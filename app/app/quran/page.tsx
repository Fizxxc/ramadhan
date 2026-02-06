"use client";

import React from "react";
import { supabase } from "@/lib/supabase/client";
import { AuthGate } from "@/components/auth-gate";

type Bookmark = { surah: number; ayah: number; note?: string };

export default function QuranPage() {
  const [fontSize, setFontSize] = React.useState(22);
  const [last, setLast] = React.useState<{ surah: number; ayah: number } | null>(null);
  const [bookmarks, setBookmarks] = React.useState<Bookmark[]>([]);
  const arabicSample = "بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

  React.useEffect(() => {
    const load = async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;

      const { data } = await supabase
        .from("quran_progress")
        .select("last_surah,last_ayah,bookmarks")
        .eq("user_id", uid)
        .single();

      if (data) {
        setLast(data.last_surah && data.last_ayah ? { surah: data.last_surah, ayah: data.last_ayah } : null);
        setBookmarks(Array.isArray(data.bookmarks) ? (data.bookmarks as any) : []);
      } else {
        await supabase.from("quran_progress").insert({ user_id: uid });
      }
    };
    load();
  }, []);

  const saveLastRead = async () => {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;

    await supabase
      .from("quran_progress")
      .update({ last_surah: 1, last_ayah: 1, updated_at: new Date().toISOString() })
      .eq("user_id", uid);

    setLast({ surah: 1, ayah: 1 });
    localStorage.setItem("rc_last_read", JSON.stringify({ surah: 1, ayah: 1 }));
  };

  const addBookmark = async () => {
    const b: Bookmark = { surah: 1, ayah: 1, note: "Tandai untuk murajaah" };
    const next = [b, ...bookmarks].slice(0, 50);

    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user.id;
    if (!uid) return;

    await supabase.from("quran_progress").update({ bookmarks: next }).eq("user_id", uid);
    setBookmarks(next);
  };

  return (
    <AuthGate>
      <main className="px-5 pt-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-text">Al-Qur’an</h1>
            <p className="text-sm text-muted">Baca dengan nyaman, lanjutkan progres.</p>
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
              onClick={() => setFontSize((s) => Math.min(32, s + 2))}
              aria-label="Perbesar font"
            >
              A+
            </button>
          </div>
        </header>

        <section className="mt-4 rounded-3xl border border-border bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-text">Terakhir dibaca</div>
            <div className="text-xs text-muted">{last ? `Surah ${last.surah} • Ayat ${last.ayah}` : "Belum ada"}</div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={saveLastRead}
              className="flex-1 rounded-2xl px-4 py-3 text-white font-semibold active:scale-[0.98] transition"
              style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
            >
              Simpan Terakhir Dibaca
            </button>
            <button
              onClick={addBookmark}
              className="rounded-2xl px-4 py-3 border border-border bg-white text-text font-semibold active:scale-[0.98] transition"
            >
              Bookmark
            </button>
          </div>
        </section>

        <section className="mt-4 rounded-3xl border border-border bg-white p-5">
          <div
            className="text-right leading-[1.9]"
            style={{
              fontSize,
              fontFamily: `"Noto Naskh Arabic","Amiri","Scheherazade New",serif`,
            }}
            aria-label="Teks Al-Qur’an"
          >
            {arabicSample}
          </div>

          <p className="mt-4 text-sm text-muted">
            Catatan: Ini kerangka reader. Dataset ayat bisa ditambahkan pada iterasi berikutnya.
          </p>
        </section>

        <section className="mt-4">
          <div className="text-sm font-semibold text-text">Bookmark</div>
          {bookmarks.length === 0 ? (
            <div className="mt-2 rounded-3xl border border-border bg-surface p-4 text-sm text-muted">
              Belum ada bookmark. Tandai ayat untuk dibaca kembali.
            </div>
          ) : (
            <ul className="mt-2 space-y-2">
              {bookmarks.map((b, i) => (
                <li key={i} className="rounded-3xl border border-border bg-white p-4">
                  <div className="text-sm font-medium text-text">
                    Surah {b.surah} • Ayat {b.ayah}
                  </div>
                  {b.note ? <div className="text-xs text-muted mt-1">{b.note}</div> : null}
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </AuthGate>
  );
}
