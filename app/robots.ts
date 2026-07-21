import { MetadataRoute } from "next";

const SITE_URL = "https://topzonemarathi.com"; // Vercel pe deploy hone ke baad apna asli domain daal dena

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admindashboard/", "/api/"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}