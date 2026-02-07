import { warmup } from "@/lib/utils/warmup";
import HafalanClient from "./hafalan.client";

export const dynamic = "force-dynamic";

export default async function HafalanPage() {
  await warmup(350);
  return <HafalanClient />;
}
