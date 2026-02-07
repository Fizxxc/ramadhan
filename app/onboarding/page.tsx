"use client";

import React from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

type Step = 1 | 2 | 3;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = React.useState<Step>(1);
  const [name, setName] = React.useState("");
  const [tilawahTarget, setTilawahTarget] = React.useState(1);
  const [hafalanTarget, setHafalanTarget] = React.useState(1);
  const [notif, setNotif] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const next = () => setStep((s) => (s === 1 ? 2 : s === 2 ? 3 : 3));
  const back = () => setStep((s) => (s === 3 ? 2 : 1));

  const finish = async () => {
    setError("");
    if (!name.trim()) return setError("Nama panggilan wajib diisi");

    setLoading(true);
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) {
      setLoading(false);
      return setError("Sesi tidak ditemukan. Silakan login ulang.");
    }

    const { error: err } = await supabase.from("profiles").upsert({
      id: uid,
      name: name.trim(),
      preferences: { target_tilawah: tilawahTarget, target_hafalan: hafalanTarget, notif_enabled: notif },
    });

    await supabase.from("quran_progress").upsert({ user_id: uid }, { onConflict: "user_id" });

    setLoading(false);
    if (err) return setError(err.message);
    router.replace("/app/home");
  };

  return (
    <main className="min-h-dvh bg-white px-5 pt-10">
      <div className="mx-auto max-w-[430px]">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold text-text">Onboarding</div>
          <div className="text-xs text-muted">Langkah {step}/3</div>
        </div>

        {error ? <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        {step === 1 ? (
          <section className="mt-6">
            <h1 className="text-xl font-semibold text-text">Kenalan dulu</h1>
            <p className="mt-1 text-sm text-muted">Isi nama panggilan agar terasa lebih personal.</p>

            <label className="mt-5 block">
              <span className="text-sm font-medium text-text">Nama panggilan</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-2 w-full rounded-2xl border border-border bg-white px-4 py-3 text-text outline-none focus:ring-2 focus:ring-emerald-200"
                placeholder="Contoh: Fulan"
              />
            </label>

            <button
              onClick={next}
              className="mt-6 w-full rounded-2xl px-4 py-3 text-white font-semibold active:scale-[0.98] transition"
              style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
            >
              Lanjut
            </button>
          </section>
        ) : null}

        {step === 2 ? (
          <section className="mt-6">
            <h1 className="text-xl font-semibold text-text">Target Ramadhan</h1>
            <p className="mt-1 text-sm text-muted">Target kecil tapi konsisten itu baik.</p>

            <div className="mt-5 rounded-3xl border border-border bg-white p-4">
              <div className="text-sm font-semibold text-text">Target tilawah</div>
              <p className="mt-1 text-xs text-muted">Halaman/Juz (angka sederhana untuk MVP).</p>
              <input
                type="number"
                min={1}
                value={tilawahTarget}
                onChange={(e) => setTilawahTarget(Math.max(1, Number(e.target.value)))}
                className="mt-3 w-full rounded-2xl border border-border bg-white px-4 py-3 text-text outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="mt-3 rounded-3xl border border-border bg-white p-4">
              <div className="text-sm font-semibold text-text">Target hafalan</div>
              <p className="mt-1 text-xs text-muted">Ayat per hari.</p>
              <input
                type="number"
                min={1}
                value={hafalanTarget}
                onChange={(e) => setHafalanTarget(Math.max(1, Number(e.target.value)))}
                className="mt-3 w-full rounded-2xl border border-border bg-white px-4 py-3 text-text outline-none focus:ring-2 focus:ring-emerald-200"
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-2">
              <button onClick={back} className="rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text active:scale-[0.98] transition">
                Kembali
              </button>
              <button onClick={next} className="rounded-2xl px-4 py-3 text-sm font-semibold text-white active:scale-[0.98] transition"
                style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}>
                Lanjut
              </button>
            </div>
          </section>
        ) : null}

        {step === 3 ? (
          <section className="mt-6">
            <h1 className="text-xl font-semibold text-text">Preferensi</h1>
            <p className="mt-1 text-sm text-muted">Atur pengalaman yang Anda inginkan.</p>

            <div className="mt-5 rounded-3xl border border-border bg-white p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold text-text">Notifikasi</div>
                  <div className="text-xs text-muted">Pengingat harian (simbolik untuk MVP).</div>
                </div>
                <button onClick={() => setNotif((s) => !s)} className="h-10 w-16 rounded-full border border-border bg-white px-1 active:scale-[0.98] transition" aria-label="Toggle notifikasi">
                  <div className="h-8 w-8 rounded-full transition"
                    style={{ transform: notif ? "translateX(24px)" : "translateX(0px)", background: notif ? "rgb(var(--green))" : "rgb(var(--border))" }} />
                </button>
              </div>
            </div>

            <button onClick={finish} disabled={loading} className="mt-6 w-full rounded-2xl px-4 py-3 text-white font-semibold disabled:opacity-60 active:scale-[0.98] transition"
              style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}>
              {loading ? "Menyimpan..." : "Mulai"}
            </button>

            <button onClick={back} className="mt-3 w-full rounded-2xl border border-border bg-white px-4 py-3 text-sm font-semibold text-text active:scale-[0.98] transition">
              Kembali
            </button>
          </section>
        ) : null}
      </div>
    </main>
  );
}
