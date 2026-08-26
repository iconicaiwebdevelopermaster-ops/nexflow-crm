"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Send, Loader2, Sparkles, CheckCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface EmailComposerProps {
  leads: any[];
  templates: any[];
  defaultLeadId?: string;
  defaultTemplateId?: string;
}

export function EmailComposer({
  leads,
  templates,
  defaultLeadId = "",
  defaultTemplateId = "",
}: EmailComposerProps) {
  const router = useRouter();
  const [selectedLeadId, setSelectedLeadId] = useState(defaultLeadId);
  const [selectedTemplateId, setSelectedTemplateId] = useState(defaultTemplateId);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const selectedLead = leads.find((l) => l.id === selectedLeadId);

  // Variable replacement logic
  const replaceVariables = (text: string, lead: any) => {
    if (!lead) return text;
    return text
      .replace(/{{name}}/g, lead.name || "there")
      .replace(/{{company}}/g, lead.company || "your company")
      .replace(/{{website}}/g, lead.website || "your website");
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplateId(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl) {
      setSubject(replaceVariables(tmpl.subject, selectedLead));
      setBody(replaceVariables(tmpl.body, selectedLead));
    }
  };

  const handleLeadChange = (leadId: string) => {
    setSelectedLeadId(leadId);
    const newLead = leads.find((l) => l.id === leadId);
    const tmpl = templates.find((t) => t.id === selectedTemplateId);
    if (tmpl && newLead) {
      setSubject(replaceVariables(tmpl.subject, newLead));
      setBody(replaceVariables(tmpl.body, newLead));
    }
  };

  useEffect(() => {
    if (defaultTemplateId && templates.length > 0) {
      handleTemplateChange(defaultTemplateId);
    }
  }, [defaultTemplateId, templates]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId) {
      setError("Please select a recipient lead.");
      return;
    }
    if (!subject || !body) {
      setError("Subject and Body cannot be empty.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLeadId,
          templateId: selectedTemplateId || null,
          subject,
          body,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to dispatch email.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/emails/history");
        router.refresh();
      }, 1500);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSend} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Column: Form Controls */}
      <div className="lg:col-span-2 space-y-5 bg-[#0E131F] p-6 rounded-2xl border border-slate-800">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
            {error}
          </div>
        )}
        {success && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" /> Email dispatched successfully! Redirecting to history...
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Select Recipient (Lead) *</Label>
            <select
              value={selectedLeadId}
              onChange={(e) => handleLeadChange(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0A0D14] px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Choose a Lead --</option>
              {leads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.name} ({lead.company || lead.email})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>Load Template (Optional)</Label>
            <select
              value={selectedTemplateId}
              onChange={(e) => handleTemplateChange(e.target.value)}
              className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0A0D14] px-3 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">-- Custom Email / None --</option>
              {templates.map((tmpl) => (
                <option key={tmpl.id} value={tmpl.id}>
                  {tmpl.name} ({tmpl.category})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Subject Line *</Label>
          <Input
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="e.g. Quick question regarding {{company}}'s website"
            className="bg-[#0A0D14] border-slate-800 text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label>Email Body *</Label>
            <span className="text-[10px] text-slate-500 font-mono">Variables: {"{{name}}"}, {"{{company}}"}, {"{{website}}"}</span>
          </div>
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your email here..."
            rows={10}
            className="bg-[#0A0D14] border-slate-800 text-xs font-sans leading-relaxed"
          />
        </div>

        <Button
          type="submit"
          disabled={isLoading || success}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-6 h-9 gap-2"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
          {isLoading ? "Dispatching..." : "Send Cold Outreach"}
        </Button>
      </div>

      {/* Right Column: Live Recipient Info & Preview */}
      <div className="space-y-6">
        <div className="bg-[#0E131F] p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-400" />
            <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Recipient Details</h3>
          </div>

          {selectedLead ? (
            <div className="space-y-2.5 text-xs text-slate-300">
              <p><span className="text-slate-500">Name:</span> {selectedLead.name}</p>
              <p><span className="text-slate-500">To:</span> <span className="font-mono text-blue-400">{selectedLead.email}</span></p>
              <p><span className="text-slate-500">Company:</span> {selectedLead.company || "None"}</p>
              <p><span className="text-slate-500">Status:</span> {selectedLead.status}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500">Select a lead from the dropdown to preview variables.</p>
          )}
        </div>

        <div className="bg-[#0E131F] p-6 rounded-2xl border border-slate-800 space-y-3">
          <h3 className="text-xs font-semibold text-white uppercase tracking-wider">Quick Note</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Sending this email will automatically update the lead status to <span className="text-amber-400 font-semibold">CONTACTED</span> and log an event in your activity timeline.
          </p>
        </div>
      </div>
    </form>
  );
}