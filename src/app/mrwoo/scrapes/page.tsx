import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MrwooScrapesPage() {
  let scrapes: any[] = [];
  try {
    scrapes = await prisma.scraperSearch.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { email: true, name: true } } },
    });
  } catch {}

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Scraper Audit Log</h1>
        <p className="text-sm text-slate-400 mt-1">Search queries executed across all accounts</p>
      </div>
      <Card className="p-4 bg-slate-900/70 border-slate-800 overflow-x-auto">
        {scrapes.length === 0 ? (
          <p className="text-xs text-slate-500 py-8 text-center">No scraper searches logged yet.</p>
        ) : (
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
              <tr>
                <th className="py-2 pr-3">Query</th>
                <th className="py-2 pr-3">Source</th>
                <th className="py-2 pr-3">City / Niche</th>
                <th className="py-2 pr-3">Results</th>
                <th className="py-2 pr-3">User</th>
                <th className="py-2">When</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {scrapes.map((s) => (
                <tr key={s.id} className="hover:bg-slate-950/40">
                  <td className="py-2.5 pr-3 font-medium text-slate-100">{s.query}</td>
                  <td className="py-2.5 pr-3 text-slate-400">{s.source}</td>
                  <td className="py-2.5 pr-3 text-slate-400">{[s.city, s.niche].filter(Boolean).join(' / ') || '—'}</td>
                  <td className="py-2.5 pr-3">
                    <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-[10px]">+{s.resultsCount}</Badge>
                  </td>
                  <td className="py-2.5 pr-3 font-mono text-[11px] text-slate-400">{s.user?.email}</td>
                  <td className="py-2.5 text-slate-500">{new Date(s.createdAt).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  );
}