import { MetadataRoute } from "next";
import { createClient } from "@/lib/supabase-server";

const SITE_URL = "https://topzonemarathi.com"; // Vercel pe deploy hone ke baad apna asli domain daal dena

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  // Sab published blogs laao
  const { data: blogs } = await supabase
    .from("blogs")
    .select("slug, updated_at, publish_date")
    .eq("status", "published");

  // Sab active categories laao
  const { data: categories } = await supabase
    .from("categories")
    .select("slug")
    .eq("status", "active");

  const blogUrls: MetadataRoute.Sitemap = (blogs || []).map((blog) => ({
    url: `${SITE_URL}/blog/${blog.slug}`,
    lastModified: blog.updated_at || blog.publish_date || new Date(),
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  const categoryUrls: MetadataRoute.Sitemap = (categories || []).map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const staticUrls: MetadataRoute.Sitemap = [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${SITE_URL}/category`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
    },
    {
      url: `${SITE_URL}/terms`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.1,
    },
  ];

  return [...staticUrls, ...categoryUrls, ...blogUrls];
}