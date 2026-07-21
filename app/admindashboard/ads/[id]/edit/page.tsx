"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase-browser";

type Category = { id: string; name: string };
type Blog = { id: string; title: string };

export default function EditAdPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [categories, setCategories] = useState<Category[]>([]);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [title, setTitle] = useState("");
  const [adType, setAdType] = useState("generic");
  const [position, setPosition] = useState("top");
  const [categoryId, setCategoryId] = useState("");
  const [blogId, setBlogId] = useState("");
  const [redirectUrl, setRedirectUrl] = useState("");
  const [priority, setPriority] = useState("3");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [status, setStatus] = useState("active");
  const [currentImageUrl, setCurrentImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [panelWidth, setPanelWidth] = useState("");
  const [panelHeight, setPanelHeight] = useState("");
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();

      const { data: catData } = await supabase.from("categories").select("id, name").order("name");
      setCategories(catData || []);
      const { data: blogData } = await supabase.from("blogs").select("id, title").order("title");
      setBlogs(blogData || []);

      const { data, error } = await supabase
        .from("advertisements")
        .select("*")
        .eq("id", id)
        .single();

      if (data) {
        setTitle(data.title);
        setAdType(data.ad_type);
        setPosition(data.position || "top");
        setCategoryId(data.category_id || "");
        setBlogId(data.blog_id || "");
        setRedirectUrl(data.redirect_url || "");
        setPriority(String(data.priority));
        setStartDate(data.start_date ? String(data.start_date).slice(0, 10) : "");
        setEndDate(data.end_date ? String(data.end_date).slice(0, 10) : "");
        setStatus(data.status);
        setCurrentImageUrl(data.image_url || "");
        setPanelWidth(data.panel_width ? String(data.panel_width) : "");
        setPanelHeight(data.panel_height ? String(data.panel_height) : "");
      }
      if (error) {
        setError(error.message);
      }
      setLoading(false);
    };

    load();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    const supabase = createClient();
    let imageUrl = currentImageUrl;

    if (imageFile) {
      setUploading(true);

      const uploadFormData = new FormData();
      uploadFormData.append("file", imageFile);

      try {
        const uploadResponse = await fetch("/api/upload", {
          method: "POST",
          body: uploadFormData,
        });

        const uploadResult = await uploadResponse.json();

        if (!uploadResponse.ok || !uploadResult.url) {
          setError("Image upload failed: " + (uploadResult.error || "Unknown error"));
          setUploading(false);
          setSaving(false);
          return;
        }

        imageUrl = uploadResult.url;
      } catch (err) {
        setError("Image upload failed. Please try again.");
        setUploading(false);
        setSaving(false);
        return;
      }

      setUploading(false);
    }

    const { error: updateError } = await supabase
      .from("advertisements")
      .update({
        title,
        image_url: imageUrl || null,
        redirect_url: redirectUrl,
        ad_type: adType,
        position: adType === "generic" ? position : null,
        category_id: adType === "category" ? categoryId || null : null,
        blog_id: adType === "blog" ? blogId || null : null,
        priority: parseInt(priority),
        start_date: startDate || null,
        end_date: endDate || null,
        status,
        panel_width: adType !== "popup" && panelWidth ? parseInt(panelWidth) : null,
        panel_height: adType !== "popup" && panelHeight ? parseInt(panelHeight) : null,
      })
      .eq("id", id);

    setSaving(false);

    if (updateError) {
      setError(updateError.message);
      return;
    }

    router.push("/admindashboard/ads");
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
        <Link href="/admindashboard/ads" className="text-sm text-gray-500 hover:underline block mb-4">
          ← जाहिरात व्यवस्थापन
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-xl font-bold mb-6 text-brand-black">जाहिरात संपादित करा</h1>

          {error && (
            <p className="bg-red-100 text-red-700 p-2 rounded mb-4 text-sm">{error}</p>
          )}

          <form onSubmit={handleSubmit}>
            <label className="block mb-2 text-sm font-medium">जाहिरातीचे शीर्षक</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              required
            />

            {currentImageUrl && (
              <div className="mb-3">
                <p className="text-sm text-gray-500 mb-2">Current image:</p>
                <div className="relative w-full h-32 rounded overflow-hidden">
                  <Image src={currentImageUrl} alt="Current" fill unoptimized className="object-cover" />
                </div>
              </div>
            )}

            <label className="block mb-2 text-sm font-medium">जाहिरात फोटो</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
              className="w-full border rounded p-2 mb-4"
            />

            {adType !== "popup" && (
              <>
                <label className="block mb-2 text-sm font-medium">पॅनेलचा आकार (Panel Size)</label>
                <div className="grid grid-cols-2 gap-4 mb-1">
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={panelWidth}
                      onChange={(e) => setPanelWidth(e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="रुंदी (Width) px, उदा. 300"
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={panelHeight}
                      onChange={(e) => setPanelHeight(e.target.value)}
                      className="w-full border rounded p-2"
                      placeholder="उंची (Height) px, उदा. 250"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  रिकामे सोडल्यास डिफॉल्ट आकार वापरला जाईल.
                </p>
              </>
            )}

            <label className="block mb-2 text-sm font-medium">रीडायरेक्ट URL</label>
            <input
              type="text"
              value={redirectUrl}
              onChange={(e) => setRedirectUrl(e.target.value)}
              className="w-full border rounded p-2 mb-4"
              placeholder="https://..."
            />

            <label className="block mb-2 text-sm font-medium">जाहिरातीचा प्रकार</label>
            <select
              value={adType}
              onChange={(e) => setAdType(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            >
              <option value="generic">सामान्य (संपूर्ण साइटवर)</option>
              <option value="category">श्रेणी विशिष्ट</option>
              <option value="blog">बातमी विशिष्ट</option>
              <option value="popup">पॉपअप</option>
            </select>

            {adType === "generic" && (
              <>
                <label className="block mb-2 text-sm font-medium">कोणत्या जागी दाखवायची</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full border rounded p-2 mb-1"
                >
                  <option value="top">वरती (Top) — लांब पट्टी, आकार: 1200×150px</option>
                  <option value="between">मध्ये (Between) — लांब पट्टी, आकार: 1200×150px</option>
                  <option value="sidebar1">साइडबार 1 (Sidebar) — चौकोनी, आकार: 300×250px</option>
                  <option value="sidebar2">साइडबार 2 (Sidebar 2) — चौकोनी, आकार: 300×250px</option>
                  <option value="bottom">खाली (Bottom) — लांब पट्टी, आकार: 1200×150px</option>
                </select>
                <p className="text-xs text-gray-400 mb-4">
                  ज्या जागेसाठी जाहिरात आहे, त्या आकाराचा फोटो अपलोड करा — तो सर्वात व्यवस्थित दिसेल.
                </p>
              </>
            )}

            {adType === "category" && (
              <>
                <label className="block mb-2 text-sm font-medium">श्रेणी निवडा</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full border rounded p-2 mb-4"
                >
                  <option value="">श्रेणी निवडा</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </>
            )}

            {adType === "blog" && (
              <>
                <label className="block mb-2 text-sm font-medium">बातमी निवडा</label>
                <select
                  value={blogId}
                  onChange={(e) => setBlogId(e.target.value)}
                  className="w-full border rounded p-2 mb-4"
                >
                  <option value="">बातमी निवडा</option>
                  {blogs.map((blog) => (
                    <option key={blog.id} value={blog.id}>{blog.title}</option>
                  ))}
                </select>
              </>
            )}

            <label className="block mb-2 text-sm font-medium">प्राधान्य (1-5)</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full border rounded p-2 mb-4"
            >
              {[1, 2, 3, 4, 5].map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block mb-2 text-sm font-medium">सुरुवात तारीख</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label className="block mb-2 text-sm font-medium">समाप्ती तारीख</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            <label className="block mb-2 text-sm font-medium">स्थिती</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full border rounded p-2 mb-6"
            >
              <option value="active">सक्रिय</option>
              <option value="inactive">निष्क्रिय</option>
            </select>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="bg-brand-red text-white px-4 py-2 rounded hover:bg-brand-red-dark transition disabled:opacity-50"
              >
                {uploading ? "अपलोड होत आहे..." : saving ? "जतन होत आहे..." : "जतन करा"}
              </button>
              <Link
                href="/admindashboard/ads"
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
              >
                रद्द करा
              </Link>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}