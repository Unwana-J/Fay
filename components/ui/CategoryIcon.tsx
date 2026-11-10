"use client";

import React from "react";
import {
  Cpu,
  Compass,
  Laptop,
  Code2,
  Coins,
  TrendingUp,
  Brain,
  Building2,
  Megaphone,
  Hourglass,
  Landmark,
  Atom,
  Feather,
  Palette,
  Mic,
  Rocket,
  Globe,
  Shuffle,
  Stethoscope,
  CreditCard,
  Radio,
  Heart,
  BookOpen,
  LucideProps,
} from "lucide-react";

export interface CategoryIconProps extends LucideProps {
  category: string;
}

const ICON_MAP: Record<string, React.ComponentType<LucideProps>> = {
  "Artificial Intelligence": Cpu,
  "Product Management": Compass,
  "Technology": Laptop,
  "Software Engineering": Code2,
  "Finance": Coins,
  "Economics": TrendingUp,
  "Psychology": Brain,
  "Business": Building2,
  "Marketing": Megaphone,
  "History": Hourglass,
  "Politics": Landmark,
  "Science": Atom,
  "Philosophy": Feather,
  "Design": Palette,
  "Public Speaking": Mic,
  "Startups": Rocket,
  "Culture": Globe,
  "Wildcard": Shuffle,
  "Medicine": Stethoscope,
  "Personal Finance": CreditCard,
  "Internet Culture": Radio,
  "Sex & Sexuality": Heart,
};

export default function CategoryIcon({
  category,
  size = 14,
  className = "",
  ...props
}: CategoryIconProps) {
  const IconComponent = ICON_MAP[category] || BookOpen;
  return <IconComponent size={size} className={className} strokeWidth={1.75} {...props} />;
}
