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

  // Columns: 6 for 30-tile board, 10 for 50/100-tile boards
  const cols = scoreGoal === 30 ? 6 : 10;

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

  return (
    <div className="w-full flex flex-col gap-4 max-w-4xl mx-auto p-4 surface rounded-3xl border border-[var(--border-dim)] shadow-sm">
      {/* Mini Score Panel */}
      <div className="flex justify-between items-center px-2 py-1 text-xs font-space border-b border-[var(--border-dim)]/40 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: colorA }} />
          <span className="font-bold text-[var(--text)]">Alpha:</span>
          <span className="text-[var(--text-dim)]">{safeScoreA} / {scoreGoal} pts</span>
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
          <span className="text-[var(--text-dim)]">{safeScoreB} / {scoreGoal} pts</span>
        </div>
      </div>

      {/* Grid Board Container */}
      <div 
        className="gap-1.5 p-1 select-none relative"
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
        }}
      >
        {tiles.map((tile) => {
          const { row, col } = getCoordinates(tile.index);
          const hasA = tileIndexA === tile.index;
          const hasB = tileIndexB === tile.index;
          const isSpecial = tile.type !== "normal" && tile.type !== "start" && tile.type !== "finish";
          const tileCategoryColor = CATEGORY_COLORS[tile.category];

          // Both teams have moved past this tile
          const passedByBoth = tile.index < tileIndexA && tile.index < tileIndexB;
          // At least one team has moved past this tile
          const passedByAny = tile.index < tileIndexA || tile.index < tileIndexB;

          // Background color determination
          let currentBgColor = tile.bgColor;
          let currentTextColor = tile.textColor;

          if (passedByBoth) {
            currentBgColor = tileCategoryColor; // Solid 100% opacity
            currentTextColor = "#ffffff"; // White text
          } else if (passedByAny) {
            currentBgColor = `${tileCategoryColor}80`; // 50% opacity
            currentTextColor = "var(--text)"; // High contrast text
          } else {
            currentBgColor = `${tileCategoryColor}20`; // 12.5% opacity
            currentTextColor = tileCategoryColor;
          }

          // Border color determination
          let currentBorderColor = hasA || hasB 
            ? "var(--text)" 
            : passedByBoth 
            ? "var(--text)" // Bold black/white border when fully conquered
            : passedByAny 
            ? `${tileCategoryColor}` // Solid category color border
            : `${tileCategoryColor}90`; // 56% opacity category border

          let currentBorderWidth = hasA || hasB ? "2.5px" : passedByBoth || passedByAny ? "2px" : "1.5px";

          // Dynamically scale tile padding and fonts based on board size
          const isLargeBoard = tileCount > 30;
          const tileClass = isLargeBoard 
            ? "aspect-square rounded-lg border flex flex-col items-center justify-between p-0.5 sm:p-1 transition-all relative overflow-hidden text-[7px]" 
            : "aspect-square rounded-2xl border flex flex-col items-center justify-between p-1.5 sm:p-2 transition-all relative overflow-hidden";

          return (
            <div
              key={tile.index}
              className={tileClass}
              style={{
                backgroundColor: currentBgColor,
                borderColor: currentBorderColor,
                borderWidth: currentBorderWidth,
                gridColumnStart: col + 1,
                gridRowStart: row + 1,
                boxShadow: hasA || hasB ? `0 0 12px ${tileCategoryColor}40` : undefined
              }}
            >
              {/* Tile label / icon */}
              <div className="w-full flex justify-between items-start leading-none">
                <span
                  className="font-space font-black"
                  style={{ 
                    color: currentTextColor, 
                    fontSize: isLargeBoard ? "7px" : "9px" 
                  }}
                >
                  {tile.type === "start" ? "START" : tile.type === "finish" ? "FINISH" : tile.index}
                </span>
                {tile.icon && (
                  <span className={isLargeBoard ? "text-[8px] sm:text-xs" : "text-xs sm:text-sm"}>
                    {tile.icon}
                  </span>
                )}
              </div>

              {/* Tokens overlay container */}
              <div className="flex justify-center items-center gap-0.5 w-full relative" style={{ height: isLargeBoard ? "14px" : "32px" }}>
                {hasA && (
                  <motion.div
                    layoutId="token-A"
                    transition={{ type: "spring", stiffness: 180, damping: 15 }}
                    className="z-10 filter drop-shadow-xs"
                  >
                    <FeyLogo size={isLargeBoard ? 14 : 26} color={colorA} />
                  </motion.div>
                )}
                {hasB && (
                  <motion.div
                    layoutId="token-B"
                    transition={{ type: "spring", stiffness: 180, damping: 15 }}
                    className="z-10 filter drop-shadow-xs"
                  >
                    <FeyLogo size={isLargeBoard ? 14 : 26} color={colorB} />
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
