'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Send, 
  Sparkles, 
  Bot, 
  Users, 
  CheckCircle2, 
  Loader2, 
  Mail, 
  Building2, 
  Globe, 
  MapPin,
  RefreshCw,
  Zap
} from 'lucide-react';

interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  niche?: string;
  city?: string;
  website?: string;
  status: string;
}

export default function ComposePage() {
  const router = useRouter();

  const [leads, setLeads] = useState<Lead[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string>('');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const [loadingLeads, setLoadingLeads] = useState(true);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [sending, setSending] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [aiProviderBadge, setAiProviderBadge] = useState<string | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (data.leads && data.leads.length > 0) {
        setLeads(data.leads);
        setSelectedLeadId(data.leads[0].id);
        setSelectedLead(data.leads[0]);
        generateEmailForLead(data.leads[0]);
      }
    } catch {
      showToast('Failed to load leads', 'error');
    } finally {
      setLoadingLeads(false);
    }
  };

  const handleLeadChange = (id: string) => {
    setSelectedLeadId(id);
    const found = leads.find(l => l.id === id) || null;
    setSelectedLead(found);
    if (found) generateEmailForLead(found);
  };

  const generateEmailForLead = async (lead: Lead) => {
    setGeneratingAI(true);
    setAiProviderBadge(null);

    try {
      const res = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: lead.name,
          company: lead.company,
          niche: lead.niche || 'B2B',
          city: lead.city || 'Global',
          website: lead.website || ''
        })
      });

      const data = await res.json();
      if (res.ok && data.subject && data.body) {
        setSubject(data.subject);
        setBody(data.body);
        setAiProviderBadge(data.provider || 'AI Generated');
        showToast(`AI Copy Generated via ${data.provider || 'AI'}`);
      }
    } catch {
      showToast('AI Generation failed, using template', 'error');
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedLead || !subject.trim() || !body.trim()) {
      showToast('Please select a lead and ensure subject/body are not empty', 'error');
      return;
    }

    setSending(true);

    try {
      const res = await fetch('/api/emails/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: [selectedLead.id],
          subject,
          body
        })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to dispatch email');

      showToast(`Email dispatched successfully to ${selectedLead.email}!`);
      setTimeout(() => router.push('/email-history'), 1500);
    } catch (err: any) {
      showToast(err.message || 'Send failed', 'error');
    } finally {
      setSending(false);
    }
  };

  if (loadingLeads) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl border text-sm font-semibold flex items-center gap-2 animate-in fade-in ${
          toastMsg.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        }`}>
          {toastMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : null}
          {toastMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">AI Campaign Composer</h1>
            {aiProviderBadge && (
              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase tracking-wide flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-purple-400" /> {aiProviderBadge}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Personalizes 1-to-1 cold emails using DeepSeek AI & your saved pitch context.
          </p>
        </div>

        {selectedLead && (
          <button
            onClick={handleSendEmail}
            disabled={sending || generatingAI}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 text-white font-bold text-xs shadow-xl shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center gap-2"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Dispatch Email
          </button>
        )}
      </div>

      {leads.length === 0 ? (
        <div className="p-12 text-center bg-[#050815] border border-white/10 rounded-2xl space-y-4">
          <Users className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Leads Available</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Please harvest leads first using the Lead Scraper or import a CSV list before composing emails.
          </p>
          <button
            onClick={() => router.push('/scraper')}
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition-all inline-flex items-center gap-2"
          >
            <Zap className="w-4 h-4" /> Go to Lead Scraper
          </button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Target Lead Selector Panel */}
          <div className="bg-[#050815] border border-white/10 rounded-2xl p-6 space-y-6 h-fit">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Select Target Lead ({leads.length})
              </label>
              <select
                value={selectedLeadId}
                onChange={(e) => handleLeadChange(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name} — {l.company}
                  </option>
                ))}
              </select>
            </div>

            {selectedLead && (
              <div className="p-4 rounded-xl bg-white/[0.02] border border-white/5 space-y-3 text-xs">
                <div>
                  <div className="text-slate-500 text-[10px] font-semibold uppercase">Business Name</div>
                  <div className="font-bold text-white text-sm">{selectedLead.company}</div>
                </div>

                <div className="flex items-center gap-2 text-slate-300">
                  <Mail className="w-3.5 h-3.5 text-slate-500" />
                  <span className="font-mono text-[11px] text-cyan-300">{selectedLead.email}</span>
                </div>

                {selectedLead.city && (
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{selectedLead.city}</span>
                  </div>
                )}

                {selectedLead.website && (
                  <div className="flex items-center gap-2 text-slate-400 truncate">
                    <Globe className="w-3.5 h-3.5 text-slate-500" />
                    <span className="truncate">{selectedLead.website.replace('https://', '')}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => generateEmailForLead(selectedLead)}
                    disabled={generatingAI}
                    className="w-full py-2.5 rounded-lg border border-purple-500/30 bg-purple-500/10 hover:bg-purple-500/20 text-purple-200 text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    {generatingAI ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RefreshCw className="w-3.5 h-3.5" />}
                    Regenerate AI Copy
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Email Editor Box */}
          <div className="lg:col-span-2 bg-[#050815] border border-white/10 rounded-2xl p-6 space-y-6">
            
            {/* Subject */}
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Subject Line</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Email Subject Line..."
                className="w-full px-4 py-2.5 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50 font-medium"
              />
            </div>

            {/* Email Body */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-medium text-slate-300">Email Body (AI Generated Copy)</label>
                {generatingAI && (
                  <span className="text-[11px] text-cyan-400 flex items-center gap-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> DeepSeek Writing Copy...
                  </span>
                )}
              </div>
              <textarea
                rows={12}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Type your email content..."
                className="w-full p-4 bg-[#03050c] border border-white/10 rounded-xl text-xs text-slate-200 leading-relaxed focus:outline-none focus:border-cyan-500/50 font-mono resize-none"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-between pt-2 border-t border-white/5">
              <span className="text-[11px] text-slate-500">
                Email will be sent with human-like delays via connected channel.
              </span>

              <button
                onClick={handleSendEmail}
                disabled={sending || generatingAI}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/20 hover:opacity-95 transition-all flex items-center gap-2"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Now
              </button>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}