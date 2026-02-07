"use client";

import { AuthGate } from "@/components/auth-gate";
import { supabase } from "@/lib/supabase/client";
import React from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const logout = async () => {
    setLoading(true);
    await supabase.auth.signOut();
    setLoading(false);
    router.replace("/auth/login");
  };

  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <h1 className="text-lg font-semibold text-text">Profil</h1>
        <p className="mt-1 text-sm text-muted">Kelola akun dan preferensi.</p>

        <div className="mt-4 rounded-3xl border border-border bg-white p-4">
          <div className="text-sm font-semibold text-text">Akun</div>
          <div className="mt-2 text-xs text-muted">
            Avatar, nama panggilan, bio, target — bisa ditambah pada iterasi berikutnya.
          </div>

          <button
            onClick={logout}
            disabled={loading}
            className="mt-4 w-full rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 disabled:opacity-60 active:scale-[0.98] transition"
          >
            {loading ? "Keluar..." : "Keluar"}
          </button>

          <a className="mt-3 block text-center text-xs text-muted underline underline-offset-4" href="/admin/overview">
            Masuk Admin (jika role admin)
          </a>
        </div>
      </main>
    </AuthGate>
  );
}
