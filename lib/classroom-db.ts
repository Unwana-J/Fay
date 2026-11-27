import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import {
  type Classroom,
  type ClassroomSubmission,
  type ClassroomMember,
  type ClassroomSlot,
  type AppreciationTag,
  type HeardReceipt,
  type MarginNote,
  normalizeClassroomCode,
  buildClassroomSyllabus,
  isSameClassroomScholar,
} from "@/lib/classroom-types";
import type { Difficulty, Topic } from "@/lib/topics";
import { getExtensionForAudioMime } from "@/lib/audio-recorder";
import { todayStr, addDaysToDate, formatDateToIso } from "@/lib/utils";

const AUDIO_BUCKET = "classroom-audio";

// ─── Warm In-Memory Fallback Cache (Zero-Backend Dev & Fast Warm Reads) ──────
interface MemoryClassroomRecord {
  classroom: Classroom;
  submissions: ClassroomSubmission[];
}

const globalForClassroom = globalThis as unknown as {
  __feyClassrooms?: Map<string, MemoryClassroomRecord>;
  __feyAudioBucketReady?: boolean;
};

const memoryClassrooms: Map<string, MemoryClassroomRecord> =
  globalForClassroom.__feyClassrooms ||
  (globalForClassroom.__feyClassrooms = new Map<string, MemoryClassroomRecord>());

function isTableMissingError(err: any): boolean {
  if (!err) return false;
  const msg = String(err.message || "").toLowerCase();
  const code = String(err.code || "");
  return (
    code === "42P01" ||
    code === "PGRST205" ||
    msg.includes("does not exist") ||
    msg.includes("relation") ||
    msg.includes("could not find the table")
  );
}

// ─── Audio Storage Helper ────────────────────────────────────────────────────

async function ensureAudioBucket(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) return false;
  if (globalForClassroom.__feyAudioBucketReady) return true;

  try {
    const { data, error } = await supabase.storage.getBucket(AUDIO_BUCKET);
    if (!error && data) {
      globalForClassroom.__feyAudioBucketReady = true;
      return true;
    }
    const { error: createErr } = await supabase.storage.createBucket(AUDIO_BUCKET, {
      public: true,
      fileSizeLimit: 6 * 1024 * 1024, // 6 MB cap
    });
    if (!createErr) {
      globalForClassroom.__feyAudioBucketReady = true;
      return true;
    }
  } catch {
    // Fallback to inline data URL if Storage API is restricted
  }
  return false;
}

/**
 * Accepts a `data:audio/...;base64,...` string (or existing https URL),
 * uploads compressed binary to Supabase Storage `classroom-audio` when available,
 * and returns a playable URL (with lossless fallback to the data URL).
 */
export async function uploadClassroomVoiceClip(opts: {
  code: string;
  slotNumber: number;
  userId: string;
  audioData?: string;
}): Promise<string | undefined> {
  const { code, slotNumber, userId, audioData } = opts;
  if (!audioData) return undefined;
  if (audioData.startsWith("http://") || audioData.startsWith("https://")) {
    return audioData;
  }

  const match = audioData.match(/^data:([^;]+)(?:;[^,]*)?,(.+)$/);
  if (!match) return audioData;

  const mimeType = match[1] || "audio/mp4";
  const base64Payload = match[2];

  const bucketReady = await ensureAudioBucket();
  if (!bucketReady || !supabase) {
    return audioData;
  }

  try {
    const buffer = Buffer.from(base64Payload, "base64");
    const ext = getExtensionForAudioMime(mimeType);
    const cleanCode = normalizeClassroomCode(code);
    const safeUser = String(userId || "member").replace(/[^a-zA-Z0-9_-]/g, "").slice(0, 36);
    const storagePath = `classrooms/${cleanCode}/slot-${slotNumber}/${safeUser}-${Date.now()}.${ext}`;

    const { error: uploadErr } = await supabase.storage
      .from(AUDIO_BUCKET)
      .upload(storagePath, buffer, {
        contentType: mimeType,
        upsert: true,
        cacheControl: "31536000",
      });

    if (!uploadErr) {
      const { data: pub } = supabase.storage.from(AUDIO_BUCKET).getPublicUrl(storagePath);
      if (pub?.publicUrl) {
        return pub.publicUrl;
      }
    }
  } catch {
    // Graceful fallback to inline data URL
  }

  return audioData;
}

// ─── Row Mappers ─────────────────────────────────────────────────────────────

function mapDedicatedRowToClassroom(row: any): Classroom {
  return {
    id: row.id,
    code: normalizeClassroomCode(row.code),
    title: row.title || "Study Classroom",
    hostId: row.host_id || "host",
    hostName: row.host_name || "Scholar",
    hostAvatar: row.host_avatar || "/avatars/avatar-scholar.svg",
    totalTopics: Number(row.total_topics) || 7,
    speakingDurationSec: row.speaking_duration_sec || 90,
    researchDurationMin: row.research_duration_min || 10,
    categories: Array.isArray(row.categories) ? row.categories : [],
    difficulty: row.difficulty || "Novice",
    maxMembers: row.max_members || 8,
    members: Array.isArray(row.members) ? row.members : [],
    slots: Array.isArray(row.slots) ? row.slots : [],
    manualUnlockedUpToSlot: row.manual_unlocked_up_to_slot || 1,
    status: row.status === "completed" ? "completed" : "active",
    createdAt: row.created_at || new Date().toISOString(),
  };
}

