import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isBannedIdentifier,
  isBotPattern,
} from "@/lib/security-guard";
import {
  type ClassroomSubmission,
  normalizeClassroomCode,
  computeEffectiveUnlockedSlot,
  isSameClassroomScholar,
} from "@/lib/classroom-types";
import {
  getClassroomWithSubmissions,
  addMemberToClassroom,
  uploadClassroomVoiceClip,
  upsertClassroomSubmission,
  saveClassroom,
} from "@/lib/classroom-db";
import { uid } from "@/lib/utils";

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rate = checkRateLimit(`classroom-submit:${clientIp}`, 20, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many submissions recently. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      classroomCode,
      slotNumber,
      userId,
      username,
      avatar,
      topicId,
      topicText,
      category,
      durationSeconds,
      audioData,
      notes,
    } = body;

    const cleanCode = normalizeClassroomCode(classroomCode);
    const slotNum = Number(slotNumber) || 1;
    const cleanUserId = String(userId || "").trim().slice(0, 80);
    const cleanUsername = String(username || "Scholar").trim().slice(0, 50) || "Scholar";

    if (!cleanCode || !cleanUserId) {
      return NextResponse.json(
        { error: "Missing Classroom code or user identity." },
        { status: 400 }
      );
    }

    if (isBotPattern(cleanUsername) || isBannedIdentifier(cleanUsername)) {
      return NextResponse.json({ error: "Action not permitted." }, { status: 403 });
    }

    let bundle = await getClassroomWithSubmissions(cleanCode);
    if (!bundle) {
      return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
    }

    // Ensure submitter is registered as a member in the circle
    const isAlreadyMember = bundle.classroom.members.some((m) =>
      isSameClassroomScholar(m.userId, m.username, cleanUserId, cleanUsername)
    );
    if (!isAlreadyMember) {
      const joined = await addMemberToClassroom(cleanCode, {
        userId: cleanUserId,
        username: cleanUsername,
        avatar: avatar || "/avatars/avatar-scholar.svg",
        isHost: false,
        joinedAt: new Date().toISOString(),
      });
      if (joined?.error) {
        return NextResponse.json({ error: joined.error }, { status: 400 });
      }
      if (joined) {
        bundle = { classroom: joined.classroom, submissions: joined.submissions };
      }
    }

    // Upload voice clip to Supabase Storage (or keep compact data URL fallback)
    const audioUrl = await uploadClassroomVoiceClip({
      code: cleanCode,
      slotNumber: slotNum,
      userId: cleanUserId,
      audioData: typeof audioData === "string" ? audioData : undefined,
    });

    // Preserve existing receipts/notes if the user re-submitted on the same slot
    const priorSub = bundle.submissions.find(
      (s) => s.slotNumber === slotNum && s.userId === cleanUserId
    );

    const slotMeta = bundle.classroom.slots.find((s) => s.slotNumber === slotNum);
    const submission: ClassroomSubmission = {
      id: priorSub?.id || `csub-${uid()}`,
      classroomCode: cleanCode,
      slotNumber: slotNum,
      userId: cleanUserId,
      username: cleanUsername,
      avatar: avatar || "/avatars/avatar-scholar.svg",
      topicId: String(topicId || slotMeta?.topicId || "topic"),
      topicText: String(topicText || slotMeta?.topicText || "").slice(0, 280),
      category: String(category || slotMeta?.category || "Technology"),
      durationSeconds: Math.max(1, Math.min(300, Math.round(Number(durationSeconds) || 60))),
      audioUrl,
      notes: typeof notes === "string" ? notes.trim().slice(0, 1500) : priorSub?.notes,
      heardBy: priorSub?.heardBy || [],
      appreciations: priorSub?.appreciations || {},
      marginNotes: priorSub?.marginNotes || [],
      submittedAt: new Date().toISOString(),
    };

    await upsertClassroomSubmission(submission);

    // Refresh bundle and persist unlocked progression if consensus reached
    const refreshed = await getClassroomWithSubmissions(cleanCode);
    if (!refreshed) {
      return NextResponse.json({ submission, classroom: bundle.classroom, submissions: [submission] });
    }

    const unlockedNow = computeEffectiveUnlockedSlot(
      refreshed.classroom,
      refreshed.submissions
    );
    let finalClassroom = refreshed.classroom;

    // Auto-complete Classroom when >= 2 members have all submitted the final topic
    const finalSlotSubs = refreshed.submissions.filter(
      (s) => s.slotNumber === refreshed.classroom.totalTopics
    );
    const allFinishedFinalTopic =
      refreshed.classroom.members.length >= 2 &&
      refreshed.classroom.members.every((m) =>
        finalSlotSubs.some((s) =>
          isSameClassroomScholar(s.userId, s.username, m.userId, m.username)
        )
      );

    if (
      unlockedNow > (refreshed.classroom.manualUnlockedUpToSlot || 1) ||
      (allFinishedFinalTopic && refreshed.classroom.status !== "completed")
    ) {
      finalClassroom = await saveClassroom({
        ...refreshed.classroom,
        manualUnlockedUpToSlot: Math.max(
          refreshed.classroom.manualUnlockedUpToSlot || 1,
          unlockedNow
        ),
        ...(allFinishedFinalTopic
          ? { status: "completed", closedAt: new Date().toISOString() }
          : {}),
      });
    }

    return NextResponse.json({
      submission,
      classroom: finalClassroom,
      submissions: refreshed.submissions,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to save Classroom recording." },
      { status: 500 }
    );
  }
}
