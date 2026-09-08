import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const grouped = await prisma.lead.groupBy({ by: ['status'], _count: { status: true } });
  const total = grouped.reduce((a, g) => a + g._count.status, 0);

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Pipeline Stats</h1>
        <p className="text-sm text-slate-400 mt-1">All users ke leads ka stage breakdown</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
        {grouped.map((g) => {
          const pct = total ? Math.round((g._count.status / total) * 100) : 0;
          return (
            <Card key={g.status} className="p-4 bg-slate-900/70 border-slate-800">
              <Badge variant="outline" className="border-slate-700 text-[10px] mb-2">{g.status}</Badge>
              <div className="text-2xl font-bold text-slate-100">{g._count.status}</div>
              <div className="text-[11px] text-slate-500 mt-1">{pct}% of total</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}