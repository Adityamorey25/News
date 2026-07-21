"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { createClient } from "@/lib/supabase-browser";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function Footer() {
  const { settings } = useSiteSettings();
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("status", "active")
        .order("sort_order", { ascending: true })
        .limit(4);
      setCategories(data || []);
    };
    loadCategories();
  }, []);

  const siteName = settings?.site_name || "News";
  const logoUrl = settings?.logo_url || "/logo.png";
  const description = settings?.site_description || "तुमचे विश्वासू मराठी बातम्या व्यासपीठ.";
  const email = settings?.contact_email || "info@topzonemarathi.com";
  const facebookUrl = settings?.facebook_url || "#";
  const instagramUrl = settings?.instagram_url || "#";
  const youtubeUrl = settings?.youtube_url || "#";
  const copyright = settings?.copyright_text || "All Rights Reserved.";

  return (
    <footer className="bg-brand-black text-white mt-12">
      <div className="max-w-6xl mx-auto px-4 pb-10 pt-10 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <Image src={logoUrl} alt={siteName} width={48} height={48} unoptimized className="rounded-full" />
            <div className="font-bold text-lg">{siteName}</div>
          </div>
          <p className="text-sm text-gray-400">{description}</p>
        </div>

        <div>
          <h3 className="font-semibold text-brand-saffron mb-3">श्रेणी</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <Link href={`/category/${cat.slug}`} className="hover:text-white">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-brand-saffron mb-3">महत्वाचे दुवे</h3>
          <ul className="space-y-2 text-sm text-gray-300">
            <li><Link href="/about" className="hover:text-white">आमच्याबद्दल</Link></li>
            <li><Link href="/contact" className="hover:text-white">संपर्क</Link></li>
            <li><Link href="/privacy-policy" className="hover:text-white">गोपनीयता धोरण</Link></li>
            <li><Link href="/terms" className="hover:text-white">नियम व शर्ती</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-brand-saffron mb-3">आमच्याशी संपर्क साधा</h3>
          <p className="text-sm text-gray-300 mb-3">Email: {email}</p>
          <div className="flex gap-3">
            <Link
              href={facebookUrl}
              target="_blank"
              aria-label="Facebook"
              className="w-9 h-9 flex items-center justify-center bg-brand-red rounded-full hover:bg-brand-red-dark transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85c0-2.5 1.49-3.89 3.77-3.89 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56v1.88h2.78l-.44 2.91h-2.34V22c4.78-.79 8.44-4.94 8.44-9.94z" />
              </svg>
            </Link>
            <Link
              href={instagramUrl}
              target="_blank"
              aria-label="Instagram"
              className="w-9 h-9 flex items-center justify-center bg-brand-red rounded-full hover:bg-brand-red-dark transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M12 2c2.72 0 3.06.01 4.12.06 1.06.05 1.79.22 2.43.47.66.26 1.22.6 1.77 1.15.55.55.9 1.11 1.15 1.77.25.64.42 1.37.47 2.43.05 1.06.06 1.4.06 4.12s-.01 3.06-.06 4.12c-.05 1.06-.22 1.79-.47 2.43a4.9 4.9 0 01-1.15 1.77 4.9 4.9 0 01-1.77 1.15c-.64.25-1.37.42-2.43.47-1.06.05-1.4.06-4.12.06s-3.06-.01-4.12-.06c-1.06-.05-1.79-.22-2.43-.47a4.9 4.9 0 01-1.77-1.15 4.9 4.9 0 01-1.15-1.77c-.25-.64-.42-1.37-.47-2.43C2.01 15.06 2 14.72 2 12s.01-3.06.06-4.12c.05-1.06.22-1.79.47-2.43.26-.66.6-1.22 1.15-1.77A4.9 4.9 0 015.45.53c.64-.25 1.37-.42 2.43-.47C8.94.01 9.28 0 12 0zm0 5a5 5 0 100 10 5 5 0 000-10zm0 8.2a3.2 3.2 0 110-6.4 3.2 3.2 0 010 6.4zm5.2-8.4a1.17 1.17 0 100-2.34 1.17 1.17 0 000 2.34z" />
              </svg>
            </Link>
            <Link
              href={youtubeUrl}
              target="_blank"
              aria-label="YouTube"
              className="w-9 h-9 flex items-center justify-center bg-brand-red rounded-full hover:bg-brand-red-dark transition"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-white">
                <path d="M23.5 6.19a3.02 3.02 0 00-2.12-2.14C19.51 3.5 12 3.5 12 3.5s-7.51 0-9.38.55A3.02 3.02 0 00.5 6.19 31.6 31.6 0 000 12a31.6 31.6 0 00.5 5.81 3.02 3.02 0 002.12 2.14C4.49 20.5 12 20.5 12 20.5s7.51 0 9.38-.55a3.02 3.02 0 002.12-2.14A31.6 31.6 0 0024 12a31.6 31.6 0 00-.5-5.81zM9.6 15.6V8.4l6.4 3.6-6.4 3.6z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-700 py-4 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} {siteName}. {copyright}
      </div>
    </footer>
  );
}