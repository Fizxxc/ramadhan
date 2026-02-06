"use client";

import { AuthGate } from "@/components/auth-gate";

export default function HafalanPage() {
  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <h1 className="text-lg font-semibold text-text">Hafalan</h1>
        <p className="mt-1 text-sm text-muted">
          Buat plan hafalan dan catat setoran/murajaah.
        </p>

        <div className="mt-4 rounded-3xl border border-border bg-white p-4">
          <div className="text-sm font-semibold text-text">Plan Aktif</div>
          <div className="mt-1 text-xs text-muted">Belum ada plan. Buat plan untuk mulai.</div>
          <button
            className="mt-3 w-full rounded-2xl px-4 py-3 text-white font-semibold active:scale-[0.98] transition"
            style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
          >
            Buat Plan
          </button>
        </div>
      </main>
    </AuthGate>
  );
}
