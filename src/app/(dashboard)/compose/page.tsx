"use client";

import React, { useState, useEffect } from "react";

export default function ComposePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  useEffect(() => {
    async function fetchLeads() {
      try {
        const res = await fetch("/api/leads");
        if (res.ok) {
          const data = await res.json();
          setLeads(data.leads || data || []);
        }
      } catch (e) {}
    }
    fetchLeads();
  }, []);

  const handleGenerate = async () => {
    if (!selectedLeadId) {
      setIsError(true);
      setMessage("Please select a lead first.");
      return;
    }

    setLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const selectedLead = leads.find((l) => l.id === selectedLeadId);
      const res = await fetch("/api/ai/generate-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId: selectedLeadId, lead: selectedLead }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to generate email");

      setSubject(data.subject || "Strategic Partnership Proposal");
      setBody(data.email || data.body || "");
      setMessage("AI Email generated successfully!");
    } catch (err: any) {
      setIsError(true);
      setMessage(`AI Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeadId || !subject || !body) {
      setIsError(true);
      setMessage("Lead, Subject, and Body are required.");
      return;
    }

    setSending(true);
    setMessage("");
    setIsError(false);

    try {
      const selectedLead = leads.find((l) => l.id === selectedLeadId);
      const res = await fetch("/api/emails/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipient: selectedLead?.email,
          leadId: selectedLeadId,
          subject,
          html: body,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      setMessage("✓ Email dispatched successfully!");
      setSubject("");
      setBody("");
    } catch (err: any) {
      setIsError(true);
      setMessage(`Send Error: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          AI Cold Email Composer
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Select a scraped lead to generate personalized DeepSeek AI outreach proposals.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Control Panel */}
        <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-cyan-400">1. Select Target Lead</h2>

          <div>
            <label className="text-xs font-semibold text-slate-400">Choose Scraped Lead</label>
            <select
              value={selectedLeadId}
              onChange={(e) => setSelectedLeadId(e.target.value)}
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value="">-- Choose Lead --</option>
              {leads.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name || l.company} ({l.email || "No email"})
                </option>
              ))}
            </select>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !selectedLeadId}
            className="w-full bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10"
          >
            {loading ? "Generating AI Email..." : "Generate AI Email"}
          </button>
        </div>

        {/* Right Editor & Sender */}
        <form onSubmit={handleSend} className="lg:col-span-2 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 space-y-4">
          <h2 className="text-base font-semibold text-cyan-400">2. Review & Dispatch</h2>

          <div>
            <label className="text-xs font-semibold text-slate-400">Email Subject</label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Quick Question Regarding AI Systems"
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Email Body (HTML / Text)</label>
            <textarea
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Generated email body will appear here..."
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500 font-mono text-xs"
              required
            />
          </div>

          {message && (
            <div className={`p-3 border rounded-xl text-xs ${isError ? "bg-rose-950/40 border-rose-800 text-rose-300" : "bg-slate-950 border-slate-800 text-cyan-400"}`}>
              {message}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !subject || !body}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/10"
            >
              {sending ? "Dispatching..." : "Send Email Now"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}