"use client";

import { useEffect } from "react";
import Script from "next/script";
import { useSiteSettings } from "@/lib/useSiteSettings";

export default function GoogleAnalytics() {
  const { settings } = useSiteSettings();
  const gaId = settings?.google_analytics_id;

  useEffect(() => {
    if (gaId && typeof window !== "undefined") {
      (window as any).dataLayer = (window as any).dataLayer || [];
      function gtag(...args: any[]) {
        (window as any).dataLayer.push(args);
      }
      (window as any).gtag = gtag;
      gtag("js", new Date());
      gtag("config", gaId);
    }
  }, [gaId]);

  if (!gaId) return null;

  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      strategy="afterInteractive"
    />
  );
}