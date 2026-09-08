'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Database,
  Search,
  Mail,
  Activity,
  Settings,
  ShieldAlert,
  BarChart3,
  Server,
  LogOut,
  ArrowLeft,
  FileText,
} from 'lucide-react';

const menuSections = [
  {
    title: 'OVERVIEW',
    items: [
      { label: 'Command Center', href: '/mrwoo', icon: LayoutDashboard },
      { label: 'Live Analytics', href: '/mrwoo/analytics', icon: BarChart3 },
    ],
  },
  {
    title: 'PEOPLE & DATA',
    items: [
      { label: 'All Users', href: '/mrwoo/users', icon: Users },
      { label: 'All Leads', href: '/mrwoo/leads', icon: Database },
      { label: 'Scraper Audit', href: '/mrwoo/scrapes', icon: Search },
      { label: 'Email Activity', href: '/mrwoo/emails', icon: Mail },
    ],
  },
  {
    title: 'SYSTEM',
    items: [
      { label: 'Pipeline Stats', href: '/mrwoo/pipeline', icon: Activity },
      { label: 'Channels (OAuth/SMTP)', href: '/mrwoo/channels', icon: Server },
      { label: 'Admin Logs', href: '/mrwoo/logs', icon: FileText },
      { label: 'Platform Settings', href: '/mrwoo/settings', icon: Settings },
    ],
  },
];

export function MrwooSidebar({ adminEmail }: { adminEmail?: string }) {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[#05070f] border-r border-red-500/15 h-screen sticky top-0 flex flex-col select-none">
      <div className="p-4 border-b border-red-500/15">
        <Link href="/mrwoo" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center shadow-lg shadow-red-500/20">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="font-bold text-sm text-slate-100 leading-none tracking-tight">MRWOO</div>
            <div className="text-[9px] font-mono text-red-400 mt-0.5 font-semibold">SUPER ADMIN</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-3 space-y-5">
        {menuSections.map((section) => (
          <div key={section.title}>
            <div className="px-2.5 mb-1.5 text-[9px] font-bold tracking-widest text-slate-600 uppercase">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/mrwoo' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition ${
                      isActive
                        ? 'bg-red-500/15 text-red-300 border border-red-500/25'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 border border-transparent'
                    }`}
                  >
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-3 border-t border-red-500/15 space-y-1.5">
        <Link
          href="/dashboard"
          className="flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[12px] text-slate-400 hover:text-slate-100 hover:bg-slate-900/70 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to CRM Workspace
        </Link>
        {adminEmail && (
          <div className="px-2.5 pt-2 text-[10px] text-slate-600 font-mono truncate">
            {adminEmail}
          </div>
        )}
      </div>
    </aside>
  );
}

export default MrwooSidebar;