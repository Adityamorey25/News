"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import BlogCard from "@/components/BlogCard";
import AdBanner from "@/components/AdBanner";
import TickerBanner from "@/components/TickerBanner";
import { createClient } from "@/lib/supabase-browser";

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  featured_image_url: string | null;
  publish_date: string | null;
  video_url: string | null;
  categories: { name: string; slug: string } | null;
};

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function Home() {
  const [blogs, setBlogs] = useState<BlogRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const supabase = createClient();

      const { data: blogData } = await supabase
        .from("blogs")
        .select("id, title, slug, excerpt, featured_image_url, publish_date, video_url, categories(name, slug)")
        .eq("status", "published")
        .order("publish_date", { ascending: false });

      const { data: catData } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      setBlogs((blogData as unknown as BlogRow[]) || []);
      setCategories(catData || []);
      setLoading(false);
    };

    loadData();
  }, []);

  const toCard = (blog: BlogRow) => ({
    title: blog.title,
    excerpt: blog.excerpt || "",
    category: blog.categories?.name || "",
    imageUrl: blog.featured_image_url || "https://picsum.photos/seed/placeholder/400/300",
    slug: blog.slug,
    date: blog.publish_date
      ? new Date(blog.publish_date).toLocaleDateString("mr-IN", { year: "numeric", month: "long", day: "numeric" })
      : "",
  });

  const featuredBlogs = blogs.slice(0, 2).map(toCard);
  const latestBlogs = blogs.slice(2, 6).map(toCard);
  const trendingBlogs = blogs.slice(6, 8).map(toCard);
  const videoBlogs = blogs.filter((b) => b.video_url);

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  if (loading) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-20">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex gap-3 overflow-x-auto pb-4 mb-6 border-b border-gray-200">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/category/${cat.slug}`}
              className="whitespace-nowrap bg-white border border-gray-200 text-sm px-4 py-2 rounded-full hover:bg-brand-red hover:text-white hover:border-brand-red transition cursor-pointer"
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <AdBanner adType="generic" position="top" placeholderText="जाहिरात स्थान (Top Ad)" heightClass="h-24" />

        {blogs.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-10 text-center text-gray-500 mb-10">
            अजून कोणतीही बातमी प्रकाशित झालेली नाही.
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              {featuredBlogs.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-brand-black mb-4 border-l-4 border-brand-red pl-3">
                    ठळक बातम्या
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    {featuredBlogs.map((blog) => (
                      <BlogCard key={blog.slug} {...blog} />
                    ))}
                  </div>
                </>
              )}

              <AdBanner adType="generic" position="between" placeholderText="जाहिरात स्थान (Between Ad)" heightClass="h-20" />

              {latestBlogs.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-brand-black mb-4 border-l-4 border-brand-saffron pl-3">
                    ताज्या बातम्या
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {latestBlogs.map((blog) => (
                      <BlogCard key={blog.slug} {...blog} />
                    ))}
                  </div>
                </>
              )}

              {trendingBlogs.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-brand-black mb-4 border-l-4 border-red-800 pl-3">
                    ट्रेंडिंग बातम्या
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {trendingBlogs.map((blog) => (
                      <BlogCard key={blog.slug} {...blog} />
                    ))}
                  </div>
                </>
              )}

              {videoBlogs.length > 0 && (
                <>
                  <h2 className="text-xl font-bold text-brand-black mb-4 border-l-4 border-brand-red pl-3">
                    व्हिडिओ बातम्या
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
                    {videoBlogs.map((video) => (
                      <div key={video.id} className="bg-white rounded-lg shadow overflow-hidden">
                        <div className="relative w-full aspect-video">
                          <iframe
                            className="absolute inset-0 w-full h-full"
                            src={getYoutubeEmbedUrl(video.video_url || "")}
                            title={video.title}
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                        <p className="p-3 font-medium text-brand-black text-sm">{video.title}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h3 className="font-bold text-brand-red mb-3 border-b pb-2">लोकप्रिय बातम्या</h3>
                <ul className="space-y-3">
                  {blogs.slice(0, 5).map((blog, i) => (
                    <li key={blog.id} className="flex gap-3 items-start">
                      <span className="text-brand-saffron font-bold text-lg">{i + 1}</span>
                      <span className="text-sm text-gray-700 line-clamp-2">{blog.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <AdBanner adType="generic" position="sidebar1" placeholderText="जाहिरात स्थान (Sidebar Ad)" heightClass="h-64" />

              <div className="bg-white rounded-lg shadow p-4 mb-6">
                <h3 className="font-bold text-brand-red mb-3 border-b pb-2">श्रेणीनुसार बातम्या</h3>
                <ul className="space-y-2 text-sm text-gray-700">
                  {categories.map((cat) => (
                    <li key={cat.slug}>
                      <Link
                        href={`/category/${cat.slug}`}
                        className="flex justify-between border-b border-gray-100 pb-2 last:border-0 hover:text-brand-red transition"
                      >
                        <span>{cat.name}</span>
                        <span className="text-gray-400">→</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>

              <AdBanner adType="generic" position="sidebar2" placeholderText="जाहिरात स्थान (Sidebar Ad 2)" heightClass="h-64" />
            </div>
          </div>
        )}

        <AdBanner adType="generic" position="bottom" placeholderText="जाहिरात स्थान (Bottom Ad)" heightClass="h-24" />

        <TickerBanner />
      </div>
    </main>
  );
}