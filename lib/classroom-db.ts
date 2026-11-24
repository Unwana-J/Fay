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
  return {
    id: embedded.id || String(row.id || `sub-${row.league_code}-${row.day_number}-${row.user_id}`),
    classroomCode: normalizeClassroomCode(row.league_code || embedded.classroomCode),
    slotNumber: Number(row.day_number || embedded.slotNumber) || 1,
    userId: row.user_id || embedded.userId,
    username: row.username || embedded.username || "Scholar",
    avatar: row.avatar || embedded.avatar || "/avatars/avatar-scholar.svg",
    topicId: embedded.topicId || "topic",
    topicText: embedded.topicText || "",
    category: embedded.category || "Technology",
    durationSeconds: Number(row.duration_seconds || embedded.durationSeconds) || 0,
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
    if (!isTableMissingError(error)) {
      // Fall through to friendship_leagues anyway for safety
    }
  } catch {}

  // 2. Fallback to `friendship_leagues` JSONB column `daily_seed_map`
  try {
    const startDate = todayStr();
    const endDate = formatDateToIso(addDaysToDate(new Date(), normalized.totalTopics));
    await supabase
      .from("friendship_leagues")
      .upsert(
        [
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
            daily_seed_map: {
              _kind: "classroom",
              _classroom: normalized,
            },
          },
        ],
        { onConflict: "code" }
      );
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
  if (!classroom) {
    try {
      const { data, error } = await supabase
        .from("friendship_leagues")
        .select("*")
        .eq("code", cleanCode)
        .maybeSingle();

      if (!error && data) {
        classroom = mapFallbackLeagueRowToClassroom(data);
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

  if (submissions.length === 0) {
    try {
      const { data: scoreRows, error: scoreErr } = await supabase
        .from("league_scores")
        .select("*")
        .eq("league_code", cleanCode)
        .order("created_at", { ascending: true });

      if (!scoreErr && Array.isArray(scoreRows)) {
        submissions = scoreRows
          .map(mapFallbackScoreRowToSubmission)
          .filter((s): s is ClassroomSubmission => Boolean(s));
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
    c.hostId === userId ||
    c.members.some(
      (m) =>
        m.userId === userId ||
        (normName && normName !== "scholar" && m.username?.trim().toLowerCase() === normName)
    );

  const resultsMap = new Map<string, Classroom>();

  // Include warm memory cache
  for (const [code, rec] of memoryClassrooms.entries()) {
    if (matchesMember(rec.classroom)) {
      resultsMap.set(code, rec.classroom);
    }
  }

  if (isSupabaseConfigured && supabase) {
    // 1. Check `classrooms`
    try {
      const { data, error } = await supabase
        .from("classrooms")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(80);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const c = mapDedicatedRowToClassroom(row);
          if (matchesMember(c)) {
            resultsMap.set(c.code, c);
          }
        }
      }
    } catch {}

    // 2. Check `friendship_leagues` fallback (`category = 'classroom'`)
    try {
      const { data, error } = await supabase
        .from("friendship_leagues")
        .select("*")
        .eq("category", "classroom")
        .order("created_at", { ascending: false })
        .limit(80);

      if (!error && Array.isArray(data)) {
        for (const row of data) {
          const c = mapFallbackLeagueRowToClassroom(row);
          if (c && matchesMember(c)) {
            resultsMap.set(c.code, c);
          }
        }
      }
    } catch {}
  }

  // Hydrate submissions for each matched Classroom
  const hydrated = await Promise.all(
    Array.from(resultsMap.keys()).map((code) => getClassroomWithSubmissions(code))
  );

  return hydrated
    .filter((item): item is { classroom: Classroom; submissions: ClassroomSubmission[] } =>
      Boolean(item)
    )
    .sort(
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
  if (!storedInDedicated) {
    try {
      const { data: existingRows } = await supabase
        .from("league_scores")
        .select("id, user_id")
        .eq("league_code", cleanCode)
        .eq("day_number", normalizedSub.slotNumber);

      const prior = (existingRows || []).find((r: any) => r.user_id === normalizedSub.userId);
      const embeddedPayload = [
        {
          _kind: "classroom_submission",
          ...normalizedSub,
        },
      ];

      if (prior?.id) {
        await supabase
          .from("league_scores")
          .update({
            username: normalizedSub.username,
            avatar: normalizedSub.avatar,
            duration_seconds: normalizedSub.durationSeconds,
            question_results: embeddedPayload,
          })
          .eq("id", prior.id);
      } else {
        await supabase.from("league_scores").insert([
          {
            league_code: cleanCode,
            user_id: normalizedSub.userId,
            username: normalizedSub.username,
            avatar: normalizedSub.avatar,
            day_number: normalizedSub.slotNumber,
            date: todayStr(),
            score: 1,
            total_questions: 1,
            points: normalizedSub.durationSeconds,
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
