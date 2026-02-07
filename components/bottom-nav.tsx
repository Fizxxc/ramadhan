"use client";

import { usePathname } from "next/navigation";

const items = [
  { href: "/app/home", label: "Beranda" },
  { href: "/app/quran", label: "Al-Qur’an" },
  { href: "/app/hafalan", label: "Hafalan" },
  { href: "/app/tracker", label: "Tracker" },
  { href: "/app/profile", label: "Profil" },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 mx-auto w-full max-w-[430px]">
      <div className="border-t border-border bg-white/80 backdrop-blur-md">
        <ul className="grid grid-cols-5 px-2 py-2">
          {items.map((it) => {
            const active = pathname === it.href;
            return (
              <li key={it.href}>
                <a
                  href={it.href}
                  className={[
                    "mx-1 flex h-11 items-center justify-center rounded-2xl text-xs font-semibold transition active:scale-[0.98]",
                    active ? "bg-surface text-text" : "text-muted",
                  ].join(" ")}
                  aria-current={active ? "page" : undefined}
                >
                  {it.label}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
