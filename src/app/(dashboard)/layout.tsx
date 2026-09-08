import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userRole = 'USER';

  try {
    const session = await auth();
    if (session?.user?.email) {
      const dbUser = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { role: true },
      });
      if (dbUser?.role) {
        userRole = dbUser.role;
      }
    }
  } catch (err) {
    console.error('Layout Auth Session Error:', err);
  }

  return (
    <div className="flex min-h-screen bg-[#070A12] text-slate-100">
      <div className="hidden md:flex sticky top-0 h-screen">
        <Sidebar userRole={userRole} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}