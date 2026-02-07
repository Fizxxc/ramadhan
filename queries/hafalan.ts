import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { MemorizationLogInput } from "@/lib/zod/hafalan";
import { subscribeTable } from "@/lib/supabase/realtime";
import { useEffect } from "react";

export function useMemorizationLogs(date: string) {
  return useQuery({
    queryKey: ["memorization_logs", date],
    queryFn: async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Sesi tidak ditemukan");

      const { data, error } = await supabase
        .from("memorization_logs")
        .select("*")
        .eq("user_id", uid)
        .eq("date", date)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data ?? [];
    },
  });
}

export function useHafalanRealtime(date: string) {
  const qc = useQueryClient();
  useEffect(() => {
    let unsub: null | (() => void) = null;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      unsub = subscribeTable({
        channel: `rt-hafalan-${uid}`,
        table: "memorization_logs",
        filter: `user_id=eq.${uid}`,
        onChange: () => qc.invalidateQueries({ queryKey: ["memorization_logs", date] }),
      });
    })();
    return () => unsub?.();
  }, [date, qc]);
}

export function useCreateMemorizationLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: MemorizationLogInput) => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Sesi tidak ditemukan");

      const { error } = await supabase.from("memorization_logs").insert({
        user_id: uid,
        date: input.date,
        surah: input.surah,
        ayah_from: input.ayah_from,
        ayah_to: input.ayah_to,
        type: input.type,
        notes: input.notes ?? null,
      });

      if (error) throw error;
      return true;
    },
    onSuccess: (_d, vars) => qc.invalidateQueries({ queryKey: ["memorization_logs", vars.date] }),
  });
}
