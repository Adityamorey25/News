"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import { createClient } from "@/lib/supabase-browser";

type SearchBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  publish_date: string | null;
  categories: { name: string; slug: string } | null;
};

function SearchContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const [results, setResults] = useState<SearchBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const search = async () => {
      if (!q.trim()) {
        setResults([]);
        setLoading(false);
        return;
      }

      const supabase = createClient();
      const { data } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, featured_image_url, publish_date, categories(name, slug)")
        .eq("status", "published")
        .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,content.ilike.%${q}%`)
        .order("publish_date", { ascending: false });

      setResults((data as unknown as SearchBlog[]) || []);
      setLoading(false);
    };

    search();
  }, [q]);

  const cards = results.map((blog) => ({
    title: blog.title,
    excerpt: blog.excerpt || "",
    category: blog.categories?.name || "",
    imageUrl: blog.featured_image_url || "https://picsum.photos/seed/placeholder/400/300",
    slug: blog.slug,
    date: blog.publish_date
      ? new Date(blog.publish_date).toLocaleDateString("mr-IN", { year: "numeric", month: "long", day: "numeric" })
      : "",
  }));

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-10">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold text-brand-red mb-2 border-l-4 border-brand-red pl-3">
        शोध परिणाम
      </h1>
      <p className="text-gray-500 mb-6 pl-3">
        &quot;{q}&quot; साठी बातम्या सापडल्या {cards.length}
      </p>

      {cards.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {cards.map((blog) => (
            <BlogCard key={blog.slug} {...blog} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
          कोणतीही बातमी सापडली नाही.
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <main className="flex-1 bg-gray-50">
      <Suspense fallback={<div className="max-w-6xl mx-auto px-4 py-10">Loading...</div>}>
        <SearchContent />
      </Suspense>
    </main>
  );
}