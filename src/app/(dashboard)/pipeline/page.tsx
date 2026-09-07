"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Columns3,
  RefreshCw,
  Mail,
  Phone,
  Building2,
  GripVertical,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

type LeadStatus = "NEW" | "CONTACTED" | "REPLIED" | "QUALIFIED" | "WON" | "LOST" | string;

interface Lead {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  status?: LeadStatus | null;
  source?: string | null;
}

const STAGES: { key: LeadStatus; label: string; color: string; border: string }[] = [
  { key: "NEW", label: "New", color: "bg-blue-500/15 text-blue-300", border: "border-blue-500/30" },
  { key: "CONTACTED", label: "Contacted", color: "bg-cyan-500/15 text-cyan-300", border: "border-cyan-500/30" },
  { key: "REPLIED", label: "Replied", color: "bg-violet-500/15 text-violet-300", border: "border-violet-500/30" },
  { key: "QUALIFIED", label: "Discussion", color: "bg-amber-500/15 text-amber-300", border: "border-amber-500/30" },
  { key: "WON", label: "Won", color: "bg-emerald-500/15 text-emerald-300", border: "border-emerald-500/30" },
  { key: "LOST", label: "Lost", color: "bg-rose-500/15 text-rose-300", border: "border-rose-500/30" },
];

function normalizeStatus(s?: string | null): LeadStatus {
  const v = String(s || "NEW").toUpperCase();
  if (v === "DISCUSSION") return "QUALIFIED";
  if (STAGES.some((x) => x.key === v)) return v;
  return "NEW";
}

export default function PipelinePage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/leads", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load leads");
      const list: Lead[] = data.leads || data.data || [];
      setLeads(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast({
        title: "Pipeline Error",
        description: err.message || "Could not load leads",
        variant: "destructive",
      });
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return leads;
    return leads.filter((l) => {
      const blob = `${l.name} ${l.email || ""} ${l.company || ""} ${l.phone || ""}`.toLowerCase();
      return blob.includes(query);
    });
  }, [leads, q]);

  const grouped = useMemo(() => {
    const map: Record<string, Lead[]> = {};
    STAGES.forEach((s) => (map[s.key] = []));
    filtered.forEach((lead) => {
      const st = normalizeStatus(lead.status);
      if (!map[st]) map[st] = [];
      map[st].push(lead);
    });
    return map;
  }, [filtered]);

  const moveLead = async (leadId: string, newStatus: LeadStatus) => {
    const lead = leads.find((l) => l.id === leadId);
    if (!lead) return;
    const prev = normalizeStatus(lead.status);
    if (prev === newStatus) return;

    // optimistic UI
    setLeads((all) =>
      all.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    setBusyId(leadId);

    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Status update failed");

      toast({
        title: "Pipeline Updated",
        description: `${lead.name} → ${newStatus}`,
      });
    } catch (err: any) {
      // rollback
      setLeads((all) =>
        all.map((l) => (l.id === leadId ? { ...l, status: prev } : l))
      );
      toast({
        title: "Move Failed",
        description: err.message || "Could not update status",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
      setDraggingId(null);
    }
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggingId(id);
    e.dataTransfer.setData("text/lead-id", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (e: React.DragEvent, status: LeadStatus) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/lead-id") || draggingId;
    if (id) moveLead(id, status);
  };

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1700px] mx-auto min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <Columns3 className="h-7 w-7 text-blue-500" />
            Pipeline Kanban
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Drag leads across stages · New → Contacted → Replied → Discussion → Won / Lost
          </p>
        </div>
        <Button
          onClick={load}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
        <Button
          onClick={() => (window.location.href = "/api/leads/export")}
          className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs"
        >
          Export CSV
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="h-4 w-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, company..."
            className="pl-9 bg-[#070b13] border-slate-800 text-white text-xs rounded-xl"
          />
        </div>
        <div className="text-xs text-slate-400">
          Showing <span className="text-blue-400 font-bold">{filtered.length}</span> of{" "}
          <span className="text-white font-bold">{leads.length}</span> leads
        </div>
      </div>

      {loading ? (
        <div className="text-slate-500 text-sm flex items-center gap-2 p-10 justify-center">
          <RefreshCw className="h-4 w-4 animate-spin" /> Loading pipeline...
        </div>
      ) : (
        <div className="flex gap-4 overflow-x-auto pb-4 min-h-[70vh]">
          {STAGES.map((stage) => {
            const items = grouped[stage.key] || [];
            return (
              <div
                key={stage.key}
                className={`min-w-[280px] w-[280px] flex-shrink-0 rounded-2xl border ${stage.border} bg-[#070b13]/80 flex flex-col max-h-[calc(100vh-220px)]`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => onDrop(e, stage.key)}
              >
                <div className="p-3 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#070b13]/95 rounded-t-2xl z-10">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${stage.color}`}>
                      {stage.label}
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 font-mono">{items.length}</span>
                </div>

                <div className="p-2 space-y-2 overflow-y-auto flex-1">
                  {items.length === 0 ? (
                    <div className="text-[11px] text-slate-600 text-center py-8 border border-dashed border-slate-800 rounded-xl">
                      Drop leads here
                    </div>
                  ) : (
                    items.map((lead) => (
                      <div
                        key={lead.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, lead.id)}
                        onDragEnd={() => setDraggingId(null)}
                        className={`rounded-xl border border-slate-800 bg-[#0d1424] p-3 cursor-grab active:cursor-grabbing hover:border-slate-600 transition ${
                          draggingId === lead.id ? "opacity-50 scale-[0.98]" : ""
                        } ${busyId === lead.id ? "opacity-70" : ""}`}
                      >
                        <div className="flex items-start gap-2">
                          <GripVertical className="h-4 w-4 text-slate-600 shrink-0 mt-0.5" />
                          <div className="min-w-0 flex-1 space-y-1.5">
                            <div className="text-xs font-bold text-white truncate">{lead.name}</div>
                            {(lead.company || lead.name) && (
                              <div className="text-[10px] text-slate-400 flex items-center gap-1 truncate">
                                <Building2 className="h-3 w-3" />
                                {lead.company || lead.name}
                              </div>
                            )}
                            {lead.email && (
                              <div className="text-[10px] text-cyan-400/90 flex items-center gap-1 truncate font-mono">
                                <Mail className="h-3 w-3" />
                                {lead.email}
                              </div>
                            )}
                            {lead.phone && (
                              <div className="text-[10px] text-emerald-400/90 flex items-center gap-1 truncate font-mono">
                                <Phone className="h-3 w-3" />
                                {lead.phone}
                              </div>
                            )}
                            {lead.source && (
                              <div className="text-[9px] text-slate-500 pt-1">{lead.source}</div>
                            )}

                            {/* quick status buttons for mobile / no-drag */}
                            <div className="flex flex-wrap gap-1 pt-2">
                              {STAGES.filter((s) => s.key !== normalizeStatus(lead.status))
                                .slice(0, 3)
                                .map((s) => (
                                  <button
                                    key={s.key}
                                    type="button"
                                    disabled={busyId === lead.id}
                                    onClick={() => moveLead(lead.id, s.key)}
                                    className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700"
                                  >
                                    → {s.label}
                                  </button>
                                ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

