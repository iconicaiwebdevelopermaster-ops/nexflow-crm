export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function TemplatesPage() {
  const templates = await prisma.template.findMany({
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Email Templates</h1>
        <p className="text-xs text-slate-400">Pre-configured cold outreach email templates.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {templates.map((tpl: any) => (
          <div key={tpl.id} className="p-5 border border-slate-800 bg-[#0E131F] rounded-xl space-y-2">
            <h3 className="font-bold text-blue-400 text-sm">{tpl.name}</h3>
            <p className="text-xs text-slate-300 font-semibold">Subject: {tpl.subject}</p>
            <p className="text-xs text-slate-400 line-clamp-3 italic">{tpl.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}