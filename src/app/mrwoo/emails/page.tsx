import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MrwooEmailsPage() {
  const emails = await prisma.emailSent.findMany({
    take: 100,
    orderBy: { sentAt: 'desc' },
    include: {
      lead: { select: { name: true, email: true, company: true } },
      user: { select: { email: true } },
    },
  });

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Email Activity</h1>
        <p className="text-sm text-slate-400 mt-1">Emails sent across all accounts (Latest 100)</p>
      </div>
      <Card className="p-4 bg-slate-900/70 border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
            <tr>
              <th className="py-2 pr-3">Subject</th>
              <th className="py-2 pr-3">To Lead</th>
              <th className="py-2 pr-3">From User</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2">Sent At</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {emails.map((e) => (
              <tr key={e.id} className="hover:bg-slate-950/40">
                <td className="py-2.5 pr-3 font-medium text-slate-100 max-w-[220px] truncate">{e.subject}</td>
                <td className="py-2.5 pr-3">
                  <div className="text-slate-300">{e.lead?.name}</div>
                  <div className="text-[11px] text-slate-500">{e.lead?.email}</div>
                </td>
                <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-400">{e.user?.email}</td>
                <td className="py-2.5 pr-3">
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">{e.status}</Badge>
                </td>
                <td className="py-2.5 text-slate-500">{new Date(e.sentAt).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}