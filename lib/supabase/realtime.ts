import { supabase } from "@/lib/supabase/client";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";

type ChangeHandler = (payload: RealtimePostgresChangesPayload<any>) => void;

export function subscribeTable(opts: {
  channel: string;
  table: string;
  schema?: string;
  filter?: string;
  onChange: ChangeHandler;
}) {
  const schema = opts.schema ?? "public";
  const ch = supabase
    .channel(opts.channel)
    .on("postgres_changes", { event: "*", schema, table: opts.table, filter: opts.filter }, (payload) => opts.onChange(payload))
    .subscribe();

  return () => supabase.removeChannel(ch);
}
