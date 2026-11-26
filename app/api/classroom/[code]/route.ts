import { NextRequest, NextResponse, after } from "next/server";
import { sendSocialPushToUsers } from "@/lib/push-sender";
import {
  checkRateLimit,
  getClientIp,
  isBannedIdentifier,
  isBotPattern,
} from "@/lib/security-guard";
import {
  type AppreciationTag,
  APPRECIATION_TAGS,
  computeEffectiveUnlockedSlot,
} from "@/lib/classroom-types";
import {
  getClassroomWithSubmissions,
  addMemberToClassroom,
  swapUnstartedClassroomSlot,
  mutateClassroomSubmissionEngagement,
  saveClassroom,
  setClassroomLifecycleStatus,
  extendClassroomTopics,
} from "@/lib/classroom-db";

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const bundle = await getClassroomWithSubmissions(code);
    if (!bundle) {
      return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
    }
    return NextResponse.json(bundle);
  } catch {
    return NextResponse.json({ error: "Failed to load Classroom." }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await context.params;
    const clientIp = getClientIp(req);
    const rate = checkRateLimit(`classroom-act:${clientIp}`, 40, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many requests. Please wait a few seconds." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = String(body?.action || "");

    if (action === "join") {
      const m = body?.member;
      if (!m?.userId) {
        return NextResponse.json({ error: "Missing user identity." }, { status: 400 });
      }
      if (isBotPattern(m.username) || isBannedIdentifier(m.username)) {
        return NextResponse.json({ error: "Action not permitted." }, { status: 403 });
      }
      const res = await addMemberToClassroom(code, {
        userId: String(m.userId).slice(0, 80),
        username: String(m.username || "Scholar").trim().slice(0, 50) || "Scholar",
        avatar: m.avatar || "/avatars/avatar-scholar.svg",
        isHost: false,
        joinedAt: new Date().toISOString(),
        favoriteCategories: Array.isArray(m.favoriteCategories)
          ? m.favoriteCategories.slice(0, 10)
          : [],
      });
      if (!res) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
      }
      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      const joinedUserId = String(m.userId).slice(0, 80);
      const joinedUsername = String(m.username || "Scholar").trim().slice(0, 50) || "Scholar";
      const memberIds = res.classroom.members.map((mem) => mem.userId);
      const title = res.classroom.title;
      const roomCode = res.classroom.code;
      after(() =>
        sendSocialPushToUsers(
          memberIds,
          {
            title: `New voice in ${title}`,
            body: `${joinedUsername} joined your Classroom.`,
            url: `/classroom/${roomCode}`,
            tag: `fey-classroom-${roomCode}-join`,
            template: "social_classroom_join",
            renotify: true,
          },
          { excludeUserId: joinedUserId }
        )
      );
      return NextResponse.json(res);
    }

    if (action === "swap_slot") {
      const slotNumber = Number(body?.slotNumber);
      const t = body?.topic;
      const swappedBy = body?.swappedBy;
      if (!slotNumber || !t?.text || !swappedBy?.userId) {
        return NextResponse.json({ error: "Invalid topic swap request." }, { status: 400 });
      }
      const res = await swapUnstartedClassroomSlot({
        code,
        slotNumber,
        newSlotTopic: {
          topicId: String(t.id || `custom-${Date.now()}`),
          topicText: String(t.text).trim().slice(0, 240),
          category: String(t.category || "Wildcard").slice(0, 50),
          difficulty: t.difficulty || "Novice",
          tags: Array.isArray(t.tags) ? t.tags.slice(0, 6) : [],
        },
        swappedBy: {
          userId: String(swappedBy.userId).slice(0, 80),
          username: String(swappedBy.username || "Member").trim().slice(0, 50),
        },
      });
      if (!res) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
      }
      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      return NextResponse.json(res);
    }

    if (action === "unlock_next") {
      const hostId = String(body?.hostId || "");
      const existing = await getClassroomWithSubmissions(code);
      if (!existing) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
      }
      if (existing.classroom.hostId !== hostId) {
        return NextResponse.json(
          { error: "Only the Classroom host can unlock topics early." },
          { status: 403 }
        );
      }
      const currentEffective = computeEffectiveUnlockedSlot(
        existing.classroom,
        existing.submissions
      );
      const nextSlot = Math.min(existing.classroom.totalTopics, currentEffective + 1);
      const saved = await saveClassroom({
        ...existing.classroom,
        manualUnlockedUpToSlot: nextSlot,
      });
      if (nextSlot > currentEffective) {
        const memberIds = saved.members.map((mem) => mem.userId);
        const roomTitle = saved.title;
        const roomCode = saved.code;
        after(() =>
          sendSocialPushToUsers(
            memberIds,
            {
              title: `Topic ${nextSlot} is unlocked`,
              body: `Your host opened the next topic in ${roomTitle}.`,
              url: `/classroom/${roomCode}`,
              tag: `fey-classroom-${roomCode}-unlock-${nextSlot}`,
              template: "social_classroom_unlock_topic",
              renotify: true,
            },
            { excludeUserId: hostId }
          )
        );
      }
      return NextResponse.json({ classroom: saved, submissions: existing.submissions });
    }

    if (action === "set_status") {
      const hostId = String(body?.hostId || "");
      const status = body?.status === "completed" ? "completed" : "active";
      if (!hostId) {
        return NextResponse.json({ error: "Missing host identity." }, { status: 400 });
      }
      const res = await setClassroomLifecycleStatus({ code, hostId, status });
      if (!res) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
      }
      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: 403 });
      }
      return NextResponse.json(res);
    }

    if (action === "extend_topics") {
      const actorId = String(body?.actorId || "").slice(0, 80);
      const actorName = String(body?.actorName || "Scholar").trim().slice(0, 50);
      const addCount = Number(body?.addCount) || 3;
      if (!actorId) {
        return NextResponse.json({ error: "Missing user identity." }, { status: 400 });
      }
      const res = await extendClassroomTopics({
        code,
        actorId,
        actorName,
        addCount,
        categories: Array.isArray(body?.categories) ? body.categories.slice(0, 10) : undefined,
        difficulty: body?.difficulty,
        presetTopics: Array.isArray(body?.presetTopics) ? body.presetTopics : undefined,
        customTopicPool: Array.isArray(body?.customTopicPool) ? body.customTopicPool : undefined,
      });
      if (!res) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
      }
      if (res.error) {
        return NextResponse.json({ error: res.error }, { status: 400 });
      }
      const memberIds = res.classroom.members.map((mem) => mem.userId);
      const roomTitle = res.classroom.title;
      const roomCode = res.classroom.code;
      after(() =>
        sendSocialPushToUsers(
          memberIds,
          {
            title: `New topics in ${roomTitle}`,
            body: `${actorName} added ${addCount} new topic${addCount === 1 ? "" : "s"} to your Classroom.`,
            url: `/classroom/${roomCode}`,
            tag: `fey-classroom-${roomCode}-extend`,
            template: "social_classroom_extend",
            renotify: true,
          },
          { excludeUserId: actorId }
        )
      );
      return NextResponse.json(res);
    }

    if (action === "mark_heard") {
      const submissionId = String(body?.submissionId || "");
      const viewer = body?.viewer;
      if (!submissionId || !viewer?.userId) {
        return NextResponse.json({ error: "Invalid receipt payload." }, { status: 400 });
      }
      const updated = await mutateClassroomSubmissionEngagement({
        code,
        submissionId,
        action: {
          type: "mark_heard",
          viewer: {
            userId: String(viewer.userId).slice(0, 80),
            username: String(viewer.username || "Scholar").trim().slice(0, 50),
            avatar: viewer.avatar || "/avatars/avatar-scholar.svg",
            heardAt: new Date().toISOString(),
          },
        },
      });
      if (!updated) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    if (action === "toggle_appreciation") {
      const submissionId = String(body?.submissionId || "");
      const tag = body?.tag as AppreciationTag;
      const userId = String(body?.userId || "").slice(0, 80);
      if (!submissionId || !userId || !APPRECIATION_TAGS.includes(tag)) {
        return NextResponse.json({ error: "Invalid appreciation tag." }, { status: 400 });
      }
      const updated = await mutateClassroomSubmissionEngagement({
        code,
        submissionId,
        action: { type: "toggle_appreciation", tag, userId },
      });
      if (!updated) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
      }
      return NextResponse.json(updated);
    }

    if (action === "add_margin_note") {
      const submissionId = String(body?.submissionId || "");
      const note = body?.note;
      if (!submissionId || !note?.userId || !note?.text) {
        return NextResponse.json({ error: "Invalid margin note." }, { status: 400 });
      }
      if (isBotPattern(note.username) || isBannedIdentifier(note.username)) {
        return NextResponse.json({ error: "Action not permitted." }, { status: 403 });
      }
      const updated = await mutateClassroomSubmissionEngagement({
        code,
        submissionId,
        action: {
          type: "add_margin_note",
          note: {
            id: String(note.id || `note-${Date.now()}`),
            userId: String(note.userId).slice(0, 80),
            username: String(note.username || "Scholar").trim().slice(0, 50),
            avatar: note.avatar || "/avatars/avatar-scholar.svg",
            text: String(note.text).trim().slice(0, 160),
            createdAt: new Date().toISOString(),
          },
        },
      });
      if (!updated) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
      }
      const targetSub = updated.submissions.find((s) => s.id === submissionId);
      if (targetSub) {
        const noteAuthorId = String(note.userId).slice(0, 80);
        const noteAuthorName = String(note.username || "Scholar").trim().slice(0, 50);
        const snippet = String(note.text).trim().slice(0, 110);
        const roomCode = updated.classroom.code;
        after(() =>
          sendSocialPushToUsers(
            [targetSub.userId],
            {
              title: `${noteAuthorName} left a margin note`,
              body: `"${snippet}"`,
              url: `/classroom/${roomCode}`,
              tag: `fey-classroom-${roomCode}-note`,
              template: "social_classroom_note",
              renotify: true,
            },
            { excludeUserId: noteAuthorId }
          )
        );
      }
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: "Unknown Classroom action." }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Failed to update Classroom." }, { status: 500 });
  }
}
