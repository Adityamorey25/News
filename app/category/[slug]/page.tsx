"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import BlogCard from "@/components/BlogCard";
import AdBanner from "@/components/AdBanner";
import { createClient } from "@/lib/supabase-browser";

type CategoryBlog = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  publish_date: string | null;
  categories: { name: string; slug: string } | null;
};

export default function CategoryDetailPage() {
  const params = useParams();
  const rawSlug = params.slug as string;
  const slug = decodeURIComponent(rawSlug);

  const [blogs, setBlogs] = useState<CategoryBlog[]>([]);
  const [categoryName, setCategoryName] = useState("");
  const [categoryFound, setCategoryFound] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBlogs = async () => {
      const supabase = createClient();

      const { data: catData } = await supabase
        .from("categories")
        .select("name")
        .eq("slug", slug)
        .single();

      if (!catData) {
        setCategoryFound(false);
        setLoading(false);
        return;
      }

      setCategoryName(catData.name);

      const { data } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, featured_image_url, publish_date, categories!inner(name, slug)")
        .eq("status", "published")
        .eq("categories.slug", slug)
        .order("publish_date", { ascending: false });

      setBlogs((data as unknown as CategoryBlog[]) || []);
      setLoading(false);
    };

    loadBlogs();
  }, [slug]);

  const cards = blogs.map((blog) => ({
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
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-20">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  if (!categoryFound) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-20">
        <p className="text-gray-500">ही श्रेणी सापडली नाही.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-brand-red mb-6 border-l-4 border-brand-red pl-3">
          {categoryName}
        </h1>

        <AdBanner adType="category" categorySlug={slug} placeholderText="जाहिरात स्थान (Top Ad)" heightClass="h-24" />

        {cards.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cards.map((blog) => (
              <BlogCard key={blog.slug} {...blog} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            या श्रेणीत बातम्या नाहीत.
          </div>
        )}
      </div>
    </main>
  );
}