"use client";

import React from "react";

type Props = { open: boolean; title?: string; onClose: () => void; children: React.ReactNode };

export function BottomSheet({ open, title, onClose, children }: Props) {
  const ref = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  React.useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;

    let startY = 0;
    let currentY = 0;
    let dragging = false;

    const onDown = (e: PointerEvent) => {
      dragging = true;
      startY = e.clientY;
      el.setPointerCapture(e.pointerId);
      el.style.transition = "none";
    };

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      currentY = Math.max(0, e.clientY - startY);
      el.style.transform = `translateY(${currentY}px)`;
    };

    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      el.style.transition = "transform 220ms cubic-bezier(0.2,0.8,0.2,1)";
      if (currentY > 120) onClose();
      else el.style.transform = "translateY(0px)";
      currentY = 0;
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);

    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <button aria-label="Tutup" onClick={onClose} className="absolute inset-0 bg-slate-900/30 backdrop-blur-md transition" />
      <div className="absolute inset-x-0 bottom-0 mx-auto w-full max-w-[430px]">
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          className="rounded-t-[28px] border border-border bg-white shadow-[0_-20px_60px_rgba(15,23,42,0.18)]"
          style={{ transform: "translateY(0px)", transition: "transform 220ms cubic-bezier(0.2,0.8,0.2,1)" }}
        >
          <div className="px-5 pt-3 pb-2">
            <div className="mx-auto h-1.5 w-12 rounded-full bg-slate-200" aria-hidden />
            {title ? <div className="mt-3 text-base font-semibold text-text">{title}</div> : null}
          </div>
          <div className="px-5 pb-6">{children}</div>
        </div>
      </div>
    </div>
  );
}
