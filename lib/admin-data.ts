import { supabase, isSupabaseConfigured } from "@/lib/supabase";

export interface FeedbackItem {
  id: string;
  rating: number; // 1-5
  promptType: "what_could_be_better" | "extra_star_if";
  message: string;
  userId?: string;
  username?: string;
  path?: string;
  createdAt: string;
}

export interface IncidentReportItem {
  id: string;
  reporterId?: string;
  reporterEmail?: string;
  reporterUsername?: string;
  category: "offensive_speech" | "harassment" | "inappropriate_content" | "cheating_exploit" | "other";
  details: string;
  targetUser?: string;
  roomId?: string;
  status: "pending" | "investigating" | "resolved";
  createdAt: string;
}

export interface AdminUserItem {
  id: string;
  username: string;
  email?: string;
  isRegistered: boolean; // true = created cloud account with email / Supabase auth, false = guest/local scholar
  avatar: string;
  xp: number;
  streakCurrent: number;
  streakLongest: number;
  isBanned: boolean;
  banReason?: string;
  isDeactivated: boolean;
  createdAt: string;
  lastActive?: string;
}

// ─── In-Memory / Local Cache Fallback ──────────────────────────────────────────
// Ensures the back office and modals work 100% out of the box even before Supabase DB setup
const fallbackFeedback: FeedbackItem[] = [
  {
    id: "fb-1",
    rating: 5,
    promptType: "extra_star_if",
    message: "I’d give an extra star if we had live Yoruba and Hausa pronunciation audio comparisons for historical terms!",
    username: "ChinuaAch",
    path: "/games/trivia",
    createdAt: new Date(Date.now() - 1000 * 60 * 42).toISOString(),
  },
  {
    id: "fb-2",
    rating: 2,
    promptType: "what_could_be_better",
    message: "The mic countdown in solo sprint gave me anxiety on my first try. Would love a 5-second countdown grace period.",
    username: "WoleS_Fan",
    path: "/session/sprint-12",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
  },
  {
    id: "fb-3",
    rating: 5,
    promptType: "extra_star_if",
    message: "I’d give an extra star if there was a multi-round debate league mode for Friday night salons.",
    username: "Chimamanda_N",
    path: "/community",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
  },
  {
    id: "fb-4",
    rating: 4,
    promptType: "extra_star_if",
    message: "I’d give an extra star if the slide generator had an export to PDF option for study circles.",
    username: "Kashim_Scholar",
    path: "/podium",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
  },
  {
    id: "fb-5",
    rating: 1,
    promptType: "what_could_be_better",
    message: "Bluetooth headset mic disconnected mid-speech and I lost my audio recording without an auto-retry warning.",
    username: "AnonymousGuest",
    path: "/session/impromptu",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
  },
];

const fallbackIncidents: IncidentReportItem[] = [
  {
    id: "inc-1",
    reporterEmail: "tunde.ade@example.com",
    reporterUsername: "Tunde_A",
    category: "harassment",
    details: "User @TrollScholar kept interrupting speeches in the community room with loud noises and derogatory remarks.",
    targetUser: "TrollScholar",
    roomId: "ROOM-8492",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
  },
  {
    id: "inc-2",
    reporterEmail: "visitor99@lokinlabs.ng",
    category: "inappropriate_content",
    details: "Found a custom podium slide topic with offensive tribal slurs generated in a public room.",
    targetUser: "AnonymousPresenter",
    roomId: "SLIDES-902",
    status: "investigating",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
  },
  {
    id: "inc-3",
    reporterUsername: "Amaka_P",
    category: "cheating_exploit",
    details: "Suspicious trivia bot submitting answers in under 120ms with 100% accuracy in the national league.",
    targetUser: "FastClicker99",
    status: "resolved",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
  },
];

