import { warmup } from "@/lib/utils/warmup";
import HomeClient from "./home.client";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  await warmup(350);
  return <HomeClient />;
}
