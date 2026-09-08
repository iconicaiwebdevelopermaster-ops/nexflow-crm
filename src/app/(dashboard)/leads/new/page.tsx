export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { PageHeader } from "@/components/layout/PageHeader";
import { LeadForm } from "@/components/forms/LeadForm";

export default function NewLeadPage() {
  return (
    <div>
      <PageHeader
        title="Add New Prospect"
        description="Fill in lead details to start cold outreach automation."
      />
      <div className="bg-[#0E131F] border border-slate-800 rounded-2xl p-6">
        <LeadForm />
      </div>
    </div>
  );
}