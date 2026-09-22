"use client";

import React, { useState } from "react";
import { Building2, MapPin, Mail, Phone, Globe, Linkedin, Facebook, Sparkles, Download, AlertCircle } from "lucide-react";

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
  const [isError, setIsError] = useState(false);

  const handleHarvest = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    setIsError(false);
    setLeads([]);
    setSelectedLeads([]);

    try {
      const res = await fetch("/api/scraper/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ niche, city, country, limit }),
      });

      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server timeout or invalid response. Please try again.");
      }

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to harvest leads");

      const fetchedLeads = Array.isArray(data.leads) ? data.leads : [];
      setLeads(fetchedLeads);
      setSelectedLeads(fetchedLeads.map((_: any, idx: number) => idx));
      setMessage(`Harvested ${fetchedLeads.length} real leads in ${city}, ${country}!`);
    } catch (err: any) {
      setIsError(true);
      setMessage(`Error: ${err.message || "Something went wrong"}`);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async () => {
    if (!selectedLeads || selectedLeads.length === 0) return;
    setImporting(true);
    setMessage("");
    setIsError(false);

    try {
      const leadsToImport = selectedLeads.map((idx) => leads[idx]).filter(Boolean);
      const res = await fetch("/api/scraper/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leads: leadsToImport }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Import failed");

      setMessage(`✓ ${data.importedCount || selectedLeads.length} Leads imported to CRM!`);
    } catch (err: any) {
      setIsError(true);
      setMessage(`Import Error: ${err.message || "Import failed"}`);
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Live B2B Lead Harvester v22.3
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Fast Parallel Business Scraping Engine (Sub-3s Response Time)
        </p>
      </div>

      <form onSubmit={handleHarvest} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Target Niche / Industry</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">City / Region</label>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Country</label>
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
              required
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400">Harvest Depth</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="mt-1.5 w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-cyan-500"
            >
              <option value={10}>10 Real Leads</option>
              <option value={30}>30 Real Leads</option>
              <option value={50}>50 Real Leads</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-emerald-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 shrink-0" /> Ultra-Fast Parallel Search Engine
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
          >
            {loading ? "Harvesting Real Data..." : `Harvest ${limit} Real Leads`}
          </button>
        </div>
      </form>

      {message && (
        <div className={`p-4 border rounded-xl text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isError ? "bg-rose-950/40 border-rose-800 text-rose-300" : "bg-slate-900 border-slate-800 text-cyan-400"
        }`}>
          <div className="flex items-center gap-2">
            {isError && <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />}
            <span>{String(message)}</span>
          </div>
          {leads && leads.length > 0 && !isError && (
            <button
              onClick={handleImport}
              disabled={importing || selectedLeads.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 self-end sm:self-auto shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              {importing ? "Importing..." : `Import Selected (${selectedLeads.length}) to CRM`}
            </button>
          )}
        </div>
      )}

      {Array.isArray(leads) && leads.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {leads.map((lead, idx) => {
            if (!lead) return null;
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
                  <div className="space-y-1 pr-4">
                    <h3 className="font-bold text-slate-100 text-sm md:text-base flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-cyan-400 shrink-0" />
                      <span className="truncate">{String(lead.name || "Business")}</span>
                    </h3>
                    <p className="text-xs text-slate-400 truncate">{String(lead.niche || niche)}</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-4 h-4 rounded text-cyan-500 focus:ring-0 bg-slate-950 border-slate-700 shrink-0"
                  />
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-2 border-t border-slate-800/60">
                  <div className="flex items-center gap-2 text-slate-400">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{String(lead.address || `${city}, ${country}`)}</span>
                  </div>

                  {lead.email && (
                    <div className="flex items-center gap-2 text-cyan-300">
                      <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span className="truncate">{String(lead.email)}</span>
                    </div>
                  )}

                  {lead.phone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span>{String(lead.phone)}</span>
                    </div>
                  )}

                  {lead.website && (
                    <div className="flex items-center gap-2 text-indigo-400 pt-1">
                      <Globe className="w-3.5 h-3.5 shrink-0" />
                      <a href={String(lead.website)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline truncate">
                        {String(lead.website)}
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800/60">
                  {lead.socials?.linkedin && (
                    <a href={String(lead.socials.linkedin)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-cyan-400">
                      <Linkedin className="w-3.5 h-3.5" />
                    </a>
                  )}
                  {lead.socials?.facebook && (
                    <a href={String(lead.socials.facebook)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-blue-400">
                      <Facebook className="w-3.5 h-3.5" />
                    </a>
                  )}
                  <span className="ml-auto text-[10px] text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    {String(lead.source || "Web Lead")}
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