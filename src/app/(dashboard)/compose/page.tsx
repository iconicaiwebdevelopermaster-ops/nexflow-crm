'use client';
import React, { useEffect, useState } from "react";
import {
  Send,
  User,
  Building2,
  Globe,
  Mail,
  RefreshCw,
  CheckCircle2,
  FileText,
  Zap,
  Users,
  Rocket,
  CheckSquare,
  Square,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string | null;
  website?: string | null;
  status?: string | null;
  source?: string | null;
}

const MY_TEST_EMAIL = "iconicaiwebdevelopermaster@gmail.com";

const TEMPLATES = [
  {
    id: "no-website",
    name: "No Website Pitch",
    category: "No Website",
    subject: "Quick question about {{company}} online presence",
    body: "Hi {{name}},\n\nI noticed {{company}} does not have an active website yet. In today's market, having no online presence means losing potential local customers daily to competitors.\n\nAt NexPulseLabs, we build high-converting, lightning-fast modern websites for businesses like yours. Would you be open to a quick 5-minute chat this week?\n\nBest regards,\nNexPulseLabs Team",
  },
  {
    id: "outdated-website",
    name: "Outdated / Weak Website",
    category: "Redesign",
    subject: "Saw {{company}} website - had a quick thought",
    body: "Hi {{name}},\n\nI came across {{company}} website ({{website}}) and noticed a few design and speed bottlenecks that might be hurting your customer conversion rate.\n\nWe specialize in redesigning modern, responsive web apps that turn visitors into paying customers. Would you like a free 3-point audit of your current site?\n\nBest regards,\nNexPulseLabs Team",
  },
  {
    id: "slow-speed",
    name: "Slow Speed Pitch",
    category: "Speed Audit",
    subject: "{{company}} website speed optimization",
    body: "Hi {{name}},\n\nI ran a quick performance test on {{company}} website and found it takes several seconds to load. Studies show that a 1-second delay reduces conversions by 7%.\n\nWe help brands build seamless mobile-first web experiences that load in under 1 second. Let me know if you'd be interested in seeing a quick preview!\n\nBest regards,\nNexPulseLabs Team",
  },
  {
    id: "followup",
    name: "Follow-up Pitch",
    category: "Follow Up",
    subject: "Following up - {{company}} digital presence",
    body: "Hi {{name}},\n\nI sent you a quick note regarding {{company}} online presence. Just wanted to follow up and see if this is something on your radar this quarter?\n\nHappy to hop on a quick 5-minute chat whenever suits you best.\n\nBest regards,\nNexPulseLabs Team",
  },
];

