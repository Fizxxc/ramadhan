"use client";

import { AuthGate } from "@/components/auth-gate";
import React from "react";
import { useJuzDetail, useSuratDetail, useSuratList } from "@/queries/quran";
import { supabase } from "@/lib/supabase/client";
import { subscribeTable } from "@/lib/supabase/realtime";

type Tab = "juz" | "surah" | "bookmark";
type Bookmark = { surah: number; ayah: number; note?: string };

function safeNumber(v: string | null, fallback: number) {
  if (!v) return fallback;
  const n = Number(v);
  return Number.isFinite(n) ? n : fallback;
}

export default function QuranPage() {
  const [tab, setTab] = React.useState<Tab>("juz");

  // ✅ Default state aman SSR (tanpa localStorage di initializer)
  const [selectedJuz, setSelectedJuz] = React.useState<number>(1);
  const [selectedSurah, setSelectedSurah] = React.useState<number>(1);
  const [fontSize, setFontSize] = React.useState<number>(22);

  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const [last, setLast] = React.useState<{ surah: number; ayah: number } | null>(null);

  // ✅ Load localStorage hanya di client (useEffect)
  React.useEffect(() => {
    try {
      const savedJuz = safeNumber(localStorage.getItem("rc_juz"), 1);
      const savedSurah = safeNumber(localStorage.getItem("rc_surah"), 1);
      const savedFont = safeNumber(localStorage.getItem("rc_font"), 22);

      setSelectedJuz(Math.min(30, Math.max(1, savedJuz)));
      setSelectedSurah(Math.min(114, Math.max(1, savedSurah)));
      setFontSize(Math.min(34, Math.max(18, savedFont)));

      const savedLast = localStorage.getItem("rc_last_read");
      if (savedLast) {
        try {
          const parsed = JSON.parse(savedLast);
          if (parsed?.surah && parsed?.ayah) setLast({ surah: Number(parsed.surah), ayah: Number(parsed.ayah) });
        } catch {
          // abaikan
        }
      }
    } catch {
      // abaikan jika environment tidak mendukung
    }
  }, []);

  // ✅ Sync ke localStorage (client only)
  React.useEffect(() => {
    try {
      localStorage.setItem("rc_font", String(fontSize));
    } catch {}
  }, [fontSize]);

  React.useEffect(() => {
    try {
      localStorage.setItem("rc_juz", String(selectedJuz));
    } catch {}
  }, [selectedJuz]);

  React.useEffect(() => {
    try {
      localStorage.setItem("rc_surah", String(selectedSurah));
    } catch {}
  }, [selectedSurah]);

  const suratList = useSuratList();
  const juz = useJuzDetail(tab === "juz" ? selectedJuz : null);
  const surah = useSuratDetail(tab === "surah" ? selectedSurah : null);

  // ✅ Realtime quran_progress (last read + bookmarks)
  React.useEffect(() => {
    let unsub: null | (() => void) = null;

    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;

      const { data } = await supabase
        .from("quran_progress")
        .select("last_surah,last_ayah,bookmarks")
        .eq("user_id", uid)
        .maybeSingle();

      if (data?.last_surah && data?.last_ayah) setLast({ surah: data.last_surah, ayah: data.last_ayah });
      setBookmarks(Array.isArray(data?.bookmarks) ? (data!.bookmarks as any) : []);

      unsub = subscribeTable({
        channel: `rt-quran-progress-${uid}`,
        table: "quran_progress",
        filter: `user_id=eq.${uid}`,
        onChange: async () => {
          const { data: fresh } = await supabase
            .from("quran_progress")
            .select("last_surah,last_ayah,bookmarks")
            .eq("user_id", uid)
            .maybeSingle();

          if (fresh?.last_surah && fresh?.last_ayah) setLast({ surah: fresh.last_surah, ayah: fresh.last_ayah });
          setBookmarks(Array.isArray(fresh?.bookmarks) ? (fresh.bookmarks as any) : []);
        },
      });
    };

    load();
    return () => unsub?.();
  }, []);

  const saveLastRead = async (surahNo: number, ayahNo: number) => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;

    await supabase.from("quran_progress").upsert(
      { user_id: uid, last_surah: surahNo, last_ayah: ayahNo, updated_at: new Date().toISOString() },
      { onConflict: "user_id" }
    );

    setLast({ surah: surahNo, ayah: ayahNo });

    // ✅ Offline-ish cache
    try {
      localStorage.setItem("rc_last_read", JSON.stringify({ surah: surahNo, ayah: ayahNo }));
    } catch {}
  };

  const addBookmark = async (surahNo: number, ayahNo: number) => {
    const b: Bookmark = { surah: surahNo, ayah: ayahNo, note: "Tandai untuk dibaca lagi" };
    const next = [b, ...bookmarks].slice(0, 50);

    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;

    await supabase.from("quran_progress").upsert({ user_id: uid, bookmarks: next }, { onConflict: "user_id" });
    setBookmarks(next);
  };

  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text">Al-Qur’an</h1>
            <p className="text-sm text-muted">Juz 1–30 via eQuran API (cached).</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="h-10 w-10 rounded-2xl border border-border bg-white active:scale-[0.98] transition"
              onClick={() => setFontSize((s) => Math.max(18, s - 2))}
              aria-label="Perkecil font"
            >
              A-
            </button>
            <button
              className="h-10 w-10 rounded-2xl border border-border bg-white active:scale-[0.98] transition"
              onClick={() => setFontSize((s) => Math.min(34, s + 2))}
              aria-label="Perbesar font"
            >
              A+
            </button>
          </div>
        </header>

        <div className="mt-4 grid grid-cols-3 gap-2 rounded-2xl border border-border bg-surface p-1">
          {[
            { k: "juz", t: "Juz" },
            { k: "surah", t: "Surah" },
            { k: "bookmark", t: "Bookmark" },
          ].map((x) => (
            <button
              key={x.k}
              onClick={() => setTab(x.k as Tab)}
              className={[
                "rounded-2xl px-3 py-2 text-sm font-semibold transition active:scale-[0.98]",
                tab === x.k ? "bg-white text-text shadow-[0_10px_24px_rgba(15,23,42,0.08)]" : "text-muted",
              ].join(" ")}
            >
              {x.t}
            </button>
          ))}
        </div>

        <section className="mt-4 rounded-3xl border border-border bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-text">Terakhir dibaca</div>
            <div className="text-xs text-muted">{last ? `Surah ${last.surah} • Ayat ${last.ayah}` : "Belum ada"}</div>
          </div>
          <p className="mt-2 text-xs text-muted">Tip: tap ayat untuk menyimpan “terakhir dibaca” dan bookmark.</p>
        </section>

        {/* TAB JUZ */}
        {tab === "juz" ? (
          <section className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-text">Juz {selectedJuz}</div>
              <select
                value={selectedJuz}
                onChange={(e) => setSelectedJuz(Number(e.target.value))}
                className="rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none"
                aria-label="Pilih Juz"
              >
                {Array.from({ length: 30 }).map((_, i) => (
                  <option key={i + 1} value={i + 1}>
                    Juz {i + 1}
                  </option>
                ))}
              </select>
            </div>

            {juz.isLoading ? (
              <div className="mt-3 rounded-3xl border border-border bg-surface p-4 text-sm text-muted">Memuat juz...</div>
            ) : juz.isError ? (
              <div className="mt-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Gagal memuat data juz.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                {(juz.data?.verses ?? []).slice(0, 200).map((v: any, idx: number) => (
                  <div key={idx} className="rounded-3xl border border-border bg-white p-4">
                    <div className="text-xs text-muted">
                      {v.namaLatin} • {v.nomorSurah}:{v.nomorAyat}
                    </div>
                    <div
                      className="mt-2 text-right leading-[1.9]"
                      style={{
                        fontSize,
                        fontFamily: `"Noto Naskh Arabic","Amiri","Scheherazade New",serif`,
                      }}
                    >
                      {v.teksArab}
                    </div>
                    <div className="mt-2 text-xs text-muted">{v.teksIndonesia}</div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => saveLastRead(v.nomorSurah, v.nomorAyat)}
                        className="flex-1 rounded-2xl px-3 py-2 text-sm font-semibold text-white active:scale-[0.98] transition"
                        style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => addBookmark(v.nomorSurah, v.nomorAyat)}
                        className="rounded-2xl border border-border bg-white px-3 py-2 text-sm font-semibold text-text active:scale-[0.98] transition"
                      >
                        Bookmark
                      </button>
                    </div>
                  </div>
                ))}
                <div className="rounded-3xl border border-border bg-surface p-4 text-xs text-muted">
                  Catatan: untuk performa, tampilan dibatasi 200 ayat pertama (bisa ditambah pagination).
                </div>
              </div>
            )}
          </section>
        ) : null}

        {/* TAB SURAH */}
        {tab === "surah" ? (
          <section className="mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-text">Surah</div>
              <select
                value={selectedSurah}
                onChange={(e) => setSelectedSurah(Number(e.target.value))}
                className="rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none"
                aria-label="Pilih Surah"
              >
                {(suratList.data ?? []).map((s: any) => (
                  <option key={s.nomor} value={s.nomor}>
                    {s.nomor}. {s.namaLatin}
                  </option>
                ))}
              </select>
            </div>

            {surah.isLoading ? (
              <div className="mt-3 rounded-3xl border border-border bg-surface p-4 text-sm text-muted">Memuat surah...</div>
            ) : surah.isError ? (
              <div className="mt-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Gagal memuat data surah.
              </div>
            ) : (
              <div className="mt-3 space-y-2">
                <div className="rounded-3xl border border-border bg-white p-4">
                  <div className="text-sm font-semibold text-text">{surah.data?.namaLatin}</div>
                  <div className="mt-1 text-xs text-muted">
                    {surah.data?.arti} • {surah.data?.tempatTurun} • {surah.data?.jumlahAyat} ayat
                  </div>
                </div>

                {(surah.data?.ayat ?? []).slice(0, 120).map((a: any) => (
                  <div key={a.nomorAyat} className="rounded-3xl border border-border bg-white p-4">
                    <div className="text-xs text-muted">Ayat {a.nomorAyat}</div>
                    <div
                      className="mt-2 text-right leading-[1.9]"
                      style={{
                        fontSize,
                        fontFamily: `"Noto Naskh Arabic","Amiri","Scheherazade New",serif`,
                      }}
                    >
                      {a.teksArab}
                    </div>
                    <div className="mt-2 text-xs text-muted">{a.teksIndonesia}</div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => saveLastRead(selectedSurah, a.nomorAyat)}
                        className="flex-1 rounded-2xl px-3 py-2 text-sm font-semibold text-white active:scale-[0.98] transition"
                        style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
                      >
                        Simpan
                      </button>
                      <button
                        onClick={() => addBookmark(selectedSurah, a.nomorAyat)}
                        className="rounded-2xl border border-border bg-white px-3 py-2 text-sm font-semibold text-text active:scale-[0.98] transition"
                      >
                        Bookmark
                      </button>
                    </div>
                  </div>
                ))}

                <div className="rounded-3xl border border-border bg-surface p-4 text-xs text-muted">
                  Catatan: untuk performa, tampilan dibatasi 120 ayat pertama (bisa ditambah pagination).
                </div>
              </div>
            )}
          </section>
        ) : null}

        {/* TAB BOOKMARK */}
        {tab === "bookmark" ? (
          <section className="mt-4">
            <div className="text-sm font-semibold text-text">Bookmark</div>
            {bookmarks.length === 0 ? (
              <div className="mt-2 rounded-3xl border border-border bg-surface p-4 text-sm text-muted">
                Belum ada bookmark.
              </div>
            ) : (
              <ul className="mt-2 space-y-2">
                {bookmarks.map((b, i) => (
                  <li key={i} className="rounded-3xl border border-border bg-white p-4">
                    <div className="text-sm font-semibold text-text">
                      Surah {b.surah} • Ayat {b.ayah}
                    </div>
                    {b.note ? <div className="mt-1 text-xs text-muted">{b.note}</div> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        ) : null}
      </main>
    </AuthGate>
  );
}
