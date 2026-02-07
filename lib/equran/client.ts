const BASE = "https://equran.id/api/v2";
export async function equranFetch(path: string) {
  const res = await fetch(`${BASE}${path}`, { next: { revalidate: 60 * 60 * 24 } });
  if (!res.ok) throw new Error(`Gagal memuat Quran (${res.status})`);
  return res.json();
}
