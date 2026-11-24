import { NextRequest, NextResponse } from "next/server";
import {
  checkRateLimit,
  getClientIp,
  isBannedIdentifier,
  isBotPattern,
} from "@/lib/security-guard";
import {
  type Classroom,
  type ClassroomPresetCount,
  generateClassroomCode,
  buildClassroomSyllabus,
  normalizeClassroomCode,
} from "@/lib/classroom-types";
import {
  saveClassroom,
  getClassroomWithSubmissions,
  listClassroomsForUser,
} from "@/lib/classroom-db";
import type { Difficulty, Topic } from "@/lib/topics";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const userId = searchParams.get("userId");
    const username = searchParams.get("username") || undefined;

    if (code) {
      const bundle = await getClassroomWithSubmissions(code);
      if (!bundle) {
        return NextResponse.json({ error: "Classroom not found." }, { status: 404 });
      }
      return NextResponse.json(bundle);
    }

    if (userId) {
      const items = await listClassroomsForUser(userId, username);
      return NextResponse.json({ items });
    }

    return NextResponse.json({ items: [] });
  } catch {
    return NextResponse.json({ error: "Failed to load Classrooms." }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const clientIp = getClientIp(req);
    const rate = checkRateLimit(`classroom-create:${clientIp}`, 12, 60);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Too many Classrooms created recently. Please wait a moment." },
        { status: 429 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      title,
      hostId,
      hostName,
      hostAvatar,
      totalTopics,
      speakingDurationSec,
      researchDurationMin,
      categories,
      difficulty,
      presetTopics,
      customTopicPool,
    } = body;

    if (
      isBotPattern(hostName) ||
      isBannedIdentifier(hostName) ||
      (hostId && isBannedIdentifier(String(hostId)))
    ) {
      return NextResponse.json({ error: "Action not permitted." }, { status: 403 });
    }

    const cleanHostId = String(hostId || "").trim().slice(0, 80) || `host-${Date.now()}`;
    const cleanHostName = String(hostName || "Scholar").trim().slice(0, 50) || "Scholar";
    const cleanTitle =
      String(title || "").trim().slice(0, 80) || `${cleanHostName}'s Classroom`;

    const validTotals: ClassroomPresetCount[] = [1, 3, 5, 7];
    const resolvedTotal: number = validTotals.includes(totalTopics)
      ? totalTopics
      : 7;

    const resolvedSpeaking = [45, 60, 90, 120].includes(Number(speakingDurationSec))
      ? Number(speakingDurationSec)
      : 90;
    const resolvedResearch = [5, 10, 15].includes(Number(researchDurationMin))
      ? Number(researchDurationMin)
      : 10;

    const validDiffs: Difficulty[] = ["Novice", "Scholar", "Expert"];
    const resolvedDiff: Difficulty = validDiffs.includes(difficulty) ? difficulty : "Novice";

    const resolvedCategories: string[] = Array.isArray(categories)
      ? categories.map((c) => String(c).trim()).filter(Boolean).slice(0, 10)
      : ["Technology", "Philosophy"];

    // Generate collision-free 6-char Classroom code
    let code = generateClassroomCode();
    for (let attempt = 0; attempt < 4; attempt++) {
      const existing = await getClassroomWithSubmissions(code);
      if (!existing) break;
      code = generateClassroomCode();
    }
    const cleanCode = normalizeClassroomCode(code);

    const slots = buildClassroomSyllabus({
      seed: `${cleanCode}-${Date.now()}`,
      totalTopics: resolvedTotal,
      categories: resolvedCategories,
      difficulty: resolvedDiff,
      presetTopics: Array.isArray(presetTopics) ? (presetTopics as Topic[]) : [],
      customTopicPool: Array.isArray(customTopicPool) ? (customTopicPool as Topic[]) : [],
    });

    const nowIso = new Date().toISOString();
    const newClassroom: Classroom = {
      code: cleanCode,
      title: cleanTitle,
      hostId: cleanHostId,
      hostName: cleanHostName,
      hostAvatar: hostAvatar || "/avatars/avatar-scholar.svg",
      totalTopics: slots.length || resolvedTotal,
      speakingDurationSec: resolvedSpeaking,
      researchDurationMin: resolvedResearch,
      categories: resolvedCategories,
      difficulty: resolvedDiff,
      maxMembers: 8,
      members: [
        {
          userId: cleanHostId,
          username: cleanHostName,
          avatar: hostAvatar || "/avatars/avatar-scholar.svg",
          isHost: true,
          joinedAt: nowIso,
          favoriteCategories: resolvedCategories,
        },
      ],
      slots,
      manualUnlockedUpToSlot: 1,
      status: "active",
      createdAt: nowIso,
    };

    const saved = await saveClassroom(newClassroom);
    return NextResponse.json({ classroom: saved, submissions: [] });
  } catch {
    return NextResponse.json(
      { error: "Unable to create Classroom right now." },
      { status: 500 }
    );
  }
}
