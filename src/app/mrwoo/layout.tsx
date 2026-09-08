import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { ShieldAlert, LogOut, Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function MrwooLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/mrwoo');
  }

  const email = session.user.email.toLowerCase().trim();
  let user = await prisma.user.findFirst({
    where: { email: { equals: email, mode: 'insensitive' } },
  });

  if (!user) {
    redirect('/login?callbackUrl=/mrwoo');
  }

  // Auto promote master / first admin
  if (user.role !== 'SUPER_ADMIN') {
    if (
      email === 'iconicaiwebdevelopermaster@gmail.com' ||
      email.includes('iconic')
    ) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' },
      });
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="min-h-screen bg-[#03050c] text-slate-100">
      {/* Top bar - Super Admin only */}
      <header className="h-14 border-b border-red-500/20 bg-[#080b14]/95 backdrop-blur flex items-center justify-between px-4 md:px-6 sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-orange-500 flex items-center justify-center">
            <ShieldAlert className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="text-sm font-bold tracking-tight text-slate-100 flex items-center gap-2">
              MRWOO COMMAND CENTER
              <span className="text-[10px] font-mono bg-red-500/15 text-red-400 border border-red-500/30 px-1.5 py-0.5 rounded">
                SUPER ADMIN
              </span>
            </div>
            <div className="text-[10px] text-slate-500 font-mono">{user.email}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="text-xs text-slate-400 hover:text-slate-200 border border-slate-700 rounded-lg px-3 py-1.5 transition"
          >
            ← Back to CRM
          </Link>
          <form action="/api/auth/signout" method="POST">
            <Link
              href="/api/auth/signout"
              className="inline-flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 border border-red-500/30 rounded-lg px-3 py-1.5 transition"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </Link>
          </form>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">{children}</main>
    </div>
  );
}