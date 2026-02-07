"use client";

import React from "react";
import { BottomSheet } from "@/components/ui/bottom-sheet";
import { useShalatProvinsi, useShalatKabkota, type PrayerLocation } from "@/queries/prayer";

type LocationKey = "rumah" | "kantor";

type Props = {
  open: boolean;
  onClose: () => void;
  activeKey: LocationKey;
  setActiveKey: (k: LocationKey) => void;

  rumah: PrayerLocation | null;
  kantor: PrayerLocation | null;
  onChange: (key: LocationKey, next: PrayerLocation) => void;
};

export function LocationSheet({
  open,
  onClose,
  activeKey,
  setActiveKey,
  rumah,
  kantor,
  onChange,
}: Props) {
  const current = activeKey === "rumah" ? rumah : kantor;

  const [prov, setProv] = React.useState<string>(current?.provinsi ?? "");
  const [kab, setKab] = React.useState<string>(current?.kabkota ?? "");

  const provQ = useShalatProvinsi();
  const kabQ = useShalatKabkota(prov || null);

  React.useEffect(() => {
    const c = activeKey === "rumah" ? rumah : kantor;
    setProv(c?.provinsi ?? "");
    setKab(c?.kabkota ?? "");
  }, [activeKey, rumah?.provinsi, rumah?.kabkota, kantor?.provinsi, kantor?.kabkota]);

  const save = () => {
    if (!prov || !kab) return;
    onChange(activeKey, { provinsi: prov, kabkota: kab });
    onClose();
  };

  return (
    <BottomSheet open={open} title="Lokasi Jadwal" onClose={onClose}>
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2 rounded-2xl border border-border bg-surface p-1">
          <button
            onClick={() => setActiveKey("rumah")}
            className={[
              "rounded-2xl px-3 py-2 text-sm font-semibold transition active:scale-[0.98]",
              activeKey === "rumah" ? "bg-white text-text shadow-[0_10px_24px_rgba(15,23,42,0.08)]" : "text-muted",
            ].join(" ")}
          >
            Rumah
          </button>
          <button
            onClick={() => setActiveKey("kantor")}
            className={[
              "rounded-2xl px-3 py-2 text-sm font-semibold transition active:scale-[0.98]",
              activeKey === "kantor" ? "bg-white text-text shadow-[0_10px_24px_rgba(15,23,42,0.08)]" : "text-muted",
            ].join(" ")}
          >
            Kantor
          </button>
        </div>

        <div className="rounded-3xl border border-border bg-surface p-4 text-xs text-muted">
          Simpan 2 lokasi: <b>Rumah</b> & <b>Kantor</b>. Jadwal di Beranda mengikuti lokasi yang aktif.
        </div>

        <label className="block">
          <span className="text-xs font-semibold text-text">Provinsi</span>
          <select
            value={prov}
            onChange={(e) => {
              setProv(e.target.value);
              setKab("");
            }}
            className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none"
          >
            <option value="">Pilih provinsi</option>
            {(provQ.data ?? []).map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <span className="text-xs font-semibold text-text">Kabupaten/Kota</span>
          <select
            value={kab}
            onChange={(e) => setKab(e.target.value)}
            disabled={!prov}
            className="mt-1 w-full rounded-2xl border border-border bg-white px-3 py-2 text-sm text-text outline-none disabled:opacity-60"
          >
            <option value="">{prov ? "Pilih kabupaten/kota" : "Pilih provinsi dulu"}</option>
            {(kabQ.data ?? []).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>

        <button
          onClick={save}
          disabled={!prov || !kab}
          className="w-full rounded-2xl px-4 py-3 text-white font-semibold disabled:opacity-60 active:scale-[0.98] transition"
          style={{ background: "linear-gradient(135deg, rgb(16 185 129), rgb(59 130 246))" }}
        >
          Simpan Lokasi {activeKey === "rumah" ? "Rumah" : "Kantor"}
        </button>
      </div>
    </BottomSheet>
  );
}
