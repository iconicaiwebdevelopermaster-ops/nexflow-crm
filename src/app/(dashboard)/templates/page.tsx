import { PageHeader } from "@/components/layout/PageHeader";
import { TemplateCard } from "@/components/email/TemplateCard";
import { prisma } from "@/lib/db";

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <PageHeader
        title="Cold Outreach Templates"
        description="High-converting battle-tested templates pre-seeded for NexPulseLabs outreach."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((t) => (
          <TemplateCard
            key={t.id}
            id={t.id}
            name={t.name}
            category={t.category}
            subject={t.subject}
            body={t.body}
          />
        ))}
      </div>
    </div>
  );
}