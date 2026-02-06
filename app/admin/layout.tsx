"use client";

import React from "react";
import { supabase } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { MobileOnlyGuard } from "@/components/mobile-only-guard";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ok, setOk] = React.useState(false);

  React.useEffect(() => {
    const run = async () => {
      const { data: sess } = await supabase.auth.getSession();
      if (!sess.session) return router.replace("/auth/login");

      const userId = sess.session.user.id;
      const { data, error } = await supabase.from("profiles").select("role").eq("id", userId).single();

      if (error || data?.role !== "admin") {
        router.replace("/app/home");
        return;
      }
      setOk(true);
    };
    run();
  }, [router]);

  if (!ok) {
    return (
      <MobileOnlyGuard>
        <div className="min-h-dvh px-5 pt-10">
          <div className="h-6 w-44 rounded-xl bg-surface animate-pulse" />
          <div className="mt-6 h-24 rounded-3xl bg-surface animate-pulse" />
        </div>
      </MobileOnlyGuard>
    );
  }

  return <MobileOnlyGuard>{children}</MobileOnlyGuard>;
}
