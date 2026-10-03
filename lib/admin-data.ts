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

// ─── Live In-Memory Cache (Initialized Empty, Populated Strictly by Real Submissions & Supabase) ──
const fallbackFeedback: FeedbackItem[] = [];
const fallbackIncidents: IncidentReportItem[] = [];
let fallbackUsers: AdminUserItem[] = [];

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

export let lastUsersQueryError: any = null;

export async function getAllUsers(): Promise<AdminUserItem[]> {
  lastUsersQueryError = null;
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .order("xp", { ascending: false });

      if (error) {
        lastUsersQueryError = { message: error.message, details: error.details, hint: error.hint, code: error.code };
        console.error("Supabase getAllUsers error:", error.message, error.details);
      }
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
      if (!error && data) {
        lastUsersQueryError = { status: "Empty table returned", count: data.length };
      }
    } catch (err: any) {
      lastUsersQueryError = { caught: err?.message };
      console.warn("Supabase getAllUsers warning, using fallback list:", err);
    }
  } else {
    lastUsersQueryError = { error: "Supabase not configured (missing env vars)" };
    console.warn("Supabase is not configured on server (missing URL or Anon key)");
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
