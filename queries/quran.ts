import { useQuery } from "@tanstack/react-query";

async function jget<T>(url: string): Promise<T> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal memuat data Al-Qur’an");
  return res.json();
}

export function useSuratList() {
  return useQuery({
    queryKey: ["equran", "surat"],
    queryFn: async () => (await jget<any>("/api/equran/surat")).data,
    staleTime: 1000 * 60 * 60,
  });
}

export function useSuratDetail(nomor: number | null) {
  return useQuery({
    queryKey: ["equran", "surat", nomor],
    queryFn: async () => (await jget<any>(`/api/equran/surat/${nomor}`)).data,
    enabled: !!nomor,
    staleTime: 1000 * 60 * 60,
  });
}

export function useJuzDetail(juz: number | null) {
  return useQuery({
    queryKey: ["equran", "juz", juz],
    queryFn: async () => (await jget<any>(`/api/equran/juz/${juz}`)).data,
    enabled: !!juz,
    staleTime: 1000 * 60 * 60,
  });
}
