"use client";

import React from "react";
import { motion } from "framer-motion";
import { CATEGORY_COLORS, CATEGORY_ICONS, type GameCategory } from "@/lib/game-words";
import FeyLogo from "@/components/ui/FeyLogo";

import { type TeamId } from "@/store/useGameStore";

export interface TeamBoardData {
  id: TeamId;
  name: string;
  score: number;
  color: string;
  symbol: string;
}

interface BoardMapProps {
  scoreA: number;
  scoreB: number;
  scoreC?: number;
  scoreD?: number;
  scoreGoal: number;
  colorA: string;
  colorB: string;
  colorC?: string;
  colorD?: string;
  nameA?: string;
  nameB?: string;
  nameC?: string;
  nameD?: string;
  activeTeam: TeamId | null;
  gameMode?: "classic" | "masterchef";
  compact?: boolean;
  teams?: TeamBoardData[];
}

interface TileInfo {
  index: number;
  label: string;
  type: "start" | "finish" | "chance" | "double" | "bonus" | "challenge" | "normal";
  bgColor: string;
  textColor: string;
  category: GameCategory;
  icon?: string;
}

const CATEGORIES_CYCLE: GameCategory[] = ["Object", "Nature", "Person", "Action", "World", "Random"];

const getTileInfo = (idx: number, totalTiles: number): TileInfo => {
  const category = CATEGORIES_CYCLE[idx % 6];
  const color = CATEGORY_COLORS[category];

  if (idx === 0) {
    return {
      index: idx,
      label: "Start",
      type: "start",
      bgColor: "#4B5563",
      textColor: "#F3F4F6",
      category: "Random",
      icon: "🏁",
    };
  }
  if (idx === totalTiles - 1) {
    return {
      index: idx,
      label: "Finish",
      type: "finish",
      bgColor: "#D97706",
      textColor: "#FEF3C7",
      category: "Random",
      icon: "🏆",
    };
  }

  let label: string = category;
  let type: TileInfo["type"] = "normal";
  let tileIcon: string | undefined = undefined;

  if (idx % 7 === 4) {
    type = "chance";
    tileIcon = "🎲";
    label = "Chance";
  } else if (idx % 7 === 2) {
    type = "double";
    tileIcon = "🔥";
    label = "Double";
  } else if (idx % 7 === 0) {
    type = "bonus";
    tileIcon = "⭐";
    label = "Bonus";
  } else if (idx % 7 === 5) {
    type = "challenge";
    tileIcon = "🧠";
    label = "Challenge";
  }

  return {
    index: idx,
    label,
    type,
    bgColor: color,
    textColor: color,
    category,
    icon: tileIcon,
  };
};

