import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Database,
  Search,
  Mail,
  ShieldAlert,
  TrendingUp,
  CheckCircle2,
  Server,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function MrwooAdminPage() {
  const session = await auth();

  // 1. Check valid session email
  if (!session?.user?.email) {
    redirect('/login');
  }

  // 2. Fetch user by email
  let currentUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!currentUser) {
    redirect('/login');
  }

  // 3. Auto-promote master email to SUPER_ADMIN on production automatically
  if (
    (currentUser.email === 'iconicaiwebdevelopermaster@gmail.com' || currentUser.email.includes('iconicai')) &&
    currentUser.role !== 'SUPER_ADMIN'
  ) {
    currentUser = await prisma.user.update({
      where: { id: currentUser.id },
      data: { role: 'SUPER_ADMIN' },
    });
  }

  // 4. Security Check: Block non-admin users
  if (currentUser.role !== 'SUPER_ADMIN') {
    redirect('/dashboard');
  }

  // Safe metrics fetching
  let totalUsers = 0;
  let totalLeads = 0;
  let totalEmailsSent = 0;
  let totalSearches = 0;
  let usersList: any[] = [];
  let recentSearches: any[] = [];
  let recentEmails: any[] = [];

  try {
    const [uCount, lCount, eCount] = await Promise.all([
      prisma.user.count(),
      prisma.lead.count(),
      prisma.emailSent.count(),
    ]);

    totalUsers = uCount;
    totalLeads = lCount;
    totalEmailsSent = eCount;

    try {
      totalSearches = await prisma.scraperSearch.count();
      recentSearches = await prisma.scraperSearch.findMany({
        take: 15,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
        },
      });
    } catch (e) {
      console.log('ScraperSearch check:', e);
    }

    usersList = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        smtpUser: true,
        _count: {
          select: {
            leads: true,
            emailsSent: true,
            gmailAccounts: true,
          },
        },
      },
    });

    recentEmails = await prisma.emailSent.findMany({
      take: 10,
      orderBy: { sentAt: 'desc' },
      include: {
        lead: { select: { name: true, email: true, company: true } },
        user: { select: { email: true } },
      },
    });
  } catch (err) {
    console.error('Mrwoo Data Load Error:', err);
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl">
      <PageHeader
        title="🔥 Mrwoo Command Center"
        description="Global platform metrics, user management, scraper logs, and outreach activity."
      >
        <Badge className="bg-red-500/10 text-red-400 border-red-500/30 px-3 py-1 text-xs flex items-center gap-1.5 font-mono">
          <ShieldAlert className="w-3.5 h-3.5" /> SUPER ADMIN MODE
        </Badge>
      </PageHeader>

      {/* TOP METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Registered Users</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{totalUsers}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" /> Active SaaS Accounts
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Harvested Leads</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Database className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{totalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1">Platform-wide Neon DB count</div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Emails Dispatched</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Mail className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{totalEmailsSent}</div>
          <div className="text-[11px] text-slate-500 mt-1">Gmail OAuth + SMTP total</div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Scraper Runs Executed</span>
            <div className="p-2 bg-amber-500/10 text-amber-400 rounded-lg">
              <Search className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{totalSearches}</div>
          <div className="text-[11px] text-slate-500 mt-1">4-Source NexScraper queries</div>
        </Card>
      </div>

      {/* USER MANAGEMENT AUDIT TABLE */}
      <Card className="p-5 bg-slate-900/60 border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-semibold text-slate-100">Registered SaaS Users & Usage</h3>
            <p className="text-xs text-slate-400">Detailed breakdown of leads, emails, and channels per user account.</p>
          </div>
          <Badge variant="outline" className="border-slate-700 text-slate-300">
            {usersList.length} Accounts
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono text-[10px]">
              <tr>
                <th className="p-3">User / Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Leads Harvested</th>
                <th className="p-3">Emails Sent</th>
                <th className="p-3">Channel Active</th>
                <th className="p-3">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usersList.map((u) => {
                const hasOAuth = u._count?.gmailAccounts > 0;
                const hasSmtp = Boolean(u.smtpUser);
                return (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition">
                    <td className="p-3">
                      <div className="font-medium text-slate-100">{u.name || 'User'}</div>
                      <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                    </td>
                    <td className="p-3">
                      {u.role === 'SUPER_ADMIN' ? (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">
                          SUPER ADMIN
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">
                          USER
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-blue-400">{u._count?.leads || 0}</td>
                    <td className="p-3 font-semibold text-purple-400">{u._count?.emailsSent || 0}</td>
                    <td className="p-3">
                      {hasOAuth ? (
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Gmail OAuth
                        </span>
                      ) : hasSmtp ? (
                        <span className="text-purple-400 font-medium flex items-center gap-1">
                          <Server className="w-3 h-3" /> Manual SMTP
                        </span>
                      ) : (
                        <span className="text-slate-500 text-[11px]">Not Configured</span>
                      )}
                    </td>
                    <td className="p-3 text-[11px] text-slate-400">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* SCRAPER SEARCH HISTORY & RECENT OUTREACH */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Search className="w-4 h-4 text-amber-400" /> Scraper Search Audit Log
            </h3>
            <span className="text-xs text-slate-400">Recent queries</span>
          </div>

          {recentSearches.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-lg">
              No scraper searches logged yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentSearches.map((s) => (
                <div
                  key={s.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-semibold text-slate-200">{s.query}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      By <span className="text-blue-400">{s.user?.email || 'User'}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">
                      +{s.resultsCount} Leads
                    </Badge>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(s.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-slate-100 flex items-center gap-2">
              <Mail className="w-4 h-4 text-purple-400" /> Live Outreach Dispatch Activity
            </h3>
            <span className="text-xs text-slate-400">Recent emails</span>
          </div>

          {recentEmails.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-lg">
              No emails dispatched yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentEmails.map((e) => (
                <div
                  key={e.id}
                  className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs"
                >
                  <div className="max-w-[70%]">
                    <div className="font-semibold text-slate-200 truncate">{e.subject}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      To: <span className="text-slate-300">{e.lead?.email || 'Lead'}</span> ({e.lead?.company || 'N/A'})
                    </div>
                  </div>
                  <div className="text-right">
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                      SENT
                    </Badge>
                    <div className="text-[10px] text-slate-500 mt-1">
                      {new Date(e.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}