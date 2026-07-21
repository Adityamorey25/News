"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\u0900-\u097Fa-z0-9\s-]/g, "")
    .replace(/\s+/g, "-");
}

function containsDevanagari(text: string) {
  return /[\u0900-\u097F]/.test(text);
}

async function translateToMarathi(text: string): Promise<string> {
  if (!text.trim()) return text;
  if (containsDevanagari(text)) return text; // Already Marathi — don't touch it
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|mr`
    );
    const data = await response.json();
    return data?.responseData?.translatedText || text;
  } catch {
    return text;
  }
}

export default function NewCategoryPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [saving, setSaving] = useState(false);
  const [translating, setTranslating] = useState(false);
  const [error, setError] = useState("");

  const handleNameChange = (value: string) => {
    setName(value);
    setSlug(slugify(value));
  };

  const handleTranslate = async () => {
    if (!name.trim()) return;
    if (containsDevanagari(name)) return; // already Marathi, nothing to do
    setTranslating(true);
    setName(await translateToMarathi(name));
    setTranslating(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();

    const { count } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true });

    const nextOrder = (count || 0) + 1;

    const { error } = await supabase.from("categories").insert({
      name,
      slug,
      description,
      status,
      sort_order: nextOrder,
    });

    setSaving(false);

    if (error) {
      if (error.code === "23505") {
        setError("ही स्लग आधीपासून वापरली गेली आहे.");
      } else {
        setError(error.message);
      }
      return;
    }

    router.push("/admindashboard/categories");
  };

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-lg mx-auto">
        <Link href="/admindashboard/categories" className="text-sm text-gray-500 hover:underline block mb-4">
          ← श्रेणी व्यवस्थापन
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold mb-6 text-brand-black">+ श्रेणी जोडा</h1>

          {error && (
            <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-medium">श्रेणीचे नाव</label>
            <div className="flex gap-2 mb-1">
              <input
                type="text"
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="flex-1 border rounded p-2"
                placeholder="English मध्ये टाइप करा, उदा. Sports"
                required
              />
              <button
                type="button"
                onClick={handleTranslate}
                disabled={translating || !name.trim() || containsDevanagari(name)}
                className="bg-brand-black text-white px-3 py-2 rounded text-sm hover:opacity-80 transition disabled:opacity-40 whitespace-nowrap"
              >
                {translating ? "..." : "मराठीत करा"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-3">
              English मध्ये नाव टाका, मग &quot;मराठीत करा&quot; बटण दाबा. आधीच मराठीत असेल तर बटण आपोआप बंद होईल.
            </p>

            <label className="block mb-2 text-sm font-medium">स्लग (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="e.g. sports"
              required
            />

            <label className="block mb-2 text-sm font-medium">वर्णन</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              rows={3}
            />

            <label className="block mb-2 text-sm font-medium">स्थिती</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded p-2 mb-6"
            >
              <option value="active">सक्रिय</option>
              <option value="inactive">निष्क्रिय</option>
            </select>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-dark transition disabled:opacity-50"
              >
                {saving ? "जतन होत आहे..." : "जतन करा"}
              </button>
              <Link
                href="/admindashboard/categories"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                रद्द करा
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}