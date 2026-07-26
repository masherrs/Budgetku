import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
  ),
  title: {
    default: "BudgetKu — Keuangan rapi, hidup lebih tenang",
    template: "%s · BudgetKu",
  },
  description:
    "Catat transaksi, atur budget, dan kelola keuangan pribadi maupun bersama dalam satu tempat.",
  openGraph: {
    title: "BudgetKu — Keuangan rapi. Hidup lebih tenang.",
    description: "Catat transaksi, atur budget, dan kelola keuangan bersama dengan lebih sederhana.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "BudgetKu" }],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BudgetKu — Keuangan rapi. Hidup lebih tenang.",
    description: "Aplikasi budgeting sederhana untuk keseharian Indonesia.",
    images: ["/og.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="id">
      <body className={`${geist.variable} antialiased`}>{children}</body>
    </html>
  );
}
