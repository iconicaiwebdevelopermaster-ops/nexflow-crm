import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const [users, leads, emails, scrapes] = await Promise.all([
    prisma.user.count(),
    prisma.lead.count(),
    prisma.emailSent.count(),
    prisma.scraperSearch.count().catch(() => 0),
  ]);

  const avgLeads = users > 0 ? (leads / users).toFixed(1) : '0';
  const avgEmails = users > 0 ? (emails / users).toFixed(1) : '0';

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Live Analytics</h1>
        <p className="text-sm text-slate-400 mt-1">High-level platform ratios</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 bg-slate-900/70 border-slate-800">
          <div className="text-xs text-slate-400">Avg Leads / User</div>
          <div className="text-3xl font-bold text-cyan-400 mt-2">{avgLeads}</div>
        </Card>
        <Card className="p-5 bg-slate-900/70 border-slate-800">
          <div className="text-xs text-slate-400">Avg Emails / User</div>
          <div className="text-3xl font-bold text-purple-400 mt-2">{avgEmails}</div>
        </Card>
        <Card className="p-5 bg-slate-900/70 border-slate-800">
          <div className="text-xs text-slate-400">Total Scraper Runs</div>
          <div className="text-3xl font-bold text-amber-400 mt-2">{scrapes}</div>
        </Card>
      </div>
      <Card className="p-5 bg-slate-900/70 border-slate-800 text-sm text-slate-400">
        Totals — Users: <b className="text-slate-100">{users}</b> · Leads: <b className="text-slate-100">{leads}</b> · Emails: <b className="text-slate-100">{emails}</b>
      </Card>
    </div>
  );
}