export default function ComposePage() {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  
  // Bulk selection state
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);
  
  const [selectedTemplateId, setSelectedTemplateId] = useState("no-website");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [sending, setSending] = useState(false);
  const [sendToMyGmail, setSendToMyGmail] = useState(true);
  const { toast } = useToast();

  const applyTemplate = (templateId: string, lead: Lead | null) => {
    setSelectedTemplateId(templateId);
    const tmpl = TEMPLATES.find((t) => t.id === templateId) || TEMPLATES[0];
    const leadName = lead?.name || "{{name}}";
    const leadCompany = lead?.company || lead?.name || "{{company}}";
    const leadWebsite = lead?.website || "{{website}}";

    const fill = (text: string) =>
      text
        .replace(/\{\{name\}\}/gi, mode === "bulk" ? "{{name}}" : leadName)
        .replace(/\{\{company\}\}/gi, mode === "bulk" ? "{{company}}" : leadCompany)
        .replace(/\{\{website\}\}/gi, mode === "bulk" ? "{{website}}" : leadWebsite);

    setSubject(fill(tmpl.subject));
    setBody(fill(tmpl.body));
  };

  const autoSelectLead = (lead: Lead) => {
    setSelectedLeadId(lead.id);
    setSelectedLead(lead);
    const matched = lead.website && lead.website.startsWith("http") ? "outdated-website" : "no-website";
    applyTemplate(matched, lead);
  };

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (res.ok) {
          const list: Lead[] = data.leads || data.data || [];
          setLeads(list);
          if (list.length > 0) {
            autoSelectLead(list[0]);
            // Select first 10 for bulk by default
            setSelectedBulkIds(list.slice(0, 10).map((l) => l.id));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLeads(false);
      }
    }
    fetchLeads();
  }, []);

  const handleLeadChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const lead = leads.find((l) => l.id === e.target.value) || null;
    if (lead) autoSelectLead(lead);
  };

  const toggleBulkLead = (id: string) => {
    setSelectedBulkIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAllBulk = () => {
    if (selectedBulkIds.length === leads.length) {
      setSelectedBulkIds([]);
    } else {
      setSelectedBulkIds(leads.map((l) => l.id));
    }
  };

  const handleSingleSend = async () => {
    if (!selectedLead) return;
    const toEmail = sendToMyGmail ? MY_TEST_EMAIL : selectedLead.email;

    setSending(true);
    try {
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLead.id, toEmail, subject, body }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Send failed");

      toast({
        title: data.simulated ? "Test Send Logged" : "Email Sent",
        description: data.message || `Sent to ${toEmail}`,
      });
    } catch (err: any) {
      toast({ title: "Dispatch Failed", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleBulkSend = async () => {
    if (selectedBulkIds.length === 0) {
      toast({ title: "No Leads Selected", description: "Select at least 1 lead for campaign.", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const res = await fetch("/api/emails/bulk-send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadIds: selectedBulkIds,
          subject,
          body,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Batch campaign failed");

      toast({
        title: "ðŸš€ Campaign Executed!",
        description: data.message || `Dispatched outreach to ${data.sent} prospects!`,
      });
    } catch (err: any) {
      toast({ title: "Campaign Failed", description: err.message, variant: "destructive" });
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !body) {
      toast({ title: "Subject & Body Required", variant: "destructive" });
      return;
    }

    if (mode === "single") {
      handleSingleSend();
    } else {
      handleBulkSend();
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1500px] mx-auto min-h-screen">
      {/* Mode Selector Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Send className="h-7 w-7 text-blue-500" />
            Outreach Studio & Pitch Personalizer
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Dispatch personalized cold outreach to individual leads or batch blasts to entire CRM lists.
          </p>
        </div>

        <div className="bg-[#070b13] border border-slate-800 p-1 rounded-xl flex items-center gap-1">
          <button
            type="button"
            onClick={() => { setMode("single"); applyTemplate(selectedTemplateId, selectedLead); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
              mode === "single" ? "bg-blue-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <User className="h-3.5 w-3.5" /> Single Prospect
          </button>
          <button
            type="button"
            onClick={() => { setMode("bulk"); applyTemplate(selectedTemplateId, null); }}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold transition ${
              mode === "bulk" ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md" : "text-slate-400 hover:text-white"
            }`}
          >
            <Rocket className="h-3.5 w-3.5 text-amber-400" /> Batch Campaign Blast
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Target Selector */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              {mode === "single" ? <User className="h-4 w-4 text-cyan-400" /> : <Users className="h-4 w-4 text-amber-400" />}
              {mode === "single" ? "Target Prospect Selector" : "Campaign Target Batch Selection"}
            </h3>

            {mode === "single" ? (
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-2">Select Lead from CRM</label>
                {loadingLeads ? (
                  <div className="text-xs text-slate-500 p-3 flex items-center gap-2">
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" /> Loading...
                  </div>
                ) : (
                  <select
                    value={selectedLeadId}
                    onChange={handleLeadChange}
                    className="w-full bg-[#050811] border border-slate-800 text-white text-xs rounded-xl p-3"
                  >
                    {leads.map((lead) => (
                      <option key={lead.id} value={lead.id}>
                        {lead.name} ({lead.company || lead.name}) â€” {lead.email || "No email"}
                      </option>
                    ))}
                  </select>
                )}

                {selectedLead && (
                  <div className="bg-[#0d1424] border border-slate-800 rounded-xl p-4 mt-3 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-white flex items-center gap-1.5">
                        <Building2 className="h-3.5 w-3.5 text-blue-400" />
                        {selectedLead.company || selectedLead.name}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 text-[10px] border border-blue-500/20">
                        {selectedLead.source || "CRM"}
                      </span>
                    </div>
                    <div className="text-cyan-400 font-mono flex items-center gap-1.5">
                      <Mail className="h-3.5 w-3.5" /> {selectedLead.email || "No email"}
                    </div>
                    {selectedLead.website && (
                      <div className="text-slate-400 flex items-center gap-1.5 truncate">
                        <Globe className="h-3.5 w-3.5 text-emerald-400" /> {selectedLead.website}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              /* Bulk Mode Target List */
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 font-semibold">Select Campaign Targets</span>
                  <button
                    type="button"
                    onClick={toggleSelectAllBulk}
                    className="text-blue-400 hover:underline flex items-center gap-1 font-bold"
                  >
                    {selectedBulkIds.length === leads.length ? <CheckSquare className="h-3.5 w-3.5" /> : <Square className="h-3.5 w-3.5" />}
                    {selectedBulkIds.length === leads.length ? "Deselect All" : "Select All"} ({selectedBulkIds.length}/{leads.length})
                  </button>
                </div>

                <div className="max-h-[280px] overflow-y-auto space-y-1.5 pr-1 border border-slate-800 rounded-xl p-2 bg-[#050811]">
                  {leads.map((lead) => {
                    const isChecked = selectedBulkIds.includes(lead.id);
                    return (
                      <div
                        key={lead.id}
                        onClick={() => toggleBulkLead(lead.id)}
                        className={`p-2 rounded-lg border text-xs cursor-pointer flex items-center justify-between transition ${
                          isChecked ? "bg-blue-600/20 border-blue-500/50 text-white" : "border-slate-800/60 text-slate-400 hover:bg-slate-900"
                        }`}
                      >
                        <div className="truncate pr-2">
                          <div className="font-bold truncate">{lead.name}</div>
                          <div className="text-[10px] text-cyan-400/80 font-mono truncate">{lead.email || "No email"}</div>
                        </div>
                        {isChecked ? <CheckSquare className="h-4 w-4 text-blue-400 shrink-0" /> : <Square className="h-4 w-4 text-slate-600 shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2 flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-amber-400" /> Pre-Configured Templates
              </label>
              <div className="grid grid-cols-2 gap-2">
                {TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => applyTemplate(tmpl.id, mode === "single" ? selectedLead : null)}
                    className={`p-2.5 rounded-xl border text-left text-xs ${
                      selectedTemplateId === tmpl.id
                        ? "bg-blue-600 text-white border-blue-500 font-bold"
                        : "bg-[#050811] text-slate-400 border-slate-800"
                    }`}
                  >
                    <div className="font-semibold truncate">{tmpl.name}</div>
                    <div className="text-[10px] opacity-75">{tmpl.category}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Editor */}
        <div className="lg:col-span-7">
          <form onSubmit={handleSubmit} className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-6 space-y-4 backdrop-blur-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-emerald-400" />
                {mode === "single" ? "Single Email Editor" : "Batch Campaign Personalizer"}
              </h3>
              <span className="text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full flex items-center gap-1 font-mono">
                <CheckCircle2 className="h-3 w-3" /> Auto-Personalize Active
              </span>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Subject Line</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="bg-[#050811] border-slate-800 text-white text-xs rounded-xl p-3"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1">Body Text</label>
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                rows={12}
                className="bg-[#050811] border-slate-800 text-white text-xs rounded-xl p-3 font-mono"
              />
            </div>

            {mode === "single" && (
              <label className="flex items-center gap-2 text-xs text-amber-300 cursor-pointer bg-amber-500/10 border border-amber-500/20 rounded-xl p-3">
                <input
                  type="checkbox"
                  checked={sendToMyGmail}
                  onChange={(e) => setSendToMyGmail(e.target.checked)}
                />
                Test mode: send to my Gmail only ({MY_TEST_EMAIL})
              </label>
            )}

            <Button
              type="submit"
              disabled={sending || (mode === "single" ? !selectedLead : selectedBulkIds.length === 0)}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl py-3 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" /> Dispatching Campaign...
                </>
              ) : mode === "single" ? (
                <>
                  <Send className="h-4 w-4" />
                  {sendToMyGmail ? `Send Test to ${MY_TEST_EMAIL}` : `Send to ${selectedLead?.email || "prospect"}`}
                </>
              ) : (
                <>
                  <Rocket className="h-4 w-4 text-amber-400" /> Launch Batch Blast to {selectedBulkIds.length} Prospects ðŸš€
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}