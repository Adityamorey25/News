"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSiteSettings } from "@/lib/useSiteSettings";
import { createClient } from "@/lib/supabase-browser";

const LANGUAGES = [
  { code: "mr", label: "मराठी" },
  { code: "hi", label: "हिंदी" },
  { code: "en", label: "English" },
  { code: "gu", label: "ગુજરાતી" },
  { code: "ta", label: "தமிழ்" },
  { code: "te", label: "తెలుగు" },
  { code: "kn", label: "ಕನ್ನಡ" },
  { code: "bn", label: "বাংলা" },
];

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function Navbar() {
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [langMenuOpen, setLangMenuOpen] = useState(false);
  const [translateLoading, setTranslateLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const scriptLoadedRef = useRef(false);
  const pendingLangRef = useRef<string | null>(null);
  const router = useRouter();
  const { settings } = useSiteSettings();

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("status", "active")
        .order("sort_order", { ascending: true });
      setCategories(data || []);
    };
    loadCategories();
  }, []);

  const navLinks = [
    { href: "/", label: "मुख्यपृष्ठ" },
    { href: "/category", label: "श्रेणी" },
    { href: "/about", label: "आमच्याबद्दल" },
    { href: "/contact", label: "संपर्क" },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const applyLanguage = (langCode: string) => {
    const select = document.querySelector(".goog-te-combo") as HTMLSelectElement | null;
    if (select) {
      select.value = langCode;
      select.dispatchEvent(new Event("change"));
    }
    setTranslateLoading(false);
  };

  const switchLanguage = (langCode: string) => {
    setLangMenuOpen(false);

    if (scriptLoadedRef.current) {
      applyLanguage(langCode);
      return;
    }

    setTranslateLoading(true);
    pendingLangRef.current = langCode;

    (window as any).googleTranslateElementInit = () => {
      new (window as any).google.translate.TranslateElement(
        { pageLanguage: "mr", autoDisplay: false },
        "google_translate_element"
      );
      scriptLoadedRef.current = true;
      setTimeout(() => {
        if (pendingLangRef.current) {
          applyLanguage(pendingLangRef.current);
          pendingLangRef.current = null;
        }
      }, 600);
    };

    const script = document.createElement("script");
    script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
    document.body.appendChild(script);
  };

  const siteName = settings?.site_name || "News";
  const logoUrl = settings?.logo_url || "/logo.png";

  return (
    <header className="bg-brand-red text-white shadow-md sticky top-0 z-50">
      {isHomepage && <div id="google_translate_element" className="hidden"></div>}

      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <Image
            src={logoUrl}
            alt={siteName}
            width={48}
            height={48}
            unoptimized
            className="rounded-full"
          />
          <div className="leading-tight hidden sm:block">
            <div className="font-bold text-lg">{siteName}</div>
            <div className="text-xs text-brand-saffron">डिजिटल मराठी चॅनेल</div>
          </div>
        </Link>

        {!searchOpen && (
          <nav className="hidden md:flex items-center gap-6 font-medium">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="hover:text-brand-saffron transition">
                {link.label}
              </Link>
            ))}
          </nav>
        )}

        {searchOpen && (
          <form onSubmit={handleSearchSubmit} className="flex-1 flex items-center max-w-md mx-auto">
            <div className="relative w-full">
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="बातम्या शोधा..."
                className="w-full bg-white text-brand-black rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-saffron"
              />
              <button
                type="submit"
                className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center bg-brand-red rounded-full hover:bg-brand-red-dark transition"
                aria-label="Search"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>
        )}

        <div className="flex items-center gap-2 shrink-0 relative">
          {isHomepage && (
            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-1 px-3 h-9 rounded-full bg-brand-red-dark hover:opacity-80 transition text-xs font-semibold"
                aria-label="Translate"
              >
                {translateLoading ? "..." : "🌐 भाषा"}
              </button>
              {langMenuOpen && (
                <div className="absolute right-0 top-11 bg-white text-brand-black rounded-lg shadow-lg overflow-hidden w-40 z-50 max-h-72 overflow-y-auto">
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => switchLanguage(lang.code)}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    >
                      {lang.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-red-dark transition"
            aria-label="Search"
          >
            {searchOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            )}
          </button>

          {!searchOpen && (
            <button
              className="md:hidden w-9 h-9 flex items-center justify-center rounded-full hover:bg-brand-red-dark transition"
              onClick={() => setMenuOpen(!menuOpen)}
              aria-label="Menu"
            >
              {menuOpen ? "✕" : "☰"}
            </button>
          )}
        </div>
      </div>

      {menuOpen && !searchOpen && (
        <nav className="md:hidden bg-brand-red-dark px-4 py-3 flex flex-col gap-3">
          {navLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-brand-saffron transition" onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
          {categories.length > 0 && (
            <div className="border-t border-brand-red/30 pt-3 mt-1">
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  className="block py-1 hover:text-brand-saffron transition"
                  onClick={() => setMenuOpen(false)}
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}
        </nav>
      )}
    </header>
  );
}