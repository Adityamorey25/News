"use client";

import { useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase-browser";

// Invisible component — its only job is to add +1 to the view count
// once, when the article page loads in the browser.
export default function ViewCounter({
  blogId,
  currentViews,
}: {
  blogId: string;
  currentViews: number;
}) {
  const hasIncremented = useRef(false);

  useEffect(() => {
    if (hasIncremented.current) return;
    hasIncremented.current = true;

    const supabase = createClient();
    supabase
      .from("blogs")
      .update({ views_count: (currentViews || 0) + 1 })
      .eq("id", blogId)
      .then();
  }, [blogId, currentViews]);

  return null;
}