function mapFallbackLeagueRowToClassroom(row: any): Classroom | null {
  const seedMap = row?.daily_seed_map;
  if (!seedMap || seedMap._kind !== "classroom" || !seedMap._classroom) {
    return null;
  }
  const c = seedMap._classroom as Classroom;
  return {
    ...c,
    id: row.id || c.id,
    code: normalizeClassroomCode(row.code || c.code),
    title: row.title || c.title || "Study Classroom",
  };
}

function mapDedicatedRowToSubmission(row: any): ClassroomSubmission {
  return {
    id: row.id,
    classroomCode: normalizeClassroomCode(row.classroom_code),
    slotNumber: Number(row.slot_number) || 1,
    userId: row.user_id,
    username: row.username || "Scholar",
    avatar: row.avatar || "/avatars/avatar-scholar.svg",
    topicId: row.topic_id || "topic",
    topicText: row.topic_text || "",
    category: row.category || "Technology",
    durationSeconds: Number(row.duration_seconds) || 0,
    audioUrl: row.audio_url || undefined,
    notes: row.notes || undefined,
    heardBy: Array.isArray(row.heard_by) ? row.heard_by : [],
    appreciations:
      row.appreciations && typeof row.appreciations === "object" ? row.appreciations : {},
    marginNotes: Array.isArray(row.margin_notes) ? row.margin_notes : [],
    submittedAt: row.submitted_at || new Date().toISOString(),
  };
}

function mapFallbackScoreRowToSubmission(row: any): ClassroomSubmission | null {
  const qr = row?.question_results;
  const embedded = Array.isArray(qr) ? qr[0] : qr;
  if (!embedded || embedded._kind !== "classroom_submission") {
    return null;
  }
  const resolvedSlot =
    Number(embedded.slotNumber) || Math.abs(Number(row.day_number)) || 1;
  return {
    id: embedded.id || String(row.id || `sub-${row.league_code}-${resolvedSlot}-${row.user_id}`),
    classroomCode: normalizeClassroomCode(row.league_code || embedded.classroomCode),
    slotNumber: resolvedSlot,
    userId: embedded.userId || row.user_id,
    username: embedded.username || row.username || "Scholar",
    avatar: embedded.avatar || row.avatar || "/avatars/avatar-scholar.svg",
    topicId: embedded.topicId || "topic",
    topicText: embedded.topicText || "",
    category: embedded.category || "Technology",
    durationSeconds: Number(embedded.durationSeconds || row.duration_seconds) || 0,
    audioUrl: embedded.audioUrl || undefined,
    notes: embedded.notes || undefined,
    heardBy: Array.isArray(embedded.heardBy) ? embedded.heardBy : [],
    appreciations:
      embedded.appreciations && typeof embedded.appreciations === "object"
        ? embedded.appreciations
        : {},
    marginNotes: Array.isArray(embedded.marginNotes) ? embedded.marginNotes : [],
    submittedAt: embedded.submittedAt || row.created_at || new Date().toISOString(),
  };
}

function getFallbackStateTs(row: any): number {
  const seedMap = row?.daily_seed_map;
  const ts = Number(seedMap?._stateTs);
  return Number.isFinite(ts) && ts > 0 ? ts : 0;
}

/**
 * Merge two slot arrays without ever letting a stale snapshot overwrite a newer
 * user-initiated topic swap (`swappedBy.swappedAt`) or drop extended slots.
 */
function mergeClassroomSlots(
  currentSlots: ClassroomSlot[],
  incomingSlots: ClassroomSlot[],
  incomingIsNewer: boolean
): ClassroomSlot[] {
  if (!Array.isArray(incomingSlots) || incomingSlots.length === 0) {
    return currentSlots;
  }
  const bySlot = new Map<number, ClassroomSlot>();
  for (const s of currentSlots) {
    bySlot.set(s.slotNumber, s);
  }
  for (const inc of incomingSlots) {
    const cur = bySlot.get(inc.slotNumber);
    if (!cur) {
      bySlot.set(inc.slotNumber, inc);
      continue;
    }
    const curSwapMs = cur.swappedBy?.swappedAt ? new Date(cur.swappedBy.swappedAt).getTime() : 0;
    const incSwapMs = inc.swappedBy?.swappedAt ? new Date(inc.swappedBy.swappedAt).getTime() : 0;

    if (incSwapMs > curSwapMs) {
      bySlot.set(inc.slotNumber, inc);
    } else if (curSwapMs > incSwapMs) {
      // Preserve the newer swapped topic even if an older snapshot replays later
      bySlot.set(inc.slotNumber, cur);
    } else if (incomingIsNewer) {
      bySlot.set(inc.slotNumber, inc);
    }
  }
  return Array.from(bySlot.values()).sort((a, b) => a.slotNumber - b.slotNumber);
}

