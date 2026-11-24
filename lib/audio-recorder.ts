/**
 * Cross-platform voice recording utilities for Fey Sessions & Classrooms.
 *
 * Prioritizes `audio/mp4` (AAC) where supported so recordings play seamlessly
 * across both iOS Safari and Android/Desktop Chrome, and targets a 24 kbps
 * voice bitrate (~260 KB per 90-second synthesis) for fast mobile loading.
 */

export const VOICE_TARGET_BITRATE = 24_000; // 24 kbps mono voice (~180 KB/min)

const MIME_CANDIDATES = [
  "audio/mp4",
  "audio/mp4;codecs=mp4a.40.2",
  "audio/webm;codecs=opus",
  "audio/webm",
  "audio/ogg;codecs=opus",
] as const;

export function pickSupportedVoiceMimeType(): string {
  if (typeof window === "undefined" || typeof MediaRecorder === "undefined") {
    return "audio/mp4";
  }
  for (const candidate of MIME_CANDIDATES) {
    try {
      if (MediaRecorder.isTypeSupported(candidate)) {
        return candidate;
      }
    } catch {
      // Ignore browser quirks on codec string checks
    }
  }
  return "";
}

export function createVoiceMediaRecorder(
  stream: MediaStream,
  audioBitsPerSecond: number = VOICE_TARGET_BITRATE
): { recorder: MediaRecorder; mimeType: string } {
  const preferredMime = pickSupportedVoiceMimeType();

  // 1. Try preferred MIME + compressed voice bitrate
  if (preferredMime) {
    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: preferredMime,
        audioBitsPerSecond,
      });
      return { recorder, mimeType: recorder.mimeType || preferredMime };
    } catch {
      // Fall through to MIME-only
    }

    // 2. Try preferred MIME without bitrate constraint
    try {
      const recorder = new MediaRecorder(stream, { mimeType: preferredMime });
      return { recorder, mimeType: recorder.mimeType || preferredMime };
    } catch {
      // Fall through to browser default
    }
  }

  // 3. Browser default MediaRecorder
  const recorder = new MediaRecorder(stream);
  return { recorder, mimeType: recorder.mimeType || "audio/mp4" };
}

export function getExtensionForAudioMime(mimeType: string): "m4a" | "webm" | "ogg" {
  const lower = (mimeType || "").toLowerCase();
  if (lower.includes("mp4") || lower.includes("aac") || lower.includes("m4a")) {
    return "m4a";
  }
  if (lower.includes("ogg")) {
    return "ogg";
  }
  return "webm";
}

export function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
