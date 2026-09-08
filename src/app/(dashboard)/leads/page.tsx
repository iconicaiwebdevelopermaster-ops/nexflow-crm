'use client';
import React, { useEffect, useMemo, useState } from "react";
import {
  Users,
  RefreshCw,
  Search,
  Trash2,
  Download,
  Mail,
  Phone,
  Building2,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface LeadItem {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  status?: string | null;
  source?: string | null;
  notes?: string | null;
  createdAt?: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  NEW: "bg-blue-500/15 text-blue-300 border-blue-500/30",
  CONTACTED: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30",
  REPLIED: "bg-violet-500/15 text-violet-300 border-violet-500/30",
  WON: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  LOST: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

export default function LeadsPage() {
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadLeads = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load leads");
      const list = data.leads || data.data || [];
      setLeads(Array.isArray(list) ? list : []);
    } catch (err: any) {
      console.error(err);
      setLeads([]);
      toast({
        title: "Leads Error",
        description: err.message || "Could not load leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLeads();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return leads.filter((l) => {
      const status = String(l.status || "NEW").toUpperCase();
      if (statusFilter !== "ALL" && status !== statusFilter) return false;
      if (!query) return true;
      const blob = `${l.name} ${l.email || ""} ${l.company || ""} ${l.phone || ""} ${l.website || ""}`.toLowerCase();
      return blob.includes(query);
    });
  }, [leads, q, statusFilter]);

  const handleExportCsv = () => {
    window.location.href = "/api/leads/export";
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete lead "${name}"?`)) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Delete failed");
      setLeads((prev) => prev.filter((l) => l.id !== id));
      toast({ title: "Lead Deleted", description: name });
    } catch (err: any) {
      // fallback: try query style if DELETE route missing
      try {
        const res2 = await fetch("/api/leads", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id }),
        });
        if (!res2.ok) throw new Error(err.message || "Delete failed");
        setLeads((prev) => prev.filter((l) => l.id !== id));
        toast({ title: "Lead Deleted", description: name });
      } catch (e2: any) {
        toast({
          title: "Delete Failed",
          description: e2.message || err.message,
          variant: "destructive",
        });
      }
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Users className="h-7 w-7 text-blue-500" />
            Leads
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage scraped and imported B2B prospects.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            onClick={handleExportCsv}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl"
          >
            <Download className="h-3.5 w-3.5 mr-2" />
            Export CSV
          </Button>
          <Button
            type="button"
            onClick={loadLeads}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1 max-w-xl">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, company..."
            className="pl-9 bg-[#070b13] border-slate-800 text-white text-xs rounded-xl"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-[#070b13] border border-slate-800 text-white text-xs rounded-xl px-3 py-2"
        >
          <option value="ALL">All Stages</option>
          <option value="NEW">New</option>
          <option value="CONTACTED">Contacted</option>
          <option value="REPLIED">Replied</option>
          <option value="WON">Won</option>
          <option value="LOST">Lost</option>
        </select>

        <div className="text-xs text-slate-400">
          Showing <span className="text-blue-400 font-bold">{filtered.length}</span> of{" "}
          <span className="text-white font-bold">{leads.length}</span> leads
        </div>
      </div>

      <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0d1424] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-4 py-3 font-semibold">Name</th>
                <th className="px-4 py-3 font-semibold">Company</th>
                <th className="px-4 py-3 font-semibold">Email</th>
                <th className="px-4 py-3 font-semibold">Phone</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Source</th>
                <th className="px-4 py-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    <RefreshCw className="h-4 w-4 animate-spin inline mr-2" />
                    Loading leads...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                    No leads match criteria. Use NexScraper to harvest B2B leads.
                  </td>
                </tr>
              ) : (
                filtered.map((lead) => {
                  const st = String(lead.status || "NEW").toUpperCase();
                  const color = STATUS_COLORS[st] || STATUS_COLORS.NEW;
                  return (
                    <tr key={lead.id} className="hover:bg-slate-900/40 transition">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-white">{lead.name}</div>
                        {lead.website ? (
                          <a
                            href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-slate-500 hover:text-blue-400 flex items-center gap-1 mt-0.5"
                          >
                            <Globe className="h-3 w-3" />
                            Website
                          </a>
                        ) : null}
                      </td>
                      <td className="px-4 py-3 text-slate-300">
                        <span className="inline-flex items-center gap-1">
                          <Building2 className="h-3 w-3 text-slate-500" />
                          {lead.company || lead.name}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-cyan-400 font-mono">
                          <Mail className="h-3 w-3" />
                          {lead.email || "â€”"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-emerald-400 font-mono">
                          <Phone className="h-3 w-3" />
                          {lead.phone || "â€”"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${color}`}>
                          {st}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">{lead.source || "â€”"}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          disabled={deletingId === lead.id}
                          onClick={() => handleDelete(lead.id, lead.name)}
                          className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-800 text-slate-400 hover:text-rose-400 hover:border-rose-500/40"
                          title="Delete lead"
                        >
                          {deletingId === lead.id ? (
                            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Trash2 className="h-3.5 w-3.5" />
                          )}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}