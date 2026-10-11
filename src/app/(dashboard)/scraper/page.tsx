"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Lead {
  id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  phone?: string;
  location: string;
  website?: string;
  linkedinUrl?: string;
  source: string;
  confidenceScore: number;
  verificationStatus: "VERIFIED" | "RISKY" | "INVALID";
  mxHost?: string;
  verificationReason?: string;
}

export default function ScraperPage() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("United States");
  const [channel, setChannel] = useState("linkedin_xray");
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [savedCount, setSavedCount] = useState(0);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/scraper/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, location, channel, limit: 12 }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to harvest leads");
      }

      setLeads(data.leads || []);
    } catch (err: any) {
      setError(err.message || "Something went wrong while harvesting.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-bold tracking-tight text-white">
              ⚡ B2B Lead Harvester & MX Verifier
            </h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              v24.0 Live
            </span>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Extract verified decision-makers with real-time DNS MX mail server validation.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/compose"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
          >
            ✉️ AI Email Composer
          </Link>
        </div>
      </div>

      {/* Search Filter Panel */}
      <form onSubmit={handleSearch} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8 shadow-xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Industry, Role or Keywords</label>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. CTO, VP Sales, SaaS Founder, Real Estate"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Target Location</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Austin, TX or United States"
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Extraction Channel</label>
            <select
              value={channel}
              onChange={(e) => setChannel(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm cursor-pointer"
            >
              <option value="linkedin_xray">LinkedIn B2B X-Ray (Corporate)</option>
              <option value="google_places">Google Places (Local Business)</option>
              <option value="web_harvester">Web Domain Harvester</option>
            </select>
          </div>
        </div>

        <div className="mt-5 flex items-center justify-between pt-4 border-t border-slate-800">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Pre-Send DNS MX Validator is active (0% Fake Email Guarantee)
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
          >
            {loading ? "Verifying DNS & Harvesting..." : "🚀 Harvest & Verify Leads"}
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm">
          {error}
        </div>
      )}

      {/* Results Grid */}
      {leads.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-slate-400">
              Found <strong className="text-white">{leads.length}</strong> validated decision-makers
            </p>
            <span className="text-xs text-slate-500">Saved: {savedCount}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-slate-900 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all shadow-lg flex flex-col justify-between"
              >
                <div>
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border flex items-center gap-1 ${
                        lead.verificationStatus === "VERIFIED"
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      🛡️ {lead.verificationStatus === "VERIFIED" ? "DNS MX Verified" : "Risky / Unverified"}
                    </span>
                    <span className="text-xs font-mono text-slate-400">{lead.confidenceScore}% Score</span>
                  </div>

                  <h3 className="font-semibold text-white text-lg">{lead.name}</h3>
                  <p className="text-xs text-indigo-400 font-medium">{lead.title}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{lead.company}</p>

                  <div className="mt-4 space-y-1.5 text-xs text-slate-300">
                    <div className="p-2 rounded bg-slate-950 border border-slate-800 font-mono text-xs flex items-center justify-between">
                      <span className="text-slate-400 truncate max-w-[200px]">{lead.email}</span>
                      <button
                        onClick={() => navigator.clipboard.writeText(lead.email)}
                        className="text-indigo-400 hover:text-indigo-300"
                      >
                        Copy
                      </button>
                    </div>

                    {lead.mxHost && (
                      <p className="text-[11px] text-slate-500 font-mono">
                        Mail Server: <span className="text-slate-400">{lead.mxHost}</span>
                      </p>
                    )}

                    <p className="text-slate-400">📍 {lead.location}</p>
                  </div>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-800 flex items-center justify-between">
                  {lead.linkedinUrl && (
                    <a
                      href={lead.linkedinUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-slate-400 hover:text-white transition-colors"
                    >
                      LinkedIn ↗
                    </a>
                  )}
                  <Link
                    href={`/compose?email=${encodeURIComponent(lead.email)}&name=${encodeURIComponent(lead.name)}&company=${encodeURIComponent(lead.company)}`}
                    className="text-xs px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium"
                  >
                    Draft Email →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}