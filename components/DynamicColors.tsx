"use client";

import { useSiteSettings } from "@/lib/useSiteSettings";
import { useEffect } from "react";

export default function DynamicColors() {
  const { settings } = useSiteSettings();

  useEffect(() => {
    if (settings?.primary_color) {
      document.documentElement.style.setProperty("--dynamic-primary", settings.primary_color);
    }
    if (settings?.secondary_color) {
      document.documentElement.style.setProperty("--dynamic-secondary", settings.secondary_color);
    }
  }, [settings]);

  return null;
}