import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import type { CompletedSession, StreakData, UserProfile } from "@/store/useAppStore";

export interface CloudUserData {
  profile: Partial<UserProfile>;
  streak?: StreakData;
  settings?: any;
  sessions?: CompletedSession[];
  claimedQuestIds?: string[];
  unlockedAchievements?: string[];
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: { id: string; email: string };
  data?: CloudUserData;
  isNewUser?: boolean;
}

/**
 * Sign up a new user with email and password, and seed cloud database with their local progress.
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  localState: {
    profile: UserProfile;
    streak: StreakData;
    settings: any;
    sessions: CompletedSession[];
    claimedQuestIds: string[];
  }
): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: true,
      user: { id: localState.profile.id || "local-user", email },
      isNewUser: true,
    };
  }

  try {
    const trimmedEmail = email.trim().toLowerCase();
    const redirectOrigin =
      typeof window !== "undefined"
        ? window.location.origin
        : "https://fey.lokinlabs.com.ng";

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: trimmedEmail,
      password,
      options: {
        data: {
          username: localState.profile.username || "Scholar",
          avatar: localState.profile.avatar,
        },
        emailRedirectTo: redirectOrigin,
      },
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const user = authData.user;
    if (!user) {
      return { success: false, error: "Failed to initialize user session." };
    }

    // If signUp didn't create an active session (e.g. if email confirmation was still enabled),
    // attempt immediate login so user is not stranded waiting for emails
    if (!authData.session) {
      await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      }).catch(() => {});
    }

    // Upsert user profile to Supabase
    const { error: profileError } = await supabase.from("user_profiles").upsert(
      {
        id: user.id,
        email: trimmedEmail,
        username: localState.profile.username || "Scholar",
        avatar: localState.profile.avatar || "/avatars/avatar-scholar.svg",
        bio: localState.profile.bio || "Building knowledge one topic at a time.",
        xp: localState.profile.xp || 0,
        streak: localState.streak,
        settings: localState.settings,
        unlocked_achievements: localState.profile.unlockedAchievements || [],
        claimed_quest_ids: localState.claimedQuestIds || [],
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    if (profileError) {
      console.warn("Could not save cloud profile:", profileError.message);
    }

    // Batch insert any local completed sessions
    if (localState.sessions && localState.sessions.length > 0) {
      const sessionRows = localState.sessions.map((s) => ({
        user_id: user.id,
        topic_id: s.topicId,
        topic_text: s.topicText,
        category: s.category,
        difficulty: s.difficulty,
        date: s.date,
        research_minutes: s.researchMinutes,
        speaking_seconds: s.speakingSeconds,
        notes: s.notes || "",
        summary: s.summary || "",
        reflection: s.reflection || {},
        ratings: s.ratings || {},
        xp_earned: s.xpEarned || 0,
        tags: s.tags || [],
        audio_base64: s.audioBase64 || null,
      }));

      const { error: sessionsError } = await supabase
        .from("completed_sessions")
        .insert(sessionRows);

      if (sessionsError) {
        console.warn("Could not batch upload local sessions:", sessionsError.message);
      }
    }

    return {
      success: true,
      user: { id: user.id, email: user.email || trimmedEmail },
      isNewUser: true,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred during registration.",
    };
  }
}

/**
 * Sign in existing user and download cloud data to sync across devices.
 */
