'use client';
import React, { useState } from "react";
import {
  Radar,
  MapPin,
  Globe,
  Briefcase,
  CheckCircle2,
  RefreshCw,
  Plus,
  ExternalLink,
  Sparkles,
  Phone,
  Mail,
  BookmarkPlus,
} from "lucide-react";
import { FaLinkedin, FaInstagram, FaFacebook } from "react-icons/fa6";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface ScrapedLead {
  title: string;
  snippet?: string;
  link?: string;
  email?: string;
  phone?: string;
  location?: string;
  source?: string;
  instagram?: string;
  facebook?: string;
  linkedin?: string;
  saved?: boolean;
}

function normalizeLeads(payload: any): ScrapedLead[] {
  const raw =
    payload?.data ||
    payload?.results ||
    payload?.items ||
    payload?.leads ||
    (Array.isArray(payload) ? payload : []);

  if (!Array.isArray(raw)) return [];

  return raw.map((item: any) => {
    const emails = item.emails || [];
    const email =
      item.email ||
      (Array.isArray(emails) && emails[0] ? emails[0] : "") ||
      "";

    return {
      title: item.title || item.name || "Untitled Lead",
      snippet: item.snippet || item.location || "",
      link: item.link || item.website || item.url || "",
      email,
      phone: item.phone || item.phoneNumber || "",
      location: item.location || "",
      source: item.source || payload?.engine || "NexScraper",
      instagram: item.instagram || "",
      facebook: item.facebook || "",
      linkedin: item.linkedin || "",
      saved: false,
    };
  });
}

