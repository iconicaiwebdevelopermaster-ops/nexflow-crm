import { PageHeader } from "@/components/layout/PageHeader";
import { LeadTable } from "@/components/leads/LeadTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, Upload } from "lucide-react";
import Link from "next/link";

export default async function LeadsPage() {
  const session = await auth();

  const leads = await prisma.lead.findMany({
    where: { userId: session?.user?.id },
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: { emailsSent: true },
      },
    },
  });

  return (
    <div>
      <PageHeader
        title="Lead Directory"
        description="Manage, track and convert high-ticket prospects."
      >
        <div className="flex items-center gap-2">
          <Link href="/leads/import">
            <Button variant="outline" className="border-slate-800 text-slate-300 hover:bg-slate-800 text-xs gap-1.5 h-9">
              <Upload className="w-3.5 h-3.5" />
              Bulk Import
            </Button>
          </Link>
          <Link href="/leads/new">
            <Button className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs gap-1.5 h-9">
              <Plus className="w-4 h-4" />
              Add New Lead
            </Button>
          </Link>
        </div>
      </PageHeader>

      {leads.length === 0 ? (
        <EmptyState
          title="No Leads Added Yet"
          description="Start building your pipeline by adding your first local business or B2B prospect."
          actionText="Add First Lead"
          actionHref="/leads/new"
        />
      ) : (
        <LeadTable initialLeads={leads} />
      )}
    </div>
  );
}