export async function signInWithEmail(email: string, password: string): Promise<AuthResult> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: "Supabase is not configured in this environment.",
    };
  }

  try {
    const trimmedEmail = email.trim().toLowerCase();
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: trimmedEmail,
      password,
    });

    if (authError) {
      return { success: false, error: authError.message };
    }

    const user = authData.user;
    if (!user) {
      return { success: false, error: "Unable to retrieve user credentials." };
    }

    // Fetch cloud profile
    const { data: profileRow, error: fetchProfileError } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    // Fetch completed sessions
    const { data: sessionRows, error: fetchSessionsError } = await supabase
      .from("completed_sessions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    const formattedSessions: CompletedSession[] = (sessionRows || []).map((row: any) => ({
      id: row.id,
      topicId: row.topic_id,
      topicText: row.topic_text,
      category: row.category,
      difficulty: row.difficulty,
      date: row.date,
      researchMinutes: row.research_minutes,
      notes: row.notes || "",
      summary: row.summary || "",
      speakingSeconds: row.speaking_seconds,
      reflection: row.reflection || { interesting: "", hardest: "", different: "" },
      ratings: row.ratings || { confidence: 3, understanding: 3, communication: 3 },
      xpEarned: row.xp_earned || 0,
      tags: row.tags || [],
      audioBase64: row.audio_base64 || undefined,
    }));

    const cloudData: CloudUserData = {
      profile: profileRow
        ? {
            id: user.id,
            email: user.email || trimmedEmail,
            username: profileRow.username || user.user_metadata?.username || "Scholar",
            avatar: profileRow.avatar || user.user_metadata?.avatar || "/avatars/avatar-scholar.svg",
            bio: profileRow.bio || "Building knowledge one topic at a time.",
            xp: profileRow.xp || 0,
            unlockedAchievements: profileRow.unlocked_achievements || [],
            hasClaimedAccount: true,
          }
        : {
            id: user.id,
            email: user.email || trimmedEmail,
            username: user.user_metadata?.username || "Scholar",
            avatar: user.user_metadata?.avatar || "/avatars/avatar-scholar.svg",
            hasClaimedAccount: true,
          },
      streak: profileRow?.streak || undefined,
      settings: profileRow?.settings || undefined,
      claimedQuestIds: profileRow?.claimed_quest_ids || [],
      unlockedAchievements: profileRow?.unlocked_achievements || [],
      sessions: formattedSessions,
    };

    return {
      success: true,
      user: { id: user.id, email: user.email || trimmedEmail },
      data: cloudData,
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || "An unexpected error occurred during sign in.",
    };
  }
}

/**
 * Sign out user from Supabase.
 */
export async function signOutUser(): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured || !supabase) return { success: true };
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

/**
 * Sync active state changes to Supabase cloud profile.
 */
export async function syncStateToCloud(
  userId: string,
  state: {
    profile: UserProfile;
    streak: StreakData;
    settings: any;
    claimedQuestIds: string[];
  }
): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;

  try {
    const { error } = await supabase.from("user_profiles").upsert(
      {
        id: userId,
        email: state.profile.email,
        username: state.profile.username,
        avatar: state.profile.avatar,
        bio: state.profile.bio,
        xp: state.profile.xp,
        streak: state.streak,
        settings: state.settings,
        unlocked_achievements: state.profile.unlockedAchievements,
        claimed_quest_ids: state.claimedQuestIds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" }
    );

    return !error;
  } catch {
    return false;
  }
}

/**
 * Persist a newly completed sprint session to the cloud.
 */
export async function syncSessionToCloud(userId: string, session: CompletedSession): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase || !userId) return false;

  try {
    const { error } = await supabase.from("completed_sessions").insert({
      user_id: userId,
      topic_id: session.topicId,
      topic_text: session.topicText,
      category: session.category,
      difficulty: session.difficulty,
      date: session.date,
      research_minutes: session.researchMinutes,
      speaking_seconds: session.speakingSeconds,
      notes: session.notes || "",
      summary: session.summary || "",
      reflection: session.reflection || {},
      ratings: session.ratings || {},
      xp_earned: session.xpEarned || 0,
      tags: session.tags || [],
      audio_base64: session.audioBase64 || null,
    });

    return !error;
  } catch {
    return false;
  }
}

/**
 * Check if active authenticated Supabase session exists on client boot.
 */
export async function getActiveAuthSession() {
  if (!isSupabaseConfigured || !supabase) return null;
  try {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  } catch {
    return null;
  }
}
