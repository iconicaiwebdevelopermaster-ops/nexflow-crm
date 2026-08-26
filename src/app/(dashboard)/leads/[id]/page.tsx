import { PageHeader } from "@/components/layout/PageHeader";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import { LeadStatus } from "@/types";
import { Mail, Globe, Phone, Building, Calendar, ArrowLeft, History } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  const session = await auth();

  const lead = await prisma.lead.findFirst({
    where: { id: params.id, userId: session?.user?.id },
    include: {
      activities: { orderBy: { createdAt: "desc" } },
      emailsSent: { orderBy: { sentAt: "desc" } },
    },
  });

  if (!lead) notFound();

  return (
    <div>
      <div className="mb-4">
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads
        </Link>
      </div>

      <PageHeader title={lead.name} description={`Prospect from ${lead.source || "Direct"}`}>
        <div className="flex items-center gap-3">
          <LeadStatusBadge status={lead.status as LeadStatus} />
          <Link href={`/emails/compose?leadId=${lead.id}`}>
            <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5 h-9">
              <Mail className="w-4 h-4" /> Send Cold Email
            </Button>
          </Link>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800 space-y-4">
            <h3 className="text-sm font-semibold text-white">Contact Details</h3>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-3 text-slate-300">
                <Mail className="w-4 h-4 text-slate-500" />
                <span>{lead.email}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Building className="w-4 h-4 text-slate-500" />
                <span>{lead.company || "No company specified"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Phone className="w-4 h-4 text-slate-500" />
                <span>{lead.phone || "No phone added"}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300">
                <Globe className="w-4 h-4 text-slate-500" />
                {lead.website ? (
                  <a href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`} target="_blank" className="text-blue-400 hover:underline">
                    {lead.website}
                  </a>
                ) : (
                  <span>No website added</span>
                )}
              </div>
              <div className="flex items-center gap-3 text-slate-400 pt-2 border-t border-slate-800/80">
                <Calendar className="w-4 h-4 text-slate-500" />
                <span>Created {formatDate(lead.createdAt)}</span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800 space-y-2">
            <h3 className="text-sm font-semibold text-white">Notes</h3>
            <p className="text-xs text-slate-400 whitespace-pre-wrap leading-relaxed">
              {lead.notes || "No discovery notes added yet."}
            </p>
          </div>
        </div>

        <div className="lg:col-span-2 p-6 rounded-2xl bg-[#0E131F] border border-slate-800 space-y-6">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-blue-400" />
            <h3 className="text-sm font-semibold text-white">Activity Timeline</h3>
          </div>

          <div className="space-y-4">
            {lead.activities.length === 0 ? (
              <p className="text-xs text-slate-500">No activity logged yet.</p>
            ) : (
              lead.activities.map((act) => (
                <div key={act.id} className="flex items-start gap-3 text-xs pb-3 border-b border-slate-800/60 last:border-0">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-slate-200 font-medium">{act.description}</p>
                    <span className="text-[10px] text-slate-500">{formatDate(act.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}