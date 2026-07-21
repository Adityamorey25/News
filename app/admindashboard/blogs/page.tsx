"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type Blog = {
  id: string;
  title: string;
  slug: string;
  status: string;
  views_count: number;
};

export default function BlogsListPage() {
  const router = useRouter();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadBlogs = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admindashboard/login");
      return;
    }

    const { data } = await supabase
      .from("blogs")
      .select("id, title, slug, status, views_count")
      .order("created_at", { ascending: false });

    setBlogs(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadBlogs();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("तुम्हाला खात्री आहे की तुम्ही ही बातमी काढायची आहे? या बातमीशी जोडलेल्या जाहिराती देखील काढल्या जातील.")) return;

    setDeletingId(id);
    const supabase = createClient();

    // First, delete any ads linked to this blog (FK safety)
    const { error: adsError } = await supabase
      .from("advertisements")
      .delete()
      .eq("blog_id", id);

    if (adsError) {
      alert("जाहिराती काढताना काहीतरी चुकले: " + adsError.message);
      setDeletingId(null);
      return;
    }

    // Then delete the blog itself
    const { error: blogError } = await supabase.from("blogs").delete().eq("id", id);

    setDeletingId(null);

    if (!blogError) {
      setBlogs((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert("बातमी काढताना काहीतरी चुकले: " + blogError.message);
    }
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
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-brand-black">बातम्या व्यवस्थापन</h1>
          <Link
            href="/admindashboard/blogs/new"
            className="bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-dark transition"
          >
            + बातमी जोडा
          </Link>
        </div>

        <Link href="/admindashboard" className="text-sm text-gray-500 hover:underline block mb-4">
          ← डॅशबोर्डवर परत जा
        </Link>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {blogs.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">अजून कोणतीही बातमी नाही.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="p-4">शीर्षक</th>
                  <th className="p-4">स्थिती</th>
                  <th className="p-4">वाचन</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {blogs.map((blog) => (
                  <tr key={blog.id} className="border-t">
                    <td className="p-4 font-medium">{blog.title}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          blog.status === "published"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {blog.status === "published" ? "प्रकाशित" : "मसुदा"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{blog.views_count}</td>
                    <td className="p-4 text-right space-x-3">
                      <Link
                        href={`/admindashboard/blogs/${blog.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        संपादित करा
                      </Link>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        disabled={deletingId === blog.id}
                        className="text-red-600 hover:underline disabled:opacity-50"
                      >
                        {deletingId === blog.id ? "काढत आहे..." : "काढा"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </main>
  );
}