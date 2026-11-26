import type { Metadata } from "next";
import { getClassroomWithSubmissions } from "@/lib/classroom-db";
import { formatClassroomCodeDisplay, normalizeClassroomCode } from "@/lib/classroom-types";
import { getRequestOrigin } from "@/lib/request-origin";
import ClassroomDetailClient from "./ClassroomDetailClient";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ code: string }>;
}): Promise<Metadata> {
  const { code } = await params;
  const cleanCode = normalizeClassroomCode(code);
  const displayCode = formatClassroomCodeDisplay(cleanCode);
  const origin = await getRequestOrigin();
  const pageUrl = `${origin}/classroom/${cleanCode}`;
  const ogImageUrl = `${origin}/opengraph-image`;

  const bundle = await getClassroomWithSubmissions(cleanCode).catch(() => null);
  if (!bundle?.classroom) {
    const fallbackTitle = `Classroom ${displayCode} · Fey`;
    const fallbackDesc =
      "Join this Fey Classroom to learn, record your 90-second take, and unlock your friends' voice explanations.";
    return {
      title: fallbackTitle,
      description: fallbackDesc,
      openGraph: {
        title: fallbackTitle,
        description: fallbackDesc,
        url: pageUrl,
        type: "website",
        images: [{ url: ogImageUrl, width: 1200, height: 630, alt: fallbackTitle, type: "image/png" }],
      },
      twitter: {
        card: "summary_large_image",
        title: fallbackTitle,
        description: fallbackDesc,
        images: [ogImageUrl],
      },
    };
  }

  const { classroom, submissions } = bundle;
  const firstTopic = classroom.slots[0]?.topicText || "daily shared topics";
  const recordedSlot1Count = submissions.filter((s) => s.slotNumber === 1).length;
  const hookPrefix =
    recordedSlot1Count > 0
      ? `${classroom.hostName} already recorded Topic 1. `
      : `${classroom.hostName} invited you to a ${classroom.totalTopics}-topic Classroom. `;

  const title = `${classroom.title} (${displayCode}) · Fey Classroom`;
  const description = `${hookPrefix}Record your ${classroom.speakingDurationSec}s take on "${firstTopic.slice(0, 110)}" to unlock everyone's audio.`;

  return {
    title,
    description,
    openGraph: {
      title: `${classroom.title} · Fey Classroom`,
      description: `${hookPrefix}Speak-to-Unlock voice learning with ${classroom.members.length} friend${classroom.members.length === 1 ? "" : "s"}.`,
      url: pageUrl,
      type: "website",
      images: [{ url: ogImageUrl, width: 1200, height: 630, alt: title, type: "image/png" }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${classroom.title} · Fey Classroom`,
      description,
      images: [ogImageUrl],
    },
  };
}

export default async function ClassroomCodePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code } = await params;
  return <ClassroomDetailClient code={normalizeClassroomCode(code)} />;
}
