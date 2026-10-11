import { getServerSession } from "next-auth";
import Link from "next/link";
import prisma from "@/lib/prisma";

const DEFAULT_TASKS = [
  {
    id: "task-1",
    title: "Follow up with warm lead from LinkedIn Harvester",
    description: "Send personalized proposal email via DeepSeek composer.",
    priority: "HIGH",
    status: "PENDING",
    dueDate: "Today",
    category: "Outreach"
  },
  {
    id: "task-2",
    title: "Verify Google Places lead batch",
    description: "Run automated MX & disposable email validation before bulk dispatch.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    dueDate: "Tomorrow",
    category: "Data Hygiene"
  },
  {
    id: "task-3",
    title: "Review daily cron auto-reply sentiment logs",
    description: "Check pipeline moves for leads classified as MEETING_REQUESTED.",
    priority: "LOW",
    status: "COMPLETED",
    dueDate: "Completed",
    category: "Pipeline"
  }
];

export default async function TasksPage() {
  let userTasks: any[] = [];

  try {
    const session = await getServerSession();
    const userId = (session?.user as any)?.id;

    if (userId && (prisma as any).task) {
      userTasks = await (prisma as any).task.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
      }).catch(() => []) || [];
    }
  } catch (error) {
    userTasks = [];
  }

  const allTasks = (userTasks && userTasks.length > 0) ? userTasks : DEFAULT_TASKS;

  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case "COMPLETED":
        return "bg-emerald-500/20 text-emerald-300";
      case "IN_PROGRESS":
        return "bg-blue-500/20 text-blue-300";
      default:
        return "bg-slate-800 text-slate-400";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            📋 Task Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track follow-ups, outreach actions, and pipeline deal to-dos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/scraper"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ⚡ Harvest Leads
          </Link>
          <Link
            href="/compose"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
          >
            + New Email
          </Link>
        </div>
      </div>

      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-medium">Total Active Tasks</p>
          <p className="text-2xl font-bold text-white mt-1">{allTasks.length}</p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-medium">Pending Follow-ups</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {allTasks.filter((t: any) => t.status !== "COMPLETED").length}
          </p>
        </div>
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <p className="text-xs text-slate-400 font-medium">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {allTasks.filter((t: any) => t.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* Task Rows */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800">
          {allTasks.map((task: any) => (
            <div
              key={task.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <span className="mt-1 flex h-2.5 w-2.5 rounded-full bg-indigo-500" />
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-medium text-white text-base">{task.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${getPriorityBadge(task.priority)}`}>
                      {task.priority || "NORMAL"}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded font-medium ${getStatusBadge(task.status)}`}>
                      {task.status?.replace("_", " ") || "PENDING"}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{task.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pl-5 md:pl-0">
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  Due: {task.dueDate || "Flexible"}
                </span>
                <span className="text-slate-500">{task.category || "General"}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
