"use client";

import { useSiteSettings } from "@/lib/useSiteSettings";

export default function ContactPage() {
  const { settings } = useSiteSettings();

  const email = settings?.contact_email || "info@topzonemarathi.com";
  const phone = settings?.contact_phone || "";

  return (
    <main className="flex-1 bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-2xl font-bold text-brand-red mb-4 border-l-4 border-brand-red pl-3">
          संपर्क
        </h1>
        <div className="bg-white rounded-lg shadow p-6 text-gray-700 leading-relaxed space-y-2">
          <p>
            <span className="font-semibold">ईमेल:</span> {email}
          </p>
          {phone && (
            <p>
              <span className="font-semibold">Phone:</span> {phone}
            </p>
          )}
          <p>
            <span className="font-semibold">पत्ता:</span> महाराष्ट्र, भारत
          </p>
        </div>
      </div>
    </main>
  );
}