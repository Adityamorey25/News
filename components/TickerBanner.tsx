"use client";
import { useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type TickerAd = {
  id: string;
  title: string;
  image_url: string | null;
  redirect_url: string | null;
  views_count?: number;
  clicks_count?: number;
};

function toDateOnly(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.slice(0, 10);
}

const SWITCH_INTERVAL_MS = 15000;

export default function TickerBanner() {
  const [ads, setAds] = useState<TickerAd[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bgColor, setBgColor] = useState<string>("#DC2626");
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const viewedIds = useRef<Set<string>>(new Set());

  const ad = ads[currentIndex] || null;

  useEffect(() => {
    const loadAds = async () => {
      const supabase = createClient();
      const now = new Date();
      const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;

      const { data } = await supabase
        .from("advertisements")
        .select("id, title, image_url, redirect_url, start_date, end_date, views_count, clicks_count")
        .eq("status", "active")
        .eq("ad_type", "generic")
        .eq("position", "ticker")
        .order("priority", { ascending: false });

      const candidates = (data || []).filter((a: any) => {
        const start = toDateOnly(a.start_date);
        const end = toDateOnly(a.end_date);
        const startOk = !start || start <= today;
        const endOk = !end || end >= today;
        return startOk && endOk;
      });

      setAds(candidates as TickerAd[]);
    };
    loadAds();
  }, []);

  // Rotate through ads every SWITCH_INTERVAL_MS
  useEffect(() => {
    if (ads.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ads.length);
    }, SWITCH_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [ads.length]);

  // Count a view once per ad shown
  useEffect(() => {
    if (!ad || viewedIds.current.has(ad.id)) return;
    viewedIds.current.add(ad.id);
    const supabase = createClient();
    supabase
      .from("advertisements")
      .update({ views_count: (ad.views_count || 0) + 1 })
      .eq("id", ad.id);
  }, [ad]);

  useEffect(() => {
    if (!ad?.image_url) return;

    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.src = ad.image_url;

    img.onload = () => {
      try {
        const canvas = canvasRef.current || document.createElement("canvas");
        canvasRef.current = canvas;
        const size = 20;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(img, 0, 0, size, size);
        const data = ctx.getImageData(0, 0, size, size).data;

        let r = 0,
          g = 0,
          b = 0,
          count = 0;
        for (let i = 0; i < data.length; i += 4) {
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        setBgColor(`rgb(${r}, ${g}, ${b})`);
      } catch {
        // CORS or other error — keep default color
      }
    };
    img.onerror = () => {
      // keep default color
    };
  }, [ad?.image_url]);

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

  if (!ad) return null;

  return (
    <div
      onClick={handleClick}
      className="w-full rounded-lg overflow-hidden mb-4 cursor-pointer flex items-center h-14 transition-colors"
      style={{ backgroundColor: bgColor }}
    >
      <div key={ad.id} className="ticker-track flex items-center gap-4 whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex items-center gap-4 px-6">
            {ad.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={ad.image_url}
                alt={ad.title}
                className="h-10 w-10 object-cover rounded"
              />
            )}
            <span className="text-white font-semibold text-base drop-shadow">
              {ad.title}
            </span>
          </div>
        ))}
      </div>

      <style jsx>{`
        .ticker-track {
          display: flex;
          animation: ticker-scroll 15s linear infinite;
        }
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0%);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}