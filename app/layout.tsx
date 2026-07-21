import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ConditionalPopupAd from "@/components/ConditionalPopupAd";
import DynamicColors from "@/components/DynamicColors";
import GoogleAnalytics from "@/components/GoogleAnalytics";
import GoogleTranslateFix from "@/components/GoogleTranslateFix";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TopZone Marathi - डिजिटल मराठी चॅनेल",
  description: "Your Marathi News & Content Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="mr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col" suppressHydrationWarning>
        <DynamicColors />
        <GoogleTranslateFix />
        <GoogleAnalytics />
        <Navbar />
        {children}
        <Footer />
        <ConditionalPopupAd />
      </body>
    </html>
  );
}