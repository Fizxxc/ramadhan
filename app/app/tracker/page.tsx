"use client";

import { AuthGate } from "@/components/auth-gate";
import React from "react";

const defaultItems = [
  { key: "shalat_wajib", label: "Shalat wajib" },
  { key: "tarawih", label: "Tarawih" },
  { key: "dhuha", label: "Dhuha" },
  { key: "sedekah", label: "Sedekah" },
  { key: "puasa", label: "Puasa" },
  { key: "qiyamul_lail", label: "Qiyamul lail" },
];

export default function TrackerPage() {
  const [items, setItems] = React.useState<Record<string, boolean>>({});

  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <h1 className="text-lg font-semibold text-text">Tracker Ibadah</h1>
        <p className="mt-1 text-sm text-muted">Checklist dan refleksi harian.</p>

        <div className="mt-4 rounded-3xl border border-border bg-white p-4">
          <div className="text-sm font-semibold text-text">Checklist</div>
          <div className="mt-3 space-y-2">
            {defaultItems.map((it) => (
              <button
                key={it.key}
                onClick={() => setItems((s) => ({ ...s, [it.key]: !s[it.key] }))}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-left active:scale-[0.99] transition flex items-center justify-between"
              >
                <span className="text-sm font-medium text-text">{it.label}</span>
                <span className="text-xs" style={{ color: items[it.key] ? "rgb(var(--green))" : "rgb(var(--muted))" }}>
                  {items[it.key] ? "Selesai" : "Belum"}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-border bg-white p-4">
          <div className="text-sm font-semibold text-text">Refleksi</div>
          <textarea
            className="mt-3 w-full min-h-[120px] rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Tulis refleksi singkat hari ini..."
          />
          <button
            className="mt-3 w-full rounded-2xl px-4 py-3 text-white font-semibold active:scale-[0.98] transition"
            style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
          >
            Simpan Hari Ini
          </button>
        </div>
      </main>
    </AuthGate>
  );
}
