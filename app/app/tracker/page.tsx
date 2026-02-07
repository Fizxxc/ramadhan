import { warmup } from "@/lib/utils/warmup";
import TrackerClient from "./tracker.client";

export const dynamic = "force-dynamic";

export default async function TrackerPage() {
  await warmup(350);
  return <TrackerClient />;
}
