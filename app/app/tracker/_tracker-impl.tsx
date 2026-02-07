"use client";

import { AuthGate } from "@/components/auth-gate";
import React from "react";
import { todayISODate } from "@/lib/utils/date";
import { useTrackerRealtime, useUpsertWorshipChecklist, useWorshipChecklist } from "@/queries/tracker";

const defaultItems = [
  { key: "shalat_wajib", label: "Shalat wajib" },
  { key: "tarawih", label: "Tarawih" },
  { key: "dhuha", label: "Dhuha" },
  { key: "sedekah", label: "Sedekah" },
  { key: "puasa", label: "Puasa" },
  { key: "qiyamul_lail", label: "Qiyamul lail" },
];

export default function TrackerPage() {
  const date = todayISODate();
  useTrackerRealtime(date);

  const q = useWorshipChecklist(date);
  const upsert = useUpsertWorshipChecklist();

  const [items, setItems] = React.useState<Record<string, boolean>>({});
  const [reflection, setReflection] = React.useState("");
  const [mood, setMood] = React.useState<number | null>(null);
  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  React.useEffect(() => {
    if (q.data) {
      setItems((q.data.items as any) ?? {});
      setReflection(q.data.reflection ?? "");
      setMood(q.data.mood ?? null);
    }
  }, [q.data]);

  const save = async () => {
    setMsg(null);
    try {
      await upsert.mutateAsync({ date, items, reflection, mood });
      setMsg({ kind: "ok", text: "Tracker tersimpan." });
    } catch (e: any) {
      setMsg({ kind: "err", text: e?.message ?? "Gagal menyimpan." });
    }
  };

  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <h1 className="text-lg font-semibold text-text">Tracker Ibadah</h1>
        <p className="mt-1 text-sm text-muted">Checklist dan refleksi harian (realtime).</p>

        {msg ? (
          <div className={[
            "mt-4 rounded-2xl border px-4 py-3 text-sm",
            msg.kind === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700"
          ].join(" ")}>
            {msg.text}
          </div>
        ) : null}

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
          <div className="text-sm font-semibold text-text">Mood</div>
          <div className="mt-3 grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((m) => (
              <button
                key={m}
                onClick={() => setMood(m)}
                className={[
                  "rounded-2xl border px-3 py-3 text-sm font-semibold active:scale-[0.98] transition",
                  mood === m ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-white text-text"
                ].join(" ")}
                aria-label={`Mood ${m}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 rounded-3xl border border-border bg-white p-4">
          <div className="text-sm font-semibold text-text">Refleksi</div>
          <textarea
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            className="mt-3 w-full min-h-[120px] rounded-2xl border border-border bg-white px-4 py-3 text-sm text-text outline-none focus:ring-2 focus:ring-emerald-200"
            placeholder="Tulis refleksi singkat hari ini..."
          />
          <button
            onClick={save}
            disabled={upsert.isPending}
            className="mt-3 w-full rounded-2xl px-4 py-3 text-white font-semibold disabled:opacity-60 active:scale-[0.98] transition"
            style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
          >
            {upsert.isPending ? "Menyimpan..." : "Simpan Hari Ini"}
          </button>
        </div>
      </main>
    </AuthGate>
  );
}
