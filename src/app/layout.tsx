import type { Metadata } from "next";
import { PT_Sans } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";

const ptSans = PT_Sans({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: "Amaj World",
  description: "Amazon World – Rebuilding a better experience!",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={ptSans.className}>
        <SiteHeader />
        <main>{children}</main>
      </body>
    </html>
  );
}
