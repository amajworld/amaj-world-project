
import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import GlobalAdScripts from "@/components/GlobalAdScripts";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Amaj World",
  description: "Amazon World – Explore the Best of Amazon in One Place! Shop smart with curated Amazon product reviews, top deals, viral gadgets, fashion picks, pet accessories & home essentials – updated daily!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ptSans.className}>
        <div className="flex flex-col min-h-screen">
          <SiteHeader />
          <main className="flex-grow">{children}</main>
          <SiteFooter />
        </div>
        <GlobalAdScripts />
      </body>
    </html>
  );
}
