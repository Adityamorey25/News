"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
type Ad = {
  id: string;
  title: string;
  image_url: string | null;
  redirect_url: string | null;
  views_count?: number;
  clicks_count?: number;
  panel_width?: number | null;
  panel_height?: number | null;
};
function toDateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}
export default function PopupAd() {
  const [ad, setAd] = useState<Ad | null>(null);
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const viewCounted = useRef(false);
  useEffect(() => {
    const alreadyShown = sessionStorage.getItem("popup_ad_shown");
    if (alreadyShown) return;
    const loadAd = async () => {
      const supabase = createClient();
      const today = new Date().toISOString().slice(0, 10);
      const { data } = await supabase
        .from("advertisements")
        .select("id, title, image_url, redirect_url, start_date, end_date, views_count, clicks_count, panel_width, panel_height")
        .eq("status", "active")
        .eq("ad_type", "popup")
        .order("priority", { ascending: false });
      const candidates = (data || []).filter((a: any) => {
        const start = toDateOnly(a.start_date);
        const end = toDateOnly(a.end_date);
        const startOk = !start || start <= today;
        const endOk = !end || end >= today;
        return startOk && endOk;
      });
      if (candidates.length > 0) {
        const chosen = candidates[0];
        setAd(chosen);
        setTimeout(async () => {
          setVisible(true);
          sessionStorage.setItem("popup_ad_shown", "true");
          if (!viewCounted.current) {
            viewCounted.current = true;
            const supabase = createClient();
            await supabase
              .from("advertisements")
              .update({ views_count: (chosen.views_count || 0) + 1 })
              .eq("id", chosen.id);
          }
        }, 3000);
      }
    };
    loadAd();
  }, []);
  const handleClose = () => {
    setVisible(false);
    setDismissed(true);
  };
  const handleAdClick = async () => {
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
  if (!ad || !visible || dismissed) return null;

  const hasCustomSize = !!(ad.panel_width && ad.panel_height);

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div
        className="bg-white rounded-lg shadow-xl w-full relative overflow-hidden"
        style={hasCustomSize ? { maxWidth: `${ad.panel_width}px` } : { maxWidth: "28rem" }}
      >
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center bg-black/50 text-white rounded-full hover:bg-black/70 z-10"
          aria-label="Close"
        >
          ✕
        </button>
        {ad.image_url && (
          <div
            onClick={handleAdClick}
            className="relative w-full cursor-pointer"
            style={hasCustomSize ? { height: `${ad.panel_height}px` } : undefined}
          >
            {hasCustomSize ? (
              <Image src={ad.image_url} alt={ad.title} fill unoptimized className="object-cover" />
            ) : (
              <div className="relative w-full h-64">
                <Image src={ad.image_url} alt={ad.title} fill unoptimized className="object-cover" />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}