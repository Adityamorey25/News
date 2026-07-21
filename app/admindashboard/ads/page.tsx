"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type Ad = {
  id: string;
  title: string;
  ad_type: string;
  priority: number;
  status: string;
  views_count: number;
  clicks_count: number;
};

export default function AdsListPage() {
  const router = useRouter();
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  const loadAds = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admindashboard/login");
      return;
    }

    const { data } = await supabase
      .from("advertisements")
      .select("id, title, ad_type, priority, status, views_count, clicks_count")
      .order("priority", { ascending: false });

    setAds(data || []);
    setLoading(false);
  };

  useEffect(() => {
    loadAds();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("तुम्हाला खात्री आहे की तुम्ही ही जाहिरात काढायची आहे?")) return;

    const supabase = createClient();
    const { error } = await supabase.from("advertisements").delete().eq("id", id);

    if (!error) {
      setAds((prev) => prev.filter((a) => a.id !== id));
    } else {
      alert("काहीतरी चुकले. कृपया पुन्हा प्रयत्न करा.");
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
          <h1 className="text-2xl font-bold text-brand-black">जाहिरात व्यवस्थापन</h1>
          <Link
            href="/admindashboard/ads/new"
            className="bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-dark transition"
          >
            + जाहिरात जोडा
          </Link>
        </div>

        <Link href="/admindashboard" className="text-sm text-gray-500 hover:underline block mb-4">
          ← डॅशबोर्डवर परत जा
        </Link>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {ads.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">अजून कोणतीही जाहिरात नाही.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="p-4">जाहिरातीचे शीर्षक</th>
                  <th className="p-4">प्रकार</th>
                  <th className="p-4">प्राधान्य</th>
                  <th className="p-4">स्थिती</th>
                  <th className="p-4">वाचन</th>
                  <th className="p-4">क्लिक</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {ads.map((ad) => (
                  <tr key={ad.id} className="border-t">
                    <td className="p-4 font-medium">{ad.title}</td>
                    <td className="p-4 text-gray-500 capitalize">{ad.ad_type}</td>
                    <td className="p-4">{ad.priority}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          ad.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {ad.status === "active" ? "सक्रिय" : "निष्क्रिय"}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{ad.views_count || 0}</td>
                    <td className="p-4 text-gray-500">{ad.clicks_count || 0}</td>
                    <td className="p-4 text-right space-x-3">
                      <Link
                        href={`/admindashboard/ads/${ad.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        संपादित करा
                      </Link>
                      <button
                        onClick={() => handleDelete(ad.id)}
                        className="text-red-600 hover:underline"
                      >
                        काढा
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