'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  MapPin, 
  Globe, 
  Briefcase, 
  Layers, 
  Download, 
  CheckCircle2, 
  Building2, 
  Mail, 
  Phone, 
  Loader2,
  ExternalLink,
  ShieldCheck,
  Navigation
} from 'lucide-react';

interface ScrapedLead {
  name: string;
  company: string;
  address?: string;
  email: string;
  phone?: string;
  website?: string;
  city?: string;
  country?: string;
  niche?: string;
  source?: string;
  isLiveVerified?: boolean;
}

export default function ScraperPage() {
  const router = useRouter();

  const [niche, setNiche] = useState('Software Houses');
  const [city, setCity] = useState('Lahore');
  const [country, setCountry] = useState('Pakistan');
  const [source, setSource] = useState<'maps' | 'web' | 'linkedin' | 'crunchbase'>('maps');
  const [limit, setLimit] = useState(15);

  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [results, setResults] = useState<ScrapedLead[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [toastMsg, setToastMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMsg({ type, text });
    setTimeout(() => setToastMsg(null), 4000);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResults([]);
    setSelectedIds(new Set());

    try {
      const res = await fetch('/api/scraper/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ niche, city, country, source, limit })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Server error during search');
      }

      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setSelectedIds(new Set(data.results.map((_: any, idx: number) => idx)));
        showToast(`Harvested ${data.results.length} real B2B leads in ${city}, ${country}!`);
      } else {
        showToast(`No registered listings found for "${niche}" in ${city}, ${country}. Try broadening your search.`, 'error');
      }
    } catch (err: any) {
      showToast(err.message || 'Search failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (index: number) => {
    const next = new Set(selectedIds);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSelectedIds(next);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === results.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(results.map((_, idx) => idx)));
    }
  };

  const handleImportToCRM = async () => {
    if (selectedIds.size === 0) {
      showToast('Select at least one lead to import', 'error');
      return;
    }

    setImporting(true);
    const leadsToImport = Array.from(selectedIds).map((idx) => results[idx]);

    try {
      const res = await fetch('/api/scraper/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leads: leadsToImport })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Import failed');

      showToast(`Successfully imported ${data.count} leads to CRM!`);
      setTimeout(() => router.push('/leads'), 1500);
    } catch (err: any) {
      showToast(err.message || 'Import failed', 'error');
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-16">
      
      {toastMsg && (
        <div className={`fixed top-5 right-5 z-50 px-5 py-3 rounded-xl shadow-2xl border text-sm font-semibold flex items-center gap-2 animate-in fade-in ${
          toastMsg.type === 'success' ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' : 'bg-rose-950/90 border-rose-500/50 text-rose-200'
        }`}>
          {toastMsg.text}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold text-white tracking-tight">NexScraper Engine v14.0</h1>
            <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 uppercase tracking-wide flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> 100% Dynamic Global Search
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Search any city & country worldwide. Returns real business entities with physical street addresses.
          </p>
        </div>

        {results.length > 0 && (
          <button
            onClick={handleImportToCRM}
            disabled={importing || selectedIds.size === 0}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-indigo-500 text-white text-xs font-bold shadow-lg shadow-cyan-500/20 transition-all flex items-center gap-2"
          >
            {importing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Import {selectedIds.size} Selected to CRM
          </button>
        )}
      </div>

      {/* Form */}
      <div className="bg-[#050815] border border-white/10 rounded-2xl p-6 shadow-xl">
        <form onSubmit={handleSearch} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">Select Data Source Channel</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { id: 'maps', label: 'Google Maps / Places', icon: MapPin, color: 'text-amber-400', desc: 'Real Local Business Registry' },
                { id: 'linkedin', label: 'LinkedIn X-Ray', icon: Briefcase, color: 'text-blue-400', desc: 'Founders, CEOs & Directors' },
                { id: 'web', label: 'Web Harvester', icon: Globe, color: 'text-cyan-400', desc: 'Corporate Contacts & SaaS' },
                { id: 'crunchbase', label: 'Crunchbase X-Ray', icon: Layers, color: 'text-purple-400', desc: 'Funded Startups & Agencies' },
              ].map((src) => {
                const Icon = src.icon;
                const isSelected = source === src.id;
                return (
                  <button
                    key={src.id}
                    type="button"
                    onClick={() => setSource(src.id as any)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      isSelected ? 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10' : 'border-white/5 bg-white/[0.02] hover:bg-white/[0.05]'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className={`w-4 h-4 ${src.color}`} />
                      <span className="text-xs font-bold text-white">{src.label}</span>
                    </div>
                    <p className="text-[11px] text-slate-400">{src.desc}</p>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Target Niche / Industry</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={niche}
                  onChange={(e) => setNiche(e.target.value)}
                  placeholder="e.g. Software Houses, Dental"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">City / Region</label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g. Lahore, Dubai, London"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Country</label>
              <div className="relative">
                <Globe className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  placeholder="e.g. Pakistan, UAE, UK, USA"
                  className="w-full pl-10 pr-4 py-2.5 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">Harvest Depth</label>
              <select
                value={limit}
                onChange={(e) => setLimit(Number(e.target.value))}
                className="w-full px-4 py-2.5 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value={10}>10 Real Leads</option>
                <option value={15}>15 Real Leads</option>
                <option value={20}>20 Real Leads</option>
                <option value={30}>30 Real Leads</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Real Location Geocoding & OpenStreetMap + Serper Live Pipeline</span>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 text-white text-xs font-bold shadow-xl shadow-cyan-500/20 transition-all flex items-center gap-2"
            >
              {loading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Searching Live Global Data...</>
              ) : (
                <><Search className="w-4 h-4" /> Harvest Real Leads</>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-bold text-white">Verified Dynamic Results ({results.length})</span>
              <button onClick={toggleSelectAll} className="text-xs text-cyan-400 hover:underline">
                {selectedIds.size === results.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <span className="text-xs text-slate-400">{selectedIds.size} Selected</span>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((lead, idx) => {
              const isSelected = selectedIds.has(idx);
              return (
                <div
                  key={idx}
                  onClick={() => toggleSelect(idx)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all relative ${
                    isSelected ? 'bg-[#080d24] border-cyan-500/40 shadow-lg shadow-cyan-500/10' : 'bg-[#050815]/60 border-white/5 hover:border-white/10 opacity-80'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1 pr-2">
                      <h3 className="text-sm font-bold text-white truncate">{lead.name}</h3>
                      <p className="text-xs font-medium text-cyan-400 truncate">{lead.company}</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => {}}
                      className="w-4 h-4 rounded border-white/20 text-cyan-500 bg-[#03050c]"
                    />
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 mb-4">
                    {lead.address && (
                      <div className="flex items-start gap-2 text-slate-300">
                        <Navigation className="w-3.5 h-3.5 text-amber-400 flex-shrink-0 mt-0.5" />
                        <span className="text-[11px] leading-tight line-clamp-2">{lead.address}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                      <span className="text-slate-200 select-all font-mono text-[11px]">{lead.email}</span>
                    </div>
                    {lead.phone && (
                      <div className="flex items-center gap-2 truncate">
                        <Phone className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <span>{lead.phone}</span>
                      </div>
                    )}
                    {lead.website && (
                      <div className="flex items-center gap-2 truncate">
                        <Globe className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                        <a 
                          href={lead.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="text-cyan-400 hover:underline flex items-center gap-1 truncate font-semibold"
                        >
                          {lead.website.replace('https://', '').replace('http://', '').replace('www.', '')}
                          <ExternalLink className="w-3 h-3 inline flex-shrink-0" />
                        </a>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-white/5 text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-white/5 text-slate-400 border border-white/5 uppercase">
                      {lead.source || source}
                    </span>
                    <span className="text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Real Dynamic Place
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}