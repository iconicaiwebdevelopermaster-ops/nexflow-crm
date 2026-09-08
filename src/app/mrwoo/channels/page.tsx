import { prisma } from '@/lib/prisma';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  const users = await prisma.user.findMany({
    select: {
      email: true, name: true, smtpUser: true, smtpHost: true,
      gmailAccounts: { select: { email: true, isActive: true, sentToday: true, dailyQuota: true } },
    },
  });

  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Sending Channels</h1>
        <p className="text-sm text-slate-400 mt-1">Gmail OAuth vs Manual SMTP per user</p>
      </div>
      <div className="space-y-3">
        {users.map((u, i) => (
          <Card key={i} className="p-4 bg-slate-900/70 border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <div className="font-medium text-slate-100">{u.name || 'User'}</div>
                <div className="text-[11px] text-slate-500 font-mono">{u.email}</div>
              </div>
              <div className="flex flex-wrap gap-2">
                {u.gmailAccounts?.length > 0 ? (
                  u.gmailAccounts.map((g: any, j: number) => (
                    <Badge key={j} className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                      OAuth: {g.email} ({g.sentToday}/{g.dailyQuota})
                    </Badge>
                  ))
                ) : null}
                {u.smtpUser ? (
                  <Badge className="bg-purple-500/10 text-purple-400 border-purple-500/20 text-[10px]">
                    SMTP: {u.smtpUser} @ {u.smtpHost || 'default'}
                  </Badge>
                ) : null}
                {!u.gmailAccounts?.length && !u.smtpUser && (
                  <Badge variant="outline" className="border-slate-700 text-slate-500 text-[10px]">Not configured</Badge>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}