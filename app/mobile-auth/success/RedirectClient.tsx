"use client";

import { useEffect } from "react";

export default function RedirectClient({ url }: { url: string }) {
  useEffect(() => {
    // Attempt redirect immediately
    window.location.replace(url);
    
    // Fallback: try again after 500ms
    const timer = setTimeout(() => {
      window.location.href = url;
    }, 500);

    return () => clearTimeout(timer);
  }, [url]);

  return null;
}
