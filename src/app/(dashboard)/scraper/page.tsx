"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/use-toast";
import { 
  Search, 
  Loader2, 
  Save, 
  Globe, 
  Mail, 
  MapPin, 
  ExternalLink, 
  Sparkles, 
  Phone,
  CheckCircle,
  Database,
  SearchCode,
  Layers,
  Briefcase
} from "lucide-react";
import { FaLinkedin, FaInstagram, FaFacebook, FaBriefcase } from "react-icons/fa6";

interface ScrapedLead {
  name: string;
  website: string;
  phone: string;
  location: string;
  source: string;
  snippet: string;
  emails: string[];
  linkedin: string | null;
  instagram: string | null;
  facebook?: string | null;
  isSaved?: boolean;
}

export default function ScraperPage() {
  const [query, setQuery] = useState("Dentists in Miami");
  const [searchType, setSearchType] = useState<"maps" | "web" | "linkedin" | "indeed">("maps");
  const [leadLimit, setLeadLimit] = useState<number>(20);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<ScrapedLead[]>([]);
  const { toast } = useToast();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) {
      toast({ title: "Validation Error", description: "Write search keywords!", variant: "destructive" });
      return;
    }
    setIsLoading(true);
    setResults([]);

    try {
      const response = await fetch("/api/scraper/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, type: searchType, limit: leadLimit })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Search failed");
      
      const fetched = result.data || [];
      setResults(fetched);
      toast({ title: "Scan Complete!", description: `Found ${fetched.length} leads via ${result.engine || "NexScraper"}.` });
    } catch (err: any) {
      toast({ title: "Scan Failed", description: err.message || "An error occurred", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  const saveLeadToCRM = async (lead: ScrapedLead, index: number) => {
    try {
      const res = await fetch("/api/scraper/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(lead)
      });
      if (!res.ok) throw new Error("Failed to save lead");
      const updatedResults = [...results];
      updatedResults[index].isSaved = true;
      setResults(updatedResults);
      toast({ title: "Lead Saved!", description: `${lead.name} added to CRM.` });
    } catch (err: any) {
      toast({ title: "Import Failed", description: err.message, variant: "destructive" });
    }
  };

  const handleBulkImport = async () => {
    const unsaved = results.filter(l => !l.isSaved);
    if (unsaved.length === 0) {
      toast({ title: "Notice", description: "All leads in session are already saved." });
      return;
    }
    try {
      const res = await fetch("/api/scraper/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(unsaved)
      });
      if (!res.ok) throw new Error("Failed bulk import");
      setResults(results.map(r => ({ ...r, isSaved: true })));
      toast({ title: "Bulk Save Complete!", description: "Successfully imported all leads." });
    } catch (err: any) {
      toast({ title: "Bulk Import Failed", description: err.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 pb-20">
      <PageHeader title="NexScraper Engine v3.0" description="Google Maps, Search, LinkedIn Founders & Indeed Job Listings Scraper." />
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurations Form Card */}
        <Card className="lg:col-span-1 p-6 border-slate-800 bg-[#0E131F] h-fit space-y-5">
          <form onSubmit={handleSearch} className="space-y-5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <SearchCode className="w-5 h-5 text-blue-500" />
                <span className="font-bold text-white text-md">Scraping Configurations</span>
              </div>
              <p className="text-xs text-slate-400">Choose your targeted intelligence engine.</p>
            </div>

            {/* Target Source Engine Toggles */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Target Engine Source</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  type="button" 
                  size="sm" 
                  variant={searchType === "maps" ? "default" : "outline"} 
                  onClick={() => setSearchType("maps")} 
                  className={`text-xs gap-1.5 justify-start ${searchType === "maps" ? "bg-blue-600 text-white" : "border-slate-800 text-slate-400"}`}
                >
                  📍 Google Maps
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant={searchType === "web" ? "default" : "outline"} 
                  onClick={() => setSearchType("web")} 
                  className={`text-xs gap-1.5 justify-start ${searchType === "web" ? "bg-blue-600 text-white" : "border-slate-800 text-slate-400"}`}
                >
                  🌐 Web Search
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant={searchType === "linkedin" ? "default" : "outline"} 
                  onClick={() => setSearchType("linkedin")} 
                  className={`text-xs gap-1.5 justify-start ${searchType === "linkedin" ? "bg-blue-600 text-white" : "border-slate-800 text-slate-400"}`}
                >
                  <FaLinkedin className="w-3.5 h-3.5 text-blue-400"/> LinkedIn
                </Button>
                <Button 
                  type="button" 
                  size="sm" 
                  variant={searchType === "indeed" ? "default" : "outline"} 
                  onClick={() => setSearchType("indeed")} 
                  className={`text-xs gap-1.5 justify-start ${searchType === "indeed" ? "bg-blue-600 text-white" : "border-slate-800 text-slate-400"}`}
                >
                  <FaBriefcase className="w-3.5 h-3.5 text-emerald-400"/> Indeed
                </Button>
              </div>
            </div>

            {/* Quantity Selector */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <Label className="text-xs text-slate-300">Target Quantity Limit</Label>
                <span className="text-xs font-mono font-bold text-blue-400 flex items-center gap-1">
                  <Layers className="w-3 h-3" /> {leadLimit} Leads
                </span>
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {[10, 20, 30, 50].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLeadLimit(num)}
                    className={`py-1.5 text-xs font-bold rounded-md border transition-all ${
                      leadLimit === num
                        ? "bg-blue-600 text-white border-blue-500"
                        : "bg-[#0A0D14] text-slate-400 border-slate-800 hover:bg-slate-800"
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            {/* Keyword Query */}
            <div className="space-y-2">
              <Label className="text-xs text-slate-300">Search Keywords Query</Label>
              <Input 
                value={query} 
                onChange={(e) => setQuery(e.target.value)} 
                placeholder={searchType === "linkedin" ? "e.g. Web Agency Founder London" : "e.g. Dentists in Miami"} 
                className="bg-[#0A0D14] border-slate-800 text-white text-sm h-10 font-medium" 
              />
              <span className="text-[10px] text-slate-500 block">
                {searchType === "linkedin" ? "💡 Finds CEOs, Founders & Owners profiles" : "💡 Write niche & location targets directly"}
              </span>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full bg-blue-600 hover:bg-blue-500 gap-2 h-10 font-semibold text-white">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin text-white" /> : <Sparkles className="w-4 h-4 text-emerald-400" />}
              Activate Scraper Engine
            </Button>
          </form>
        </Card>

        {/* Results Stream Area */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center bg-[#0E131F]/80 p-4 rounded-xl border border-slate-800">
            <div>
              <h3 className="font-bold text-white text-md">Scraping Results Feed</h3>
              <p className="text-xs text-slate-400">Total harvested listings in session: <span className="text-blue-400 font-bold">{results.length}</span></p>
            </div>
            {results.length > 0 && (
              <Button onClick={handleBulkImport} className="bg-emerald-600 hover:bg-emerald-500 text-xs font-semibold gap-2 h-9">
                <Database className="w-4 h-4" /> Import All Scraped ({results.filter(r => !r.isSaved).length})
              </Button>
            )}
          </div>

          {isLoading && (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((v) => (
                <div key={v} className="bg-[#0E131F] p-5 rounded-xl border border-slate-800 animate-pulse flex flex-col gap-3">
                  <div className="h-4 w-1/3 bg-slate-800 rounded"></div>
                  <div className="h-3 w-2/3 bg-slate-800 rounded"></div>
                  <div className="h-8 w-full bg-slate-900 rounded mt-2"></div>
                </div>
              ))}
            </div>
          )}

          {!isLoading && results.length === 0 && (
            <div className="text-center py-16 bg-[#0E131F]/30 border border-dashed border-slate-800 rounded-xl">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3 animate-pulse" />
              <p className="text-sm font-semibold text-slate-300">Ready to Scan!</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Select your source engine (Maps, Web, LinkedIn, Indeed) and press Activate.
              </p>
            </div>
          )}

          <div className="space-y-4">
            {results.map((lead, idx) => (
              <Card 
                key={idx} 
                className={`p-5 border-slate-800/80 bg-[#0E131F] hover:border-slate-700 transition-all duration-200 ${
                  lead.isSaved ? "opacity-75 border-emerald-950 bg-emerald-950/10" : ""
                }`}
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-bold text-white text-base leading-tight">{lead.name}</h4>
                      <Badge className="text-[9px] font-semibold bg-blue-500/10 text-blue-400 border-blue-500/20">{lead.source}</Badge>
                      {lead.isSaved && (
                        <Badge className="text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/20 flex items-center gap-1">
                          <CheckCircle className="w-2.5 h-2.5" /> Inside CRM
                        </Badge>
                      )}
                    </div>

                    <p className="text-xs text-slate-400 line-clamp-1 italic">Snippet: "{lead.snippet}"</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 pt-1">
                      <div className="space-y-1.5 text-xs text-slate-300 font-mono">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-blue-400" />
                          <span className="text-emerald-400 font-semibold">
                            {lead.emails && lead.emails.length > 0 ? lead.emails[0] : "N/A"}
                          </span>
                        </div>

                        {lead.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-blue-400" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-300">
                        {lead.website && (
                          <div className="flex items-center gap-2">
                            <Globe className="w-3.5 h-3.5 text-slate-400" />
                            <a 
                              href={lead.website} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="text-blue-400 hover:underline flex items-center gap-1"
                            >
                              Visit Link <ExternalLink className="w-2.5 h-2.5" />
                            </a>
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-slate-400">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span className="truncate max-w-[200px]">{lead.location}</span>
                        </div>
                      </div>
                    </div>

                    {/* Social profiles */}
                    <div className="flex items-center gap-3 pt-2 border-t border-slate-800/60 mt-2">
                      {lead.linkedin ? (
                        <a href={lead.linkedin} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] text-blue-400 hover:underline">
                          <FaLinkedin className="w-3.5 h-3.5 text-blue-400" /> LinkedIn
                        </a>
                      ) : null}

                      {lead.instagram && (
                        <a href={lead.instagram} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] text-pink-400 hover:underline">
                          <FaInstagram className="w-3.5 h-3.5 text-pink-400" /> Instagram
                        </a>
                      )}

                      {lead.facebook && (
                        <a href={lead.facebook} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[11px] text-blue-500 hover:underline">
                          <FaFacebook className="w-3.5 h-3.5 text-blue-500" /> Facebook
                        </a>
                      )}
                    </div>
                  </div>

                  <Button
                    disabled={lead.isSaved}
                    onClick={() => saveLeadToCRM(lead, idx)}
                    variant={lead.isSaved ? "ghost" : "outline"}
                    className={`border-slate-800 hover:bg-blue-600 hover:text-white transition-all duration-150 gap-2 font-medium text-xs w-full md:w-auto h-9 ${
                      lead.isSaved ? "text-emerald-500 bg-emerald-500/10 hover:bg-emerald-500/10 cursor-not-allowed" : "text-white"
                    }`}
                  >
                    {lead.isSaved ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5" /> Saved
                      </>
                    ) : (
                      <>
                        <Save className="w-3.5 h-3.5" /> Save Lead
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}