"use client";

import QRCode from "qrcode";
import React from "react";

const PREVIEW_IMAGE = "https://i.ibb.co.com/G4Gwwnbr/IMG-4254.png";

export default function UseMobilePage() {
  const [dataUrl, setDataUrl] = React.useState<string>("");
  const [imgError, setImgError] = React.useState(false);

  React.useEffect(() => {
    const url = window.location.origin;
    QRCode.toDataURL(url, { margin: 1, width: 220 }).then(setDataUrl);
  }, []);

  const origin = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <main className="min-h-dvh bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-4xl rounded-3xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] border border-border p-6">
        <div className="flex gap-8 items-center">
          {/* === iPhone 13 Frame + Screenshot Preview === */}
          <div className="relative">
            {/* Outer body */}
            <div className="h-[560px] w-[280px] rounded-[52px] bg-[#0b0f19] p-[10px] shadow-[0_40px_120px_rgba(2,6,23,0.45)]">
              {/* Inner bezel */}
              <div className="relative h-full w-full overflow-hidden rounded-[44px] bg-black">
                {/* Screen */}
                <div className="relative h-full w-full overflow-hidden rounded-[40px] bg-white">
                  {/* iPhone 13 notch */}
                  <div className="absolute top-0 left-1/2 z-20 h-[26px] w-[140px] -translate-x-1/2 rounded-b-[18px] bg-black" />
                  {/* notch details */}
                  <div className="absolute top-[8px] left-1/2 z-30 flex -translate-x-1/2 items-center gap-2 opacity-90">
                    <div className="h-[6px] w-[44px] rounded-full bg-[#1f2937]" />
                    <div className="h-[8px] w-[8px] rounded-full bg-[#111827]" />
                  </div>

                  {/* Preview image (pas ukuran, tidak kebesaran) */}
                  {!imgError ? (
                    <div className="flex h-full w-full items-center justify-center bg-[#f8fafc]">
                      <img
                        src={PREVIEW_IMAGE}
                        alt="Pratinjau tampilan mobile (iPhone 13)"
                        className="max-h-full max-w-full object-contain p-3"
                        onError={() => setImgError(true)}
                      />
                    </div>
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface px-6 text-center">
                      <div>
                        <div className="text-sm font-semibold text-text">
                          Preview tidak bisa dimuat
                        </div>
                        <div className="mt-2 text-xs text-muted leading-relaxed">
                          Cek kembali URL screenshot atau gunakan domain gambar yang bisa diakses publik.
                        </div>
                        <div className="mt-3 rounded-2xl border border-border bg-white px-3 py-2 text-[11px] text-muted break-all">
                          {PREVIEW_IMAGE}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* subtle glass highlight */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                </div>
              </div>
            </div>

            {/* bottom soft shadow */}
            <div className="pointer-events-none absolute -bottom-6 left-1/2 h-7 w-[220px] -translate-x-1/2 rounded-full bg-black/20 blur-xl" />
          </div>

          {/* === Right content === */}
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-text">Silakan akses via ponsel</h1>
            <p className="mt-2 text-muted text-sm leading-relaxed">
              Ramadhan Companion dirancang khusus untuk layar mobile (≤ 480px). Untuk pengalaman terbaik, silakan buka lewat ponsel Anda.
            </p>

            {/* QR card */}
            <div className="mt-5 rounded-2xl border border-border bg-white p-4">
              <div className="text-sm font-medium text-text">Scan QR ini</div>

              <div className="mt-3 flex items-center gap-4">
                {dataUrl ? (
                  <img
                    alt="QR Code"
                    src={dataUrl}
                    className="h-[140px] w-[140px] rounded-xl border border-border bg-white"
                  />
                ) : (
                  <div className="h-[140px] w-[140px] rounded-xl bg-surface animate-pulse" />
                )}

                <div className="text-xs text-muted leading-relaxed">
                  Buka kamera ponsel, arahkan ke QR, lalu akses aplikasi dari browser mobile.
                  <div className="mt-2 text-[11px] text-muted">
                    Link: <span className="font-semibold text-text">{origin}</span>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted">
              Tip: Anda juga bisa “Add to Home Screen” agar terasa seperti aplikasi.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
