"use client";

import { useState } from "react";
import { 
  Building2, MapPin, Mail, Phone, Globe, Linkedin, Facebook, 
  Twitter, Instagram, Search, Sparkles, CheckCircle2, Download 
} from "lucide-react";

export default function ScraperPage() {
  const [niche, setNiche] = useState("Software Houses");
  const [city, setCity] = useState("London");
  const [country, setCountry] = useState("United Kingdom");
  const [limit, setLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");

  const handleHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setLeads([]);
    setSelectedLeads([]);

    try {
      const res = await fetch("/api/scraper/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, city, country, limit }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to harvest leads");

      setLeads(data.leads || []);
      setSelectedLeads((data.leads || []).map((_: any, idx: number) => idx));
      setMessage(`Harvested ${data.leads?.length || 0} real leads in ${city}, ${country}!`);
    } catch (err: any) {
      setMessage(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (selectedLeads.length === 0) return;
    setImporting(true);

    try {
      const leadsToImport = selectedLeads.map((idx) => leads[idx]);
      const res = await fetch("/api/scraper/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: leadsToImport }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setMessage(`✓ ${data.importedCount || selectedLeads.length} Leads imported to CRM! (Skipped duplicates)`);
    } catch (err: any) {
      setMessage(`Import Error: ${err.message}`);
    } finally {
      setImporting(false);
    }
  };

  const toggleSelect = (index: number) => {
    if (selectedLeads.includes(index)) {
      setSelectedLeads(selectedLeads.filter((i) => i !== index));
    } else {
      setSelectedLeads([...selectedLeads, index]);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 space-y-8">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Live B2B Lead Harvester v22.0
        </h1>
        <p className="text-slate-400 mt-1">
          Scrape real physical businesses, working websites, phones, emails & social profiles.
        </p>
      </div>

      <form onSubmit={handleHarvest} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Target Niche / Industry</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Software Houses, Dental Clinics"
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">City / Region</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. London, Dubai, New York"
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="e.g. United Kingdom, USA, UAE"
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Harvest Depth (Count)</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value={10}>10 Real Leads</option>
              <option value={30}>30 Real Leads</option>
              <option value={50}>50 Real Leads</option>
              <option value={100}>100 Real Leads</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" /> Multi-Source Pipeline: Google Places + Gemini Grounding + OpenStreetMap
          </div>

          <button
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/10 flex items-center gap-2"
          >
            {loading ? "Harvesting Real Data..." : `Harvest ${limit} Real Leads`}
          </button>
        </div>
      </form>

      {message && (
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl text-sm text-cyan-400 flex items-center justify-between">
          <span>{message}</span>
          {leads.length > 0 && (
            <button
              onClick={handleImport}
              disabled={importing || selectedLeads.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              {importing ? "Importing..." : `Import Selected (${selectedLeads.length}) to CRM`}
            </button>
          )}
        </div>
      )}

      {leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead, idx) => {
            const isSelected = selectedLeads.includes(idx);
            return (
              <div
                key={idx}
                onClick={() => toggleSelect(idx)}
                className={`cursor-pointer bg-slate-900/50 border rounded-2xl p-5 space-y-3 transition-all relative ${
                  isSelected ? "border-cyan-500/80 bg-slate-900/90 shadow-lg shadow-cyan-500/5" : "border-slate-800/80 hover:border-slate-700"
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1 pr-6">
                    <h3 className="font-bold text-slate-100 text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      {lead.name}
                    </h3>
                    <p className="text-xs text-slate-400">{lead.niche}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-950 border-slate-700"
                  />
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{lead.address}</span>
                  </div>

                  {lead.email && (
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{lead.email}</span>
                    </div>
                  )}

                  {lead.phone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{lead.phone}</span>
                    </div>
                  )}

                  {lead.website && (
                    <div className="flex items-center gap-2 text-indigo-400 pt-1">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <a href={lead.website} target="_blank" rel="noreferrer" className="hover:underline truncate">
                        {lead.website}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                  {lead.socials?.linkedin && (
                    <a href={lead.socials.linkedin} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-cyan-400">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {lead.socials?.facebook && (
                    <a href={lead.socials.facebook} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400">
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {lead.socials?.twitter && (
                    <a href={lead.socials.twitter} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sky-400">
                      <Twitter className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className="ml-auto text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    {lead.source}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}