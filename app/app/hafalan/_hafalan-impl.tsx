"use client";

import { AuthGate } from "@/components/auth-gate";
import { todayISODate } from "@/lib/utils/date";
import { useHafalanRealtime, useMemorizationLogs } from "@/queries/hafalan";

export default function HafalanPage() {
  const date = todayISODate();
  useHafalanRealtime(date);
  const q = useMemorizationLogs(date);

  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <h1 className="text-lg font-semibold text-text">Hafalan</h1>
        <p className="mt-1 text-sm text-muted">Log hafalan hari ini (realtime).</p>

        <div className="mt-4 space-y-2">
          {q.isLoading ? (
            <div className="rounded-3xl border border-border bg-surface p-4 text-sm text-muted">Memuat...</div>
          ) : (q.data?.length ?? 0) == 0 ? (
            <div className="rounded-3xl border border-border bg-surface p-4 text-sm text-muted">
              Belum ada log hafalan. Tambahkan dari Beranda.
            </div>
          ) : (
            q.data?.map((h: any) => (
              <div key={h.id} className="rounded-3xl border border-border bg-white p-4">
                <div className="text-sm font-semibold text-text">{h.type === "baru" ? "Baru" : "Murajaah"}</div>
                <div className="mt-1 text-xs text-muted">Surah {h.surah} • Ayat {h.ayah_from}-{h.ayah_to}</div>
                {h.notes ? <div className="mt-2 text-xs text-muted">{h.notes}</div> : null}
              </div>
            ))
          )}
        </div>
      </main>
    </AuthGate>
  );
}
