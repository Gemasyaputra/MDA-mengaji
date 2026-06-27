"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function MobileAuth() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl') || 'mdamengaji://login';
    // Automatically trigger Google sign in when this page loads
    signIn("google", { callbackUrl: `/mobile-auth/success?returnUrl=${encodeURIComponent(returnUrl)}` });
  }, []);

  return (
    <div style={{ padding: 50, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Membuka Google Login...</h2>
      <p>Mohon tunggu sebentar.</p>
    </div>
  );
}
