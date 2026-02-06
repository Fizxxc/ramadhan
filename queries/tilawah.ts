import { supabase } from "@/lib/supabase/client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { TilawahLogInput } from "@/lib/zod/tilawah";

export function useTilawahLogs(date: string) {
  return useQuery({
    queryKey: ["tilawah_logs", date],
    queryFn: async () => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Sesi tidak ditemukan");

      const { data, error } = await supabase
        .from("tilawah_logs")
        .select("*")
        .eq("user_id", uid)
        .eq("date", date)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useCreateTilawahLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: TilawahLogInput) => {
      const { data: sess } = await supabase.auth.getSession();
      const uid = sess.session?.user.id;
      if (!uid) throw new Error("Sesi tidak ditemukan");

      const { error } = await supabase.from("tilawah_logs").insert({
        user_id: uid,
        date: input.date,
        surah: input.surah,
        ayah_from: input.ayah_from,
        ayah_to: input.ayah_to,
        pages_count: input.pages_count,
        notes: input.notes ?? null,
      });

      if (error) throw error;
      return true;
    },
    onSuccess: (_d, vars) => {
      qc.invalidateQueries({ queryKey: ["tilawah_logs", vars.date] });
    },
  });
}

export function useDeleteTilawahLog() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, date }: { id: string; date: string }) => {
      const { error } = await supabase.from("tilawah_logs").delete().eq("id", id);
      if (error) throw error;
      return { date };
    },
    onSuccess: ({ date }) => {
      qc.invalidateQueries({ queryKey: ["tilawah_logs", date] });
    },
  });
}
