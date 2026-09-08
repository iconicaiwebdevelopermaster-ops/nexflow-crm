export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { PageHeader } from "@/components/layout/PageHeader";
import { EmailComposer } from "@/components/email/EmailComposer";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function ComposeEmailPage({
  searchParams,
}: {
  searchParams: { leadId?: string; templateId?: string };
}) {
  const session = await auth();

  const [leads, templates] = await Promise.all([
    prisma.lead.findMany({
      where: { userId: session?.user?.id },
      orderBy: { name: "asc" },
    }),
    prisma.template.findMany({
      orderBy: { createdAt: "asc" },
    }),
  ]);

  return (
    <div>
      <PageHeader
        title="Compose Cold Outreach"
        description="Send personalized emails directly via your connected SMTP."
      />
      <EmailComposer
        leads={leads}
        templates={templates}
        defaultLeadId={searchParams.leadId}
        defaultTemplateId={searchParams.templateId}
      />
    </div>
  );
}