/**
 * Reconciles a base Classroom row with append-only `league_scores` event & submission rows.
 * Essential when Supabase RLS allows public INSERT + SELECT on `friendship_leagues` / `league_scores`
 * without FOR UPDATE policies:
 * 1. Applies chronological `_kind === "classroom_state"` snapshots (unioning members so concurrent
 *    friend joins never overwrite each other, and respecting `_stateTs` + `swappedBy.swappedAt`
 *    so stale snapshots never clobber a newer `friendship_leagues` update or topic swap).
 * 2. Deduplicates `_kind === "classroom_submission"` revisions by (slotNumber, userId), keeping the
 *    latest revision while unioning `heardBy` receipts and `marginNotes` across revisions.
 * 3. Retroactively auto-heals `classroom.members` from any submission author who recorded a take
 *    even if their initial Join state write was blocked prior to this event-sourced layer.
 */
function hydrateClassroomBundleFromScoreRows(
  baseClassroom: Classroom,
  scoreRows: any[],
  baseStateTs: number = 0
): { classroom: Classroom; submissions: ClassroomSubmission[] } {
  let hydrated: Classroom = {
    ...baseClassroom,
    members: [...(baseClassroom.members || [])],
    slots: [...(baseClassroom.slots || [])],
    categories: [...(baseClassroom.categories || [])],
  };

  const mergeMemberIntoList = (list: ClassroomMember[], incoming: ClassroomMember): ClassroomMember[] => {
    const idx = list.findIndex((m) =>
      isSameClassroomScholar(m.userId, m.username, incoming.userId, incoming.username)
    );
    if (idx >= 0) {
      const existing = list[idx];
      return list.map((m, i) =>
        i === idx
          ? {
              ...existing,
              username:
                incoming.username && incoming.username !== "Scholar"
                  ? incoming.username
                  : existing.username,
              avatar: incoming.avatar || existing.avatar,
              favoriteCategories:
                incoming.favoriteCategories && incoming.favoriteCategories.length > 0
                  ? incoming.favoriteCategories
                  : existing.favoriteCategories,
            }
          : m
      );
    }
    if (list.length >= (hydrated.maxMembers || 8)) return list;
    return [...list, incoming];
  };

  // 1. Replay chronological `classroom_state` snapshots, respecting `_stateTs` & slot swap timestamps
  let latestStateTs = baseStateTs;
  const stateEvents: Array<{ snap: Classroom; ts: number }> = [];
  for (const row of scoreRows) {
    const qr = row?.question_results;
    const embedded = Array.isArray(qr) ? qr[0] : qr;
    if (embedded && embedded._kind === "classroom_state" && embedded._classroom) {
      const ts =
        Number(embedded._ts) ||
        (row?.created_at ? new Date(row.created_at).getTime() : 0) ||
        0;
      stateEvents.push({ snap: embedded._classroom as Classroom, ts });
    }
  }
  stateEvents.sort((a, b) => a.ts - b.ts);

  for (const { snap, ts } of stateEvents) {
    let unionedMembers = [...hydrated.members];
    for (const m of snap.members || []) {
      unionedMembers = mergeMemberIntoList(unionedMembers, m);
    }
    const incomingIsNewer = ts >= latestStateTs;
    const mergedSlots = mergeClassroomSlots(
      hydrated.slots,
      Array.isArray(snap.slots) ? snap.slots : [],
      incomingIsNewer
    );

    if (incomingIsNewer) {
      latestStateTs = ts;
    }

    hydrated = {
      ...hydrated,
      title: incomingIsNewer && snap.title ? snap.title : hydrated.title,
      totalTopics: Math.max(
        hydrated.totalTopics || 1,
        mergedSlots.length,
        incomingIsNewer ? Number(snap.totalTopics) || 0 : 0
      ),
      slots: mergedSlots,
      categories: Array.from(
        new Set([...(hydrated.categories || []), ...(snap.categories || [])])
      ),
      manualUnlockedUpToSlot: Math.max(
        hydrated.manualUnlockedUpToSlot || 1,
        snap.manualUnlockedUpToSlot || 1
      ),
      status: incomingIsNewer && snap.status ? snap.status : hydrated.status,
      closedAt:
        (incomingIsNewer ? snap.status : hydrated.status) === "completed"
          ? (incomingIsNewer ? snap.closedAt : hydrated.closedAt) || hydrated.closedAt
          : undefined,
      members: unionedMembers,
    };
  }

  // 2. Collapse `classroom_submission` rows chronologically per (slotNumber, scholar)
  const subList: ClassroomSubmission[] = [];
  for (const row of scoreRows) {
    const parsed = mapFallbackScoreRowToSubmission(row);
    if (!parsed) continue;

    const priorIdx = subList.findIndex(
      (s) =>
        s.slotNumber === parsed.slotNumber &&
        isSameClassroomScholar(s.userId, s.username, parsed.userId, parsed.username)
    );

    if (priorIdx < 0) {
      subList.push(parsed);
    } else {
      const prev = subList[priorIdx];
      // Union heardBy receipts by scholar
      const mergedHeard: HeardReceipt[] = [...(prev.heardBy || [])];
      for (const h of parsed.heardBy || []) {
        if (!mergedHeard.some((x) => isSameClassroomScholar(x.userId, x.username, h.userId, h.username))) {
          mergedHeard.push(h);
        }
      }
      // Union marginNotes by id
      const seenNoteIds = new Set((prev.marginNotes || []).map((n) => n.id));
      const mergedNotes: MarginNote[] = [...(prev.marginNotes || [])];
      for (const n of parsed.marginNotes || []) {
        if (!seenNoteIds.has(n.id)) {
          seenNoteIds.add(n.id);
          mergedNotes.push(n);
        }
      }

      subList[priorIdx] = {
        ...prev,
        ...parsed,
        audioUrl: parsed.audioUrl || prev.audioUrl,
        notes: parsed.notes !== undefined ? parsed.notes : prev.notes,
        heardBy: mergedHeard,
        marginNotes: mergedNotes,
      };
    }
  }

  // 3. Retroactive Member Auto-Heal: ensure every submission author appears in `members`
  let healedMembers = [...hydrated.members];
  for (const sub of subList) {
    if (!sub.userId && !sub.username) continue;
    healedMembers = mergeMemberIntoList(healedMembers, {
      userId: sub.userId,
      username: sub.username || "Scholar",
      avatar: sub.avatar || "/avatars/avatar-scholar.svg",
      isHost: sub.userId === hydrated.hostId,
      joinedAt: sub.submittedAt || hydrated.createdAt,
    });
  }
  hydrated = { ...hydrated, members: healedMembers };

  return { classroom: hydrated, submissions: subList };
}

