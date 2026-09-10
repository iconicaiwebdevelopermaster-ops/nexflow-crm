'use client';

import React, { useState, useEffect } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Send, Users, CheckSquare, Square, Loader2 } from 'lucide-react';

export default function ComposePage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState<string[]>([]);
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [fetchingLeads, setFetchingLeads] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setFetchingLeads(true);
      const res = await fetch('/api/leads');
      const data = await res.json();
      if (res.ok && data.leads) {
        setLeads(data.leads);
        // Default select all fresh/queued leads
        const defaultSelected = data.leads.map((l: any) => l.id);
        setSelectedLeadIds(defaultSelected);
      }
    } catch (err) {
      console.error('Error fetching leads:', err);
    } finally {
      setFetchingLeads(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedLeadIds.length === leads.length) {
      setSelectedLeadIds([]);
    } else {
      setSelectedLeadIds(leads.map((l) => l.id));
    }
  };

  const toggleSelectLead = (id: string) => {
    setSelectedLeadIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAiGenerate = async () => {
    if (selectedLeadIds.length === 0) {
      toast({
        title: 'Select Leads First',
        description: 'Please select at least one lead to generate an AI email for.',
        variant: 'destructive',
      });
      return;
    }

    const firstLead = leads.find((l) => selectedLeadIds.includes(l.id));
    setAiLoading(true);

    try {
      const res = await fetch('/api/ai/generate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadName: firstLead?.name || 'Prospect',
          companyName: firstLead?.company || '',
          niche: firstLead?.niche || 'B2B Services',
          city: firstLead?.city || 'Local',
          website: firstLead?.website || '',
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI Generation failed');

      if (data.subject) setSubject(data.subject);
      if (data.body) setBody(data.body);

      toast({
        title: 'AI Email Generated! ✨',
        description: 'Subject and body populated. Feel free to edit before sending.',
      });
    } catch (err: any) {
      toast({
        title: 'AI Generation Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSendBulk = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedLeadIds.length === 0) {
      toast({
        title: 'No Recipients Selected',
        description: 'Please check at least one lead from the list.',
        variant: 'destructive',
      });
      return;
    }

    if (!subject.trim() || !body.trim()) {
      toast({
        title: 'Missing Fields',
        description: 'Please write a subject line and email body.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/emails/bulk-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leadIds: selectedLeadIds, // EXACT BACKEND KEY MATCH
          subject,
          body,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Bulk dispatch failed');

      toast({
        title: 'Bulk Dispatch Successful! 🎉',
        description: `${data.sentCount || selectedLeadIds.length} cold emails sent. Lead status updated to SENT.`,
      });

      // Reset form
      setSubject('');
      setBody('');
      fetchLeads();
    } catch (err: any) {
      toast({
        title: 'Dispatch Failed',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      <PageHeader
        title="Outreach Campaign Composer"
        description="Personalize and dispatch cold outreach campaigns to multiple leads simultaneously."
      />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: RECIPIENT LEADS SELECTION (4 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-4 bg-slate-900/60 border-slate-800">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-semibold text-sm text-slate-200">Select Recipients</span>
              </div>
              <Badge variant="outline" className="border-blue-500/30 text-blue-400 text-xs">
                {selectedLeadIds.length} / {leads.length} Selected
              </Badge>
            </div>

            {fetchingLeads ? (
              <div className="py-12 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-400" /> Loading leads...
              </div>
            ) : leads.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-500">
                No leads found. Scrape leads first from the Scraper menu.
              </div>
            ) : (
              <div className="mt-3 space-y-2 max-h-[480px] overflow-y-auto pr-1">
                <div
                  onClick={toggleSelectAll}
                  className="flex items-center justify-between p-2 rounded-lg bg-slate-950/80 border border-slate-800 hover:border-slate-700 cursor-pointer text-xs font-medium text-slate-300"
                >
                  <div className="flex items-center gap-2">
                    {selectedLeadIds.length === leads.length ? (
                      <CheckSquare className="w-4 h-4 text-blue-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500" />
                    )}
                    <span>Select All ({leads.length})</span>
                  </div>
                </div>

                {leads.map((lead) => {
                  const isSelected = selectedLeadIds.includes(lead.id);
                  return (
                    <div
                      key={lead.id}
                      onClick={() => toggleSelectLead(lead.id)}
                      className={`flex items-center justify-between p-2.5 rounded-lg border cursor-pointer transition text-xs ${
                        isSelected
                          ? 'bg-blue-600/10 border-blue-500/40 text-slate-100'
                          : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-blue-400 flex-shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-slate-600 flex-shrink-0" />
                        )}
                        <div className="truncate">
                          <div className="font-medium text-slate-200 truncate">{lead.name}</div>
                          <div className="text-[11px] text-slate-500 truncate">{lead.email}</div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] border-slate-800 text-slate-500">
                        {lead.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT COLUMN: EMAIL COMPOSER (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-slate-200">Write / Generate Email</span>
              <Button
                type="button"
                onClick={handleAiGenerate}
                disabled={aiLoading}
                variant="outline"
                className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10 text-xs h-8"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Personalizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-purple-400" /> AI Personalize (GPT-4o)
                  </>
                )}
              </Button>
            </div>

            <form onSubmit={handleSendBulk} className="space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Subject Line</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Quick question about {{company}}'s client acquisition..."
                  className="bg-slate-950 border-slate-800 text-xs text-slate-100"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">Email Body</Label>
                <Textarea
                  rows={10}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Hi {{name}}, I noticed {{company}} is located in {{city}}..."
                  className="bg-slate-950 border-slate-800 text-xs text-slate-100 leading-relaxed font-sans"
                />
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-slate-800/80">
                <div className="text-xs text-slate-400">
                  Sending to <b className="text-blue-400">{selectedLeadIds.length}</b> recipients
                </div>

                <Button
                  type="submit"
                  disabled={loading || selectedLeadIds.length === 0}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-10 px-5"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Dispatching...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Dispatch Bulk Campaign
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}