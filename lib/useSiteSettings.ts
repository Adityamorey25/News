"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export type SiteSettings = {
  site_name: string;
  logo_url: string;
  site_description: string;
  contact_email: string;
  contact_phone: string;
  facebook_url: string;
  instagram_url: string;
  youtube_url: string;
  copyright_text: string;
  primary_color: string;
  secondary_color: string;
  google_analytics_id: string;
};

export function useSiteSettings() {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("site_settings").select("*").single();
      setSettings(data);
      setLoading(false);
    };
    load();
  }, []);

  return { settings, loading };
}