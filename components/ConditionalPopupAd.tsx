"use client";

import { usePathname } from "next/navigation";
import PopupAd from "./PopupAd";

export default function ConditionalPopupAd() {
  const pathname = usePathname();
  const isAdminPage = pathname?.startsWith("/admindashboard");

  if (isAdminPage) return null;

  return <PopupAd />;
}