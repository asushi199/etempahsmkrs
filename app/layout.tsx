import type { Metadata } from "next";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import { BottomNav } from "@/components/Nav";
import { getSettings } from "@/lib/data";

export const metadata: Metadata = {
  title: "e-Tempah Bilik SMKRS",
  description: "Sistem tempahan bilik khas SMK Raja Shahriman",
};

// Render dinamik supaya tetapan jenama (logo/nama) sentiasa terkini
export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  return (
    <html lang="ms">
      <body>
        <SiteHeader settings={settings} />
        {/* pb tambahan di telefon supaya kandungan tidak dilindungi bar bawah */}
        <main className="mx-auto max-w-5xl px-4 py-6 pb-24 sm:pb-6">{children}</main>
        <footer className="no-print mx-auto max-w-5xl px-4 pb-24 pt-8 text-center text-xs text-slate-400 sm:pb-8">
          {settings.system_name} &middot; SMK Raja Shahriman
        </footer>
        <BottomNav />
      </body>
    </html>
  );
}