export default function BoardMap({
  scoreA,
  scoreB,
  scoreC,
  scoreD,
  scoreGoal,
  colorA,
  colorB,
  colorC,
  colorD,
  nameA = "Team Alpha",
  nameB = "Team Omega",
  nameC = "Team Delta",
  nameD = "Team Sigma",
  activeTeam,
  gameMode = "classic",
  compact = false,
  teams,
}: BoardMapProps) {
  const isMasterchef = gameMode === "masterchef";
  const tileCount = Math.max(10, scoreGoal);

  // Responsive column count (5 columns on mobile for 20/30 pts provides breathable grid sizing)
  const cols = 5;

  // Build active teams list
  const teamsList: TeamBoardData[] = teams || [
    { id: "A", name: nameA, score: scoreA, color: colorA, symbol: "A" },
    { id: "B", name: nameB, score: scoreB, color: colorB, symbol: "Ω" },
    ...(scoreC !== undefined && colorC ? [{ id: "C" as TeamId, name: nameC, score: scoreC, color: colorC, symbol: "Δ" }] : []),
    ...(scoreD !== undefined && colorD ? [{ id: "D" as TeamId, name: nameD, score: scoreD, color: colorD, symbol: "Σ" }] : []),
  ];

  // Generate tiles array
  const tiles: TileInfo[] = Array.from({ length: tileCount }, (_, i) => getTileInfo(i, tileCount));

  // Snake order coordinates (Row 0: Left to Right -> Row 1: Right to Left -> Row 2: Left to Right...)
  const getCoordinates = (i: number) => {
    const row = Math.floor(i / cols);
    const isEvenRow = row % 2 === 0;
    const col = isEvenRow ? i % cols : cols - 1 - (i % cols);
    return { row, col, isEvenRow };
  };

  const gridColsClass =
    teamsList.length === 2
      ? "grid-cols-2"
      : teamsList.length === 3
      ? "grid-cols-3"
      : "grid-cols-2 sm:grid-cols-4";

  return (
    <div className="w-full flex flex-col gap-3 max-w-2xl mx-auto">
      {/* Race Progress Bar & Score Overview Header */}
      {!compact && (
        <div className="space-y-2.5 pb-1">
          <div className={`grid ${gridColsClass} gap-2.5`}>
            {teamsList.map((t) => {
              const safeScore = Math.max(0, t.score);
              const pct = Math.min(100, Math.round((safeScore / scoreGoal) * 100));
              const isActive = isMasterchef || activeTeam === t.id;

              return (
                <div
                  key={t.id}
                  className="p-2.5 sm:p-3 rounded-2xl border flex flex-col justify-between shadow-2xs"
                  style={{
                    borderColor: `${t.color}35`,
                    backgroundColor: `${t.color}0C`,
                  }}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[11px] font-bold font-space flex items-center gap-1.5 truncate" style={{ color: t.color }}>
                      <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: t.color }} />
                      <span className="truncate">{t.name}</span>
                    </span>
                    {isActive && (
                      <span
                        className="text-[9px] uppercase px-1.5 py-0.2 rounded font-black shrink-0"
                        style={{
                          backgroundColor: `${t.color}20`,
                          color: t.color,
                        }}
                      >
                        Active
                      </span>
                    )}
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="font-space font-black text-lg sm:text-2xl text-[var(--text)]">
                      {safeScore}
                      <span className="text-[10px] font-normal text-[var(--text-mute)] font-mono ml-1">/ {scoreGoal}</span>
                    </span>
                    <span className="text-[10px] font-mono font-bold text-[var(--text-dim)]">{pct}%</span>
                  </div>
                  {/* Progress Line */}
                  <div className="w-full h-1.5 rounded-full bg-[var(--bg)] overflow-hidden mt-1.5 border border-[var(--border-dim)]/40">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ backgroundColor: t.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Snake Game Board Grid */}
      <div
        className="w-full relative select-none p-1"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: "0.375rem",
        }}
      >
        {tiles.map((tile) => {
          const { row, col } = getCoordinates(tile.index);
          const categoryColor = CATEGORY_COLORS[tile.category];

          const isStart = tile.type === "start";
          const isFinish = tile.type === "finish";

          // Find teams on this tile
          const teamsOnTile = teamsList.filter((t) => {
            const safeScore = Math.max(0, t.score);
            const tileIdx = Math.max(0, Math.min(tileCount - 1, safeScore));
            return tileIdx === tile.index;
          });

          const isCurrent = teamsOnTile.length > 0;

          return (
            <div
              key={tile.index}
              className={`relative rounded-2xl flex flex-col items-center justify-between p-1.5 sm:p-2 transition-all min-h-[56px] sm:min-h-[64px] border ${
                isFinish
                  ? "bg-amber-500/20 border-amber-500/60 shadow-md ring-1 ring-amber-500/40"
                  : isStart
                  ? "bg-[var(--bg-card)] border-[var(--border-dim)] shadow-xs"
                  : isCurrent
                  ? "bg-[var(--bg-card)] shadow-md ring-2 ring-offset-1 ring-offset-[var(--bg)]"
                  : "bg-[var(--bg-card)]/80 hover:bg-[var(--bg-card)] border-[var(--border-dim)]/70 shadow-2xs"
              }`}
              style={{
                gridColumnStart: col + 1,
                gridRowStart: row + 1,
                borderColor: isCurrent
                  ? teamsOnTile.length > 1
                    ? "var(--gold)"
                    : teamsOnTile[0].color
                  : isFinish
                  ? "#F59E0B"
                  : undefined,
              }}
            >
              {/* Category Color Bar Indicator on Top Edge */}
              <div
                className="absolute top-0 inset-x-2 h-1 rounded-full opacity-80"
                style={{ backgroundColor: isStart ? "#6B7280" : isFinish ? "#F59E0B" : categoryColor }}
              />

              {/* Tile Header: Step Index & Badge */}
              <div className="w-full flex items-center justify-between text-[10px] font-space font-bold leading-none pt-0.5">
                <span
                  className="font-mono text-[10px] sm:text-[11px] font-black"
                  style={{
                    color: isStart ? "#9CA3AF" : isFinish ? "#D97706" : "var(--text-dim)",
                  }}
                >
                  {isStart ? "START" : isFinish ? "FINISH" : tile.index}
                </span>

                {/* Modifier icon or category pill */}
                {tile.icon ? (
                  <span className="text-xs" title={tile.label}>
                    {tile.icon}
                  </span>
                ) : (
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0 opacity-70"
                    style={{ backgroundColor: categoryColor }}
                    title={tile.category}
                  />
                )}
              </div>

              {/* Pawn / Scholar Tokens Center Slot */}
              <div className="flex items-center justify-center gap-1 w-full my-auto py-0.5 min-h-[22px] flex-wrap">
                {teamsOnTile.map((t) => (
                  <motion.div
                    key={t.id}
                    layoutId={`token-${t.id}`}
                    initial={{ scale: 0.6, y: -4 }}
                    animate={{ scale: [0.8, 1.15, 1], y: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full shadow-md text-white font-space font-black text-[9px] sm:text-[10px] border-2 border-white dark:border-black shrink-0"
                    style={{ backgroundColor: t.color }}
                    title={`${t.name} Position`}
                  >
                    {t.symbol}
                  </motion.div>
                ))}
              </div>

              {/* Bottom Traversal Trace Dots (Shows who passed this tile) */}
              <div className="w-full flex items-center justify-between px-0.5 text-[8px] font-mono leading-none">
                <div className="flex items-center gap-0.5">
                  {teamsList.map((t) => {
                    const safeScore = Math.max(0, t.score);
                    const tileIdx = Math.max(0, Math.min(tileCount - 1, safeScore));
                    const isTraversed = tile.index <= tileIdx;
                    const isOnTile = teamsOnTile.some((ot) => ot.id === t.id);
                    if (isTraversed && !isOnTile) {
                      return (
                        <span
                          key={t.id}
                          className="w-1 h-1 rounded-full shrink-0"
                          style={{ backgroundColor: t.color }}
                          title={`${t.name} passed here`}
                        />
                      );
                    }
                    return null;
                  })}
                </div>
                {!isStart && !isFinish && (
                  <span className="text-[7.5px] font-medium text-[var(--text-mute)] opacity-60 truncate max-w-[34px]">
                    {tile.category}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
