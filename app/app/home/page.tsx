"use client";

import { AuthGate } from "@/components/auth-gate";
import React from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { todayISODate } from "@/lib/utils/date";
import { tilawahLogSchema, type TilawahLogInput } from "@/lib/zod/tilawah";
import { memorizationLogSchema, type MemorizationLogInput } from "@/lib/zod/hafalan";
import { useCreateTilawahLog, useTilawahLogs, useTilawahRealtime } from "@/queries/tilawah";
import { useCreateMemorizationLog, useHafalanRealtime, useMemorizationLogs } from "@/queries/hafalan";
import { LocationSheet } from "@/components/prayer/location-sheet";
import { useImsakiyah, useShalatBulanan, type PrayerLocation } from "@/queries/prayer";
import { supabase } from "@/lib/supabase/client";
import { usePrayerNotifications } from "@/components/prayer/use-prayer-notifications";

type LocationKey = "rumah" | "kantor";

function num(v: string) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function nowParts() {
  const d = new Date();
  return { yyyy: d.getFullYear(), mm: d.getMonth() + 1, dd: d.getDate() };
}

export default function HomePage() {
  const date = todayISODate();
  const { yyyy, mm } = nowParts();

  // realtime hooks
  useTilawahRealtime(date);
  useHafalanRealtime(date);

  const tilawah = useTilawahLogs(date);
  const hafalan = useMemorizationLogs(date);

  const createTilawah = useCreateTilawahLog();
  const createHafalan = useCreateMemorizationLog();

  const [sheet, setSheet] = React.useState<"none" | "tilawah" | "hafalan">("none");
  const close = () => setSheet("none");

  // ---------- prefs: ramadhan day, notif, multi lokasi ----------
  const [ramadhanDay, setRamadhanDay] = React.useState<number | null>(null);
  const [notifImsak, setNotifImsak] = React.useState(true);
  const [notifMaghrib, setNotifMaghrib] = React.useState(true);

  const [activeKey, setActiveKey] = React.useState<LocationKey>("rumah");
  const [rumah, setRumah] = React.useState<PrayerLocation | null>(null);
  const [kantor, setKantor] = React.useState<PrayerLocation | null>(null);

  const activeLoc = activeKey === "rumah" ? rumah : kantor;

  React.useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;

      const { data } = await supabase.from("profiles").select("preferences").eq("id", uid).single();
      const pref = (data?.preferences ?? {}) as any;

      if (typeof pref.ramadhan_day === "number") setRamadhanDay(pref.ramadhan_day);
      setNotifImsak(pref?.notif?.imsak ?? true);
      setNotifMaghrib(pref?.notif?.maghrib ?? true);

      if (pref.active_location === "rumah" || pref.active_location === "kantor") setActiveKey(pref.active_location);

      setRumah(pref?.locations?.rumah ?? null);
      setKantor(pref?.locations?.kantor ?? null);
    };
    load();
  }, []);

  // ---------- prayer queries ----------
  const shalatMonth = useShalatBulanan(activeLoc, mm, yyyy);
  const imsak = useImsakiyah(activeLoc);

  const shalatToday = React.useMemo(() => {
    const list = shalatMonth.data?.jadwal ?? [];
    return list.find((x) => x.tanggal_lengkap === date) ?? null;
  }, [shalatMonth.data?.jadwal, date]);

  const imsakToday = React.useMemo(() => {
    if (!imsak.data || !ramadhanDay) return null;
    return imsak.data.imsakiyah?.[ramadhanDay - 1] ?? null;
  }, [imsak.data, ramadhanDay]);

  // ---------- schedule notifications (best-effort) ----------
  usePrayerNotifications({
    enabled: !!activeLoc && !!ramadhanDay,
    titlePrefix: activeKey === "rumah" ? "Rumah" : "Kantor",
    imsak: imsakToday?.imsak ?? null,
    maghrib: imsakToday?.maghrib ?? shalatToday?.maghrib ?? null,
    notifyImsak: notifImsak,
    notifyMaghrib: notifMaghrib,
  });

  // ---------- location sheet ----------
  const [openLoc, setOpenLoc] = React.useState(false);

  const onChangeLocation = (key: LocationKey, next: PrayerLocation) => {
    if (key === "rumah") setRumah(next);
    if (key === "kantor") setKantor(next);

    // best-effort save to profile.preferences (merge)
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;

      const { data } = await supabase.from("profiles").select("preferences").eq("id", uid).single();
      const prev = (data?.preferences ?? {}) as any;

      const nextPref = {
        ...prev,
        ramadhan_day: typeof prev.ramadhan_day === "number" ? prev.ramadhan_day : ramadhanDay ?? 1,
        active_location: prev.active_location ?? activeKey,
        notif: { ...(prev.notif ?? {}), imsak: prev?.notif?.imsak ?? notifImsak, maghrib: prev?.notif?.maghrib ?? notifMaghrib },
        locations: { ...(prev.locations ?? {}), [key]: next },
      };

      await supabase.from("profiles").update({ preferences: nextPref }).eq("id", uid);
    })();
  };

  const [msg, setMsg] = React.useState<{ kind: "ok" | "err"; text: string } | null>(null);

  // ---------- forms ----------
  const [tilForm, setTilForm] = React.useState<TilawahLogInput>({
    date,
    surah: 1,
    ayah_from: 1,
    ayah_to: 1,
    pages_count: 0,
    notes: "",
  });

  const [hafForm, setHafForm] = React.useState<MemorizationLogInput>({
    date,
    surah: 1,
    ayah_from: 1,
    ayah_to: 1,
    type: "baru",
    notes: "",
  });

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

  const locLabel = activeKey === "rumah" ? "Rumah" : "Kantor";

  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <header className="flex items-start justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text">Beranda</h1>
            <p className="text-sm text-muted">Aktivitas hari ini (realtime).</p>
          </div>

          <button
            onClick={() => setOpenLoc(true)}
            className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2 active:scale-[0.98] transition"
            aria-label="Atur lokasi"
          >
            <span className="text-xs font-semibold" style={{ color: "rgb(var(--gold))" }}>
              {locLabel}
            </span>
            <span className="text-xs text-muted">{activeLoc ? activeLoc.kabkota : "Atur"}</span>
          </button>
        </header>

        {msg ? (
          <div
            className={[
              "mt-4 rounded-2xl border px-4 py-3 text-sm",
              msg.kind === "ok" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-red-200 bg-red-50 text-red-700",
            ].join(" ")}
          >
            {msg.text}
          </div>
        ) : null}

        {/* Jadwal Sholat + Imsakiyah */}
        <section className="mt-4 rounded-3xl border border-border bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold text-text">Jadwal Hari Ini</div>
              <div className="mt-1 text-xs text-muted">
                {activeLoc ? `${locLabel} • ${activeLoc.kabkota}, ${activeLoc.provinsi}` : "Atur lokasi Rumah/Kantor dulu."}
              </div>
            </div>
            <div className="text-xs text-muted">{date}</div>
          </div>

          {!activeLoc ? (
            <div className="mt-3 rounded-2xl border border-border bg-surface p-3 text-sm text-muted">
              Ketuk chip <b>{locLabel}</b> untuk mengatur lokasi.
            </div>
          ) : shalatMonth.isLoading ? (
            <div className="mt-3 rounded-2xl border border-border bg-surface p-3 text-sm text-muted">
              Memuat jadwal sholat...
            </div>
          ) : shalatMonth.isError || !shalatToday ? (
            <div className="mt-3 rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Jadwal sholat belum tersedia. Coba ganti lokasi.
            </div>
          ) : (
            <div className="mt-3 grid grid-cols-4 gap-2">
              {[
                { k: "Subuh", v: shalatToday.subuh },
                { k: "Dzuhur", v: shalatToday.dzuhur },
                { k: "Ashar", v: shalatToday.ashar },
                { k: "Maghrib", v: shalatToday.maghrib },
                { k: "Isya", v: shalatToday.isya },
                { k: "Imsak", v: shalatToday.imsak },
                { k: "Terbit", v: shalatToday.terbit },
                { k: "Dhuha", v: shalatToday.dhuha },
              ].map((x) => (
                <div key={x.k} className="rounded-2xl border border-border bg-white p-3">
                  <div className="text-[11px] text-muted">{x.k}</div>
                  <div className="mt-1 text-sm font-semibold text-text">{x.v}</div>
                </div>
              ))}
            </div>
          )}

          {/* Iftar mode (ungu senja) */}
          <div
            className="mt-4 rounded-3xl border border-border p-4"
            style={{ background: "linear-gradient(135deg, rgb(139 92 246 / 0.12), rgb(139 92 246 / 0.03))" }}
          >
            <div className="text-sm font-semibold" style={{ color: "rgb(var(--purple))" }}>
              Iftar mode
            </div>
            <div className="mt-1 text-xs text-muted">
              {imsakToday?.maghrib
                ? `Perkiraan Maghrib (Imsakiyah): ${imsakToday.maghrib}`
                : shalatToday?.maghrib
                ? `Perkiraan Maghrib: ${shalatToday.maghrib}`
                : "Atur lokasi & hari Ramadhan untuk melihat Maghrib."}
            </div>
          </div>

          {/* Imsakiyah akurat berdasarkan hari ke-Ramadhan */}
          <div className="mt-4 rounded-3xl border border-border bg-surface p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-text">
                Imsakiyah • Hari ke-{ramadhanDay ?? "—"} Ramadhan
              </div>
              <div className="text-xs text-muted">API eQuran</div>
            </div>

            {!activeLoc || !ramadhanDay ? (
              <div className="mt-2 text-xs text-muted">Atur lokasi dan hari Ramadhan di Profil/Onboarding.</div>
            ) : imsak.isLoading ? (
              <div className="mt-2 text-xs text-muted">Memuat imsakiyah...</div>
            ) : imsak.isError || !imsakToday ? (
              <div className="mt-2 text-xs text-muted">
                Data imsakiyah tidak tersedia (biasanya hanya aktif saat Ramadhan).
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-3 gap-2">
                {[
                  { k: "Imsak", v: imsakToday.imsak },
                  { k: "Subuh", v: imsakToday.subuh },
                  { k: "Maghrib", v: imsakToday.maghrib },
                ].map((x) => (
                  <div key={x.k} className="rounded-2xl border border-border bg-white p-3">
                    <div className="text-[11px] text-muted">{x.k}</div>
                    <div className="mt-1 text-sm font-semibold text-text">{x.v}</div>
                  </div>
                ))}
                <div className="col-span-3 mt-2 text-xs text-muted">
                  Notifikasi mengikuti waktu Imsakiyah (lebih akurat untuk Ramadhan).
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Ringkas Hari Ini */}
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
        </section>

        {/* Quick actions */}
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

        {/* Log terbaru */}
        <section className="mt-5">
          <div className="text-sm font-semibold text-text">Log Terbaru</div>

          <div className="mt-2 space-y-2">
            {tilawah.isLoading || hafalan.isLoading ? (
              <div className="rounded-3xl border border-border bg-surface p-4 text-sm text-muted">Memuat...</div>
            ) : tilCount + hafCount === 0 ? (
              <div className="rounded-3xl border border-border bg-surface p-4 text-sm text-muted">
                Belum ada aktivitas. Tambah tilawah atau hafalan untuk memulai.
              </div>
            ) : (
              <>
                {tilawah.data?.slice(0, 3).map((t: any) => (
                  <div key={t.id} className="rounded-3xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-text">Tilawah</div>
                    <div className="mt-1 text-xs text-muted">
                      Surah {t.surah} • Ayat {t.ayah_from}-{t.ayah_to}
                    </div>
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

        {/* Bottom sheet: tilawah */}
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

        {/* Bottom sheet: hafalan */}
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

        {/* Location sheet */}
        <LocationSheet
          open={openLoc}
          onClose={() => setOpenLoc(false)}
          activeKey={activeKey}
          setActiveKey={setActiveKey}
          rumah={rumah}
          kantor={kantor}
          onChange={onChangeLocation}
        />
      </main>
    </AuthGate>
  );
}
