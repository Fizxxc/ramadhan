"use client";

import { useQuery } from "@tanstack/react-query";

type ApiResp<T> = { code: number; message: string; data: T };

export type PrayerLocation = {
  provinsi: string;
  kabkota: string;
};

export type ShalatDay = {
  tanggal: number;
  tanggal_lengkap: string; // YYYY-MM-DD
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
};

export type ShalatMonthData = {
  provinsi: string;
  kabkota: string;
  bulan: number;
  tahun: number;
  bulan_nama: string;
  jadwal: ShalatDay[];
};

export type ImsakDay = {
  tanggal: number; // 1..30
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
};

export type ImsakiyahData = {
  provinsi: string;
  kabkota: string;
  hijriah: string;
  masehi: string;
  imsakiyah: ImsakDay[];
};

async function jget<T>(url: string): Promise<ApiResp<T>> {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Gagal memuat data.");
  return res.json();
}
async function jpost<T>(url: string, body: any): Promise<ApiResp<T>> {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Gagal memuat data.");
  return res.json();
}

export function useShalatProvinsi() {
  return useQuery({
    queryKey: ["shalat_provinsi"],
    queryFn: () => jget<string[]>("/api/equran/shalat/provinsi"),
    select: (r) => r.data,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useShalatKabkota(provinsi: string | null) {
  return useQuery({
    queryKey: ["shalat_kabkota", provinsi],
    enabled: !!provinsi,
    queryFn: () => jpost<string[]>("/api/equran/shalat/kabkota", { provinsi }),
    select: (r) => r.data,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useShalatBulanan(loc: PrayerLocation | null, bulan: number, tahun: number) {
  return useQuery({
    queryKey: ["shalat_bulanan", loc?.provinsi, loc?.kabkota, bulan, tahun],
    enabled: !!loc?.provinsi && !!loc?.kabkota,
    queryFn: () =>
      jpost<ShalatMonthData>("/api/equran/shalat", {
        provinsi: loc!.provinsi,
        kabkota: loc!.kabkota,
        bulan,
        tahun,
      }),
    select: (r) => r.data,
    staleTime: 1000 * 60 * 10,
  });
}

export function useImsakProvinsi() {
  return useQuery({
    queryKey: ["imsak_provinsi"],
    queryFn: () => jget<string[]>("/api/equran/imsakiyah/provinsi"),
    select: (r) => r.data,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useImsakKabkota(provinsi: string | null) {
  return useQuery({
    queryKey: ["imsak_kabkota", provinsi],
    enabled: !!provinsi,
    queryFn: () => jpost<string[]>("/api/equran/imsakiyah/kabkota", { provinsi }),
    select: (r) => r.data,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useImsakiyah(loc: PrayerLocation | null) {
  return useQuery({
    queryKey: ["imsakiyah", loc?.provinsi, loc?.kabkota],
    enabled: !!loc?.provinsi && !!loc?.kabkota,
    queryFn: () =>
      jpost<ImsakiyahData>("/api/equran/imsakiyah", {
        provinsi: loc!.provinsi,
        kabkota: loc!.kabkota,
      }),
    select: (r) => r.data,
    staleTime: 1000 * 60 * 60,
  });
}
