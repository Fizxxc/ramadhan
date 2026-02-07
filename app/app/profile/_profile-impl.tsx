"use client";

import { AuthGate } from "@/components/auth-gate";
import { supabase } from "@/lib/supabase/client";
import React from "react";
import { useRouter } from "next/navigation";

type LocationKey = "rumah" | "kantor";
type PrayerLocation = { provinsi: string; kabkota: string };

export default function ProfilePage() {
  const router = useRouter();
  const [loading, setLoading] = React.useState(false);

  const [ramadhanDay, setRamadhanDay] = React.useState<number>(1);
  const [activeKey, setActiveKey] = React.useState<LocationKey>("rumah");
  const [notifImsak, setNotifImsak] = React.useState(true);
  const [notifMaghrib, setNotifMaghrib] = React.useState(true);

  const [rumah, setRumah] = React.useState<PrayerLocation | null>(null);
  const [kantor, setKantor] = React.useState<PrayerLocation | null>(null);

  const [msg, setMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;

      const { data } = await supabase.from("profiles").select("preferences").eq("id", uid).single();
      const pref = (data?.preferences ?? {}) as any;

      if (typeof pref.ramadhan_day === "number") setRamadhanDay(pref.ramadhan_day);
      if (pref.active_location === "rumah" || pref.active_location === "kantor") setActiveKey(pref.active_location);

      setNotifImsak(pref?.notif?.imsak ?? true);
      setNotifMaghrib(pref?.notif?.maghrib ?? true);

      setRumah(pref?.locations?.rumah ?? null);
      setKantor(pref?.locations?.kantor ?? null);
    };
    load();
  }, []);

  const savePrefs = async () => {
    setMsg(null);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;

    const { data: p } = await supabase.from("profiles").select("preferences").eq("id", uid).single();
    const prev = (p?.preferences ?? {}) as any;

    const next = {
      ...prev,
      ramadhan_day: ramadhanDay,
      active_location: activeKey,
      notif: { ...(prev.notif ?? {}), imsak: notifImsak, maghrib: notifMaghrib },
      locations: { ...(prev.locations ?? {}), rumah, kantor },
    };

    const { error } = await supabase.from("profiles").update({ preferences: next }).eq("id", uid);
    if (error) {
      setMsg("Gagal menyimpan: " + error.message);
      return;
    }
    setMsg("Tersimpan. ✅");
  };

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
        <p className="mt-1 text-sm text-muted">Pengaturan Ramadhan & notifikasi.</p>

        {msg ? (
          <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
            {msg}
          </div>
        ) : null}

        <div className="mt-4 rounded-3xl border border-border bg-white p-4">
          <div className="text-sm font-semibold text-text">Ramadhan</div>

          <label className="mt-3 block">
            <span className="text-xs text-muted">Hari ke-Ramadhan</span>
            <select
              value={ramadhanDay}
              onChange={(e) => setRamadhanDay(Number(e.target.value))}
              className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm"
            >
              {Array.from({ length: 30 }).map((_, i) => (
                <option key={i + 1} value={i + 1}>
                  Hari ke-{i + 1}
                </option>
              ))}
            </select>
          </label>

          <div className="mt-4 rounded-2xl border border-border bg-surface p-3">
            <div className="text-xs font-semibold text-text">Lokasi aktif untuk Beranda</div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => setActiveKey("rumah")}
                className={[
                  "rounded-2xl border px-3 py-2 text-sm font-semibold active:scale-[0.98] transition",
                  activeKey === "rumah" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-white text-text",
                ].join(" ")}
              >
                Rumah
              </button>
              <button
                onClick={() => setActiveKey("kantor")}
                className={[
                  "rounded-2xl border px-3 py-2 text-sm font-semibold active:scale-[0.98] transition",
                  activeKey === "kantor" ? "border-emerald-200 bg-emerald-50 text-emerald-800" : "border-border bg-white text-text",
                ].join(" ")}
              >
                Kantor
              </button>
            </div>
            <div className="mt-2 text-xs text-muted">
              Rumah: {rumah ? `${rumah.kabkota}` : "Belum diatur"} • Kantor: {kantor ? `${kantor.kabkota}` : "Belum diatur"}
            </div>
          </div>

          <div className="mt-4">
            <div className="text-sm font-semibold text-text">Notifikasi</div>
            <div className="mt-2 space-y-2">
              <button
                onClick={() => setNotifImsak((s) => !s)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-left flex items-center justify-between active:scale-[0.99] transition"
              >
                <span className="text-sm font-medium text-text">Imsak</span>
                <span className="text-xs" style={{ color: notifImsak ? "rgb(var(--green))" : "rgb(var(--muted))" }}>
                  {notifImsak ? "Aktif" : "Mati"}
                </span>
              </button>

              <button
                onClick={() => setNotifMaghrib((s) => !s)}
                className="w-full rounded-2xl border border-border bg-white px-4 py-3 text-left flex items-center justify-between active:scale-[0.99] transition"
              >
                <span className="text-sm font-medium text-text">Maghrib (Buka)</span>
                <span className="text-xs" style={{ color: notifMaghrib ? "rgb(var(--green))" : "rgb(var(--muted))" }}>
                  {notifMaghrib ? "Aktif" : "Mati"}
                </span>
              </button>

              <div className="text-xs text-muted">
                Catatan: notifikasi browser bersifat best-effort (paling stabil saat aplikasi terbuka).
              </div>
            </div>
          </div>

          <button
            onClick={savePrefs}
            className="mt-4 w-full rounded-2xl px-4 py-3 text-white font-semibold active:scale-[0.98] transition"
            style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
          >
            Simpan Pengaturan
          </button>
        </div>

        <div className="mt-4 rounded-3xl border border-border bg-white p-4">
          <div className="text-sm font-semibold text-text">Akun</div>

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
