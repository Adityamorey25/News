"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [blogsCount, setBlogsCount] = useState(0);
  const [categoriesCount, setCategoriesCount] = useState(0);
  const [adsCount, setAdsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/admindashboard/login");
        return;
      }

      setEmail(user.email || "");

      const { count: blogs } = await supabase.from("blogs").select("*", { count: "exact", head: true });
      const { count: cats } = await supabase.from("categories").select("*", { count: "exact", head: true });
      const { count: ads } = await supabase.from("advertisements").select("*", { count: "exact", head: true });

      setBlogsCount(blogs ?? 0);
      setCategoriesCount(cats ?? 0);
      setAdsCount(ads ?? 0);
      setLoading(false);
    };

    load();
  }, [router]);

  const handleLogout = async () => {
    setLoggingOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admindashboard/login");
    router.refresh();
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
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold text-brand-black">प्रशासक डॅशबोर्ड</h1>
          <div className="flex items-center gap-4">
            <p className="text-sm text-gray-500">लॉग इन केले: {email}</p>
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="text-sm bg-white border border-gray-300 text-gray-700 px-4 py-1.5 rounded hover:bg-gray-50 transition disabled:opacity-50"
            >
              {loggingOut ? "..." : "लॉग आउट"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <Link
            href="/admindashboard/blogs"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer block"
          >
            <p className="text-sm text-gray-500 mb-1">एकूण बातम्या</p>
            <p className="text-3xl font-bold text-brand-red">{blogsCount}</p>
          </Link>
          <Link
            href="/admindashboard/categories"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer block"
          >
            <p className="text-sm text-gray-500 mb-1">एकूण श्रेणी</p>
            <p className="text-3xl font-bold text-brand-red">{categoriesCount}</p>
          </Link>
          <Link
            href="/admindashboard/ads"
            className="bg-white rounded-lg shadow p-6 hover:shadow-md hover:-translate-y-0.5 transition cursor-pointer block"
          >
            <p className="text-sm text-gray-500 mb-1">एकूण जाहिराती</p>
            <p className="text-3xl font-bold text-brand-red">{adsCount}</p>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="font-bold text-lg mb-4">जलद क्रिया</h2>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/admindashboard/blogs/new"
              className="bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-dark transition"
            >
              + बातमी जोडा
            </Link>
            <Link
              href="/admindashboard/categories"
              className="bg-brand-black text-white px-4 py-2 rounded hover:opacity-80 transition"
            >
              श्रेणी व्यवस्थापित करा
            </Link>
            <Link
              href="/admindashboard/ads"
              className="bg-gray-700 text-white px-4 py-2 rounded hover:opacity-80 transition"
            >
              जाहिरात व्यवस्थापन
            </Link>
            <Link
              href="/admindashboard/settings"
              className="bg-gray-500 text-white px-4 py-2 rounded hover:opacity-80 transition"
            >
              साइट सेटिंग्स
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}