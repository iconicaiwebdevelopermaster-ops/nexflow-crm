"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  CheckSquare, 
  Settings, 
  Send, 
  History,
  Sparkles,
  SearchCode
} from "lucide-react";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Leads", href: "/leads", icon: Users },
  { name: "NexScraper", href: "/scraper", icon: SearchCode },
  { name: "Compose Email", href: "/emails/compose", icon: Send },
  { name: "Email History", href: "/emails/history", icon: History },
  { name: "Templates", href: "/templates", icon: FileText },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#0E131F] border-r border-slate-800 flex flex-col justify-between h-screen fixed left-0 top-0 z-30">
      <div>
        <div className="h-16 flex items-center px-6 border-b border-slate-800/80 gap-3">
          <div className="h-9 w-9 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">N</div>
          <div>
            <span className="font-bold text-lg text-white tracking-tight">NexFlow</span>
            <span className="text-[10px] block text-blue-400 font-mono font-medium -mt-1">by NexPulseLabs</span>
          </div>
        </div>
        <nav className="p-4 space-y-1.5">
          {navigation.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
            const Icon = item.icon;
            return (
              <Link key={item.name} href={item.href} className={cn("flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150", isActive ? "bg-blue-600/15 text-blue-400 border border-blue-500/20 shadow-sm" : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50")}>
                <Icon className={cn("w-4 h-4", isActive ? "text-blue-400" : "text-slate-400")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="p-4 border-t border-slate-800">
        <div className="bg-slate-900/90 border border-slate-800 p-3.5 rounded-xl">
          <div className="flex items-center gap-2 mb-1.5">
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-semibold text-white">NexScraper Active</span>
          </div>
          <p className="text-[11px] text-slate-400">Find leads automatically</p>
        </div>
      </div>
    </aside>
  );
}