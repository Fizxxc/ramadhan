"use client";

import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import { subscribeTable } from "@/lib/supabase/realtime";

async function fetchOverview() {
  const [{ count: users }, { count: tilawah }, { count: hafalan }, { count: tracker }] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("tilawah_logs").select("id", { count: "exact", head: true }),
    supabase.from("memorization_logs").select("id", { count: "exact", head: true }),
    supabase.from("worship_checklists").select("id", { count: "exact", head: true }),
  ]);
  return { users: users ?? 0, tilawah: tilawah ?? 0, hafalan: hafalan ?? 0, tracker: tracker ?? 0 };
}

export default function AdminOverviewPage() {
  const qc = useQueryClient();
  useEffect(() => {
    const u1 = subscribeTable({ channel: "rt-admin-tilawah", table: "tilawah_logs", onChange: () => qc.invalidateQueries({ queryKey: ["admin_overview"] }) });
    const u2 = subscribeTable({ channel: "rt-admin-hafalan", table: "memorization_logs", onChange: () => qc.invalidateQueries({ queryKey: ["admin_overview"] }) });
    const u3 = subscribeTable({ channel: "rt-admin-tracker", table: "worship_checklists", onChange: () => qc.invalidateQueries({ queryKey: ["admin_overview"] }) });
    const u4 = subscribeTable({ channel: "rt-admin-users", table: "profiles", onChange: () => qc.invalidateQueries({ queryKey: ["admin_overview"] }) });
    return () => { u1(); u2(); u3(); u4(); };
  }, [qc]);

  const q = useQuery({ queryKey: ["admin_overview"], queryFn: fetchOverview });

  return (
    <main className="px-5 pt-6">
      <h1 className="text-lg font-semibold text-text">Admin • Overview</h1>
      <p className="mt-1 text-sm text-muted">Statistik singkat (realtime).</p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        {[
          { k: "Total pengguna", v: q.data?.users },
          { k: "Total tilawah", v: q.data?.tilawah },
          { k: "Total hafalan", v: q.data?.hafalan },
          { k: "Total tracker", v: q.data?.tracker },
        ].map((x) => (
          <div key={x.k} className="rounded-3xl border border-border bg-white p-4">
            <div className="text-xs text-muted">{x.k}</div>
            <div className="mt-2 text-lg font-semibold text-text">{q.isLoading ? "…" : (x.v ?? 0)}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-3xl border border-border bg-surface p-4 text-xs text-muted">
        Catatan: DAU/MAU & completion rate bisa ditambah via view/RPC.
      </div>
    </main>
  );
}
