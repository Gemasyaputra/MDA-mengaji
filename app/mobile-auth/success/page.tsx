"use client";

import { useEffect } from "react";

export default function MobileAuthSuccess() {
  useEffect(() => {
    // Get the returnUrl from current page's query params
    const params = new URLSearchParams(window.location.search);
    const returnUrl = params.get('returnUrl') || 'mdamengaji://login';

    // Redirect to the API route that does a proper HTTP 302 redirect
    // This 302 redirect is what openAuthSessionAsync can detect!
    window.location.replace(
      `/api/mobile/auth/complete?returnUrl=${encodeURIComponent(returnUrl)}`
    );
  }, []);

  return (
    <div style={{ padding: 50, textAlign: "center", fontFamily: "sans-serif" }}>
      <h2>Login Berhasil!</h2>
      <p>Mengarahkan kembali ke aplikasi...</p>
    </div>
  );
}
