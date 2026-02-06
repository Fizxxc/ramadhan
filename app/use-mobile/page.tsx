"use client";

import QRCode from "qrcode";
import React from "react";

export default function UseMobilePage() {
  const [dataUrl, setDataUrl] = React.useState<string>("");

  React.useEffect(() => {
    const url = window.location.origin;
    QRCode.toDataURL(url, { margin: 1, width: 220 }).then(setDataUrl);
  }, []);

  return (
    <main className="min-h-dvh bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl bg-white shadow-[0_12px_40px_rgba(15,23,42,0.12)] border border-border p-6">
        <div className="flex gap-6 items-center">
          <div className="h-[420px] w-[240px] rounded-[36px] border border-border bg-surface shadow-inner flex items-center justify-center">
            <div className="text-muted text-sm text-center px-4">
              Pratinjau ponsel
            </div>
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-semibold text-text">Silakan akses via ponsel</h1>
            <p className="mt-2 text-muted text-sm">
              Ramadhan Companion dirancang khusus untuk layar mobile agar nyaman digunakan.
            </p>

            <div className="mt-4 rounded-2xl border border-border bg-white p-4">
              <div className="text-sm font-medium text-text">Scan QR ini</div>
              <div className="mt-3 flex items-center gap-4">
                {dataUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img alt="QR Code" src={dataUrl} className="h-[140px] w-[140px] rounded-xl border border-border" />
                ) : (
                  <div className="h-[140px] w-[140px] rounded-xl bg-surface animate-pulse" />
                )}
                <div className="text-xs text-muted">
                  Buka kamera ponsel, arahkan ke QR, lalu masuk.
                </div>
              </div>
            </div>

            <p className="mt-4 text-xs text-muted">
              Tip: Perkecil jendela hingga ≤ 480px untuk melihat versi mobile.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
