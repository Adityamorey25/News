"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("active");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setName(data.name);
        setSlug(data.slug);
        setDescription(data.description || "");
        setStatus(data.status);
      }
      if (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    const { error } = await supabase
      .from("categories")
      .update({ name, slug, description, status })
      .eq("id", id);

    setSaving(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push("/admindashboard/categories");
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
      <div className="max-w-lg mx-auto">
        <Link href="/admindashboard/categories" className="text-sm text-gray-500 hover:underline block mb-4">
          ← श्रेणी व्यवस्थापन
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold mb-6 text-brand-black">श्रेणी संपादित करा</h1>

          {error && (
            <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-medium">श्रेणीचे नाव</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              required
            />

            <label className="block mb-2 text-sm font-medium">स्लग (URL)</label>
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="w-full border rounded p-2 mb-4"
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