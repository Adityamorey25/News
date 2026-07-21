"use client";

import { useSiteSettings } from "@/lib/useSiteSettings";

export default function AboutPage() {
  const { settings } = useSiteSettings();

  const description =
    settings?.site_description ||
    "TopZone Marathi हे महाराष्ट्रातील एक विश्वासू डिजिटल मराठी बातम्या व्यासपीठ आहे.";

  return (
    <main className="flex-1 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-brand-red mb-4 border-l-4 border-brand-red pl-3">
          आमच्याबद्दल
        </h1>
        <div className="bg-white rounded-lg shadow p-6 text-gray-700 leading-relaxed space-y-4">
          <p>{description}</p>
          <p>आमचे उद्दिष्ट महाराष्ट्रातील प्रत्येक कोपऱ्यातील बातम्या जलद आणि अचूकपणे पोहोचवणे आहे.</p>
        </div>
      </div>
    </main>
  );
}