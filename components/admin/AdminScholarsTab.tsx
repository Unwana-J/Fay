"use client";

import { useMemo, useState } from "react";
import {
  Ban,
  CheckCircle2,
  Download,
  Flame,
  Search,
  UserCheck,
} from "lucide-react";
import type { AdminUserItem } from "@/lib/admin-data";
import type { TopScholarRow } from "@/lib/admin-engagement";

type UserFilter = "all" | "registered" | "guest" | "active" | "banned" | "deactivated";
type UserSort = "xp" | "hours" | "streak" | "recent";

interface Props {
  users: AdminUserItem[];
  topScholars: TopScholarRow[];
  onModerate: (
    userId: string,
    action: "ban" | "unban" | "deactivate" | "activate",
    reason?: string
  ) => void;
  onRequestBan: (user: AdminUserItem) => void;
}

export default function AdminScholarsTab({
  users,
  topScholars,
  onModerate,
  onRequestBan,
}: Props) {
  const [userFilter, setUserFilter] = useState<UserFilter>("all");
  const [userSort, setUserSort] = useState<UserSort>("xp");
  const [userSearch, setUserSearch] = useState("");

  const statsByIdOrName = useMemo(() => {
    const map = new Map<string, TopScholarRow>();
    for (const s of topScholars) {
      map.set(s.id, s);
      map.set(s.username.toLowerCase(), s);
    }
    return map;
  }, [topScholars]);

  const enrichedAndSorted = useMemo(() => {
    const list = users
      .map((u) => {
        const match =
          statsByIdOrName.get(u.id) ||
          statsByIdOrName.get(u.username.toLowerCase());
        const lastActiveIso = match?.lastActiveIso || u.lastActiveIso || u.createdAt;
        return {
          ...u,
          totalHours: match?.totalHours ?? 0,
          totalSessions: match?.totalSessions ?? 0,
          effectiveLastActiveIso: lastActiveIso,
        };
      })
      .filter((u) => {
        if (userFilter === "registered" && !u.isRegistered && !u.email) return false;
        if (userFilter === "guest" && (u.isRegistered || u.email)) return false;
        if (userFilter === "active" && (u.isBanned || u.isDeactivated)) return false;
        if (userFilter === "banned" && !u.isBanned) return false;
        if (userFilter === "deactivated" && !u.isDeactivated) return false;
        if (userSearch.trim()) {
          const q = userSearch.toLowerCase();
          const matchUser = u.username?.toLowerCase().includes(q);
          const matchEmail = u.email?.toLowerCase().includes(q);
          if (!matchUser && !matchEmail) return false;
        }
        return true;
      });

    list.sort((a, b) => {
      if (userSort === "hours") return b.totalHours - a.totalHours || b.xp - a.xp;
      if (userSort === "streak") return b.streakLongest - a.streakLongest || b.streakCurrent - a.streakCurrent;
      if (userSort === "recent") {
        const ta = a.effectiveLastActiveIso ? new Date(a.effectiveLastActiveIso).getTime() : 0;
        const tb = b.effectiveLastActiveIso ? new Date(b.effectiveLastActiveIso).getTime() : 0;
        return tb - ta;
      }
      return b.xp - a.xp;
    });

    return list;
  }, [users, statsByIdOrName, userFilter, userSort, userSearch]);

  const exportCsv = () => {
    const header = [
      "ID",
      "Username",
      "Email",
      "Account Type",
      "Status",
      "XP",
      "Current Streak",
      "Longest Streak",
      "Hours Played",
      "Rounds Played",
      "Last Active",
    ];
    const rows = enrichedAndSorted.map((u) => [
      u.id,
      u.username,
      u.email || "",
      u.isRegistered || u.email ? "Registered" : "Guest",
      u.isBanned ? "Banned" : u.isDeactivated ? "Deactivated" : "Active",
      String(u.xp),
      String(u.streakCurrent),
      String(u.streakLongest),
      String(u.totalHours),
      String(u.totalSessions),
      u.effectiveLastActiveIso || "",
    ]);
    const csv = [header, ...rows]
      .map((r) => r.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fey-scholars-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Filter, Sort & Export Bar */}
      <div
        className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl surface border"
        style={{ borderColor: "var(--border-dim)" }}
      >
        <div className="flex flex-wrap items-center gap-1.5">
          {(["all", "registered", "guest", "active", "banned", "deactivated"] as const).map((uf) => (
            <button
              key={uf}
              onClick={() => setUserFilter(uf)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono capitalize transition-colors cursor-pointer ${
                userFilter === uf
                  ? "text-white font-bold"
                  : "text-[var(--text-dim)] hover:bg-[var(--bg-input)]"
              }`}
              style={userFilter === uf ? { background: "var(--olive)" } : {}}
            >
              {uf === "registered"
                ? "Registered"
                : uf === "guest"
                ? "Guest"
                : uf}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={userSort}
            onChange={(e) => setUserSort(e.target.value as UserSort)}
            className="text-xs font-mono rounded-xl px-3 py-2 border focus:outline-none"
            style={{
              background: "var(--bg-input)",
              borderColor: "var(--border-dim)",
              color: "var(--text)",
            }}
            aria-label="Sort scholars"
          >
            <option value="xp">Sort: Highest XP</option>
            <option value="hours">Sort: Most Hours Played</option>
            <option value="streak">Sort: Longest Streak</option>
            <option value="recent">Sort: Recently Active</option>
          </select>

          <div className="relative flex-1 sm:w-56">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-mute)]" />
            <input
              type="text"
              placeholder="Search scholars..."
              value={userSearch}
              onChange={(e) => setUserSearch(e.target.value)}
              className="w-full text-xs rounded-xl pl-8 pr-3 py-2 border focus:outline-none"
              style={{
                background: "var(--bg-input)",
                borderColor: "var(--border-dim)",
                color: "var(--text)",
              }}
            />
          </div>

          <button
            type="button"
            onClick={exportCsv}
            className="px-3 py-2 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
            style={{ borderColor: "var(--border-dim)", color: "var(--text)" }}
          >
            <Download size={13} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Scholars Table */}
      <div className="surface border rounded-2xl overflow-hidden" style={{ borderColor: "var(--border-dim)" }}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead
              className="border-b font-mono uppercase text-[10px]"
              style={{
                borderColor: "var(--border-dim)",
                background: "var(--bg-input)",
                color: "var(--text-mute)",
              }}
            >
              <tr>
                <th className="py-3 px-4">Scholar</th>
                <th className="py-3 px-4">Account Type</th>
                <th className="py-3 px-4">Hours & Rounds</th>
                <th className="py-3 px-4">XP & Streak</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y font-mono" style={{ borderColor: "var(--border-dim)" }}>
              {enrichedAndSorted.map((u) => (
                <tr key={u.id} className="hover:bg-[var(--bg-input)]/40 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-7 h-7 rounded-full border flex items-center justify-center font-bold text-xs shrink-0"
                        style={{
                          background: "var(--bg-card)",
                          borderColor: "var(--border-dim)",
                        }}
                      >
                        {u.username.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold font-sans" style={{ color: "var(--text)" }}>
                          {u.username}
                        </div>
                        <div className="text-[10px] truncate max-w-[140px]" style={{ color: "var(--text-mute)" }}>
                          ID: {u.id.slice(0, 14)}...
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    {u.isRegistered || u.email ? (
                      <div className="space-y-1">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                          style={{
                            background: "rgba(68, 78, 44, 0.14)",
                            color: "var(--olive)",
                          }}
                        >
                          <CheckCircle2 size={12} />
                          <span>Registered</span>
                        </span>
                        <div className="text-[11px] font-medium truncate max-w-[180px]" style={{ color: "var(--text)" }}>
                          {u.email}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                          style={{
                            background: "var(--bg-input)",
                            color: "var(--text-dim)",
                          }}
                        >
                          <span>Guest</span>
                        </span>
                        <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                          Local identity
                        </div>
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold">{u.totalHours} hrs</div>
                    <div className="text-[10px]" style={{ color: "var(--text-mute)" }}>
                      {u.totalSessions} rounds
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <div className="font-semibold" style={{ color: "var(--gold)" }}>
                      {u.xp.toLocaleString()} XP
                    </div>
                    <div
                      className="flex items-center gap-1 text-[11px]"
                      style={{ color: "var(--text-dim)" }}
                    >
                      <Flame size={11} style={{ color: "var(--gold)" }} />
                      <span>
                        {u.streakCurrent}d streak (Max {u.streakLongest}d)
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-4" style={{ color: "var(--text-mute)" }}>
                    {u.effectiveLastActiveIso
                      ? new Date(u.effectiveLastActiveIso).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : u.lastActive || "—"}
                  </td>

                  <td className="py-3 px-4">
                    {u.isBanned ? (
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                        style={{
                          background: "rgba(181, 58, 58, 0.16)",
                          color: "var(--red)",
                        }}
                      >
                        Banned
                      </span>
                    ) : u.isDeactivated ? (
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                        style={{
                          background: "rgba(166, 124, 30, 0.16)",
                          color: "var(--gold)",
                        }}
                      >
                        Deactivated
                      </span>
                    ) : (
                      <span
                        className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold"
                        style={{
                          background: "rgba(68, 78, 44, 0.15)",
                          color: "var(--olive)",
                        }}
                      >
                        Active
                      </span>
                    )}
                    {u.banReason && (
                      <div
                        className="text-[10px] font-semibold truncate max-w-xs mt-1"
                        style={{ color: "var(--red)" }}
                        title={u.banReason}
                      >
                        {u.banReason}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {u.isBanned || u.isDeactivated ? (
                        <button
                          onClick={() => onModerate(u.id, "activate")}
                          className="px-2.5 py-1 rounded-lg border text-[11px] font-bold hover:bg-[var(--bg-input)] transition-colors flex items-center gap-1 cursor-pointer"
                          style={{ borderColor: "var(--border-dim)", color: "var(--olive)" }}
                        >
                          <UserCheck size={12} />
                          <span>Reinstate</span>
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onModerate(u.id, "deactivate")}
                            className="px-2.5 py-1 rounded-lg border text-[11px] hover:bg-[var(--bg-input)] transition-colors cursor-pointer"
                            style={{ borderColor: "var(--border-dim)", color: "var(--text-dim)" }}
                          >
                            Deactivate
                          </button>
                          <button
                            onClick={() => onRequestBan(u)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-white hover:brightness-110 transition-colors flex items-center gap-1 cursor-pointer"
                            style={{ background: "var(--terra)" }}
                          >
                            <Ban size={12} />
                            <span>Ban</span>
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