// ─── Core Persistence Operations ─────────────────────────────────────────────

export async function saveClassroom(classroom: Classroom): Promise<Classroom> {
  const cleanCode = normalizeClassroomCode(classroom.code);
  const normalized: Classroom = { ...classroom, code: cleanCode };

  // Update warm memory cache
  const existingMem = memoryClassrooms.get(cleanCode);
  memoryClassrooms.set(cleanCode, {
    classroom: normalized,
    submissions: existingMem?.submissions || [],
  });

  if (!isSupabaseConfigured || !supabase) {
    return normalized;
  }

  // 1. Try dedicated `classrooms` table
  try {
    const { data, error } = await supabase
      .from("classrooms")
      .upsert(
        [
          {
            code: cleanCode,
            title: normalized.title,
            host_id: normalized.hostId,
            host_name: normalized.hostName,
            host_avatar: normalized.hostAvatar,
            total_topics: normalized.totalTopics,
            speaking_duration_sec: normalized.speakingDurationSec,
            research_duration_min: normalized.researchDurationMin,
            categories: normalized.categories,
            difficulty: normalized.difficulty,
            max_members: normalized.maxMembers,
            members: normalized.members,
            slots: normalized.slots,
            manual_unlocked_up_to_slot: normalized.manualUnlockedUpToSlot,
            status: normalized.status,
          },
        ],
        { onConflict: "code" }
      )
      .select()
      .maybeSingle();

    if (!error && data) {
      return mapDedicatedRowToClassroom(data);
    }
  } catch {}

  // 2. Fallback to `friendship_leagues` + append-only `league_scores` state sync
  try {
    const startDate = todayStr();
    const endDate = formatDateToIso(addDaysToDate(new Date(), normalized.totalTopics));
    const stateTs = Date.now();
    const seedPayload = {
      _kind: "classroom",
      _classroom: normalized,
      _stateTs: stateTs,
    };

    const { data: existingLeague } = await supabase
      .from("friendship_leagues")
      .select("code")
      .eq("code", cleanCode)
      .maybeSingle();

    if (!existingLeague) {
      // Initial creation: INSERT works under public INSERT RLS policy
      await supabase.from("friendship_leagues").insert([
        {
          code: cleanCode,
          title: normalized.title,
          creator_name: normalized.hostName,
          creator_id: normalized.hostId,
          duration_days: normalized.totalTopics,
          start_date: startDate,
          end_date: endDate,
          questions_per_day: 1,
          difficulty: normalized.difficulty.toLowerCase(),
          category: "classroom",
          daily_seed_map: seedPayload,
        },
      ]);
    } else {
      // Existing Classroom: try direct UPDATE first
      const { data: updatedRows, error: updateErr } = await supabase
        .from("friendship_leagues")
        .update({
          title: normalized.title,
          duration_days: normalized.totalTopics,
          end_date: endDate,
          daily_seed_map: seedPayload,
        })
        .eq("code", cleanCode)
        .select();

      // If RLS blocks UPDATE (0 rows updated), persist an append-only state event into `league_scores`
      // with `day_number: 0` and `username: "__LEAGUE_SYNC__"` (ignored by global leaderboards).
      if (updateErr || !updatedRows || updatedRows.length === 0) {
        await supabase.from("league_scores").insert([
          {
            league_code: cleanCode,
            user_id: `__classroom_sync_${stateTs}_${Math.random().toString(36).slice(2, 6)}`,
            username: "__LEAGUE_SYNC__",
            avatar: normalized.hostAvatar || "/avatars/avatar-scholar.svg",
            day_number: 0,
            date: startDate,
            score: normalized.manualUnlockedUpToSlot || 1,
            total_questions: normalized.totalTopics || 7,
            points: 0,
            duration_seconds: 0,
            question_results: [
              {
                _kind: "classroom_state",
                _classroom: normalized,
                _ts: stateTs,
              },
            ],
          },
        ]);
      }
    }
  } catch {}

  return normalized;
}

