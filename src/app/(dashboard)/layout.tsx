import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { Sidebar } from '@/components/layout/Sidebar';
import { Navbar } from '@/components/layout/Navbar';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  let userRole = 'USER';
  if (session?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true },
    });
    if (dbUser?.role) {
      userRole = dbUser.role;
    }
  }

  return (
    <div className="flex min-h-screen bg-[#070A12] text-slate-100">
      {/* Sidebar */}
      <div className="hidden md:flex sticky top-0 h-screen">
        <Sidebar userRole={userRole} />
      </div>

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar />
        <main className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5">
          {children}
        </main>
      </div>
    </div>
  );
}