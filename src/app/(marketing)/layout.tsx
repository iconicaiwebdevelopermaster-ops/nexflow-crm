import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NexFlow CRM — B2B Lead Generation on Autopilot",
  description: "Scrape leads from Google Maps, LinkedIn & Indeed. Send cold emails. Close deals. All in one dark-mode CRM.",
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} bg-[#0A0D14] text-white antialiased`}>
        {children}
      </body>
    </html>
  );
}
