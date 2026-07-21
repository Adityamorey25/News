"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setError("अवैध ईमेल किंवा पासवर्ड.");
      return;
    }

    router.push("/admindashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <form
        onSubmit={handleLogin}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm"
      >
        <div className="flex justify-center mb-4">
          <Image src="/logo.png" alt="TopZone Marathi" width={64} height={64} unoptimized className="rounded-full" />
        </div>
        <h1 className="text-2xl font-bold mb-6 text-center text-brand-red">
          प्रशासक लॉगिन
        </h1>

        {error && (
          <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
            {error}
          </p>
        )}

        <label className="block mb-2 text-sm font-medium">ईमेल</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border rounded p-2 mb-4"
          required
        />

        <label className="block mb-2 text-sm font-medium">पासवर्ड</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border rounded p-2 mb-6"
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-brand-red text-white py-2 rounded font-semibold hover:bg-brand-red-dark disabled:opacity-50"
        >
          {loading ? "लॉग इन होत आहे..." : "लॉग इन करा"}
        </button>
      </form>
    </main>
  );
}