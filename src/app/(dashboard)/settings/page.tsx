import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertTriangle, ShieldCheck, Zap } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const gmailAccount = await prisma.gmailAccount.findFirst({
    where: { userId: session.user.id },
  });

  return (
    <div className="space-y-6 max-w-4xl">
      <PageHeader
        title="Settings & Integrations"
        description="Manage your sending accounts, AI models, and outreach configuration."
      />

      <div className="grid gap-6">
        {/* Gmail OAuth Integration Card */}
        <Card className="p-6 bg-slate-900/60 border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-100 text-lg">Gmail Outreach Engine</h3>
                  {gmailAccount?.isActive ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-amber-500/40 text-amber-400 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Not Connected
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  Connect your Gmail via Google OAuth 2.0 for inbox-grade deliverability and auto reply detection.
                </p>
              </div>
            </div>

            <div>
              {gmailAccount?.isActive ? (
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">{gmailAccount.email}</div>
                  <Button variant="outline" size="sm" className="mt-2 text-xs border-slate-700" asChild>
                    <Link href="/api/auth/gmail">Reconnect Account</Link>
                  </Button>
                </div>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-medium" asChild>
                  <Link href="/api/auth/gmail">Connect Gmail Account</Link>
                </Button>
              )}
            </div>
          </div>

          {gmailAccount?.isActive && (
            <div className="mt-6 pt-6 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Daily Sending Quota</div>
                <div className="text-lg font-bold text-slate-100 mt-1">
                  {gmailAccount.sentToday} / {gmailAccount.dailyQuota}
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div
                    className="bg-blue-500 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, (gmailAccount.sentToday / gmailAccount.dailyQuota) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Deliverability Mode</div>
                <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-4 h-4" /> Inbox-Grade OAuth
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Bypasses spam filters</div>
              </div>

              <div className="p-3 rounded-lg bg-slate-950/60 border border-slate-800">
                <div className="text-xs text-slate-400">Follow-up Engine</div>
                <div className="text-sm font-semibold text-purple-400 mt-1 flex items-center gap-1">
                  <Zap className="w-4 h-4" /> 4-Day Smart Delay
                </div>
                <div className="text-[11px] text-slate-500 mt-1">Auto-cancels on reply</div>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}