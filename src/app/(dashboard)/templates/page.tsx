"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Template {
  id: string;
  name: string;
  subject: string;
  body: string;
  category: "Cold Outreach" | "Follow Up" | "Pitch" | "Demo";
}

const TEMPLATES: Template[] = [
  {
    id: "tpl-1",
    name: "Cold Outreach - Quick Question",
    subject: "Quick question regarding {{company}}'s outbound scaling",
    body: "Hi {{firstName}},\n\nI noticed you are leading the team at {{company}}. We recently helped a similar B2B team scale their pipeline by 3x using autonomous AI email sequences.\n\nWould you be open to a quick 5-minute chat this Thursday?\n\nBest,\n{{yourName}}",
    category: "Cold Outreach"
  },
  {
    id: "tpl-2",
    name: "Gentle Follow-Up (Day 3)",
    subject: "Re: Quick question regarding {{company}}'s outbound scaling",
    body: "Hi {{firstName}},\n\nJust following up on my previous note in case it got buried under your inbox. Any thoughts on exploring this for {{company}}?\n\nBest,\n{{yourName}}",
    category: "Follow Up"
  },
  {
    id: "tpl-3",
    name: "Executive Demo & Product Preview",
    subject: "Exclusive preview for {{company}}",
    body: "Hi {{firstName}},\n\nI prepared a short 2-minute video walkthrough showing how NexFlow harvests validated leads and drafts personalized emails in seconds.\n\nShould I send the demo link over?\n\nBest,\n{{yourName}}",
    category: "Pitch"
  },
  {
    id: "tpl-4",
    name: "Breakup / Final Attempt",
    subject: "Permission to close your file, {{firstName}}?",
    body: "Hi {{firstName}},\n\nI have reached out a couple of times but haven't heard back, so I assume this is not a priority for {{company}} right now.\n\nIf anything changes in the future, feel free to reach back out.\n\nBest regards,\n{{yourName}}",
    category: "Follow Up"
  }
];

export default function TemplatesPage() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const copyTemplate = (template: Template) => {
    navigator.clipboard.writeText(`Subject: ${template.subject}\n\n${template.body}`);
    setCopiedId(template.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            ✉️ Email Templates
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            High-converting cold outreach sequences ready for AI personalization.
          </p>
        </div>
        <Link
          href="/compose"
          className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
        >
          + Compose with AI
        </Link>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map(template => (
          <div
            key={template.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-6 hover:border-slate-700 transition-all flex flex-col justify-between shadow-lg"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  {template.category}
                </span>
                <button
                  onClick={() => copyTemplate(template)}
                  className="text-xs px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700 transition-colors"
                >
                  {copiedId === template.id ? "✓ Copied!" : "Copy Text"}
                </button>
              </div>

              <h3 className="font-semibold text-lg text-white mb-2">
                {template.name}
              </h3>
              <p className="text-xs text-slate-400 font-mono mb-3 bg-slate-950 p-2.5 rounded border border-slate-800">
                <strong className="text-slate-300">Subject:</strong> {template.subject}
              </p>
              <p className="text-sm text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950/40 p-3 rounded-lg border border-slate-800/60 font-sans">
                {template.body}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500">Variables: {'{{firstName}}'}, {'{{company}}'}</span>
              <Link
                href={`/compose?subject=${encodeURIComponent(template.subject)}`}
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
              >
                Use in Composer →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
