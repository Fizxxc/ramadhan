"use client";

import React from "react";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPage() {
  const [email, setEmail] = React.useState("");
  const [error, setError] = React.useState("");
  const [info, setInfo] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    if (!email.includes("@")) return setError("Email tidak valid");

    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/login`,
    });
    setLoading(false);

    if (err) return setError(err.message);
    setInfo("Tautan reset sudah dikirim. Silakan cek email Anda.");
  };

  return (
    <main className="min-h-dvh bg-white px-5 pt-10">
      <div className="mx-auto max-w-[430px]">
        <h1 className="text-xl font-semibold text-text">Lupa Kata Sandi</h1>
        <p className="mt-1 text-sm text-muted">Kami akan kirim tautan reset ke email Anda.</p>

        {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {info ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{info}</div> : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-text">Email</span>
            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              type="email"
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-text outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="nama@email.com"
              autoComplete="email"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-2xl px-4 py-3 text-white font-semibold shadow-[0_10px_30px_rgba(16,185,129,0.25)] disabled:opacity-60 active:scale-[0.98] transition"
            style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
          >
            {loading ? "Mengirim..." : "Kirim Tautan Reset"}
          </button>

          <a className="block text-center text-sm text-muted underline underline-offset-4" href="/auth/login">
            Kembali ke Masuk
          </a>
        </form>
      </div>
    </main>
  );
}
