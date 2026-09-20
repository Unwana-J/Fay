"use client";

import React from "react";
import Image from "next/image";
import { resolveAvatarSrc } from "@/lib/avatars";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
  avatar?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  alt?: string;
}

const SIZE_MAP = {
  xs: { px: 20, class: "w-5 h-5 text-[11px]" },
  sm: { px: 28, class: "w-7 h-7 text-xs" },
  md: { px: 36, class: "w-9 h-9 text-sm" },
  lg: { px: 48, class: "w-12 h-12 text-base" },
  xl: { px: 64, class: "w-16 h-16 text-xl" },
  "2xl": { px: 84, class: "w-21 h-21 text-3xl" },
};

export default function UserAvatar({
  avatar,
  size = "md",
  className,
  alt = "User avatar",
}: UserAvatarProps) {
  const resolved = resolveAvatarSrc(avatar);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  if (!resolved.isImage) {
    return (
      <div
        className={cn(
          "rounded-full flex items-center justify-center select-none shrink-0 border",
          sizeConfig.class,
          className
        )}
        style={{
          background: "var(--bg-input)",
          borderColor: "var(--border)",
        }}
      >
        <span>{resolved.value}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-full overflow-hidden shrink-0 border relative flex items-center justify-center",
        sizeConfig.class,
        className
      )}
      style={{
        borderColor: "var(--border)",
        background: "var(--bg-card)",
      }}
    >
      <img
        src={resolved.value}
        alt={alt}
        className="w-full h-full object-cover select-none pointer-events-none"
        loading="eager"
      />
    </div>
  );
}
