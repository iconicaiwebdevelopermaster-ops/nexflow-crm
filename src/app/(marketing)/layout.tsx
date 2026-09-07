import React from "react";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white selection:bg-blue-500 selection:text-white">
      {children}
    </div>
  );
}
