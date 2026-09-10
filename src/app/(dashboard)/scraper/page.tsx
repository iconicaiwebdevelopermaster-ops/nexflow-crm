'use client';

import React, { useState } from 'react';
import PageHeader from '@/components/layout/PageHeader';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Radar,
  Search,
  MapPin,
  Globe,
  Briefcase,
  Flame,
  CheckCircle2,
  Download,
  Loader2,
  Building2,
  Phone,
  Mail,
} from 'lucide-react';

const SOURCES = [
  { id: 'google_maps', label: 'Google Maps', icon: MapPin, desc: 'Local businesses & clinics' },
  { id: 'web_search', label: 'Web Search', icon: Globe, desc: 'Global B2B websites' },
  { id: 'linkedin', label: 'LinkedIn X-Ray', icon: Briefcase, desc: 'Founders & CEOs' },
  { id: 'indeed', label: 'Indeed X-Ray', icon: Flame, desc: 'Active hiring companies' },
];

export default function ScraperPage() {
  const [source, setSource] = useState('google_maps');
  const [query, setQuery] = useState('');
  const [city, setCity] = useState('');
  const [niche, setNiche] = useState('');
  const [limit, setLimit] = useState(10);
  const [results, setResults] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({
        title: 'Query Required',
        description: 'Please enter a search term (e.g. Dental Clinics Dubai).',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setResults([]);
    setSelectedLeads([]);

    try {
      const res = await fetch('/api/scraper/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: `${query} ${city}`.trim(),
          source,
          city,
          niche,
          limit,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Scraper search failed');

      if (data.leads && Array.isArray(data.leads)) {
        setResults(data.leads);
        setSelectedLeads(data.leads);
        toast({
          title: 'Harvest Complete! 🚀',
          description: `Extracted ${data.leads.length} high-quality B2B leads.`,
        });
      }
    } catch (err: any) {
      toast({
        title: 'Scraper Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImportToCrm = async () => {
    if (selectedLeads.length === 0) {
      toast({
        title: 'No Leads Selected',
        description: 'Please select at least one lead to import to your CRM.',
        variant: 'destructive',
      });
      return;
    }

    setImporting(true);

    try {
      const res = await fetch('/api/scraper/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          leads: selectedLeads,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      toast({
        title: 'Import Successful! 🎉',
        description: `${data.count || selectedLeads.length} leads saved to your Neon DB CRM.`,
      });
    } catch (err: any) {
      toast({
        title: 'Import Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setImporting(false);
    }
  };

  const toggleSelect = (lead: any) => {
    if (selectedLeads.some((l) => l.email === lead.email)) {
      setSelectedLeads((prev) => prev.filter((l) => l.email !== lead.email));
    } else {
      setSelectedLeads((prev) => [...prev, lead]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl">
      <PageHeader
        title="NexScraper Engine v3.0"
        description="Harvest targeted B2B leads from Google Maps, LinkedIn, Web & Indeed with 3-layer fallback."
      />

      <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-5">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {SOURCES.map((s) => {
            const Icon = s.icon;
            const isSelected = source === s.id;
            return (
              <div
                key={s.id}
                onClick={() => setSource(s.id)}
                className={`p-3 rounded-xl border cursor-pointer transition ${
                  isSelected
                    ? 'bg-blue-600/15 border-blue-500/50 text-blue-400'
                    : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 font-medium text-xs text-slate-200">
                  <Icon className="w-4 h-4 text-blue-400" /> {s.label}
                </div>
                <div className="text-[10px] text-slate-500 mt-1">{s.desc}</div>
              </div>
            );
          })}
        </div>

        <form onSubmit={handleSearch} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-5 space-y-1">
            <Label className="text-xs text-slate-300">Target Keyword / Query</Label>
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Dental Clinics, Software Agencies"
              className="bg-slate-950 border-slate-800 text-xs text-slate-100"
            />
          </div>

          <div className="sm:col-span-3 space-y-1">
            <Label className="text-xs text-slate-300">Target City / Region</Label>
            <Input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Dubai, Miami, London"
              className="bg-slate-950 border-slate-800 text-xs text-slate-100"
            />
          </div>

          <div className="sm:col-span-2 space-y-1">
            <Label className="text-xs text-slate-300">Target Count</Label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="w-full h-9 rounded-md border border-slate-800 bg-slate-950 px-3 py-1 text-xs text-slate-100 focus:outline-none"
            >
              <option value={10}>10 Leads</option>
              <option value={20}>20 Leads</option>
              <option value={30}>30 Leads</option>
              <option value={50}>50 Leads</option>
            </select>
          </div>

          <div className="sm:col-span-2 flex items-end">
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs h-9"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Scraping...
                </>
              ) : (
                <>
                  <Radar className="w-4 h-4 mr-1.5" /> Start Scrape
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      {results.length > 0 && (
        <Card className="p-5 bg-slate-900/60 border-slate-800 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-semibold text-slate-100 text-sm">Harvested Leads Results</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Selected <b className="text-blue-400">{selectedLeads.length}</b> of {results.length} leads
              </p>
            </div>

            <Button
              type="button"
              onClick={handleImportToCrm}
              disabled={importing || selectedLeads.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs h-9 px-4"
            >
              {importing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Importing...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-1.5" /> Import {selectedLeads.length} Leads to CRM
                </>
              )}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {results.map((lead, idx) => {
              const isSelected = selectedLeads.some((l) => l.email === lead.email);
              return (
                <div
                  key={idx}
                  onClick={() => toggleSelect(lead)}
                  className={`p-3.5 rounded-xl border cursor-pointer transition space-y-2 ${
                    isSelected
                      ? 'bg-blue-600/10 border-blue-500/40 text-slate-100'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="font-semibold text-slate-200 text-xs truncate max-w-[80%]">
                      {lead.name}
                    </div>
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                  </div>

                  <div className="text-[11px] text-blue-400 flex items-center gap-1.5 truncate">
                    <Mail className="w-3 h-3" /> {lead.email}
                  </div>

                  {lead.phone && (
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5 truncate">
                      <Phone className="w-3 h-3" /> {lead.phone}
                    </div>
                  )}

                  {lead.website && (
                    <div className="text-[11px] text-slate-500 flex items-center gap-1.5 truncate">
                      <Globe className="w-3 h-3" /> {lead.website}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}