export async function getClassroomWithSubmissions(code: string): Promise<{
  classroom: Classroom;
  submissions: ClassroomSubmission[];
} | null> {
  const cleanCode = normalizeClassroomCode(code);
  if (!cleanCode) return null;

  if (!isSupabaseConfigured || !supabase) {
    const mem = memoryClassrooms.get(cleanCode);
    return mem ? { classroom: mem.classroom, submissions: mem.submissions } : null;
  }

  let classroom: Classroom | null = null;
  let usedDedicatedTable = false;

  // 1. Try `classrooms`
  try {
    const { data, error } = await supabase
      .from("classrooms")
      .select("*")
      .eq("code", cleanCode)
      .maybeSingle();

    if (!error && data) {
      classroom = mapDedicatedRowToClassroom(data);
      usedDedicatedTable = true;
    }
  } catch {}

  // 2. Fallback to `friendship_leagues`
  let baseStateTs = 0;
  if (!classroom) {
    try {
      const { data, error } = await supabase
        .from("friendship_leagues")
        .select("*")
        .eq("code", cleanCode)
        .maybeSingle();

      if (!error && data) {
        classroom = mapFallbackLeagueRowToClassroom(data);
        baseStateTs = getFallbackStateTs(data);
      }
    } catch {}
  }

  // 3. Fallback to warm memory
  if (!classroom) {
    const mem = memoryClassrooms.get(cleanCode);
    return mem ? { classroom: mem.classroom, submissions: mem.submissions } : null;
  }

  // 4. Load submissions
  let submissions: ClassroomSubmission[] = [];

  if (usedDedicatedTable) {
    try {
      const { data: subRows, error: subErr } = await supabase
        .from("classroom_submissions")
        .select("*")
        .eq("classroom_code", cleanCode)
        .order("submitted_at", { ascending: true });

      if (!subErr && Array.isArray(subRows)) {
        submissions = subRows.map(mapDedicatedRowToSubmission);
      }
    } catch {}
  }

  if (!usedDedicatedTable) {
    try {
      const { data: scoreRows, error: scoreErr } = await supabase
        .from("league_scores")
        .select("*")
        .eq("league_code", cleanCode)
        .order("created_at", { ascending: true });

      if (!scoreErr && Array.isArray(scoreRows)) {
        const reconciled = hydrateClassroomBundleFromScoreRows(
          classroom,
          scoreRows,
          baseStateTs
        );
        classroom = reconciled.classroom;
        submissions = reconciled.submissions;
      }
    } catch {}
  }

  memoryClassrooms.set(cleanCode, { classroom, submissions });
  return { classroom, submissions };
}

