import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Husky Statistic",
  description: "Shopee sales and accounting dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body>{children}</body></html>;
}
