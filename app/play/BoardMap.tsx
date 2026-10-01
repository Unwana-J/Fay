"use client";

import React from "react";
import { motion } from "framer-motion";
import { CATEGORY_COLORS, CATEGORY_ICONS, type GameCategory } from "@/lib/game-words";
import FeyLogo from "@/components/ui/FeyLogo";

interface BoardMapProps {
  scoreA: number;
  scoreB: number;
  scoreGoal: number;
  colorA: string;
  colorB: string;
  activeTeam: "A" | "B" | null;
  gameMode?: "classic" | "masterchef";
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
  const icon = CATEGORY_ICONS[category];

  if (idx === 0) {
    return {
      index: idx,
      label: "Start",
      type: "start",
      bgColor: "var(--border-dim)",
      textColor: "var(--text-mute)",
      category: "Random",
      icon: "🚀"
    };
  }
  if (idx === totalTiles - 1) {
    return {
      index: idx,
      label: "Finish",
      type: "finish",
      bgColor: "var(--gold-dim)",
      textColor: "var(--gold)",
      category: "Random",
      icon: "🏁"
    };
  }

  // Base tile values
  let label: string = category;
  let type: TileInfo["type"] = "normal";
  let tileIcon: string | undefined = undefined;
  let bgColor = `${color}35`; // 20% opacity for highly visible category background tint
  let textColor = color;

  // Modifiers
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
    type = "challenge";
    tileIcon = "🧠";
    label = "Challenge";
  }

  return {
    index: idx,
    label,
    type,
    bgColor,
    textColor,
    category,
    icon: tileIcon
  };
};

