import { Sidebar } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-[#070A12] text-slate-100">
      {/* Sidebar */}
      <div className="hidden md:flex sticky top-0 h-screen">
        <Sidebar />
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}