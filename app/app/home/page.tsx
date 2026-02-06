"use client";

import { AuthGate } from "@/components/auth-gate";
import React from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";

export default function HomePage() {
  const [open, setOpen] = React.useState(false);

  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text">Beranda</h1>
            <p className="text-sm text-muted">Ringkas ibadah hari ini.</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2">
            <span className="text-xs font-semibold" style={{ color: "rgb(var(--gold))" }}>
              Streak
            </span>
            <span className="text-xs text-muted">0 hari</span>
          </div>
        </header>

        <section className="mt-4 rounded-3xl border border-border bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-text">Hari ke- Ramadhan</div>
          <div className="mt-2 text-xs text-muted">Atur secara manual pada iterasi berikutnya.</div>

          <div className="mt-3 rounded-3xl border border-border bg-white p-4"
               style={{ background: "linear-gradient(135deg, rgb(139 92 246 / 0.10), rgb(139 92 246 / 0.02))" }}>
            <div className="text-sm font-semibold" style={{ color: "rgb(var(--purple))" }}>
              Iftar mode
            </div>
            <div className="mt-1 text-xs text-muted">Waktu berbuka: belum diatur</div>
          </div>
        </section>

        <section className="mt-4 grid grid-cols-2 gap-3">
          {["Tilawah","Hafalan","Dzikir","Shalat"].map((k) => (
            <div key={k} className="rounded-3xl border border-border bg-white p-4">
              <div className="text-sm font-semibold text-text">{k}</div>
              <div className="mt-1 text-xs text-muted">0%</div>
              <div className="mt-3 h-2 rounded-full bg-surface overflow-hidden">
                <div className="h-full w-[10%] rounded-full" style={{ background: "rgb(var(--green) / 0.6)" }} />
              </div>
            </div>
          ))}
        </section>

        <section className="mt-4 space-y-3">
          <button
            onClick={() => setOpen(true)}
            className="w-full rounded-2xl px-4 py-3 text-white font-semibold shadow-[0_10px_30px_rgba(16,185,129,0.25)] active:scale-[0.98] transition"
            style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
          >
            Mulai
          </button>
          <div className="grid grid-cols-3 gap-2">
            {["Tambah Tilawah","Tambah Hafalan","Catat Refleksi"].map((t) => (
              <button key={t} className="rounded-2xl border border-border bg-white px-3 py-3 text-xs font-semibold text-text active:scale-[0.98] transition">
                {t}
              </button>
            ))}
          </div>
        </section>

        <BottomSheet open={open} title="Aksi Cepat" onClose={() => setOpen(false)}>
          <div className="space-y-2">
            <button className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text active:scale-[0.98] transition">
              Tambah Tilawah
            </button>
            <button className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text active:scale-[0.98] transition">
              Tambah Hafalan
            </button>
            <button className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text active:scale-[0.98] transition">
              Catat Refleksi
            </button>
          </div>
        </BottomSheet>
      </main>
    </AuthGate>
  );
}
