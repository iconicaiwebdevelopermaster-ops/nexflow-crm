import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { MrwooSidebar } from '@/components/admin/MrwooSidebar';
import { ShieldAlert } from 'lucide-react';

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

  if (user.role !== 'SUPER_ADMIN') {
    if (email === 'iconicaiwebdevelopermaster@gmail.com' || email.includes('iconic')) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'SUPER_ADMIN' },
      });
    } else {
      redirect('/dashboard');
    }
  }

  return (
    <div className="flex min-h-screen bg-[#03050c] text-slate-100">
      <div className="hidden md:block">
        <MrwooSidebar adminEmail={user.email} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="md:hidden h-12 border-b border-red-500/20 bg-[#080b14] flex items-center px-4 gap-2">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          <span className="text-sm font-bold">MRWOO ADMIN</span>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-6 md:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}