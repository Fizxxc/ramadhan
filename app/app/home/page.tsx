"use client";

import { AuthGate } from "@/components/auth-gate";
import React from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { todayISODate } from "@/lib/utils/date";
import { tilawahLogSchema, type TilawahLogInput } from "@/lib/zod/tilawah";
import { memorizationLogSchema, type MemorizationLogInput } from "@/lib/zod/hafalan";
import { useCreateTilawahLog, useTilawahLogs, useTilawahRealtime } from "@/queries/tilawah";
import { useCreateMemorizationLog, useHafalanRealtime, useMemorizationLogs } from "@/queries/hafalan";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function HomePage() {
  const date = todayISODate();

  // realtime hooks
  useTilawahRealtime(date);
  useHafalanRealtime(date);

  const tilawah = useTilawahLogs(date);
  const hafalan = useMemorizationLogs(date);

  const createTilawah = useCreateTilawahLog();
  const createHafalan = useCreateMemorizationLog();

  const [sheet, setSheet] = React.useState<"none" | "tilawah" | "hafalan">("none");
  const close = () => setSheet("none");

  const [tilForm, setTilForm] = React.useState<TilawahLogInput>({
    date, surah: 1, ayah_from: 1, ayah_to: 1, pages_count: 0, notes: ""
  });

  const [hafForm, setHafForm] = React.useState<MemorizationLogInput>({
    date, surah: 1, ayah_from: 1, ayah_to: 1, type: "baru", notes: ""
  });

  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const submitTilawah = async () => {
    setMsg(null);
    const parsed = tilawahLogSchema.safeParse(tilForm);
    if (!parsed.success) return setMsg({ kind: "err", text: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    try {
      await createTilawah.mutateAsync(parsed.data);
      setMsg({ kind: "ok", text: "Tilawah tersimpan." });
      close();
    } catch (e: any) {
      setMsg({ kind: "err", text: e?.message ?? "Gagal menyimpan." });
    }
  };

  const submitHafalan = async () => {
    setMsg(null);
    const parsed = memorizationLogSchema.safeParse(hafForm);
    if (!parsed.success) return setMsg({ kind: "err", text: parsed.error.issues[0]?.message ?? "Input tidak valid" });
    try {
      await createHafalan.mutateAsync(parsed.data);
      setMsg({ kind: "ok", text: "Hafalan tersimpan." });
      close();
    } catch (e: any) {
      setMsg({ kind: "err", text: e?.message ?? "Gagal menyimpan." });
    }
  };

  const tilCount = tilawah.data?.length ?? 0;
  const hafCount = hafalan.data?.length ?? 0;

  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text">Beranda</h1>
            <p className="text-sm text-muted">Aktivitas hari ini (realtime).</p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2">
            <span className="text-xs font-semibold" style={{ color: "rgb(var(--gold))" }}>Streak</span>
            <span className="text-xs text-muted">—</span>
          </div>
        </header>

        {msg ? (
          <div className={[
            "mt-4 rounded-2xl border px-4 py-3 text-sm",
            msg.kind === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
          ].join(" ")}>
            {msg.text}
          </div>
        ) : null}

        <section className="mt-4 rounded-3xl border border-border bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="text-sm font-semibold text-text">Ringkas Hari Ini</div>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <div className="rounded-3xl border border-border bg-white p-4">
              <div className="text-xs text-muted">Tilawah</div>
              <div className="mt-2 text-lg font-semibold text-text">{tilCount} log</div>
            </div>
            <div className="rounded-3xl border border-border bg-white p-4">
              <div className="text-xs text-muted">Hafalan</div>
              <div className="mt-2 text-lg font-semibold text-text">{hafCount} log</div>
            </div>
          </div>

          <div className="mt-3 rounded-3xl border border-border bg-white p-4"
               style={{ background: "linear-gradient(135deg, rgb(139 92 246 / 0.10), rgb(139 92 246 / 0.02))" }}>
            <div className="text-sm font-semibold" style={{ color: "rgb(var(--purple))" }}>Iftar mode</div>
            <div className="mt-1 text-xs text-muted">Waktu berbuka: (opsional) atur nanti</div>
          </div>
        </section>

        <section className="mt-4 space-y-3">
          <button
            onClick={() => setSheet("tilawah")}
            className="w-full rounded-2xl px-4 py-3 text-white font-semibold shadow-[0_10px_30px_rgba(16,185,129,0.25)] active:scale-[0.98] transition"
            style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
          >
            Tambah Tilawah
          </button>

          <button
            onClick={() => setSheet("hafalan")}
            className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-text font-semibold active:scale-[0.98] transition"
          >
            Tambah Hafalan
          </button>
        </section>

        <section className="mt-5">
          <div className="text-sm font-semibold text-text">Log Terbaru</div>

          <div className="mt-2 space-y-2">
            {tilawah.isLoading || hafalan.isLoading ? (
              <div className="rounded-3xl border border-border bg-surface p-4 text-sm text-muted">Memuat...</div>
            ) : (tilCount + hafCount === 0) ? (
              <div className="rounded-3xl border border-border bg-surface p-4 text-sm text-muted">
                Belum ada aktivitas. Tambah tilawah atau hafalan untuk memulai.
              </div>
            ) : (
              <>
                {tilawah.data?.slice(0, 3).map((t: any) => (
                  <div key={t.id} className="rounded-3xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-text">Tilawah</div>
                    <div className="mt-1 text-xs text-muted">Surah {t.surah} • Ayat {t.ayah_from}-{t.ayah_to}</div>
                  </div>
                ))}
                {hafalan.data?.slice(0, 3).map((h: any) => (
                  <div key={h.id} className="rounded-3xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-text">Hafalan</div>
                    <div className="mt-1 text-xs text-muted">
                      {h.type === "baru" ? "Baru" : "Murajaah"} • Surah {h.surah} • Ayat {h.ayah_from}-{h.ayah_to}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </section>

        <BottomSheet open={sheet === "tilawah"} title="Tambah Tilawah" onClose={close}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs font-semibold text-text">Surah</span>
                <input
                  value={tilForm.surah}
                  onChange={(e) => setTilForm((s) => ({ ...s, surah: num(e.target.value) }))}
                  type="number"
                  min={1}
                  max={114}
                  className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-text">Halaman (opsional)</span>
                <input
                  value={tilForm.pages_count}
                  onChange={(e) => setTilForm((s) => ({ ...s, pages_count: num(e.target.value) }))}
                  type="number"
                  min={0}
                  className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs font-semibold text-text">Ayat dari</span>
                <input
                  value={tilForm.ayah_from}
                  onChange={(e) => setTilForm((s) => ({ ...s, ayah_from: num(e.target.value) }))}
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-text">Ayat sampai</span>
                <input
                  value={tilForm.ayah_to}
                  onChange={(e) => setTilForm((s) => ({ ...s, ayah_to: num(e.target.value) }))}
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-text">Catatan (opsional)</span>
              <textarea
                value={tilForm.notes ?? ""}
                onChange={(e) => setTilForm((s) => ({ ...s, notes: e.target.value }))}
                className="mt-1 w-full min-h-[90px] rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Tulis catatan singkat..."
              />
            </label>

            <button
              onClick={submitTilawah}
              disabled={createTilawah.isPending}
              className="w-full rounded-2xl px-4 py-3 text-white font-semibold disabled:opacity-60 active:scale-[0.98] transition"
              style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
            >
              {createTilawah.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </BottomSheet>

        <BottomSheet open={sheet === "hafalan"} title="Tambah Hafalan" onClose={close}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs font-semibold text-text">Surah</span>
                <input
                  value={hafForm.surah}
                  onChange={(e) => setHafForm((s) => ({ ...s, surah: num(e.target.value) }))}
                  type="number"
                  min={1}
                  max={114}
                  className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-text">Tipe</span>
                <select
                  value={hafForm.type}
                  onChange={(e) => setHafForm((s) => ({ ...s, type: e.target.value as any }))}
                  className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                >
                  <option value="baru">Baru</option>
                  <option value="murajaah">Murajaah</option>
                </select>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <label className="block">
                <span className="text-xs font-semibold text-text">Ayat dari</span>
                <input
                  value={hafForm.ayah_from}
                  onChange={(e) => setHafForm((s) => ({ ...s, ayah_from: num(e.target.value) }))}
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
              <label className="block">
                <span className="text-xs font-semibold text-text">Ayat sampai</span>
                <input
                  value={hafForm.ayah_to}
                  onChange={(e) => setHafForm((s) => ({ ...s, ayah_to: num(e.target.value) }))}
                  type="number"
                  min={1}
                  className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                />
              </label>
            </div>

            <label className="block">
              <span className="text-xs font-semibold text-text">Catatan (opsional)</span>
              <textarea
                value={hafForm.notes ?? ""}
                onChange={(e) => setHafForm((s) => ({ ...s, notes: e.target.value }))}
                className="mt-1 w-full min-h-[90px] rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Tulis catatan singkat..."
              />
            </label>

            <button
              onClick={submitHafalan}
              disabled={createHafalan.isPending}
              className="w-full rounded-2xl px-4 py-3 text-white font-semibold disabled:opacity-60 active:scale-[0.98] transition"
              style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
            >
              {createHafalan.isPending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </BottomSheet>
      </main>
    </AuthGate>
  );
}
