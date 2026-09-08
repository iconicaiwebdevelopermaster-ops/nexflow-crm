import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MrwooLeadsPage() {
  const leads = await prisma.lead.findMany({
    take: 100,
    orderBy: { createdAt: 'desc' },
    include: { user: { select: { email: true, name: true } } },
  });

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">All Leads</h1>
        <p className="text-sm text-slate-400 mt-1">Platform Leads (Latest 100)</p>
      </div>
      <Card className="p-4 bg-slate-900/70 border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
            <tr>
              <th className="py-2 pr-3">Lead</th>
              <th className="py-2 pr-3">Company</th>
              <th className="py-2 pr-3">Status</th>
              <th className="py-2 pr-3">Source</th>
              <th className="py-2 pr-3">Owner</th>
              <th className="py-2">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {leads.map((l) => (
              <tr key={l.id} className="hover:bg-slate-950/40">
                <td className="py-2.5 pr-3">
                  <div className="font-medium text-slate-100">{l.name}</div>
                  <div className="text-[11px] text-slate-500">{l.email}</div>
                </td>
                <td className="py-2.5 pr-3 text-slate-300">{l.company || '—'}</td>
                <td className="py-2.5 pr-3"><Badge variant="outline" className="text-[10px] border-slate-700">{l.status}</Badge></td>
                <td className="py-2.5 pr-3 text-slate-400">{l.source || '—'}</td>
                <td className="py-2.5 pr-3 text-slate-400 font-mono text-[11px]">{l.user?.email}</td>
                <td className="py-2.5 text-slate-500">{new Date(l.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}