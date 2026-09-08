import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  Database,
  Search,
  Mail,
  TrendingUp,
  CheckCircle2,
  Server,
  Activity,
  Globe,
} from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MrwooPage() {
  let totalUsers = 0;
  let totalLeads = 0;
  let totalEmails = 0;
  let totalSearches = 0;
  let usersList: any[] = [];
  let recentSearches: any[] = [];
  let recentEmails: any[] = [];
  let recentLeads: any[] = [];
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
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true, email: true } } },
      });
    } catch {}

    usersList = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        smtpUser: true,
        lastLoginAt: true,
        _count: {
          select: {
            leads: true,
            emailsSent: true,
            gmailAccounts: true,
            scraperSearches: true,
          },
        },
      },
    });

    recentEmails = await prisma.emailSent.findMany({
      take: 15,
      orderBy: { sentAt: 'desc' },
      include: {
        lead: { select: { name: true, email: true, company: true } },
        user: { select: { email: true } },
      },
    });

    recentLeads = await prisma.lead.findMany({
      take: 15,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true } } },
    });

    const grouped = await prisma.lead.groupBy({
      by: ['status'],
      _count: { status: true },
    });
    grouped.forEach((g) => {
      statusBreakdown[g.status] = g._count.status;
    });
  } catch (err) {
    console.error('Mrwoo metrics error', err);
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="rounded-2xl border border-red-500/20 bg-gradient-to-br from-red-500/10 via-slate-900/40 to-transparent p-5 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-slate-50">Platform Control Room</h1>
            <p className="text-sm text-slate-400 mt-1">
              Saare users, leads, scraper searches, emails — live Neon DB se.
            </p>
          </div>
          <div className="flex items-center gap-2 text-[11px] font-mono text-red-300/90">
            <Activity className="w-3.5 h-3.5" /> LIVE • SECRET ROUTE /mrwoo
          </div>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide">Users</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-bold mt-2">{totalUsers}</div>
          <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-400" /> Registered accounts
          </div>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide">Leads</span>
            <Database className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold mt-2">{totalLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1">Platform-wide harvest</div>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide">Emails</span>
            <Mail className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold mt-2">{totalEmails}</div>
          <div className="text-[11px] text-slate-500 mt-1">OAuth + SMTP total</div>
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-400 uppercase tracking-wide">Scraper Runs</span>
            <Search className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold mt-2">{totalSearches}</div>
          <div className="text-[11px] text-slate-500 mt-1">Search audit log</div>
        </Card>
      </div>

      {/* Lead status breakdown */}
      <Card className="p-4 md:p-5 bg-slate-900/70 border-slate-800">
        <h2 className="text-sm font-semibold text-slate-100 mb-3 flex items-center gap-2">
          <Globe className="w-4 h-4 text-cyan-400" /> Lead Pipeline (All Users)
        </h2>
        <div className="flex flex-wrap gap-2">
          {Object.keys(statusBreakdown).length === 0 ? (
            <span className="text-xs text-slate-500">No lead status data yet.</span>
          ) : (
            Object.entries(statusBreakdown).map(([status, count]) => (
              <Badge
                key={status}
                variant="outline"
                className="border-slate-700 bg-slate-950/60 text-slate-300 text-[11px] px-2.5 py-1"
              >
                {status}: <span className="text-slate-100 font-semibold ml-1">{count}</span>
              </Badge>
            ))
          )}
        </div>
      </Card>

      {/* Users table */}
      <Card className="p-4 md:p-5 bg-slate-900/70 border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">All SaaS Users</h2>
            <p className="text-[11px] text-slate-500">Kaun aaya, kitne leads, kitne emails, channel kya hai</p>
          </div>
          <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">
            {usersList.length} accounts
          </Badge>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase tracking-wide text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-2 pr-3">User</th>
                <th className="py-2 pr-3">Role</th>
                <th className="py-2 pr-3">Leads</th>
                <th className="py-2 pr-3">Emails</th>
                <th className="py-2 pr-3">Scrapes</th>
                <th className="py-2 pr-3">Channel</th>
                <th className="py-2">Joined</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {usersList.map((u) => {
                const oauth = (u._count?.gmailAccounts || 0) > 0;
                const smtp = Boolean(u.smtpUser);
                return (
                  <tr key={u.id} className="hover:bg-slate-950/40">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium text-slate-100">{u.name || 'User'}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
                    </td>
                    <td className="py-2.5 pr-3">
                      {u.role === 'SUPER_ADMIN' ? (
                        <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-[10px]">SUPER ADMIN</Badge>
                      ) : (
                        <Badge variant="outline" className="border-slate-700 text-slate-400 text-[10px]">USER</Badge>
                      )}
                    </td>
                    <td className="py-2.5 pr-3 font-semibold text-blue-400">{u._count?.leads || 0}</td>
                    <td className="py-2.5 pr-3 font-semibold text-purple-400">{u._count?.emailsSent || 0}</td>
                    <td className="py-2.5 pr-3 font-semibold text-amber-400">{u._count?.scraperSearches || 0}</td>
                    <td className="py-2.5 pr-3">
                      {oauth ? (
                        <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> OAuth</span>
                      ) : smtp ? (
                        <span className="text-purple-400 flex items-center gap-1"><Server className="w-3 h-3" /> SMTP</span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                    <td className="py-2.5 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Searches + Emails + Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Search className="w-4 h-4 text-amber-400" /> Who searched what
          </h3>
          {recentSearches.length === 0 ? (
            <p className="text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg p-4 text-center">No searches yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentSearches.map((s) => (
                <div key={s.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="font-medium text-slate-200">{s.query}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {s.user?.email || 'user'} • {s.source} • +{s.resultsCount}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Mail className="w-4 h-4 text-purple-400" /> Recent emails (all)
          </h3>
          {recentEmails.length === 0 ? (
            <p className="text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg p-4 text-center">No emails yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentEmails.map((e) => (
                <div key={e.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="font-medium text-slate-200 truncate">{e.subject}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5 truncate">
                    {e.user?.email} → {e.lead?.email}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-4 bg-slate-900/70 border-slate-800">
          <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" /> Latest leads (all)
          </h3>
          {recentLeads.length === 0 ? (
            <p className="text-xs text-slate-500 border border-dashed border-slate-800 rounded-lg p-4 text-center">No leads yet</p>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 text-xs">
                  <div className="font-medium text-slate-200">{lead.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {lead.email} • by {lead.user?.email || '—'} • {lead.status}
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