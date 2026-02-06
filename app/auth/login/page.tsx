"use client";

import React from "react";
import { supabase } from "@/lib/supabase/client";
import { loginSchema } from "@/lib/zod/auth";
import { z } from "zod";
import { useRouter } from "next/navigation";

type Form = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = React.useState<Form>({ email: "", password: "" });
  const [error, setError] = React.useState<string>("");
  const [loading, setLoading] = React.useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const parsed = loginSchema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Input tidak valid");
      return;
    }

    setLoading(true);
    const { error: err } = await supabase.auth.signInWithPassword(parsed.data);
    setLoading(false);

    if (err) return setError(err.message);
    router.replace("/app/home");
  };

  return (
    <main className="min-h-dvh bg-white px-5 pt-10">
      <div className="mx-auto max-w-[430px]">
        <h1 className="text-xl font-semibold text-text">Masuk</h1>
        <p className="mt-1 text-sm text-muted">Lanjutkan perjalanan Ramadhan Anda.</p>

        {error ? (
          <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

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
              placeholder="••••••••"
              autoComplete="current-password"
            />
          </label>

          <button
            disabled={loading}
            className="w-full rounded-2xl px-4 py-3 text-white font-semibold shadow-[0_10px_30px_rgba(16,185,129,0.25)] disabled:opacity-60 active:scale-[0.98] transition"
            style={{
              background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))",
            }}
          >
            {loading ? "Masuk..." : "Masuk"}
          </button>

          <div className="flex justify-between text-sm">
            <a className="text-muted underline underline-offset-4" href="/auth/forgot">
              Lupa kata sandi?
            </a>
            <a className="text-text font-medium underline underline-offset-4" href="/auth/register">
              Daftar
            </a>
          </div>

          <a className="block text-center text-xs text-muted underline underline-offset-4" href="/">
            Kembali
          </a>
        </form>
      </div>
    </main>
  );
}
