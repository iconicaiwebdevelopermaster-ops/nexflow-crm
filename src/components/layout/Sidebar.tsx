"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Kanban,
  Radar,
  Mail,
  FileText,
  CheckSquare,
  Settings,
  Flame,
} from "lucide-react";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Leads Table", href: "/leads", icon: Users },
  { label: "Pipeline (Kanban)", href: "/leads/kanban", icon: Kanban, badge: "New" },
  { label: "Lead Scraper", href: "/scraper", icon: Radar },
  { label: "Campaigns & Emails", href: "/emails", icon: Mail },
  { label: "Templates", href: "/templates", icon: FileText },
  { label: "Tasks", href: "/tasks", icon: CheckSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 bg-[#050815] border-r border-slate-800/80 h-full flex flex-col justify-between p-3 select-none">
      <div className="space-y-5">
        {/* Brand */}
        <Link href="/dashboard" className="flex items-center gap-2.5 px-2 pt-1">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Flame className="w-4 h-4 text-white fill-white" />
          </div>
          <div>
            <span className="font-bold text-[15px] text-slate-100 tracking-tight leading-none">
              NEXFLOW
            </span>
            <span className="text-[9px] block font-mono text-blue-400 font-semibold leading-none mt-0.5">
              OUTREACH CRM
            </span>
          </div>
        </Link>

        {/* Navigation */}
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center justify-between px-2.5 py-2 rounded-lg text-[13px] font-medium transition ${
                  isActive
                    ? "bg-blue-600/15 text-blue-400 border border-blue-500/25"
                    : "text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon
                    className={`w-4 h-4 ${
                      isActive ? "text-blue-400" : "text-slate-500"
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[9px] font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30 px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-2.5 bg-slate-900/50 border border-slate-800/60 rounded-xl text-[11px] text-slate-400">
        <div className="font-medium text-slate-300">NexFlow Engine v4.0</div>
        <div className="text-[10px] text-slate-500 mt-0.5">
          Neon DB • Gmail OAuth Active
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;