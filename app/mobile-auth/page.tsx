"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";

export default function MobileAuth() {
  useEffect(() => {
    // Automatically trigger Google sign in when this page loads
    signIn("google", { callbackUrl: "/mobile-auth/success" });
  }, []);

  return (
    <div style={{ padding: 50, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Membuka Google Login...</h2>
      <p>Mohon tunggu sebentar.</p>
    </div>
  );
}
