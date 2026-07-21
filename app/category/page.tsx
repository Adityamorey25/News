"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase-browser";

type Category = {
  id: string;
  name: string;
  slug: string;
};

export default function AllCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      const supabase = createClient();
      const { data } = await supabase
        .from("categories")
        .select("id, name, slug")
        .eq("status", "active")
        .order("sort_order", { ascending: true });

      setCategories(data || []);
      setLoading(false);
    };

    loadCategories();
  }, []);

  if (loading) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-20">
        <p className="text-gray-500">Loading...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-brand-red mb-6 border-l-4 border-brand-red pl-3">
          सर्व श्रेणी
        </h1>

        {categories.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center text-gray-500">
            अजून कोणतीही श्रेणी नाही.
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="bg-white rounded-lg shadow p-6 text-center font-semibold text-brand-black hover:shadow-md hover:text-brand-red transition"
              >
                {cat.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}