import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import {
  Users,
  Database,
  Search,
  Mail,
  Activity,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MrwooHomePage() {
  let totalUsers = 0;
  let totalLeads = 0;
  let totalEmails = 0;
  let totalSearches = 0;
  let usersList: any[] = [];
  let recentSearches: any[] = [];
  let recentEmails: any[] = [];
  let statusBreakdown: Record<string, number> = {};

  try {
    const [u, l, e] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.emailSent.count(),
    ]);
    totalUsers = u;
    totalLeads = l;
    totalEmails = e;

    try {
      totalSearches = await prisma.scraperSearch.count();
      recentSearches = await prisma.scraperSearch.findMany({
        take: 8,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { email: true } } },
      });
    } catch {}

    usersList = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 8,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        smtpUser: true,
        _count: {
          select: { leads: true, emailsSent: true, gmailAccounts: true, scraperSearches: true },
        },
      },
    });

    recentEmails = await prisma.emailSent.findMany({
      take: 8,
      orderBy: { sentAt: 'desc' },
      include: {
        lead: { select: { email: true, company: true } },
        user: { select: { email: true } },
      },
    });

    const grouped = await prisma.lead.groupBy({ by: ['status'], _count: { status: true } });
    grouped.forEach((g) => {
      statusBreakdown[g.status] = g._count.status;
    });
  } catch (err) {
    console.error(err);
  }

  const quickLinks = [
    { href: '/mrwoo/users', label: 'Manage Users', icon: Users, color: 'text-blue-400' },
    { href: '/mrwoo/leads', label: 'All Leads', icon: Database, color: 'text-cyan-400' },
    { href: '/mrwoo/scrapes', label: 'Scraper Logs', icon: Search, color: 'text-amber-400' },
    { href: '/mrwoo/emails', label: 'Email Logs', icon: Mail, color: 'text-purple-400' },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Command Center</h1>
          <p className="text-sm text-slate-400 mt-1">Platform-wide live metrics from Neon DB</p>
        </div>
        <Badge className="w-fit bg-red-500/10 text-red-400 border-red-500/30 text-[10px] font-mono">
          LIVE SUPER ADMIN
        </Badge>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: 'Users', value: totalUsers, icon: Users, color: 'text-blue-400 bg-blue-500/10' },
          { label: 'Leads', value: totalLeads, icon: Database, color: 'text-cyan-400 bg-cyan-500/10' },
          { label: 'Emails Sent', value: totalEmails, icon: Mail, color: 'text-purple-400 bg-purple-500/10' },
          { label: 'Scraper Runs', value: totalSearches, icon: Search, color: 'text-amber-400 bg-amber-500/10' },
        ].map((k) => {
          const Icon = k.icon;
          return (
            <Card key={k.label} className="p-4 bg-slate-900/70 border-slate-800">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-400 uppercase">{k.label}</span>
                <div className={`p-1.5 rounded-lg ${k.color}`}><Icon className="w-3.5 h-3.5" /></div>
              </div>
              <div className="text-2xl font-bold mt-2 text-slate-100">{k.value}</div>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {quickLinks.map((q) => {
          const Icon = q.icon;
          return (
            <Link key={q.href} href={q.href}>
              <Card className="p-4 bg-slate-900/50 border-slate-800 hover:border-red-500/30 transition cursor-pointer h-full">
                <Icon className={`w-5 h-5 ${q.color} mb-2`} />
                <div className="text-sm font-medium text-slate-200 flex items-center gap-1">
                  {q.label} <ArrowRight className="w-3 h-3 text-slate-500" />
                </div>
              </Card>
            </Link>
          );
        })}
      </div>

      <Card className="p-4 bg-slate-900/70 border-slate-800">
        <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" /> Global Lead Pipeline
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(statusBreakdown).length === 0 ? (
            <span className="text-xs text-slate-500">No data yet</span>
          ) : (
            Object.entries(statusBreakdown).map(([s, c]) => (
              <Badge key={s} variant="outline" className="border-slate-700 text-slate-300 text-[11px]">
                {s}: <b className="ml-1 text-slate-100">{c}</b>
              </Badge>
            ))
          )}
        </div>
      </Card>
    </div>
  );
}