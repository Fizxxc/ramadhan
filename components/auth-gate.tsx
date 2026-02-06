"use client";

import React from "react";
import { supabase } from "@/lib/supabase/client";
import { usePathname, useRouter } from "next/navigation";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    let mounted = true;

    const init = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session && mounted) {
        router.replace("/auth/login");
      } else if (mounted) {
        setReady(true);
      }
    };

    init();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session && pathname.startsWith("/app")) router.replace("/auth/login");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="min-h-dvh px-5 pt-10">
        <div className="h-6 w-40 rounded-xl bg-surface animate-pulse" />
        <div className="mt-6 h-28 rounded-3xl bg-surface animate-pulse" />
        <div className="mt-4 h-28 rounded-3xl bg-surface animate-pulse" />
      </div>
    );
  }

  return <>{children}</>;
}
