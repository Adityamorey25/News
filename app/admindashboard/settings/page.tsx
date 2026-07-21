"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";

const DEFAULTS = {
  site_name: "News",
  site_description: "तुमचे विश्वासू मराठी बातम्या व्यासपीठ.",
  logo_url: "/logo.png",
  primary_color: "#DC2626",
  secondary_color: "#FFFFFF",
  contact_email: "info@topzonemarathi.com",
  contact_phone: "",
  facebook_url: "",
  instagram_url: "",
  youtube_url: "",
};

export default function SiteSettingsPage() {
  const router = useRouter();

  const [settingsId, setSettingsId] = useState("");
  const [siteName, setSiteName] = useState("");
  const [siteDescription, setSiteDescription] = useState("");
  const [currentLogoUrl, setCurrentLogoUrl] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [primaryColor, setPrimaryColor] = useState("#DC2626");
  const [secondaryColor, setSecondaryColor] = useState("#FFFFFF");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [facebookUrl, setFacebookUrl] = useState("");
  const [instagramUrl, setInstagramUrl] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [gaId, setGaId] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadSettings = async () => {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push("/admindashboard/login");
      return;
    }

    const { data, error: fetchError } = await supabase.from("site_settings").select("*").single();

    if (data) {
      setSettingsId(data.id);
      setSiteName(data.site_name || "");
      setSiteDescription(data.site_description || "");
      setCurrentLogoUrl(data.logo_url || "");
      setPrimaryColor(data.primary_color || "#DC2626");
      setSecondaryColor(data.secondary_color || "#FFFFFF");
      setContactEmail(data.contact_email || "");
      setContactPhone(data.contact_phone || "");
      setFacebookUrl(data.facebook_url || "");
      setInstagramUrl(data.instagram_url || "");
      setYoutubeUrl(data.youtube_url || "");
      setGaId(data.google_analytics_id || "");
    }
    if (fetchError) {
      setError("Load failed: " + fetchError.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadSettings();
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setMessage("");

    const supabase = createClient();
    let logoUrl = currentLogoUrl;

    if (logoFile) {
      setUploading(true);

      const uploadFormData = new FormData();
      uploadFormData.append("file", logoFile);

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.url) {
          setError("Logo upload failed: " + (uploadResult.error || "Unknown error"));
          setUploading(false);
          setSaving(false);
          return;
        }

        logoUrl = uploadResult.url;
      } catch (err) {
        setError("Logo upload failed. Please try again.");
        setUploading(false);
        setSaving(false);
        return;
      }

      setUploading(false);
    }

    const { data: updateData, error: updateError } = await supabase
      .from("site_settings")
      .update({
        site_name: siteName,
        site_description: siteDescription,
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        contact_email: contactEmail,
        contact_phone: contactPhone,
        facebook_url: facebookUrl,
        instagram_url: instagramUrl,
        youtube_url: youtubeUrl,
        google_analytics_id: gaId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settingsId)
      .select();

    setSaving(false);

    if (updateError) {
      setError("Save failed: " + updateError.message);
      return;
    }

    if (!updateData || updateData.length === 0) {
      setError("Save appeared to succeed but no rows were updated.");
      return;
    }

    setMessage("सेटिंग्स यशस्वीरित्या जतन केल्या! पूर्ण बदल पाहण्यासाठी पेज रिफ्रेश करा.");
    setCurrentLogoUrl(logoUrl);
  };

  const handleReset = async () => {
    const confirmed = confirm(
      "तुम्हाला खात्री आहे की तुम्ही सर्व सेटिंग्स (लोगोसह) मूळ स्थितीत आणायच्या आहेत?"
    );
    if (!confirmed) return;

    setResetting(true);
    setError("");
    setMessage("");

    const supabase = createClient();

    const { error: resetError } = await supabase
      .from("site_settings")
      .update({
        ...DEFAULTS,
        updated_at: new Date().toISOString(),
      })
      .eq("id", settingsId);

    setResetting(false);

    if (resetError) {
      setError("Reset failed: " + resetError.message);
      return;
    }

    setMessage("सेटिंग्स मूळ स्थितीत आणल्या!");
    await loadSettings();
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
      <div className="max-w-2xl mx-auto">
        <Link href="/admindashboard" className="text-sm text-gray-500 hover:underline block mb-4">
          ← डॅशबोर्डवर परत जा
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-brand-black">साइट सेटिंग्स</h1>
            <button
              type="button"
              onClick={handleReset}
              disabled={resetting}
              className="text-sm text-red-600 border border-red-300 px-3 py-1.5 rounded hover:bg-red-50 transition disabled:opacity-50"
            >
              {resetting ? "..." : "↺ मूळ स्थितीत आणा"}
            </button>
          </div>

          {message && (
            <p className="bg-green-100 text-green-700 p-2 rounded mb-4 text-sm">{message}</p>
          )}
          {error && (
            <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-medium">साइटचे नाव</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              required
            />

            <label className="block mb-2 text-sm font-medium">साइट वर्णन</label>
            <textarea
              value={siteDescription}
              onChange={(e) => setSiteDescription(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              rows={2}
            />

            {currentLogoUrl && (
              <div className="mb-3">
                <p className="text-sm text-gray-500 mb-2">सध्याचा लोगो:</p>
                <div className="relative w-20 h-20 rounded-full overflow-hidden">
                  <Image src={currentLogoUrl} alt="Logo" fill unoptimized className="object-cover" />
                </div>
              </div>
            )}

            <label className="block mb-2 text-sm font-medium">नवीन लोगो अपलोड करा</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
              className="w-full border rounded p-2 mb-4"
            />

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-sm font-medium">मुख्य रंग</label>
                <input
                  type="color"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="w-full border rounded h-10"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">दुय्यम रंग</label>
                <input
                  type="color"
                  value={secondaryColor}
                  onChange={(e) => setSecondaryColor(e.target.value)}
                  className="w-full border rounded h-10"
                />
              </div>
            </div>

            <label className="block mb-2 text-sm font-medium">संपर्क ईमेल</label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />

            <label className="block mb-2 text-sm font-medium">संपर्क फोन</label>
            <input
              type="text"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            />

            <label className="block mb-2 text-sm font-medium">फेसबुक लिंक</label>
            <input
              type="text"
              value={facebookUrl}
              onChange={(e) => setFacebookUrl(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="https://facebook.com/..."
            />

            <label className="block mb-2 text-sm font-medium">इंस्टाग्राम लिंक</label>
            <input
              type="text"
              value={instagramUrl}
              onChange={(e) => setInstagramUrl(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="https://instagram.com/..."
            />

            <label className="block mb-2 text-sm font-medium">यूट्यूब लिंक</label>
            <input
              type="text"
              value={youtubeUrl}
              onChange={(e) => setYoutubeUrl(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="https://youtube.com/@yourchannel"
            />

            <label className="block mb-2 text-sm font-medium">गूगल अॅनालिटिक्स आयडी</label>
            <input
              type="text"
              value={gaId}
              onChange={(e) => setGaId(e.target.value)}
              className="w-full border rounded p-2 mb-6"
              placeholder="G-XXXXXXXXXX"
            />

            <button
              type="submit"
              disabled={saving}
              className="bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-dark transition disabled:opacity-50"
            >
              {uploading ? "अपलोड होत आहे..." : saving ? "जतन होत आहे..." : "जतन करा"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}