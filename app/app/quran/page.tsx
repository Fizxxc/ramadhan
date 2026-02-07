import { warmup } from "@/lib/utils/warmup";
import QuranClient from "./quran.client";

export const dynamic = "force-dynamic";

export default async function QuranPage() {
  await warmup(350);
  return <QuranClient />;
}