import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Mail, CheckCircle2, AlertTriangle, ShieldCheck, Zap, Server } from 'lucide-react';
import { SettingsForm } from '@/components/forms/SettingsForm';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect('/login');
  }

  const [gmailAccount, user] = await Promise.all([
    prisma.gmailAccount.findFirst({
      where: { userId: session.user.id },
    }),
    prisma.user.findUnique({
      where: { id: session.user.id },
      select: { smtpHost: true, smtpPort: true, smtpUser: true, smtpPass: true },
    }),
  ]);

  return (
    <div className="space-y-6 max-w-4xl pb-10">
      <PageHeader
        title="Settings & Outreach Config"
        description="Choose Gmail OAuth 2.0 or Manual SMTP/App Password for sending cold emails."
      />

      <div className="grid gap-6">
        {/* OPTION 1: Gmail OAuth Integration Card */}
        <Card className="p-6 bg-slate-900/60 border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-blue-400">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-100 text-base">Method 1: Gmail OAuth 2.0 (Recommended)</h3>
                  {gmailAccount?.isActive ? (
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Connected
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="border-slate-700 text-slate-400">
                      Optional
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  1-Click Google authorization for inbox-grade deliverability and auto reply detection.
                </p>
              </div>
            </div>

            <div>
              {gmailAccount?.isActive ? (
                <div className="text-right">
                  <div className="text-xs text-slate-400 font-mono">{gmailAccount.email}</div>
                  <Button variant="outline" size="sm" className="mt-2 text-xs border-slate-700" asChild>
                    <Link href="/api/auth/gmail">Reconnect</Link>
                  </Button>
                </div>
              ) : (
                <Button className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-9 px-4" asChild>
                  <Link href="/api/auth/gmail">Connect Gmail Account</Link>
                </Button>
              )}
            </div>
          </div>
        </Card>

        {/* OPTION 2: Manual SMTP / App Password Card */}
        <Card className="p-6 bg-slate-900/60 border-slate-800">
          <div className="flex items-start gap-4 mb-4">
            <div className="p-3 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400">
              <Server className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-base">Method 2: Manual SMTP / App Password</h3>
                {user?.smtpUser && user?.smtpPass ? (
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Configured
                  </Badge>
                ) : (
                  <Badge variant="outline" className="border-slate-700 text-slate-400">
                    Fallback
                  </Badge>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Enter Gmail App Password or custom SMTP credentials (SendGrid, Mailgun, Hostinger, Private Server).
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/60">
            <SettingsForm initialSmtp={user} />
          </div>
        </Card>
      </div>
    </div>
  );
}