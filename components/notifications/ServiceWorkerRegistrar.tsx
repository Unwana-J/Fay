"use client";

import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/push-notifications";

/** Registers /sw.js once per page load so the app is installable and can receive push. */
export default function ServiceWorkerRegistrar() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    registerServiceWorker();
  }, []);
  return null;
}
