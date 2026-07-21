"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";

type Category = {
  id: string;
  name: string;
  slug: string;
};

function countWords(text: string) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

async function translateToMarathi(text: string): Promise<string> {
  if (!text.trim()) return text;
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

export default function EditBlogPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [status, setStatus] = useState("draft");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [translatingTitle, setTranslatingTitle] = useState(false);
  const [translatingExcerpt, setTranslatingExcerpt] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: catData } = await supabase.from("categories").select("id, name, slug").order("name");
      setCategories(catData || []);

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setContent(data.content);
        setExcerpt(data.excerpt || "");
        setCategoryId(data.category_id || "");
        setAuthorName(data.author_name || "");
        setYoutubeLink(data.video_url || "");
        setStatus(data.status);
        setCurrentImageUrl(data.featured_image_url || "");
      }
      if (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    load();
  }, [id]);

  const wordCount = countWords(content);

  const handleTranslateTitle = async () => {
    if (!title.trim()) return;
    setTranslatingTitle(true);
    setTitle(await translateToMarathi(title));
    setTranslatingTitle(false);
  };

  const handleTranslateExcerpt = async () => {
    if (!excerpt.trim()) return;
    setTranslatingExcerpt(true);
    setExcerpt(await translateToMarathi(excerpt));
    setTranslatingExcerpt(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    const supabase = createClient();
    let featuredImageUrl = currentImageUrl;

    if (imageFile) {
      setUploading(true);

      const uploadFormData = new FormData();
      uploadFormData.append("file", imageFile);

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.url) {
          setError("Image upload failed: " + (uploadResult.error || "Unknown error"));
          setUploading(false);
          setSaving(false);
          return;
        }

        featuredImageUrl = uploadResult.url;
      } catch (err) {
        setError("Image upload failed. Please try again.");
        setUploading(false);
        setSaving(false);
        return;
      }

      setUploading(false);
    }

    const { error: updateError } = await supabase
      .from("blogs")
      .update({
        title: title.trim(),
        slug: slug.trim(),
        content,
        excerpt,
        category_id: categoryId || null,
        author_name: authorName,
        video_url: youtubeLink || null,
        featured_image_url: featuredImageUrl || null,
        status,
        publish_date: status === "published" ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    setSaving(false);

    if (updateError) {
      setError("Update failed: " + updateError.message);
      return;
    }

    router.push("/admindashboard/blogs");
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-2xl mx-auto">
        <Link href="/admindashboard/blogs" className="text-sm text-gray-500 hover:underline block mb-4">
          ← बातम्या व्यवस्थापन
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold mb-6 text-brand-black">बातमी संपादित करा</h1>

          {error && (
            <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-medium">शीर्षक</label>
            <div className="flex gap-2 mb-1">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="flex-1 border rounded p-2"
                required
              />
              <button
                type="button"
                onClick={handleTranslateTitle}
                disabled={translatingTitle || !title.trim()}
                className="bg-brand-black text-white px-3 py-2 rounded text-sm hover:opacity-80 transition disabled:opacity-40 whitespace-nowrap"
              >
                {translatingTitle ? "..." : "मराठीत करा"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              English मध्ये टाइप करा, मग &quot;मराठीत करा&quot; बटण दाबा.
            </p>

            <label className="block mb-2 text-sm font-medium">स्लग (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              required
            />

            <label className="block mb-2 text-sm font-medium">थोडक्यात सारांश</label>
            <div className="flex gap-2 mb-1">
              <textarea
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="flex-1 border rounded p-2"
                rows={2}
              />
              <button
                type="button"
                onClick={handleTranslateExcerpt}
                disabled={translatingExcerpt || !excerpt.trim()}
                className="bg-brand-black text-white px-3 py-2 rounded text-sm hover:opacity-80 transition disabled:opacity-40 whitespace-nowrap self-start"
              >
                {translatingExcerpt ? "..." : "मराठीत करा"}
              </button>
            </div>
            <p className="text-xs text-gray-400 mb-4">
              English मध्ये टाइप करा, मग &quot;मराठीत करा&quot; बटण दाबा.
            </p>

            <label className="block mb-2 text-sm font-medium">
              मजकूर <span className="text-gray-400">({wordCount} शब्द)</span>
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              rows={12}
              required
            />

            <label className="block mb-2 text-sm font-medium">श्रेणी</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              required
            >
              <option value="">श्रेणी निवडा</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {currentImageUrl && (
              <div className="mb-3">
                <p className="text-sm text-gray-500 mb-2">Current image:</p>
                <div className="relative w-full h-40 rounded overflow-hidden">
                  <Image src={currentImageUrl} alt="Current" fill className="object-cover" unoptimized />
                </div>
              </div>
            )}

            <label className="block mb-2 text-sm font-medium">मुख्य फोटो</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full border rounded p-2 mb-4"
            />

            <label className="block mb-2 text-sm font-medium">यूट्यूब लिंक (वैकल्पिक)</label>
            <input
              type="text"
              value={youtubeLink}
              onChange={(e) => setYoutubeLink(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="https://youtube.com/watch?v=..."
            />

            <label className="block mb-2 text-sm font-medium">लेखकाचे नाव</label>
            <input
              type="text"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />

            <label className="block mb-2 text-sm font-medium">प्रकाशन स्थिती</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded p-2 mb-6"
            >
              <option value="draft">मसुदा</option>
              <option value="published">प्रकाशित</option>
            </select>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-dark transition disabled:opacity-50"
              >
                {uploading ? "अपलोड होत आहे..." : saving ? "जतन होत आहे..." : "जतन करा"}
              </button>
              <Link
                href="/admindashboard/blogs"
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