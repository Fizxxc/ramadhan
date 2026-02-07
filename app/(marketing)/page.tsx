import { warmup } from "@/lib/utils/warmup";
import LandingClient from "./landing.client";

export const dynamic = "force-dynamic";

export default async function MarketingPage() {
  await warmup(350); // ini yang membuat loading.tsx tampil
  return <LandingClient />;
}
