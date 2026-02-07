"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

export function RouteLoading({ subtitle = "Memuat..." }: { subtitle?: string }) {
  return (
    <main className="min-h-dvh bg-white flex items-center justify-center px-6">
      <div className="w-full max-w-[430px] flex items-center justify-center">
        <div className="relative flex items-center justify-center">
          <div className="pointer-events-none absolute -inset-16 rounded-full bg-emerald-500/10 blur-3xl" />

          <motion.div className="flex items-center gap-4" initial="start" animate="end">
            <motion.div
              className="relative"
              variants={{
                start: { y: 80, opacity: 0, scale: 0.96 },
                end: { y: 0, opacity: 1, scale: 1, transition: { duration: 0.6, ease: [0.2, 0.9, 0.2, 1] } },
              }}
            >
              <motion.div
                variants={{
                  start: {},
                  end: { transition: { delay: 0.6, type: "spring", stiffness: 280, damping: 10, mass: 0.8 } },
                }}
              >
                <motion.div
                  variants={{
                    start: { x: 0 },
                    end: { x: -72, transition: { delay: 1.25, duration: 0.5, ease: [0.2, 0.9, 0.2, 1] } },
                  }}
                >
                  <Image
                    src="/brand/logo-masjid.png"
                    alt="Logo Masjid"
                    width={180}
                    height={180}
                    priority
                    className="drop-shadow-[0_16px_50px_rgba(16,185,129,0.16)]"
                  />
                </motion.div>
              </motion.div>
            </motion.div>

            <motion.div
              className="flex flex-col leading-none"
              initial={{ opacity: 0, x: 20, filter: "blur(6px)" }}
              animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
              transition={{ delay: 1.55, duration: 0.45, ease: [0.2, 0.9, 0.2, 1] }}
            >
              <div className="text-slate-900 font-semibold text-2xl tracking-tight">Masjid</div>
              <div className="mt-1 text-emerald-700 font-semibold text-xl tracking-tight">Al-Ikhlas</div>

              <motion.div
                className="mt-3 h-[2px] w-0 rounded-full bg-gradient-to-r from-emerald-500/80 to-sky-500/60"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 120, opacity: 1 }}
                transition={{ delay: 1.75, duration: 0.5, ease: "easeOut" }}
              />

              <div className="mt-3 text-xs text-slate-500">{subtitle}</div>
            </motion.div>
          </motion.div>

          <div className="absolute -bottom-20 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <Dot delay={0} />
            <Dot delay={0.15} />
            <Dot delay={0.3} />
          </div>
        </div>
      </div>
    </main>
  );
}

function Dot({ delay }: { delay: number }) {
  return (
    <motion.span
      className="h-2 w-2 rounded-full bg-slate-900/50"
      initial={{ y: 0, opacity: 0.25 }}
      animate={{ y: [-2, 2, -2], opacity: [0.25, 0.7, 0.25] }}
      transition={{ duration: 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
    />
  );
}
