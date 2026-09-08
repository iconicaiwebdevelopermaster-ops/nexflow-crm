import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Server } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MrwooUsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, name: true, email: true, role: true, createdAt: true, smtpUser: true,
      _count: { select: { leads: true, emailsSent: true, gmailAccounts: true, scraperSearches: true } },
    },
  });

  return (
    <div className="space-y-5 max-w-7xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">All Users</h1>
        <p className="text-sm text-slate-400 mt-1">SaaS User Accounts & Usage Stats</p>
      </div>
      <Card className="p-4 bg-slate-900/70 border-slate-800 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="text-[10px] uppercase text-slate-500 border-b border-slate-800">
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
            {users.map((u) => (
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
                <td className="py-2.5 pr-3 text-blue-400 font-semibold">{u._count.leads}</td>
                <td className="py-2.5 pr-3 text-purple-400 font-semibold">{u._count.emailsSent}</td>
                <td className="py-2.5 pr-3 text-amber-400 font-semibold">{u._count.scraperSearches}</td>
                <td className="py-2.5 pr-3">
                  {u._count.gmailAccounts > 0 ? (
                    <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> OAuth</span>
                  ) : u.smtpUser ? (
                    <span className="text-purple-400 flex items-center gap-1"><Server className="w-3 h-3" /> SMTP</span>
                  ) : <span className="text-slate-500">—</span>}
                </td>
                <td className="py-2.5 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}