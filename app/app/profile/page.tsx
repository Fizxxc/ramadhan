import { warmup } from "@/lib/utils/warmup";
import ProfileClient from "./profile.client";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  await warmup(350);
  return <ProfileClient />;
}
