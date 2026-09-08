export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { KanbanBoard } from "@/components/kanban/KanbanBoard";
import { PageHeader } from "@/components/layout/PageHeader";


export default async function KanbanPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const leads = await prisma.lead.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-4">
      <PageHeader
        title="Visual Lead Pipeline"
        description="Drag and drop leads to update stages in real-time."
      />
      <KanbanBoard initialLeads={leads} />
    </div>
  );
}