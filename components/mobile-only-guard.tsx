"use client";

import React from "react";
import { useRouter } from "next/navigation";

export function MobileOnlyGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  React.useEffect(() => {
    const check = () => {
      const w = window.innerWidth;
      if (w > 480) router.replace("/use-mobile");
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [router]);

  return (
    <div className="mx-auto min-h-dvh w-full max-w-[430px] bg-white">
      {children}
    </div>
  );
}
