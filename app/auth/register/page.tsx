"use client";

import React from "react";
import { supabase } from "@/lib/supabase/client";
import { registerSchema } from "@/lib/zod/auth";
import { z } from "zod";

type Form = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [form, setForm] = React.useState<Form>({ email: "", password: "", confirm: "" });
  const [error, setError] = React.useState<string>("");
  const [info, setInfo] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setInfo("");

    const parsed = registerSchema.safeParse(form);
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Input tidak valid");

    setLoading(true);
    const { error: err } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: { emailRedirectTo: `${window.location.origin}/auth/login` },
    });
    setLoading(false);

    if (err) return setError(err.message);
    setInfo("Akun dibuat. Silakan cek email untuk verifikasi, lalu masuk.");
  };

  return (
    <main className="min-h-dvh bg-white px-5 pt-10">
      <div className="mx-auto max-w-[430px]">
        <h1 className="text-xl font-semibold text-text">Daftar</h1>
        <p className="mt-1 text-sm text-muted">Mulai perjalanan Ramadhan Anda.</p>

        {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}
        {info ? <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">{info}</div> : null}

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-text">Email</span>
            <input
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
              type="email"
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-text outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="nama@email.com"
              autoComplete="email"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text">Kata sandi</span>
            <input
              value={form.password}
              onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
              type="password"
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-text outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
            />
          </label>

          <label className="block">
            <span className="text-sm font-medium text-text">Konfirmasi kata sandi</span>
            <input
              value={form.confirm}
              onChange={(e) => setForm((s) => ({ ...s, confirm: e.target.value }))}
              type="password"
              className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-text outline-none focus:ring-2 focus:ring-emerald-200"
              placeholder="Ulangi kata sandi"
              autoComplete="new-password"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-2xl px-4 py-3 text-white font-semibold shadow-[0_10px_30px_rgba(16,185,129,0.25)] disabled:opacity-60 active:scale-[0.98] transition"
            style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
          >
            {loading ? "Membuat akun..." : "Buat Akun"}
          </button>

          <a className="block text-center text-sm text-muted underline underline-offset-4" href="/auth/login">
            Sudah punya akun? Masuk
          </a>

          <div className="mt-2 rounded-2xl border border-border bg-surface px-4 py-3 text-xs text-muted">
            Kami akan mengirim email verifikasi. Setelah verifikasi, silakan login.
          </div>
        </form>
      </div>
    </main>
  );
}
