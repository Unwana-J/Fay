"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CELESTIAL_ASCENSION_EVENT,
  type CelestialAscensionPayload,
} from "@/lib/celestial-events";

interface FlightTrajectory {
  id: string;
  payload: CelestialAscensionPayload;
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

export default function CelestialAscensionOverlay() {
  const [flight, setFlight] = useState<FlightTrajectory | null>(null);
  const [impact, setImpact] = useState<{
    id: string;
    x: number;
    y: number;
    color: string;
  } | null>(null);

  useEffect(() => {
    let impactTimer: ReturnType<typeof setTimeout> | null = null;
    let clearTimer: ReturnType<typeof setTimeout> | null = null;

    function handleAscension(e: Event) {
      const custom = e as CustomEvent<CelestialAscensionPayload>;
      const payload = custom.detail;
      if (!payload || typeof window === "undefined") return;

      if (impactTimer) clearTimeout(impactTimer);
      if (clearTimer) clearTimeout(clearTimer);

      const startX = window.innerWidth / 2;
      const startY = Math.min(window.innerHeight * 0.42, 340);

      // Prefer desktop sidebar Constellation link if visible; otherwise mobile top bar target
      const desktopNav = document.querySelector('[data-constellation-nav="desktop"]');
      const mobileNav = document.querySelector('[data-constellation-nav="mobile"]');

      const desktopRect = desktopNav?.getBoundingClientRect();
      const mobileRect = mobileNav?.getBoundingClientRect();

      let endX = 48;
      let endY = 28;

      if (desktopRect && desktopRect.width > 0 && desktopRect.left >= 0) {
        endX = desktopRect.left + 28;
        endY = desktopRect.top + desktopRect.height / 2;
      } else if (mobileRect && mobileRect.width > 0) {
        endX = mobileRect.left + mobileRect.width / 2;
        endY = mobileRect.top + mobileRect.height / 2;
      }

      const isSun = payload.kind === "sun";
      const isMoon = payload.kind === "moon";
      const accentColor = isSun ? "#A67C1E" : isMoon ? "#444E2C" : "#7A1C2E";

      setImpact(null);
      setFlight({
        id: payload.id,
        payload,
        startX,
        startY,
        endX,
        endY,
      });

      // Trigger landing shockwave & sidebar/mobile nav badge pulse right as the object arrives
      impactTimer = setTimeout(() => {
        setImpact({
          id: payload.id,
          x: endX,
          y: endY,
          color: accentColor,
        });
        window.dispatchEvent(
          new CustomEvent("fey:constellation-nav-pulse", { detail: payload })
        );
      }, 1450);

      // Clean up after animation finishes
      clearTimer = setTimeout(() => {
        setFlight(null);
        setImpact(null);
      }, 2400);
    }

    window.addEventListener(CELESTIAL_ASCENSION_EVENT, handleAscension);
    return () => {
      window.removeEventListener(CELESTIAL_ASCENSION_EVENT, handleAscension);
      if (impactTimer) clearTimeout(impactTimer);
      if (clearTimer) clearTimeout(clearTimer);
    };
  }, []);

  if (!flight && !impact) return null;

  const isSun = flight?.payload.kind === "sun";
  const isMoon = flight?.payload.kind === "moon";
  const accentColor = isSun ? "#A67C1E" : isMoon ? "#444E2C" : "#7A1C2E";

  // Control point for a graceful curved arc toward the Constellation nav item
  const midX = flight ? (flight.startX + flight.endX) / 2 - 40 : 0;
  const midY = flight ? Math.min(flight.startY, flight.endY) - 110 : 0;

  return (
    <div className="fixed inset-0 z-[110] pointer-events-none overflow-hidden">
      {/* 1. Brief Translucent Orbital Ring Ripple at Birth Point (No text, pure geometry) */}
      <AnimatePresence>
        {flight && (
          <motion.div
            key={`origin-ring-${flight.id}`}
            initial={{
              x: flight.startX - 56,
              y: flight.startY - 56,
              scale: 0.35,
              opacity: 0,
            }}
            animate={{
              scale: [0.35, 1.05, 1.35],
              opacity: [0, 0.85, 0],
              rotate: [0, 90],
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: "easeOut" }}
            className="fixed top-0 left-0 w-28 h-28 flex items-center justify-center"
          >
            <svg viewBox="0 0 112 112" className="w-full h-full overflow-visible">
              <circle
                cx="56"
                cy="56"
                r="26"
                fill="none"
                stroke="#A67C1E"
                strokeWidth="1.5"
                strokeDasharray="4 4"
                strokeOpacity="0.65"
              />
              <circle
                cx="56"
                cy="56"
                r="40"
                fill="none"
                stroke="#444E2C"
                strokeWidth="1.5"
                strokeDasharray="6 4"
                strokeOpacity="0.55"
              />
              <circle
                cx="56"
                cy="56"
                r="52"
                fill="none"
                stroke="#7A1C2E"
                strokeWidth="1.5"
                strokeDasharray="3 5"
                strokeOpacity="0.5"
              />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. The Celestial Body (Sun, Moon, or Star) Igniting & Flying to Constellation */}
      <AnimatePresence>
        {flight && (
          <motion.div
            key={`flying-body-${flight.id}`}
            initial={{
              x: flight.startX - 32,
              y: flight.startY - 32,
              scale: 0,
              rotate: -30,
              opacity: 0,
            }}
            animate={{
              x: [
                flight.startX - 32,
                flight.startX - 32,
                midX - 32,
                flight.endX - 32,
              ],
              y: [
                flight.startY - 32,
                flight.startY - 32,
                midY - 32,
                flight.endY - 32,
              ],
              scale: [0, 1.25, 1.05, 0.38],
              rotate: [-30, 15, 90, 200],
              opacity: [0, 1, 1, 0.15],
            }}
            transition={{
              duration: 1.5,
              times: [0, 0.34, 0.68, 1],
              ease: "easeInOut",
            }}
            className="fixed top-0 left-0 w-16 h-16 flex items-center justify-center"
          >
            {/* Outer luminous aura */}
            <div
              className="absolute inset-0 rounded-full"
              style={{
                background: `radial-gradient(circle, ${accentColor}75 0%, transparent 70%)`,
                filter: "blur(4px)",
              }}
            />

            {/* Pure SVG Sun, Moon, or Star */}
            {isSun && (
              <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-lg overflow-visible">
                {Array.from({ length: 12 }).map((_, i) => (
                  <g key={i} transform={`rotate(${i * 30} 32 32)`}>
                    <polygon points="29,7 35,7 32,0" fill="#A67C1E" />
                  </g>
                ))}
                <circle
                  cx="32"
                  cy="32"
                  r="20"
                  fill="#E5A52C"
                  stroke="#FDFCFA"
                  strokeWidth="2.5"
                />
                <circle cx="26" cy="26" r="6" fill="#FFF7DB" opacity="0.65" />
              </svg>
            )}

            {isMoon && (
              <svg viewBox="0 0 64 64" className="w-14 h-14 drop-shadow-lg overflow-visible">
                <circle
                  cx="32"
                  cy="32"
                  r="21"
                  fill="#E5DFD0"
                  stroke="#444E2C"
                  strokeWidth="2.5"
                />
                <path
                  d="M 38 12 A 20 20 0 1 1 18 50 A 16 18 0 1 0 38 12 Z"
                  fill="#444E2C"
                  opacity="0.32"
                />
                <circle cx="23" cy="24" r="3.5" fill="#444E2C" opacity="0.2" />
                <circle cx="35" cy="38" r="2.8" fill="#444E2C" opacity="0.2" />
              </svg>
            )}

            {!isSun && !isMoon && (
              <svg viewBox="0 0 64 64" className="w-15 h-15 drop-shadow-lg overflow-visible">
                <polygon
                  points="32,10 36,28 54,32 36,36 32,54 28,36 10,32 28,28"
                  transform="rotate(45 32 32)"
                  fill="#A67C1E"
                  opacity="0.85"
                />
                <polygon
                  points="32,2 38,26 62,32 38,38 32,62 26,38 2,32 26,26"
                  fill="#7A1C2E"
                  stroke="#FDFCFA"
                  strokeWidth="2"
                />
                <circle cx="32" cy="32" r="7" fill="#FFF8E7" />
              </svg>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. Trailing Stardust Particles Following the Same Path */}
      <AnimatePresence>
        {flight &&
          [0.06, 0.12, 0.18].map((delay, idx) => (
            <motion.div
              key={`trail-${flight.id}-${idx}`}
              initial={{
                x: flight.startX - 5,
                y: flight.startY - 5,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: [
                  flight.startX - 5,
                  flight.startX - 5,
                  midX - 5,
                  flight.endX - 5,
                ],
                y: [
                  flight.startY - 5,
                  flight.startY - 5,
                  midY - 5,
                  flight.endY - 5,
                ],
                scale: [0, 1 - idx * 0.2, 0.8 - idx * 0.15, 0],
                opacity: [0, 0.85 - idx * 0.2, 0.65, 0],
              }}
              transition={{
                duration: 1.5,
                delay,
                times: [0, 0.34, 0.68, 1],
                ease: "easeInOut",
              }}
              className="fixed top-0 left-0 w-2.5 h-2.5 rounded-full"
              style={{
                backgroundColor: idx % 2 === 0 ? "#D89B2B" : accentColor,
                boxShadow: `0 0 10px ${accentColor}`,
              }}
            />
          ))}
      </AnimatePresence>

      {/* 4. Landing Shockwave Ring Over the Constellation Nav Item */}
      <AnimatePresence>
        {impact && (
          <motion.div
            key={`impact-${impact.id}`}
            initial={{
              x: impact.x - 28,
              y: impact.y - 28,
              scale: 0.25,
              opacity: 0.95,
            }}
            animate={{
              scale: 2.2,
              opacity: 0,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="fixed top-0 left-0 w-14 h-14 rounded-full border-2"
            style={{
              borderColor: impact.color,
              background: `radial-gradient(circle, ${impact.color}40 0%, transparent 70%)`,
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
