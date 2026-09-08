export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Users, Mail, CheckCircle2, Clock, Send, Flame, Radar, Kanban } from 'lucide-react';


export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login');
  }

  // Safe user lookup by email
  const dbUser = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!dbUser) {
    redirect('/login');
  }

  const userId = dbUser.id;

  let totalLeads = 0;
  let totalEmailsSent = 0;
  let newLeads = 0;
  let repliedLeads = 0;
  let recentLeads: any[] = [];
  let recentEmails: any[] = [];

  try {
    const [
      leadsCount,
      emailsCount,
      newCount,
      repliedCount,
      leadsList,
      emailsList,
    ] = await Promise.all([
      prisma.lead.count({ where: { userId } }),
      prisma.emailSent.count({ where: { userId } }),
      prisma.lead.count({ where: { userId, status: 'NEW' } }),
      prisma.lead.count({ where: { userId, status: 'REPLIED' } }),
      prisma.lead.findMany({
        where: { userId },
        take: 5,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.emailSent.findMany({
        where: { userId },
        take: 5,
        orderBy: { sentAt: 'desc' },
        include: {
          lead: { select: { name: true, company: true, email: true } },
        },
      }),
    ]);

    totalLeads = leadsCount;
    totalEmailsSent = emailsCount;
    newLeads = newCount;
    repliedLeads = repliedCount;
    recentLeads = leadsList;
    recentEmails = emailsList;
  } catch (err) {
    console.error('Dashboard Data Fetch Error:', err);
  }

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Executive Workspace"
        description="Real-time overview of harvested leads, pipeline stages & cold outreach metrics."
      >
        <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9" asChild>
          <Link href="/scraper">
            <Radar className="w-3.5 h-3.5 mr-1.5" /> Scrape Leads
          </Link>
        </Button>
      </PageHeader>

      {/* METRICS ROW */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Harvested Leads</span>
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{totalLeads}</div>
          <div className="text-[11px] text-blue-400 mt-1 font-mono">Real-time DB sync</div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Cold Emails Dispatched</span>
            <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
              <Send className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{totalEmailsSent}</div>
          <div className="text-[11px] text-slate-500 mt-1">via Gmail / SMTP</div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">New Fresh Leads</span>
            <div className="p-2 bg-cyan-500/10 text-cyan-400 rounded-lg">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{newLeads}</div>
          <div className="text-[11px] text-slate-500 mt-1">Awaiting campaign</div>
        </Card>

        <Card className="p-4 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Replied Prospects 🔥</span>
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
              <Flame className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100 mt-2">{repliedLeads}</div>
          <div className="text-[11px] text-emerald-400 mt-1 font-medium">Warm prospects</div>
        </Card>
      </div>

      {/* RECENT ACTIVITY & LEADS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100">Recent Harvested Leads</h3>
            <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 p-0" asChild>
              <Link href="/leads">View All</Link>
            </Button>
          </div>

          {recentLeads.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-lg">
              No leads harvested yet. Use the Scraper to add leads.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentLeads.map((lead) => (
                <div key={lead.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-200">{lead.name}</div>
                    <div className="text-[11px] text-slate-400">{lead.email}</div>
                  </div>
                  <Badge variant="outline" className="bg-blue-500/10 text-blue-400 border-blue-500/20 text-[10px]">
                    {lead.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-5 bg-slate-900/60 border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-100">Recent Cold Outreach</h3>
            <Button variant="ghost" size="sm" className="text-xs text-blue-400 hover:text-blue-300 p-0" asChild>
              <Link href="/emails">View History</Link>
            </Button>
          </div>

          {recentEmails.length === 0 ? (
            <div className="text-xs text-slate-500 py-6 text-center border border-dashed border-slate-800 rounded-lg">
              No cold emails dispatched yet.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentEmails.map((email) => (
                <div key={email.id} className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                  <div className="max-w-[70%]">
                    <div className="font-semibold text-slate-200 truncate">{email.subject}</div>
                    <div className="text-[11px] text-slate-400 truncate">{email.lead?.email || 'Lead'}</div>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                    SENT
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}