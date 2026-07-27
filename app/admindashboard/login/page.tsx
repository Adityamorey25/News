"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";
import { useSiteSettings } from "@/lib/useSiteSettings";

const ADMIN_EMAIL = "adityamorey1@gmail.com";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "forgot" | "verify">("login");
  const router = useRouter();
  const { settings } = useSiteSettings();

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

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (email.trim().toLowerCase() !== ADMIN_EMAIL.toLowerCase()) {
      setError("ही ईमेल नोंदणीकृत नाही.");
      return;
    }

    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    setLoading(false);
    if (error) {
      setError("कोड पाठवताना त्रुटी आली. पुन्हा प्रयत्न करा.");
      return;
    }
    setMode("verify");
  };

  const handleVerifyAndReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (newPassword !== confirmPassword) {
      setError("पासवर्ड जुळत नाहीत.");
      return;
    }
    if (newPassword.length < 6) {
      setError("पासवर्ड किमान ६ अक्षरांचा असावा.");
      return;
    }

    setLoading(true);
    const supabase = createClient();

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "recovery",
    });

    if (verifyError) {
      setLoading(false);
      setError("कोड चुकीचा किंवा कालबाह्य आहे. पुन्हा प्रयत्न करा.");
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setError("पासवर्ड बदलताना त्रुटी आली. पुन्हा प्रयत्न करा.");
      return;
    }

    router.push("/admindashboard");
    router.refresh();
  };

  const resetToLogin = () => {
    setMode("login");
    setError("");
    setCode("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="flex justify-center mb-4">
          <Image
            src={settings?.logo_url || "/logo.png"}
            alt={settings?.site_name || "News"}
            width={64}
            height={64}
            unoptimized
            className="rounded-full"
          />
        </div>

        {mode === "login" && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-brand-red">
              प्रशासक लॉगिन
            </h1>
            {error && (
              <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                {error}
              </p>
            )}
            <form onSubmit={handleLogin}>
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
                className="w-full border rounded p-2 mb-2"
                required
              />
              <div className="text-right mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode("forgot");
                    setError("");
                  }}
                  className="text-sm text-brand-red hover:underline"
                >
                  पासवर्ड विसरलात?
                </button>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red text-white py-2 rounded font-semibold hover:bg-brand-red-dark disabled:opacity-50"
              >
                {loading ? "लॉग इन होत आहे..." : "लॉग इन करा"}
              </button>
            </form>
          </>
        )}

        {mode === "forgot" && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-brand-red">
              पासवर्ड रीसेट करा
            </h1>
            {error && (
              <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                {error}
              </p>
            )}
            <form onSubmit={handleSendCode}>
              <label className="block mb-2 text-sm font-medium">
                तुमचा ईमेल टाका
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border rounded p-2 mb-6"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red text-white py-2 rounded font-semibold hover:bg-brand-red-dark disabled:opacity-50"
              >
                {loading ? "पाठवत आहे..." : "कोड पाठवा"}
              </button>
            </form>
            <button
              type="button"
              onClick={resetToLogin}
              className="w-full text-sm text-gray-600 hover:underline mt-4"
            >
              ← लॉगिनवर परत जा
            </button>
          </>
        )}

        {mode === "verify" && (
          <>
            <h1 className="text-2xl font-bold mb-6 text-center text-brand-red">
              कोड टाका आणि नवीन पासवर्ड सेट करा
            </h1>
            <p className="text-sm text-gray-600 mb-4 text-center">
              {email} वर पाठवलेला कोड टाका
            </p>
            {error && (
              <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">
                {error}
              </p>
            )}
            <form onSubmit={handleVerifyAndReset}>
              <label className="block mb-2 text-sm font-medium">कोड</label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full border rounded p-2 mb-4 text-center tracking-widest text-lg"
                maxLength={8}
                required
              />
              <label className="block mb-2 text-sm font-medium">नवीन पासवर्ड</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border rounded p-2 mb-4"
                required
              />
              <label className="block mb-2 text-sm font-medium">
                पासवर्ड पुन्हा टाका
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full border rounded p-2 mb-6"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-brand-red text-white py-2 rounded font-semibold hover:bg-brand-red-dark disabled:opacity-50"
              >
                {loading ? "सेव्ह होत आहे..." : "पासवर्ड सेव्ह करा"}
              </button>
            </form>
            <button
              type="button"
              onClick={resetToLogin}
              className="w-full text-sm text-gray-600 hover:underline mt-4"
            >
              ← लॉगिनवर परत जा
            </button>
          </>
        )}
      </div>
    </main>
  );
}