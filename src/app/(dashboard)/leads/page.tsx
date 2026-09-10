import { auth } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import PageHeader from '@/components/layout/PageHeader';
import { LeadTable } from '@/components/leads/LeadTable';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Plus, Radar } from 'lucide-react';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LeadsPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect('/login?callbackUrl=/leads');
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    redirect('/login');
  }

  // Fetch leads directly on server side
  const leads = await prisma.lead.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="Harvested Leads CRM"
        description={`Manage, filter, and execute cold outreach for your ${leads.length} harvested prospects.`}
      >
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="border-slate-800 text-xs" asChild>
            <Link href="/scraper">
              <Radar className="w-3.5 h-3.5 mr-1.5 text-blue-400" /> Lead Scraper
            </Link>
          </Button>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-500 text-white text-xs" asChild>
            <Link href="/compose">
              <Plus className="w-3.5 h-3.5 mr-1.5" /> AI Campaign
            </Link>
          </Button>
        </div>
      </PageHeader>

      <LeadTable initialLeads={leads} />
    </div>
  );
}