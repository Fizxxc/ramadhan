export default function LandingPage() {
  return (
    <main className="min-h-dvh bg-white px-5 pt-12">
      <div className="mx-auto max-w-[430px]">
        <div className="inline-flex items-center gap-2 rounded-2xl border border-border bg-surface px-3 py-2">
          <span className="text-xs font-semibold" style={{ color: "rgb(var(--green))" }}>
            Ramadhan Companion
          </span>
          <span className="text-xs text-muted">Mobile-only</span>
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-text">
          Teman ibadah Ramadhan Anda
        </h1>
        <p className="mt-2 text-sm text-muted">
          Tilawah, hafalan, tracker ibadah, dan refleksi harian — dalam satu aplikasi yang nyaman di ponsel.
        </p>

        <div className="mt-8 space-y-3">
          <a
            href="/auth/login"
            className="block w-full rounded-2xl px-4 py-3 text-center text-white font-semibold shadow-[0_10px_30px_rgba(16,185,129,0.25)] active:scale-[0.98] transition"
            style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
          >
            Masuk
          </a>
          <a
            href="/auth/register"
            className="block w-full rounded-2xl px-4 py-3 text-center font-semibold border border-border bg-white text-text active:scale-[0.98] transition"
          >
            Daftar
          </a>
        </div>

        <p className="mt-10 text-xs text-muted">
          Untuk layar besar, aplikasi akan menampilkan halaman khusus “Silakan akses via ponsel”.
        </p>
      </div>
    </main>
  );
}
