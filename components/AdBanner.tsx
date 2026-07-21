"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";

type Ad = {
  id: string;
  title: string;
  image_url: string | null;
  redirect_url: string | null;
  priority: number;
  views_count?: number;
  clicks_count?: number;
  panel_width?: number | null;
  panel_height?: number | null;
};

type AdBannerProps = {
  adType: "generic" | "category" | "blog";
  categorySlug?: string;
  blogId?: string;
  position?: string;
  placeholderText: string;
  heightClass?: string;
};

function pickWeightedAd(ads: Ad[]): Ad {
  const totalWeight = ads.reduce((sum, a) => sum + (a.priority || 1), 0);
  let r = Math.random() * totalWeight;
  for (const ad of ads) {
    r -= ad.priority || 1;
    if (r <= 0) return ad;
  }
  return ads[ads.length - 1];
}

// Both start_date/end_date might come back as full timestamps
// (e.g. "2026-07-12 00:00:00+00") or plain dates ("2026-07-12").
// Always compare using just the first 10 characters (YYYY-MM-DD).
function toDateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

export default function AdBanner({
  adType,
  categorySlug,
  blogId,
  position,
  placeholderText,
  heightClass = "h-24",
}: AdBannerProps) {
  const [ad, setAd] = useState<Ad | null>(null);
  const [loading, setLoading] = useState(true);
  const viewCounted = useRef(false);

  useEffect(() => {
    const loadAd = async () => {
      const supabase = createClient();
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("advertisements")
        .select(
          "id, title, image_url, redirect_url, priority, blog_id, position, start_date, end_date, views_count, clicks_count, panel_width, panel_height, categories(slug)"
        )
        .eq("status", "active")
        .eq("ad_type", adType)
        .order("priority", { ascending: false });

      let candidates = data || [];
      candidates = candidates.filter((a: any) => {
        const start = toDateOnly(a.start_date);
        const end = toDateOnly(a.end_date);
        const startOk = !start || start <= today;
        const endOk = !end || end >= today;
        return startOk && endOk;
      });

      if (adType === "category" && categorySlug) {
        candidates = candidates.filter((a: any) => a.categories?.slug === categorySlug);
      }
      if (adType === "blog" && blogId) {
        candidates = candidates.filter((a: any) => a.blog_id === blogId);
      }
      if (adType === "generic" && position) {
        candidates = candidates.filter((a: any) => a.position === position);
      }

      if (candidates.length > 0) {
        const chosen = pickWeightedAd(candidates as Ad[]);
        setAd(chosen);

        if (!viewCounted.current) {
          viewCounted.current = true;
          await supabase
            .from("advertisements")
            .update({ views_count: (chosen.views_count || 0) + 1 })
            .eq("id", chosen.id);
        }
      }
      setLoading(false);
    };
    loadAd();
  }, [adType, categorySlug, blogId, position]);

  const handleClick = async () => {
    if (!ad) return;

    const supabase = createClient();
    await supabase
      .from("advertisements")
      .update({ clicks_count: (ad.clicks_count || 0) + 1 })
      .eq("id", ad.id);

    if (ad.redirect_url && ad.redirect_url.startsWith("http")) {
      window.open(ad.redirect_url, "_blank", "noopener,noreferrer");
    }
  };

  if (loading) {
    return <div className={`bg-gray-200 rounded-lg ${heightClass} animate-pulse mb-4`}></div>;
  }

  if (!ad || !ad.image_url) {
    return (
      <div className={`bg-gray-200 rounded-lg ${heightClass} flex items-center justify-center text-gray-500 text-sm mb-4`}>
        {placeholderText}
      </div>
    );
  }

  const hasCustomSize = !!(ad.panel_width && ad.panel_height);

  return (
    <div
      onClick={handleClick}
      className={`relative rounded-lg overflow-hidden mb-4 cursor-pointer ${
        hasCustomSize ? "max-w-full mx-auto" : `w-full ${heightClass}`
      }`}
      style={
        hasCustomSize
          ? { width: `${ad.panel_width}px`, height: `${ad.panel_height}px`, maxWidth: "100%" }
          : undefined
      }
    >
      <Image src={ad.image_url} alt={ad.title} fill unoptimized className="object-cover" />
    </div>
  );
}