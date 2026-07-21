"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";

type Category = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: string;
  sort_order: number;
};

export default function CategoriesListPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [editValues, setEditValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [orderError, setOrderError] = useState("");

  const loadCategories = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admindashboard/login");
      return;
    }

    const { data, error } = await supabase
      .from("categories")
      .select("id, name, slug, description, status, sort_order")
      .order("sort_order", { ascending: true });

    if (error) {
      console.error("Load categories error:", error);
    }

    const list = data || [];
    setCategories(list);

    const values: Record<string, string> = {};
    list.forEach((c) => {
      values[c.id] = String(c.sort_order);
    });
    setEditValues(values);

    setLoading(false);
  };

  // Renumbers every category 1, 2, 3... in their current order — no gaps, always starts at 1
  const reindexAll = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("categories")
      .select("id, sort_order")
      .order("sort_order", { ascending: true });

    if (!data) return;

    for (let i = 0; i < data.length; i++) {
      const correctNumber = i + 1;
      if (data[i].sort_order !== correctNumber) {
        await supabase
          .from("categories")
          .update({ sort_order: correctNumber })
          .eq("id", data[i].id);
      }
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`"${name}" ही श्रेणी काढायची आहे का?`)) return;

    const supabase = createClient();

    const { count } = await supabase
      .from("blogs")
      .select("id", { count: "exact", head: true })
      .eq("category_id", id);

    if (count && count > 0) {
      alert(`ही श्रेणी काढता येणार नाही — यात अजून ${count} बातम्या आहेत.`);
      return;
    }

    const { error } = await supabase.from("categories").delete().eq("id", id);

    if (error) {
      alert("काहीतरी चुकले: " + error.message);
      return;
    }

    await reindexAll();
    await loadCategories();
  };

  const handleInputTyping = (id: string, value: string) => {
    setEditValues((prev) => ({ ...prev, [id]: value }));
  };

  const handleOrderSave = async (id: string) => {
    const newNum = parseInt(editValues[id]);
    if (isNaN(newNum)) {
      setOrderError("कृपया वैध नंबर टाका.");
      return;
    }

    const current = categories.find((c) => c.id === id);
    if (!current) return;

    const oldNum = current.sort_order;
    if (oldNum === newNum) return;

    const conflicting = categories.find((c) => c.id !== id && c.sort_order === newNum);

    setSavingId(id);
    setOrderError("");
    const supabase = createClient();

    const { error: err1 } = await supabase
      .from("categories")
      .update({ sort_order: newNum })
      .eq("id", id);

    let err2 = null;
    if (conflicting) {
      const result = await supabase
        .from("categories")
        .update({ sort_order: oldNum })
        .eq("id", conflicting.id);
      err2 = result.error;
    }

    setSavingId(null);

    if (err1 || err2) {
      setOrderError("क्रम बदलताना त्रुटी आली.");
      return;
    }

    await reindexAll();
    await loadCategories();
  };

  const moveCategory = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const current = categories[index];
    const target = categories[targetIndex];

    setSavingId(current.id);
    setOrderError("");
    const supabase = createClient();

    const { error: err1 } = await supabase
      .from("categories")
      .update({ sort_order: target.sort_order })
      .eq("id", current.id);

    const { error: err2 } = await supabase
      .from("categories")
      .update({ sort_order: current.sort_order })
      .eq("id", target.id);

    setSavingId(null);

    if (err1 || err2) {
      setOrderError("क्रम बदलताना त्रुटी आली.");
      return;
    }

    await reindexAll();
    await loadCategories();
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
          <h1 className="text-2xl font-bold text-brand-black">श्रेणी व्यवस्थापन</h1>
          <Link
            href="/admindashboard/categories/new"
            className="bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-dark transition"
          >
            + श्रेणी जोडा
          </Link>
        </div>

        <Link href="/admindashboard" className="text-sm text-gray-500 hover:underline block mb-4">
          ← डॅशबोर्डवर परत जा
        </Link>

        <p className="text-sm text-gray-500 mb-3">
          बाणांनी (↑↓) एक-एक स्थान बदला, किंवा नंबर टाकून ✓ दाबा — क्रम नेहमी 1 पासून सुरू राहील.
        </p>

        {orderError && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-3 text-sm">{orderError}</p>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          {categories.length === 0 ? (
            <p className="p-6 text-gray-500 text-center">अजून कोणतीही श्रेणी नाही.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left text-gray-500">
                <tr>
                  <th className="p-4">क्रम</th>
                  <th className="p-4">नाव</th>
                  <th className="p-4">स्लग</th>
                  <th className="p-4">स्थिती</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat, index) => (
                  <tr key={cat.id} className="border-t">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="flex gap-1">
                          <button
                            onClick={() => moveCategory(index, "up")}
                            disabled={index === 0 || savingId === cat.id}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30"
                            aria-label="Move up"
                          >
                            ↑
                          </button>
                          <button
                            onClick={() => moveCategory(index, "down")}
                            disabled={index === categories.length - 1 || savingId === cat.id}
                            className="w-7 h-7 flex items-center justify-center bg-gray-100 rounded hover:bg-gray-200 disabled:opacity-30"
                            aria-label="Move down"
                          >
                            ↓
                          </button>
                        </div>
                        <input
                          type="number"
                          value={editValues[cat.id] ?? cat.sort_order}
                          onChange={(e) => handleInputTyping(cat.id, e.target.value)}
                          className="w-14 border rounded px-2 py-1 text-center"
                        />
                        <button
                          onClick={() => handleOrderSave(cat.id)}
                          disabled={savingId === cat.id}
                          className="w-7 h-7 flex items-center justify-center bg-green-100 text-green-700 rounded hover:bg-green-200 disabled:opacity-40"
                          aria-label="Save order"
                        >
                          {savingId === cat.id ? "…" : "✓"}
                        </button>
                      </div>
                    </td>
                    <td className="p-4 font-medium">{cat.name}</td>
                    <td className="p-4 text-gray-500">/{cat.slug}</td>
                    <td className="p-4">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          cat.status === "active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {cat.status === "active" ? "सक्रिय" : "निष्क्रिय"}
                      </span>
                    </td>
                    <td className="p-4 text-right space-x-3">
                      <Link
                        href={`/admindashboard/categories/${cat.id}/edit`}
                        className="text-blue-600 hover:underline"
                      >
                        संपादित करा
                      </Link>
                      <button
                        onClick={() => handleDelete(cat.id, cat.name)}
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