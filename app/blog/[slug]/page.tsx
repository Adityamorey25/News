import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import AdBanner from "@/components/AdBanner";
import ViewCounter from "./ViewCounter";

type Blog = {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string | null;
  featured_image_url: string | null;
  video_url: string | null;
  author_name: string | null;
  publish_date: string | null;
  views_count: number;
  categories: { name: string; slug: string } | null;
};

const selectFields =
  "id, title, slug, content, excerpt, featured_image_url, video_url, author_name, publish_date, views_count, categories(name, slug)";

async function getBlog(slug: string): Promise<Blog | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("blogs")
    .select(selectFields)
    .eq("slug", slug)
    .eq("status", "published")
    .single();

  if (error || !data) return null;
  return data as unknown as Blog;
}

async function getRelated(categorySlug: string, currentSlug: string): Promise<Blog[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("blogs")
    .select(selectFields)
    .eq("status", "published")
    .eq("categories.slug", categorySlug)
    .neq("slug", currentSlug)
    .limit(3);

  return (data as unknown as Blog[]) || [];
}

// This runs on the SERVER and gives Google / WhatsApp / Facebook the
// correct title, description, and image for THIS specific article.
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return { title: "बातमी सापडली नाही - TopZone Marathi" };
  }

  const description = blog.excerpt || blog.content.slice(0, 160);
  const imageUrl = blog.featured_image_url || "/logo.png";

  return {
    title: `${blog.title} - TopZone Marathi`,
    description,
    openGraph: {
      title: blog.title,
      description,
      images: [{ url: imageUrl }],
      type: "article",
      publishedTime: blog.publish_date || undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: blog.title,
      description,
      images: [imageUrl],
    },
    alternates: {
      canonical: `/blog/${blog.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const blog = await getBlog(slug);

  if (!blog) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-20">
        <p className="text-gray-500">बातमी सापडली नाही.</p>
      </main>
    );
  }

  const related = blog.categories?.slug
    ? await getRelated(blog.categories.slug, slug)
    : [];

  const wordCount = blog.content.split(/\s+/).filter(Boolean).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 150));
  const formattedDate = blog.publish_date
    ? new Date(blog.publish_date).toLocaleDateString("mr-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  const getYoutubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  // Structured data — tells Google this is a news article (helps search appearance)
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: blog.title,
    image: blog.featured_image_url ? [blog.featured_image_url] : undefined,
    datePublished: blog.publish_date || undefined,
    author: blog.author_name ? [{ "@type": "Person", name: blog.author_name }] : undefined,
    description: blog.excerpt || undefined,
  };

  return (
    <main className="flex-1 bg-gray-50">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <ViewCounter blogId={blog.id} currentViews={blog.views_count} />

      <div className="max-w-3xl mx-auto px-4 py-10">
        {blog.categories?.name && (
          <span className="inline-block bg-brand-red text-white text-xs px-3 py-1 rounded mb-3">
            {blog.categories.name}
          </span>
        )}
        <h1 className="text-2xl md:text-3xl font-bold text-brand-black mb-3">{blog.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
          {blog.author_name && <span>लेखक: {blog.author_name}</span>}
          <span>{formattedDate}</span>
          <span>⏱ {readingTimeMinutes} मिनिटे वाचन</span>
        </div>

        {blog.featured_image_url && (
          <div className="relative w-full h-64 md:h-96 rounded-lg overflow-hidden mb-6">
            <Image
              src={blog.featured_image_url}
              alt={blog.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              className="object-cover"
            />
          </div>
        )}

        <article className="prose max-w-none text-gray-700 leading-relaxed space-y-4 mb-6">
          <p>{blog.content}</p>
        </article>

        <AdBanner adType="blog" blogId={blog.id} placeholderText="जाहिरात स्थान (Between Ad)" heightClass="h-24" />

        {blog.video_url && (
          <div className="mb-8">
            <h2 className="text-lg font-bold text-brand-red mb-3 border-l-4 border-brand-red pl-3">
              संबंधित व्हिडिओ
            </h2>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden shadow">
              <iframe
                className="absolute inset-0 w-full h-full"
                src={getYoutubeEmbedUrl(blog.video_url)}
                title="YouTube video"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        )}

        {related.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-brand-red mb-4 border-l-4 border-brand-red pl-3">
              संबंधित बातम्या
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/blog/${r.slug}`}
                  className="bg-white rounded-lg shadow overflow-hidden hover:shadow-md transition"
                >
                  {r.featured_image_url && (
                    <div className="relative w-full h-28">
                      <Image
                        src={r.featured_image_url}
                        alt={r.title}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <p className="p-3 text-sm font-medium text-brand-black line-clamp-2">{r.title}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}