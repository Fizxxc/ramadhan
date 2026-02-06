import "@/app/globals.css";
import { MobileOnlyGuard } from "@/components/mobile-only-guard";
import { BottomNav } from "@/components/bottom-nav";
import { ReactQueryProvider } from "@/components/react-query-provider";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <MobileOnlyGuard>
      <ReactQueryProvider>
        <div className="min-h-dvh pb-20">{children}</div>
        <BottomNav />
      </ReactQueryProvider>
    </MobileOnlyGuard>
  );
}
