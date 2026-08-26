import { PageHeader } from "@/components/layout/PageHeader";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/shared/EmptyState";
import Link from "next/link";

export default async function EmailHistoryPage() {
  const session = await auth();

  const history = await prisma.emailSent.findMany({
    where: { userId: session?.user?.id },
    orderBy: { sentAt: "desc" },
    include: {
      lead: true,
      template: true,
    },
  });

  return (
    <div>
      <PageHeader
        title="Email Outreach Logs"
        description="Complete history of all cold emails dispatched through NexFlow."
      />

      {history.length === 0 ? (
        <EmptyState
          title="No Emails Sent Yet"
          description="Pick a lead and dispatch your first personalized pitch."
          actionText="Compose Email"
          actionHref="/emails/compose"
        />
      ) : (
        <div className="rounded-xl border border-slate-800 bg-[#0E131F] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/80 border-b border-slate-800 text-slate-400 font-medium">
                <tr>
                  <th className="p-3.5 pl-4">Recipient</th>
                  <th className="p-3.5">Subject</th>
                  <th className="p-3.5">Template</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-4 text-right">Sent Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-3.5 pl-4">
                      <Link href={`/leads/${h.lead.id}`} className="font-medium text-white hover:text-blue-400">
                        {h.lead.name}
                      </Link>
                      <span className="text-[11px] text-slate-500 block font-mono">{h.lead.email}</span>
                    </td>
                    <td className="p-3.5 max-w-xs truncate text-slate-200">{h.subject}</td>
                    <td className="p-3.5 text-slate-400">{h.template?.name || "Custom Pitch"}</td>
                    <td className="p-3.5">
                      {h.status === "SENT" ? (
                        <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                          Sent
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/30">
                          Failed
                        </Badge>
                      )}
                    </td>
                    <td className="p-3.5 pr-4 text-right text-slate-400">{formatDate(h.sentAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}