/**
 * Utility to encode and decode public shared notes into URL-safe strings.
 * Zero-database: state is completely portable via URL.
 */

export interface SharedNotePayload {
  topicId?: string;
  topicText: string;
  category: string;
  difficulty: string;
  notes: string;
  author: string;
  date: string;
  speakingSeconds?: number;
  xpEarned?: number;
  tags?: string[];
}

export function encodeSharedNote(payload: SharedNotePayload): string {
  try {
    const jsonStr = JSON.stringify(payload);
    if (typeof window !== "undefined" && typeof window.btoa === "function") {
      // UTF-8 safe browser base64
      return encodeURIComponent(
        btoa(
          encodeURIComponent(jsonStr).replace(
            /%([0-9A-F]{2})/g,
            function toSolidBytes(_match, p1) {
              return String.fromCharCode(parseInt(p1, 16));
            }
          )
        )
      );
    }
    // Fallback or server-side
    return encodeURIComponent(Buffer.from(jsonStr, "utf-8").toString("base64"));
  } catch (err) {
    console.error("Failed to encode note payload", err);
    return "";
  }
}

export function decodeSharedNote(encoded: string): SharedNotePayload | null {
  try {
    const decodedUri = decodeURIComponent(encoded);
    let jsonStr = "";
    if (typeof window !== "undefined" && typeof window.atob === "function") {
      // UTF-8 safe browser atob
      const binary = atob(decodedUri);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) {
        bytes[i] = binary.charCodeAt(i);
      }
      jsonStr = decodeURIComponent(
        Array.prototype.map
          .call(bytes, (byte: number) => {
            return "%" + ("00" + byte.toString(16)).slice(-2);
          })
          .join("")
      );
    } else {
      jsonStr = Buffer.from(decodedUri, "base64").toString("utf-8");
    }

    const data = JSON.parse(jsonStr);
    if (!data.topicText || !data.notes) {
      return null;
    }
    return data as SharedNotePayload;
  } catch (err) {
    console.error("Failed to decode shared note payload", err);
    return null;
  }
}