export default function BoardMap({
  scoreA,
  scoreB,
  scoreGoal,
  colorA,
  colorB,
  activeTeam,
  gameMode = "classic"
}: BoardMapProps) {
  const isMasterchef = gameMode === "masterchef";
  // Game board tile count matches the scoreGoal exactly (1 space = 1 point)
  const tileCount = scoreGoal;

  // Responsive column count based on score goal
  const cols = scoreGoal <= 20 ? (scoreGoal % 5 === 0 ? 5 : 10) : scoreGoal === 30 ? 6 : 10;

  const safeScoreA = Math.max(0, scoreA);
  const safeScoreB = Math.max(0, scoreB);
  const tileIndexA = Math.max(0, Math.min(tileCount - 1, safeScoreA));
  const tileIndexB = Math.max(0, Math.min(tileCount - 1, safeScoreB));

  // Generate tiles array
  const tiles: TileInfo[] = Array.from({ length: tileCount }, (_, i) => getTileInfo(i, tileCount));

  // Helper to get coordinates in snake order
  const getCoordinates = (i: number) => {
    const row = Math.floor(i / cols);
    const isEvenRow = row % 2 === 0;
    const col = isEvenRow ? (i % cols) : (cols - 1 - (i % cols));
    return { row, col };
  };

  const isVeryLargeBoard = tileCount > 50;
  const isLargeBoard = tileCount > 30;

  return (
    <div className="w-full flex flex-col gap-3.5 max-w-4xl mx-auto p-3 sm:p-4 surface rounded-3xl border border-[var(--border-dim)] shadow-sm">
      {/* Mini Score Panel */}
      <div className="flex justify-between items-center px-2 py-1 text-xs font-space border-b border-[var(--border-dim)]/40 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorA }} />
          <span className="font-bold text-[var(--text)]">Alpha:</span>
          <span className="text-[var(--text-dim)] font-mono font-bold">{safeScoreA} / {scoreGoal} pts</span>
          {(isMasterchef || activeTeam === "A") && (
            <span className="text-[9px] uppercase bg-terra/10 px-1.5 py-0.5 rounded text-[var(--terra)] font-black">
              {isMasterchef ? "Active" : "Playing"}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {(isMasterchef || activeTeam === "B") && (
            <span className="text-[9px] uppercase bg-olive/10 px-1.5 py-0.5 rounded text-[var(--olive)] font-black">
              {isMasterchef ? "Active" : "Playing"}
            </span>
          )}
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorB }} />
          <span className="font-bold text-[var(--text)]">Omega:</span>
          <span className="text-[var(--text-dim)] font-mono font-bold">{safeScoreB} / {scoreGoal} pts</span>
        </div>
      </div>

      {/* Dual Progress Fill Bars */}
      <div className="grid grid-cols-2 gap-3 px-2">
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="font-bold flex items-center gap-1.5" style={{ color: colorA }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorA }} />
              Team Alpha
            </span>
            <span className="text-[var(--text-dim)] font-bold">{Math.round((safeScoreA / scoreGoal) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-input)] overflow-hidden">
            <motion.div 
              className="h-full rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (safeScoreA / scoreGoal) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ backgroundColor: colorA }} 
            />
          </div>
        </div>
        <div className="space-y-1">
          <div className="flex justify-between items-center text-[10px] font-mono">
            <span className="font-bold flex items-center gap-1.5" style={{ color: colorB }}>
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colorB }} />
              Team Omega
            </span>
            <span className="text-[var(--text-dim)] font-bold">{Math.round((safeScoreB / scoreGoal) * 100)}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--bg-input)] overflow-hidden">
            <motion.div 
              className="h-full rounded-full" 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (safeScoreB / scoreGoal) * 100)}%` }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              style={{ backgroundColor: colorB }} 
            />
          </div>
        </div>
      </div>

      {/* Grid Board Container */}
      <div 
        className="p-1 select-none relative"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
          gap: isVeryLargeBoard ? "0.25rem" : "0.375rem",
        }}
      >
        {tiles.map((tile) => {
          const { row, col } = getCoordinates(tile.index);
          const hasA = tileIndexA === tile.index;
          const hasB = tileIndexB === tile.index;
          const isSpecial = tile.type !== "normal" && tile.type !== "start" && tile.type !== "finish";
          const tileCategoryColor = CATEGORY_COLORS[tile.category];

          const passedByA = tile.index < tileIndexA;
          const passedByB = tile.index < tileIndexB;
          const passedByBoth = passedByA && passedByB;
          const passedByAny = passedByA || passedByB;
          const isCurrent = hasA || hasB;

          // Background & Shading determination
          let currentBgColor = tile.bgColor;
          let currentTextColor = tile.textColor;
          let currentBorderColor = "var(--border-dim)";
          let currentBorderStyle: "solid" | "dashed" = "solid";
          let currentBorderWidth = "1.5px";
          let currentOpacity = 1;
          let currentBoxShadow: string | undefined = undefined;

          if (isCurrent) {
            // Team is currently on this tile: elevated and highlighted
            currentOpacity = 1;
            currentBorderStyle = "solid";
            currentBorderWidth = "2.5px";
            currentBorderColor = hasA && hasB ? "var(--text)" : hasA ? colorA : colorB;
            currentBgColor = `${tileCategoryColor}35`;
            currentTextColor = "var(--text)";
            currentBoxShadow = `0 0 0 2px ${hasA ? colorA : colorB}, 0 4px 12px ${hasA ? colorA : colorB}40`;
          } else if (passedByBoth) {
            // Fully conquered by both teams: deeply shaded and darker
            currentOpacity = 1;
            currentBorderStyle = "solid";
            currentBorderWidth = "2px";
            currentBorderColor = "var(--text)";
            currentBgColor = `${tileCategoryColor}60`;
            currentTextColor = "var(--text)";
            currentBoxShadow = "inset 0 0 0 100px rgba(0, 0, 0, 0.18)";
          } else if (passedByA) {
            // Traversed by Team Alpha: clearly darker/shaded with Alpha's tone
            currentOpacity = 1;
            currentBorderStyle = "solid";
            currentBorderWidth = "2px";
            currentBorderColor = colorA;
            currentBgColor = `${colorA}30`;
            currentTextColor = "var(--text)";
            currentBoxShadow = "inset 0 0 0 100px rgba(0, 0, 0, 0.12)";
          } else if (passedByB) {
            // Traversed by Team Omega: clearly darker/shaded with Omega's tone
            currentOpacity = 1;
            currentBorderStyle = "solid";
            currentBorderWidth = "2px";
            currentBorderColor = colorB;
            currentBgColor = `${colorB}30`;
            currentTextColor = "var(--text)";
            currentBoxShadow = "inset 0 0 0 100px rgba(0, 0, 0, 0.12)";
          } else {
            // Upcoming / uncompleted tile: softly muted and semi-transparent
            currentOpacity = 0.38;
            currentBorderStyle = "dashed";
            currentBorderWidth = "1px";
            currentBorderColor = `${tileCategoryColor}60`;
            currentBgColor = `${tileCategoryColor}12`;
            currentTextColor = tileCategoryColor;
            currentBoxShadow = undefined;
          }

          const tileClass = isVeryLargeBoard 
            ? "aspect-square rounded-md border flex flex-col items-center justify-between p-0.5 transition-all relative overflow-hidden" 
            : isLargeBoard 
            ? "aspect-square rounded-lg border flex flex-col items-center justify-between p-0.5 sm:p-1 transition-all relative overflow-hidden" 
            : "aspect-square rounded-2xl border flex flex-col items-center justify-between p-1.5 sm:p-2 transition-all relative overflow-hidden";

          return (
            <div
              key={tile.index}
              className={tileClass}
              style={{
                backgroundColor: currentBgColor,
                borderColor: currentBorderColor,
                borderStyle: currentBorderStyle,
                borderWidth: currentBorderWidth,
                opacity: currentOpacity,
                boxShadow: currentBoxShadow,
                gridColumnStart: col + 1,
                gridRowStart: row + 1,
              }}
            >
              {/* Tile label / icon */}
              <div className="w-full flex justify-between items-start leading-none">
                <span
                  className="font-space font-black"
                  style={{ 
                    color: currentTextColor, 
                    fontSize: isVeryLargeBoard ? "6.5px" : isLargeBoard ? "7.5px" : "9px" 
                  }}
                >
                  {tile.type === "start" ? (isVeryLargeBoard ? "S" : "START") : tile.type === "finish" ? (isVeryLargeBoard ? "F" : "FINISH") : tile.index}
                </span>

                {/* Traversed indicator or tile icon */}
                {passedByAny && !isCurrent ? (
                  <span
                    className="rounded-full inline-block shrink-0 shadow-xs"
                    style={{
                      width: isVeryLargeBoard ? "4px" : "6px",
                      height: isVeryLargeBoard ? "4px" : "6px",
                      backgroundColor: passedByBoth ? "var(--text)" : passedByA ? colorA : colorB,
                    }}
                    title={passedByBoth ? "Traversed by both" : passedByA ? "Traversed by Alpha" : "Traversed by Omega"}
                  />
                ) : tile.icon ? (
                  <span className={isVeryLargeBoard ? "text-[6px]" : isLargeBoard ? "text-[8px] sm:text-xs" : "text-xs sm:text-sm"}>
                    {tile.icon}
                  </span>
                ) : null}
              </div>

              {/* Tokens overlay container */}
              <div 
                className="flex justify-center items-center gap-0.5 w-full relative" 
                style={{ height: isVeryLargeBoard ? "11px" : isLargeBoard ? "14px" : "32px" }}
              >
                {hasA && (
                  <motion.div
                    layoutId="token-A"
                    transition={{ type: "spring", stiffness: 180, damping: 15 }}
                    className="z-10 filter drop-shadow-xs"
                  >
                    <FeyLogo size={isVeryLargeBoard ? 12 : isLargeBoard ? 14 : 26} color={colorA} />
                  </motion.div>
                )}
                {hasB && (
                  <motion.div
                    layoutId="token-B"
                    transition={{ type: "spring", stiffness: 180, damping: 15 }}
                    className="z-10 filter drop-shadow-xs"
                  >
                    <FeyLogo size={isVeryLargeBoard ? 12 : isLargeBoard ? 14 : 26} color={colorB} />
                  </motion.div>
                )}
              </div>

              {/* Dynamic light highlight for special tile titles */}
              {isSpecial && !isLargeBoard && (
                <span className="text-[7px] uppercase font-extrabold tracking-tight opacity-75 hidden sm:block" style={{ color: tile.textColor }}>
                  {tile.label}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