export async function listClassroomsForUser(
  userId: string,
  username?: string
): Promise<Array<{ classroom: Classroom; submissions: ClassroomSubmission[] }>> {
  const normName = username?.trim().toLowerCase();
  const matchesMember = (c: Classroom) =>
    isSameClassroomScholar(c.hostId, c.hostName, userId, username) ||
    c.members.some((m) => isSameClassroomScholar(m.userId, m.username, userId, username));

  const resultsMap = new Map<string, { classroom: Classroom; submissions: ClassroomSubmission[] }>();

  // Include warm memory cache
  for (const [code, rec] of memoryClassrooms.entries()) {
    if (matchesMember(rec.classroom)) {
      resultsMap.set(code, rec);
    }
  }

  if (isSupabaseConfigured && supabase) {
    // 1. Check dedicated `classrooms` table if present
    try {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(80);

      if (!error && Array.isArray(data) && data.length > 0) {
        for (const row of data) {
          const c = mapDedicatedRowToClassroom(row);
          if (matchesMember(c)) {
            const hydrated = await getClassroomWithSubmissions(c.code);
            if (hydrated) resultsMap.set(c.code, hydrated);
          }
        }
      }
    } catch {}

    // 2. Check `friendship_leagues` (`category = 'classroom'`) + batch-hydrate `league_scores`
    // so joined friends (whose Join or Submission is stored in `league_scores`) see their Classrooms!
    try {
      const { data: leagueRows, error } = await supabase
        .from("friendship_leagues")
        .select("*")
        .eq("category", "classroom")
        .order("created_at", { ascending: false })
        .limit(80);

      if (!error && Array.isArray(leagueRows) && leagueRows.length > 0) {
        const baseMap = new Map<string, { classroom: Classroom; stateTs: number }>();
        for (const row of leagueRows) {
          const c = mapFallbackLeagueRowToClassroom(row);
          if (c) baseMap.set(c.code, { classroom: c, stateTs: getFallbackStateTs(row) });
        }

        const allCodes = Array.from(baseMap.keys());
        let allScoreRows: any[] = [];
        if (allCodes.length > 0) {
          const { data: scoreData } = await supabase
            .from("league_scores")
            .select("*")
            .in("league_code", allCodes)
            .order("created_at", { ascending: true });
          if (Array.isArray(scoreData)) {
            allScoreRows = scoreData;
          }
        }

        const scoresByCode = new Map<string, any[]>();
        for (const sr of allScoreRows) {
          const codeKey = normalizeClassroomCode(sr.league_code);
          const bucket = scoresByCode.get(codeKey) || [];
          bucket.push(sr);
          scoresByCode.set(codeKey, bucket);
        }

        for (const [codeKey, entry] of baseMap.entries()) {
          const reconciled = hydrateClassroomBundleFromScoreRows(
            entry.classroom,
            scoresByCode.get(codeKey) || [],
            entry.stateTs
          );
          memoryClassrooms.set(codeKey, reconciled);
          if (matchesMember(reconciled.classroom)) {
            resultsMap.set(codeKey, reconciled);
          }
        }
      }
    } catch {}
  }

  return Array.from(resultsMap.values()).sort(
    (a, b) =>
      new Date(b.classroom.createdAt).getTime() - new Date(a.classroom.createdAt).getTime()
  );
}

// ─── Submission Upsert & Collaborative Reactions ─────────────────────────────

export async function upsertClassroomSubmission(
  submission: ClassroomSubmission
): Promise<ClassroomSubmission> {
  const cleanCode = normalizeClassroomCode(submission.classroomCode);
  const normalizedSub: ClassroomSubmission = {
    ...submission,
    classroomCode: cleanCode,
  };

  // Update warm memory cache
  const mem = memoryClassrooms.get(cleanCode);
  if (mem) {
    const filtered = mem.submissions.filter(
      (s) => !(s.slotNumber === normalizedSub.slotNumber && s.userId === normalizedSub.userId)
    );
    mem.submissions = [...filtered, normalizedSub];
  }

  if (!isSupabaseConfigured || !supabase) {
    return normalizedSub;
  }

  // 1. Try dedicated `classroom_submissions`
  let storedInDedicated = false;
  try {
    const { data, error } = await supabase
      .from("classroom_submissions")
      .upsert(
        [
          {
            id: normalizedSub.id,
            classroom_code: cleanCode,
            slot_number: normalizedSub.slotNumber,
            user_id: normalizedSub.userId,
            username: normalizedSub.username,
            avatar: normalizedSub.avatar,
            topic_id: normalizedSub.topicId,
            topic_text: normalizedSub.topicText,
            category: normalizedSub.category,
            duration_seconds: normalizedSub.durationSeconds,
            audio_url: normalizedSub.audioUrl || null,
            notes: normalizedSub.notes || null,
            heard_by: normalizedSub.heardBy || [],
            appreciations: normalizedSub.appreciations || {},
            margin_notes: normalizedSub.marginNotes || [],
            submitted_at: normalizedSub.submittedAt,
          },
        ],
        { onConflict: "classroom_code,slot_number,user_id" }
      )
      .select()
      .maybeSingle();

    if (!error && data) {
      storedInDedicated = true;
      return mapDedicatedRowToSubmission(data);
    }
  } catch {}

  // 2. Fallback to `league_scores` JSONB `question_results`
  // Uses negative `day_number` (-slotNumber) so Classroom submissions never appear on
  // Trivia global leaderboards, and falls back to append-only INSERT if RLS blocks UPDATE.
  if (!storedInDedicated) {
    try {
      const negSlot = -Math.abs(normalizedSub.slotNumber || 1);
      const { data: existingRows } = await supabase
        .from("league_scores")
        .select("id, user_id, username, day_number")
        .eq("league_code", cleanCode)
        .in("day_number", [negSlot, Math.abs(normalizedSub.slotNumber || 1)]);

      const prior = (existingRows || []).find((r: any) =>
        isSameClassroomScholar(r.user_id, r.username, normalizedSub.userId, normalizedSub.username)
      );
      const embeddedPayload = [
        {
          _kind: "classroom_submission",
          ...normalizedSub,
          _rev: Date.now(),
        },
      ];

      let updatedDirectly = false;
      if (prior?.id) {
        const { data: updData, error: updErr } = await supabase
          .from("league_scores")
          .update({
            username: normalizedSub.username,
            avatar: normalizedSub.avatar,
            day_number: negSlot,
            points: 0,
            duration_seconds: normalizedSub.durationSeconds,
            question_results: embeddedPayload,
          })
          .eq("id", prior.id)
          .select();

        if (!updErr && Array.isArray(updData) && updData.length > 0) {
          updatedDirectly = true;
        }
      }

      if (!updatedDirectly) {
        await supabase.from("league_scores").insert([
          {
            league_code: cleanCode,
            user_id: prior?.id
              ? `${normalizedSub.userId}__rev_${Date.now()}`
              : normalizedSub.userId,
            username: normalizedSub.username,
            avatar: normalizedSub.avatar,
            day_number: negSlot,
            date: todayStr(),
            score: 1,
            total_questions: 1,
            points: 0,
            duration_seconds: normalizedSub.durationSeconds,
            question_results: embeddedPayload,
          },
        ]);
      }
    } catch {}
  }

  return normalizedSub;
}

