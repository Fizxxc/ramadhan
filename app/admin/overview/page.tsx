export default function AdminOverviewPage() {
  return (
    <main className="px-5 pt-6">
      <h1 className="text-lg font-semibold text-text">Admin • Overview</h1>
      <p className="mt-1 text-sm text-muted">Statistik singkat (placeholder).</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {["Total pengguna","Total log","Completion rate","Top streak"].map((k) => (
          <div key={k} className="rounded-3xl border border-border bg-white p-4">
            <div className="text-xs text-muted">{k}</div>
            <div className="mt-2 text-lg font-semibold text-text">—</div>
          </div>
        ))}
      </div>
    </main>
  );
}
