"use client";

import React, { useState, useEffect } from "react";

// Inline Native SVG Icons (Zero External Dependency - Never Crashes)
const IconBuilding = () => (
  <svg className="w-4 h-4 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <rect x="4" y="2" width="16" height="20" rx="2" ry="2"/>
    <path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>
  </svg>
);

const IconMapPin = () => (
  <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>
);

const IconMail = () => (
  <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
    <polyline points="22,6 12,13 2,6"/>
  </svg>
);

const IconPhone = () => (
  <svg className="w-3.5 h-3.5 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
  </svg>
);

const IconGlobe = () => (
  <svg className="w-3.5 h-3.5 text-indigo-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="2" y1="12" x2="22" y2="12"/>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
  </svg>
);

const IconLinkedin = () => (
  <svg className="w-3.5 h-3.5 text-cyan-400 shrink-0" fill="currentColor" viewBox="0 0 24 24">
    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
  </svg>
);

const IconSparkles = () => (
  <svg className="w-4 h-4 text-emerald-400 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/>
  </svg>
);

const IconDownload = () => (
  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
  </svg>
);

const IconExternalLink = () => (
  <svg className="w-3 h-3 text-slate-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
  </svg>
);

export default function ScraperPage() {
  const [mounted, setMounted] = useState(false);
  const [niche, setNiche] = useState("Software Houses");
  const [city, setCity] = useState("London");
  const [country, setCountry] = useState("United Kingdom");
  const [channel, setChannel] = useState("linkedin");
  const [limit, setLimit] = useState(30);
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<any[]>([]);
  const [selectedLeads, setSelectedLeads] = useState<number[]>([]);
  const [importing, setImporting] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  // Prevent SSR/Client Hydration Exception
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 p-8 flex items-center justify-center">
        <div className="text-slate-400 text-sm animate-pulse">Loading Harvester Engine...</div>
      </div>
    );
  }

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
        body: JSON.stringify({ niche, city, country, limit, channel }),
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
      setMessage(`Harvested ${fetchedLeads.length} verified B2B leads in ${city}, ${country}!`);
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

      setMessage(`✓ ${data.importedCount || selectedLeads.length} Verified B2B Leads imported to CRM!`);
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
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
          B2B Lead Harvester & LinkedIn X-Ray v23.2
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Scrape verified corporate companies, decision-makers, websites & active LinkedIn profiles.
        </p>
      </div>

      {/* Channel Source Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setChannel("linkedin")}
          className={`p-4 rounded-xl border text-left transition-all ${
            channel === "linkedin"
              ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 text-cyan-300"
              : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconLinkedin /> LinkedIn B2B X-Ray
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Corporate companies & LinkedIn entity matches</p>
        </button>

        <button
          type="button"
          onClick={() => setChannel("google")}
          className={`p-4 rounded-xl border text-left transition-all ${
            channel === "google"
              ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 text-cyan-300"
              : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconBuilding /> Google Places Live
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Physical registered business addresses & phones</p>
        </button>

        <button
          type="button"
          onClick={() => setChannel("web")}
          className={`p-4 rounded-xl border text-left transition-all ${
            channel === "web"
              ? "bg-cyan-950/40 border-cyan-500 shadow-lg shadow-cyan-500/10 text-cyan-300"
              : "bg-slate-900/50 border-slate-800 text-slate-400 hover:border-slate-700"
          }`}
        >
          <div className="flex items-center gap-2 font-semibold text-sm">
            <IconGlobe /> Web Harvester
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Enterprise B2B websites & AI verified index</p>
        </button>
      </div>

      {/* Form Controls */}
      <form onSubmit={handleHarvest} className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 md:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-slate-400">Target Niche / Industry</label>
            <input
              type="text"
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              placeholder="e.g. Software Houses"
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
              placeholder="e.g. London"
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
              placeholder="e.g. United Kingdom"
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
              <option value={10}>10 B2B Leads</option>
              <option value={30}>30 B2B Leads</option>
              <option value={50}>50 B2B Leads</option>
            </select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-2">
          <div className="text-xs text-cyan-400 flex items-center gap-1.5">
            <IconSparkles /> Active Channel: {channel.toUpperCase()} X-Ray + AI Domain Extraction
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/10 flex items-center justify-center gap-2"
          >
            {loading ? "Extracting B2B Leads..." : `Harvest ${limit} B2B Leads`}
          </button>
        </div>
      </form>

      {/* Messages */}
      {message && (
        <div className={`p-4 border rounded-xl text-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
          isError ? "bg-rose-950/40 border-rose-800 text-rose-300" : "bg-slate-900 border-slate-800 text-cyan-400"
        }`}>
          <span>{String(message)}</span>
          {leads && leads.length > 0 && !isError && (
            <button
              onClick={handleImport}
              disabled={importing || selectedLeads.length === 0}
              className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-medium px-4 py-2 rounded-lg text-xs flex items-center gap-1.5 self-end sm:self-auto shrink-0"
            >
              <IconDownload />
              {importing ? "Importing..." : `Import Selected (${selectedLeads.length}) to CRM`}
            </button>
          )}
        </div>
      )}

      {/* Cards List */}
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
                      <IconBuilding />
                      <span className="truncate">{String(lead.name || "Company")}</span>
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
                    <IconMapPin />
                    <span className="truncate">{String(lead.address || `${city}, ${country}`)}</span>
                  </div>

                  {lead.email && (
                    <div className="flex items-center gap-2 text-cyan-300">
                      <IconMail />
                      <span className="truncate">{String(lead.email)}</span>
                    </div>
                  )}

                  {lead.phone && (
                    <div className="flex items-center gap-2 text-slate-300">
                      <IconPhone />
                      <span>{String(lead.phone)}</span>
                    </div>
                  )}

                  {lead.website && (
                    <div className="flex items-center gap-2 text-indigo-400 pt-1">
                      <IconGlobe />
                      <a href={String(lead.website)} target="_blank" rel="noreferrer" onClick={(e) => e.stopPropagation()} className="hover:underline truncate flex items-center gap-1">
                        {String(lead.website)} <IconExternalLink />
                      </a>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  {lead.socials?.linkedin ? (
                    <a
                      href={String(lead.socials.linkedin)}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-cyan-950/60 hover:bg-cyan-900/80 border border-cyan-800/50 rounded-lg text-xs text-cyan-300 font-medium transition-colors"
                    >
                      <IconLinkedin /> LinkedIn Profile
                    </a>
                  ) : (
                    <span className="text-[10px] text-slate-500">Corporate Lead</span>
                  )}

                  <span className="text-[10px] text-slate-400 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
                    {String(lead.source || "LinkedIn X-Ray")}
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