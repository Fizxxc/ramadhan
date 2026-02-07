"use client";

import React from "react";

type Opts = {
  enabled: boolean;
  titlePrefix: string; // mis: "Rumah" / "Kantor"
  imsak?: string | null; // "HH:MM"
  maghrib?: string | null; // "HH:MM"
  notifyImsak: boolean;
  notifyMaghrib: boolean;
};

function parseHHMM(hhmm: string) {
  const [h, m] = hhmm.split(":").map((x) => Number(x));
  if (!Number.isFinite(h) || !Number.isFinite(m)) return null;
  return { h, m };
}

function msUntilTodayTime(hhmm: string) {
  const t = parseHHMM(hhmm);
  if (!t) return null;

  const now = new Date();
  const target = new Date();
  target.setHours(t.h, t.m, 0, 0);

  const diff = target.getTime() - now.getTime();
  // kalau sudah lewat, jadwalkan besok
  if (diff <= 0) return diff + 24 * 60 * 60 * 1000;
  return diff;
}

async function ensurePermission() {
  if (typeof window === "undefined") return "denied" as const;
  if (!("Notification" in window)) return "denied" as const;
  if (Notification.permission === "granted") return "granted" as const;
  if (Notification.permission === "denied") return "denied" as const;
  const perm = await Notification.requestPermission();
  return perm;
}

function fire(title: string, body: string) {
  if (!("Notification" in window)) return;
  if (Notification.permission !== "granted") return;
  // best-effort
  new Notification(title, { body });
}

export function usePrayerNotifications(opts: Opts) {
  React.useEffect(() => {
    if (!opts.enabled) return;
    if (typeof window === "undefined") return;

    let t1: any = null;
    let t2: any = null;
    let cancelled = false;

    const run = async () => {
      const perm = await ensurePermission();
      if (cancelled) return;
      if (perm !== "granted") return;

      if (opts.notifyImsak && opts.imsak) {
        const ms = msUntilTodayTime(opts.imsak);
        if (ms != null) {
          t1 = setTimeout(() => {
            fire(
              `${opts.titlePrefix} • Imsak`,
              `Waktunya imsak (${opts.imsak}). Semoga puasa lancar 🤍`
            );
          }, ms);
        }
      }

      if (opts.notifyMaghrib && opts.maghrib) {
        const ms = msUntilTodayTime(opts.maghrib);
        if (ms != null) {
          t2 = setTimeout(() => {
            fire(
              `${opts.titlePrefix} • Maghrib`,
              `Waktu berbuka tiba (${opts.maghrib}). Bismillah 🌙`
            );
          }, ms);
        }
      }
    };

    run();

    return () => {
      cancelled = true;
      if (t1) clearTimeout(t1);
      if (t2) clearTimeout(t2);
    };
  }, [
    opts.enabled,
    opts.titlePrefix,
    opts.imsak,
    opts.maghrib,
    opts.notifyImsak,
    opts.notifyMaghrib,
  ]);
}
