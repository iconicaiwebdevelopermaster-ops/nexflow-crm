import { getServerSession } from "next-auth";
import Link from "next/link";
import prisma from "@/lib/prisma";

const DEFAULT_TEMPLATES = [
  {
    id: "default-1",
    name: "Cold Outreach - Quick Question",
    subject: "Quick question regarding {{company}}'s growth",
    body: "Hi {{firstName}},\n\nI noticed you are leading the team at {{company}}. We recently helped a similar company scale their outbound pipeline by 3x.\n\nWould you be open to a quick 5-minute chat this Thursday?\n\nBest,\n{{yourName}}",
    category: "Cold Outreach",
  },
  {
    id: "default-2",
    name: "Gentle Follow-Up (Day 3)",
    subject: "Re: Quick question regarding {{company}}'s growth",
    body: "Hi {{firstName}},\n\nJust following up on my previous note in case it got buried. Any thoughts on exploring this?\n\nBest,\n{{yourName}}",
    category: "Follow Up",
  },
  {
    id: "default-3",
    name: "Demo / Meeting Invite",
    subject: "Exclusive preview for {{company}}",
    body: "Hi {{firstName}},\n\nI would love to share a short 3-minute preview on how NexFlow automates your entire lead workflow.\n\nLet me know if you would like me to send the link over!\n\nBest,\n{{yourName}}",
    category: "Pitch",
  },
];

export default async function TemplatesPage() {
  let userTemplates: any[] = [];
  
  try {
    const session = await getServerSession();
    const userId = (session?.user as any)?.id;
    
    if (userId) {
      userTemplates = await prisma.template.findMany({
        where: { userId: userId },
        orderBy: { createdAt: "desc" },
      }).catch(() => []);
    }
  } catch (error) {
    userTemplates = [];
  }

  const allTemplates = (userTemplates && userTemplates.length > 0) ? userTemplates : DEFAULT_TEMPLATES;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            ✉️ Email Templates
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Create, manage, and customize personalized cold outreach templates.
          </p>
        </div>
        <Link
          href="/compose"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
        >
          + Compose with AI
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allTemplates.map((template: any) => (
          <div
            key={template.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {template.category || "General"}
                </span>
              </div>
              <h3 className="font-semibold text-lg text-white mb-2 line-clamp-1">
                {template.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mb-3 bg-slate-950 p-2 rounded border border-slate-800/80">
                <strong className="text-slate-300">Subject:</strong> {template.subject}
              </p>
              <p className="text-sm text-slate-300 whitespace-pre-line line-clamp-5 leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/50 font-sans">
                {template.body}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Variables: {'{{firstName}}'}, {'{{company}}'}</span>
              <Link
                href={`/compose?templateId=${template.id}`}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Use Template →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