export default function ScraperPage() {
  const [engineMode, setEngineMode] = useState<"maps" | "web" | "linkedin" | "indeed">("maps");
  const [limit, setLimit] = useState(20);
  const [query, setQuery] = useState("Dentists in Miami");
  const [loading, setLoading] = useState(false);
  const [importingBulk, setImportingBulk] = useState(false);
  const [results, setResults] = useState<ScrapedLead[]>([]);
  const [lastEngine, setLastEngine] = useState("");
  const { toast } = useToast();

  const toBulkPayload = (lead: ScrapedLead) => ({
    name: lead.title,
    title: lead.title,
    company: lead.title,
    email: lead.email || "",
    phone: lead.phone || "",
    website: lead.link || "",
    link: lead.link || "",
    location: lead.location || lead.snippet || "",
    source: lead.source || "NexScraper",
    linkedin: lead.linkedin || "",
    instagram: lead.instagram || "",
    facebook: lead.facebook || "",
    status: "NEW",
  });

  const handleStartScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({ title: "Query Required", description: "Enter keywords.", variant: "destructive" });
      return;
    }

    setLoading(true);
    setResults([]);

    try {
      const type = engineMode === "web" ? "search" : engineMode;
      const res = await fetch("/api/scraper/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: query.trim(), type, mode: engineMode, limit }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Scraping failed");

      const items = normalizeLeads(data);
      setResults(items);
      setLastEngine(data.engine || engineMode.toUpperCase());

      toast({
        title: items.length ? "Harvesting Complete!" : "No Leads Found",
        description: items.length
          ? `Harvested ${items.length} leads via ${data.engine || engineMode}.`
          : data.error || "No leads returned",
        variant: items.length ? "default" : "destructive",
      });
    } catch (err: any) {
      toast({ title: "Scraper Error", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSingleLead = async (lead: ScrapedLead, index: number) => {
    try {
      const res = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify([toBulkPayload(lead)]),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save lead");

      setResults((prev) => prev.map((item, i) => (i === index ? { ...item, saved: true } : item)));
      toast({
        title: "Lead Saved to CRM",
        description: data.message || `${lead.title} added to Leads page!`,
      });
    } catch (err: any) {
      toast({ title: "Save Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleImportAll = async () => {
    if (!results.length) return;
    setImportingBulk(true);
    try {
      const res = await fetch("/api/leads/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(results.map(toBulkPayload)),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Bulk import failed");

      setResults((prev) => prev.map((item) => ({ ...item, saved: true })));
      toast({
        title: "Bulk Import Success!",
        description: data.message || `Saved ${data.saved || results.length} leads. Open Leads page.`,
      });
    } catch (err: any) {
      toast({ title: "Bulk Import Failed", description: err.message, variant: "destructive" });
    } finally {
      setImportingBulk(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      <div>
        <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <Radar className="h-7 w-7 text-blue-500 animate-pulse" />
          NexScraper Engine v3.0
        </h1>
        <p className="text-sm text-slate-400 mt-1">
          Google Maps, Search, LinkedIn Founders & Indeed Job Listings Scraper.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-5 space-y-5">
          <form onSubmit={handleStartScrape} className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-6 space-y-5 backdrop-blur-xl shadow-xl">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-400" /> Scraping Configurations
            </h3>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-2">Target Engine Source</label>
              <div className="grid grid-cols-2 gap-2">
                {([
                  ["maps", "Google Maps", MapPin],
                  ["web", "Web Search", Globe],
                  ["linkedin", "LinkedIn", null],
                  ["indeed", "Indeed", Briefcase],
                ] as const).map(([key, label, Icon]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEngineMode(key as any)}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                      engineMode === key
                        ? "bg-blue-600 text-white border-blue-500 shadow-md shadow-blue-500/20"
                        : "bg-[#050811] text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {key === "linkedin" ? (
                      <FaLinkedin className="h-3.5 w-3.5 text-blue-400" />
                    ) : Icon ? (
                      <Icon className={`h-3.5 w-3.5 ${key === "maps" ? "text-rose-400" : key === "web" ? "text-cyan-400" : "text-emerald-400"}`} />
                    ) : null}
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-2">
                <span className="text-slate-400">Target Quantity Limit</span>
                <span className="text-blue-400 font-mono">{limit} Leads</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {[10, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLimit(num)}
                    className={`py-2 text-xs font-bold rounded-xl border transition-all ${
                      limit === num ? "bg-blue-600 text-white border-blue-500" : "bg-[#050811] text-slate-400 border-slate-800 hover:text-white"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Search Keywords Query</label>
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Dentists in Miami"
                className="bg-[#050811] border-slate-800 text-white text-xs rounded-xl p-3"
              />
            </div>

            <Button type="submit" disabled={loading} className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl py-3">
              {loading ? (<><RefreshCw className="h-4 w-4 animate-spin mr-2" /> Harvesting...</>) : (<><Radar className="h-4 w-4 mr-2" /> Activate Scraper Engine</>)}
            </Button>
          </form>
        </div>

        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between bg-[#070b13]/80 border border-slate-800 p-4 rounded-2xl">
            <div>
              <h3 className="text-sm font-bold text-white">Scraper Results Feed</h3>
              <p className="text-xs text-slate-400">
                Total: <span className="text-blue-400 font-bold">{results.length}</span>
                {lastEngine ? ` · ${lastEngine}` : ""}
              </p>
            </div>
            {results.length > 0 && (
              <Button onClick={handleImportAll} disabled={importingBulk} className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl">
                {importingBulk ? "Importing..." : `Import All Scraped (${results.length})`}
              </Button>
            )}
          </div>

          <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-1">
            {results.length === 0 ? (
              <div className="border-2 border-dashed border-slate-800 rounded-2xl p-12 text-center text-slate-500 text-xs">
                No leads yet. Activate Scraper Engine.
              </div>
            ) : (
              results.map((lead, idx) => (
                <div key={idx} className="bg-[#070b13]/90 border border-slate-800 rounded-2xl p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2 flex-wrap">
                        {lead.title}
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {lead.source}
                        </span>
                      </h4>
                      {lead.snippet && <p className="text-xs text-slate-400 mt-1 line-clamp-2">{lead.snippet}</p>}
                    </div>
                    <Button size="sm" variant="outline" disabled={lead.saved} onClick={() => handleSaveSingleLead(lead, idx)} className="text-xs rounded-xl">
                      {lead.saved ? (<><CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Saved</>) : (<><Plus className="h-3.5 w-3.5 mr-1" /> Save Lead</>)}
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-4 text-xs text-slate-400 pt-2 border-t border-slate-800/60">
                    {lead.email && <span className="text-cyan-400 flex items-center gap-1"><Mail className="h-3.5 w-3.5" />{lead.email}</span>}
                    {lead.phone && <span className="text-emerald-400 flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{lead.phone}</span>}
                    {lead.linkedin && <a href={lead.linkedin} target="_blank" className="text-blue-400"><FaLinkedin /></a>}
                    {lead.instagram && <a href={lead.instagram} target="_blank" className="text-pink-400"><FaInstagram /></a>}
                    {lead.facebook && <a href={lead.facebook} target="_blank" className="text-indigo-400"><FaFacebook /></a>}
                    {lead.link && (
                      <a href={lead.link.startsWith("http") ? lead.link : `https://${lead.link}`} target="_blank" className="flex items-center gap-1 hover:text-white">
                        <Globe className="h-3.5 w-3.5" /> Visit <ExternalLink className="h-2.5 w-2.5" />
                      </a>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