let fallbackUsers: AdminUserItem[] = [
  {
    id: "u-titans-1",
    username: "Wole Soyinka",
    email: "wole@nobel.lit",
    isRegistered: true,
    avatar: "/avatars/avatar-scholar.svg",
    xp: 4200,
    streakCurrent: 42,
    streakLongest: 50,
    isBanned: false,
    isDeactivated: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
    lastActive: "Today",
  },
  {
    id: "u-titans-2",
    username: "Chimamanda Ngozi Adichie",
    email: "chimamanda@fey.ng",
    isRegistered: true,
    avatar: "/avatars/avatar-philosopher.svg",
    xp: 3850,
    streakCurrent: 28,
    streakLongest: 35,
    isBanned: false,
    isDeactivated: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 45).toISOString(),
    lastActive: "Today",
  },
  {
    id: "u-titans-3",
    username: "Chinua Achebe",
    email: "achebe@fey.ng",
    isRegistered: true,
    avatar: "/avatars/avatar-polymath.svg",
    xp: 3400,
    streakCurrent: 19,
    streakLongest: 29,
    isBanned: false,
    isDeactivated: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    lastActive: "Yesterday",
  },
  {
    id: "u-troll-1",
    username: "TrollScholar",
    email: "troll@burnermail.org",
    isRegistered: true,
    avatar: "/avatars/avatar-scholar.svg",
    xp: 120,
    streakCurrent: 0,
    streakLongest: 1,
    isBanned: true,
    banReason: "Repeated harassment in public salons (Report #inc-1)",
    isDeactivated: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 4).toISOString(),
    lastActive: "2 days ago",
  },
  {
    id: "u-clicker-1",
    username: "FastClicker99",
    isRegistered: false, // Guest / local scholar without registered cloud account
    avatar: "/avatars/avatar-scholar.svg",
    xp: 890,
    streakCurrent: 2,
    streakLongest: 3,
    isBanned: false,
    isDeactivated: true,
    banReason: "Suspicious API rate limit breach",
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 8).toISOString(),
    lastActive: "3 days ago",
  },
];

// ─── Feedback CRUD ────────────────────────────────────────────────────────────

export async function saveFeedback(item: Omit<FeedbackItem, "id" | "createdAt">): Promise<FeedbackItem> {
  const newItem: FeedbackItem = {
    id: "fb-" + Math.random().toString(36).slice(2, 9),
    rating: item.rating,
    promptType: item.promptType,
    message: item.message.trim(),
    userId: item.userId,
    username: item.username || "Scholar",
    path: item.path || "/",
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("feedback_responses").insert([{
        rating: newItem.rating,
        prompt_type: newItem.promptType,
        message: newItem.message,
        user_id: newItem.userId || null,
        username: newItem.username || null,
        path: newItem.path || null,
      }]).select().single();

      if (!error && data) {
        newItem.id = data.id;
        newItem.createdAt = data.created_at;
      }
    } catch (err) {
      console.warn("Supabase feedback save warning, using fallback cache:", err);
    }
  }

  fallbackFeedback.unshift(newItem);
  return newItem;
}

export async function getAllFeedback(): Promise<FeedbackItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("feedback_responses")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          rating: d.rating,
          promptType: d.prompt_type,
          message: d.message,
          userId: d.user_id,
          username: d.username,
          path: d.path,
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase getAllFeedback warning, using fallback:", err);
    }
  }
  return fallbackFeedback;
}

// ─── Incidents CRUD ───────────────────────────────────────────────────────────

export async function saveIncidentReport(item: Omit<IncidentReportItem, "id" | "status" | "createdAt">): Promise<IncidentReportItem> {
  const newIncident: IncidentReportItem = {
    id: "inc-" + Math.random().toString(36).slice(2, 9),
    reporterId: item.reporterId,
    reporterEmail: item.reporterEmail?.trim(),
    reporterUsername: item.reporterUsername || "Anonymous Reporter",
    category: item.category,
    details: item.details.trim(),
    targetUser: item.targetUser?.trim(),
    roomId: item.roomId?.trim(),
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.from("incident_reports").insert([{
        reporter_id: newIncident.reporterId || null,
        reporter_email: newIncident.reporterEmail || null,
        reporter_username: newIncident.reporterUsername || null,
        category: newIncident.category,
        details: newIncident.details,
        target_user: newIncident.targetUser || null,
        room_id: newIncident.roomId || null,
        status: newIncident.status,
      }]).select().single();

      if (!error && data) {
        newIncident.id = data.id;
        newIncident.createdAt = data.created_at;
      }
    } catch (err) {
      console.warn("Supabase incident save warning, using fallback:", err);
    }
  }

  fallbackIncidents.unshift(newIncident);
  return newIncident;
}

