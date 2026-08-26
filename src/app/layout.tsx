import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";

export const metadata: Metadata = {
  title: "NexFlow CRM — Lead Generation on Autopilot",
  description: "Built by NexPulseLabs",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="font-sans antialiased bg-[#0A0D14] text-[#F3F4F6]">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}