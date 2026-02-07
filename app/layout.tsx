import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ramadhan Companion",
  description: "Teman ibadah Ramadhan (mobile-only)."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