export async function getAllIncidents(): Promise<IncidentReportItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("incident_reports")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((d: any) => ({
          id: d.id,
          reporterId: d.reporter_id,
          reporterEmail: d.reporter_email,
          reporterUsername: d.reporter_username,
          category: d.category,
          details: d.details,
          targetUser: d.target_user,
          roomId: d.room_id,
          status: d.status,
          createdAt: d.created_at,
        }));
      }
    } catch (err) {
      console.warn("Supabase getAllIncidents warning, using fallback:", err);
    }
  }
  return fallbackIncidents;
}

export async function updateIncidentStatus(id: string, status: IncidentReportItem["status"]): Promise<boolean> {
  const item = fallbackIncidents.find((i) => i.id === id);
  if (item) {
    item.status = status;
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from("incident_reports")
        .update({ status })
        .eq("id", id);
      return !error;
    } catch (err) {
      console.warn("Supabase updateIncidentStatus warning:", err);
    }
  }
  return true;
}

// ─── Users & Moderation ───────────────────────────────────────────────────────

export async function getAllUsers(): Promise<AdminUserItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("xp", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((p: any) => ({
          id: p.id,
          username: p.username || "Scholar",
          email: p.email,
          isRegistered: Boolean(p.email), // Registered via Supabase Auth
          avatar: p.avatar || "/avatars/avatar-scholar.svg",
          xp: p.xp || 0,
          streakCurrent: p.streak?.current || 0,
          streakLongest: p.streak?.longest || 0,
          isBanned: Boolean(p.is_banned),
          banReason: p.ban_reason || undefined,
          isDeactivated: Boolean(p.is_deactivated),
          createdAt: p.created_at || new Date().toISOString(),
          lastActive: p.updated_at ? new Date(p.updated_at).toLocaleDateString() : "Recent",
        }));
      }
    } catch (err) {
      console.warn("Supabase getAllUsers warning, using fallback list:", err);
    }
  }
  return fallbackUsers;
}

export async function moderateUser(
  userId: string,
  action: "ban" | "unban" | "deactivate" | "activate",
  reason?: string
): Promise<AdminUserItem | null> {
  // Update in local fallback
  let target = fallbackUsers.find((u) => u.id === userId || u.username === userId);
  
  if (!target) {
    // If not found in seed, create an entry so action takes effect
    target = {
      id: userId,
      username: userId,
      isRegistered: false,
      avatar: "/avatars/avatar-scholar.svg",
      xp: 0,
      streakCurrent: 0,
      streakLongest: 0,
      isBanned: false,
      isDeactivated: false,
      createdAt: new Date().toISOString(),
    };
    fallbackUsers.push(target);
  }

  if (action === "ban") {
    target.isBanned = true;
    target.isDeactivated = true;
    target.banReason = reason || "Violated scholarly conduct";
  } else if (action === "unban") {
    target.isBanned = false;
    target.banReason = undefined;
  } else if (action === "deactivate") {
    target.isDeactivated = true;
  } else if (action === "activate") {
    target.isDeactivated = false;
    target.isBanned = false;
    target.banReason = undefined;
  }

  // Update in Supabase if available
  if (isSupabaseConfigured && supabase) {
    try {
      const updates: any = {};
      if (action === "ban") {
        updates.is_banned = true;
        updates.is_deactivated = true;
        updates.ban_reason = reason || "Violated scholarly conduct";
      } else if (action === "unban") {
        updates.is_banned = false;
        updates.ban_reason = null;
      } else if (action === "deactivate") {
        updates.is_deactivated = true;
      } else if (action === "activate") {
        updates.is_deactivated = false;
        updates.is_banned = false;
        updates.ban_reason = null;
      }

      await supabase.from("user_profiles").update(updates).eq("id", userId);
    } catch (err) {
      console.warn("Supabase user moderation update error:", err);
    }
  }

  return target;
}