export async function mutateClassroomSubmissionEngagement(opts: {
  code: string;
  submissionId: string;
  action:
    | { type: "mark_heard"; viewer: HeardReceipt }
    | { type: "toggle_appreciation"; tag: AppreciationTag; userId: string }
    | { type: "add_margin_note"; note: MarginNote };
}): Promise<{ classroom: Classroom; submissions: ClassroomSubmission[] } | null> {
  const existing = await getClassroomWithSubmissions(opts.code);
  if (!existing) return null;

  const target = existing.submissions.find((s) => s.id === opts.submissionId);
  if (!target) return existing;

  let updated: ClassroomSubmission = { ...target };

  if (opts.action.type === "mark_heard") {
    const { viewer } = opts.action;
    if (viewer.userId && viewer.userId !== target.userId) {
      const already = (updated.heardBy || []).some((h) => h.userId === viewer.userId);
      if (!already) {
        updated = {
          ...updated,
          heardBy: [...(updated.heardBy || []), viewer],
        };
        await upsertClassroomSubmission(updated);
      }
    }
  } else if (opts.action.type === "toggle_appreciation") {
    const { tag, userId } = opts.action;
    const currentList = updated.appreciations?.[tag] || [];
    const nextList = currentList.includes(userId)
      ? currentList.filter((id) => id !== userId)
      : [...currentList, userId];
    updated = {
      ...updated,
      appreciations: {
        ...(updated.appreciations || {}),
        [tag]: nextList,
      },
    };
    await upsertClassroomSubmission(updated);
  } else if (opts.action.type === "add_margin_note") {
    const { note } = opts.action;
    if (note.text.trim()) {
      updated = {
        ...updated,
        marginNotes: [...(updated.marginNotes || []).slice(-29), note],
      };
      await upsertClassroomSubmission(updated);
    }
  }

  return getClassroomWithSubmissions(opts.code);
}

export async function addMemberToClassroom(
  code: string,
  member: ClassroomMember
): Promise<{ classroom: Classroom; submissions: ClassroomSubmission[]; error?: string } | null> {
  const existing = await getClassroomWithSubmissions(code);
  if (!existing) return null;

  const { classroom, submissions } = existing;
  const normName = member.username?.trim().toLowerCase();
  const existingIdx = classroom.members.findIndex(
    (m) =>
      m.userId === member.userId ||
      (normName && normName !== "scholar" && m.username?.trim().toLowerCase() === normName)
  );

  if (existingIdx >= 0) {
    // Refresh avatar/name if updated
    const updatedMembers = classroom.members.map((m, idx) =>
      idx === existingIdx
        ? { ...m, username: member.username || m.username, avatar: member.avatar || m.avatar }
        : m
    );
    const saved = await saveClassroom({ ...classroom, members: updatedMembers });
    return { classroom: saved, submissions };
  }

  if (classroom.members.length >= (classroom.maxMembers || 8)) {
    return { classroom, submissions, error: "This Classroom circle is full (max 8 friends)." };
  }

  // Merge any new favorite categories into Classroom category metadata
  const mergedCategories = Array.from(
    new Set([...(classroom.categories || []), ...(member.favoriteCategories || [])])
  );

  const updatedClassroom: Classroom = {
    ...classroom,
    categories: mergedCategories,
    members: [...classroom.members, { ...member, isHost: false }],
  };

  const saved = await saveClassroom(updatedClassroom);
  return { classroom: saved, submissions };
}

