import { PageHeader } from "@/components/layout/PageHeader";
import { TaskList } from "@/components/tasks/TaskList";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function TasksPage() {
  const session = await auth();

  const [tasks, leads] = await Promise.all([
    prisma.task.findMany({
      where: { userId: session?.user?.id },
      orderBy: { createdAt: "desc" },
      include: { lead: true },
    }),
    prisma.lead.findMany({
      where: { userId: session?.user?.id },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Action Items & Follow-ups"
        description="Stay on top of deal follow-ups, calls, and daily agency outreach tasks."
      />
      <TaskList initialTasks={tasks} leads={leads} />
    </div>
  );
}