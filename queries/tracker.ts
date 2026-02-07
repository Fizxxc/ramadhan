import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { subscribeTable } from "@/lib/supabase/realtime";
import { useEffect } from "react";

export type ChecklistItems = Record<string, boolean>;

export function useWorshipChecklist(date: string) {
  return useQuery({
    queryKey: ["worship_checklists", date],
    queryFn: async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Sesi tidak ditemukan");

      const { data, error } = await supabase
        .from("worship_checklists")
        .select("*")
        .eq("user_id", uid)
        .eq("date", date)
        .maybeSingle();

      if (error) throw error;
      return data ?? null;
    },
  });
}

export function useTrackerRealtime(date: string) {
  const qc = useQueryClient();
  useEffect(() => {
    let unsub: null | (() => void) = null;
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) return;
      unsub = subscribeTable({
        channel: `rt-tracker-${uid}`,
        table: "worship_checklists",
        filter: `user_id=eq.${uid}`,
        onChange: () => qc.invalidateQueries({ queryKey: ["worship_checklists", date] }),
      });
    })();
    return () => unsub?.();
  }, [date, qc]);
}

export function useUpsertWorshipChecklist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { date: string; items: ChecklistItems; reflection?: string; mood?: number | null }) => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Sesi tidak ditemukan");

      const { error } = await supabase.from("worship_checklists").upsert(
        { user_id: uid, date: payload.date, items: payload.items, reflection: payload.reflection ?? null, mood: payload.mood ?? null },
        { onConflict: "user_id,date" }
      );
      if (error) throw error;
      return payload.date;
    },
    onSuccess: (date) => qc.invalidateQueries({ queryKey: ["worship_checklists", date] }),
  });
}