export async function swapUnstartedClassroomSlot(opts: {
  code: string;
  slotNumber: number;
  newSlotTopic: Pick<ClassroomSlot, "topicId" | "topicText" | "category" | "difficulty" | "tags">;
  swappedBy: { userId: string; username: string };
}): Promise<{ classroom: Classroom; submissions: ClassroomSubmission[]; error?: string } | null> {
  const existing = await getClassroomWithSubmissions(opts.code);
  if (!existing) return null;

  const { classroom, submissions } = existing;
  const hasSubs = submissions.some((s) => s.slotNumber === opts.slotNumber);
  if (hasSubs) {
    return {
      classroom,
      submissions,
      error: "Someone has already recorded on this topic, so it can no longer be swapped.",
    };
  }

  const updatedSlots = classroom.slots.map((slot) =>
    slot.slotNumber === opts.slotNumber
      ? {
          ...slot,
          topicId: opts.newSlotTopic.topicId,
          topicText: opts.newSlotTopic.topicText,
          category: opts.newSlotTopic.category,
          difficulty: opts.newSlotTopic.difficulty,
          tags: opts.newSlotTopic.tags || [],
          swappedBy: {
            userId: opts.swappedBy.userId,
            username: opts.swappedBy.username,
            swappedAt: new Date().toISOString(),
          },
        }
      : slot
  );

  const saved = await saveClassroom({ ...classroom, slots: updatedSlots });
  return { classroom: saved, submissions };
}

export async function setClassroomLifecycleStatus(opts: {
  code: string;
  hostId: string;
  status: "active" | "completed";
}): Promise<{ classroom: Classroom; submissions: ClassroomSubmission[]; error?: string } | null> {
  const existing = await getClassroomWithSubmissions(opts.code);
  if (!existing) return null;

  const { classroom, submissions } = existing;
  if (classroom.hostId !== opts.hostId) {
    return {
      classroom,
      submissions,
      error: "Only the Classroom host can close or reopen this Classroom.",
    };
  }

  const updated: Classroom = {
    ...classroom,
    status: opts.status,
    closedAt: opts.status === "completed" ? new Date().toISOString() : undefined,
  };
  const saved = await saveClassroom(updated);
  return { classroom: saved, submissions };
}

export async function extendClassroomTopics(opts: {
  code: string;
  actorId: string;
  actorName: string;
  addCount: number;
  categories?: string[];
  difficulty?: Difficulty;
  presetTopics?: Topic[];
  customTopicPool?: Topic[];
}): Promise<{
  classroom: Classroom;
  submissions: ClassroomSubmission[];
  firstNewSlot: number;
  error?: string;
} | null> {
  const existing = await getClassroomWithSubmissions(opts.code);
  if (!existing) return null;

  const { classroom, submissions } = existing;
  const normActor = opts.actorName?.trim().toLowerCase();
  const isMember =
    classroom.hostId === opts.actorId ||
    classroom.members.some(
      (m) =>
        m.userId === opts.actorId ||
        (normActor && normActor !== "scholar" && m.username?.trim().toLowerCase() === normActor)
    );

  if (!isMember) {
    return {
      classroom,
      submissions,
      firstNewSlot: classroom.totalTopics,
      error: "Join this Classroom first to add topics.",
    };
  }

  const clampedAdd = Math.max(1, Math.min(14, Number(opts.addCount) || 3));
  const oldTotal = classroom.slots.length;
  if (oldTotal + clampedAdd > 60) {
    return {
      classroom,
      submissions,
      firstNewSlot: oldTotal,
      error: "A single Classroom can hold up to 60 topics.",
    };
  }

  const firstNewSlot = oldTotal + 1;
  const excludeIds = classroom.slots.map((s) => s.topicId);
  const chosenCategories =
    Array.isArray(opts.categories) && opts.categories.length > 0
      ? opts.categories
      : classroom.categories;

  const newSlots = buildClassroomSyllabus({
    seed: `${classroom.code}-ext-${oldTotal}-${Date.now()}`,
    totalTopics: clampedAdd,
    categories: chosenCategories,
    difficulty: opts.difficulty || classroom.difficulty || "Novice",
    presetTopics: opts.presetTopics || [],
    customTopicPool: opts.customTopicPool || [],
    excludeTopicIds: excludeIds,
    startingSlotNumber: firstNewSlot,
  });

  if (newSlots.length === 0) {
    return {
      classroom,
      submissions,
      firstNewSlot: oldTotal,
      error: "No additional unused topics matched those filters. Try selecting another category.",
    };
  }

  const mergedSlots = [...classroom.slots, ...newSlots];
  const mergedCategories = Array.from(
    new Set([...(classroom.categories || []), ...chosenCategories])
  );

  // If the circle was completed or already had takes on the previous final topic,
  // unlock the first newly added topic immediately so nobody has to wait!
  const prevFinalHasSubs = submissions.some((s) => s.slotNumber === oldTotal);
  const nextManualUnlock =
    classroom.status === "completed" || prevFinalHasSubs
      ? Math.max(classroom.manualUnlockedUpToSlot || 1, firstNewSlot)
      : classroom.manualUnlockedUpToSlot || 1;

  const updatedClassroom: Classroom = {
    ...classroom,
    slots: mergedSlots,
    totalTopics: mergedSlots.length,
    categories: mergedCategories,
    manualUnlockedUpToSlot: nextManualUnlock,
    status: "active",
    closedAt: undefined,
  };

  const saved = await saveClassroom(updatedClassroom);
  return { classroom: saved, submissions, firstNewSlot };
}
