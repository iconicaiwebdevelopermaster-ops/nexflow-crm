"use client";

import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Send,
  CheckCircle2,
  Clock,
  TrendingUp,
  RefreshCw,
  Columns3,
  Radar,
  ArrowRight,
  Mail,
  Building2,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface StatsData {
  totalLeads: number;
  totalEmailsSent: number;
  newLeads: number;
  contacted: number;
  replied: number;
  won: number;
  lost: number;
}

interface RecentLead {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  status?: string | null;
  source?: string | null;
  createdAt?: string;
}

interface RecentEmail {
  id: string;
  subject: string;
  recipient: string;
  status: string;
  sentAt?: string;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<StatsData>({
    totalLeads: 0,
    totalEmailsSent: 0,
    newLeads: 0,
    contacted: 0,
    replied: 0,
    won: 0,
    lost: 0,
  });
  const [recentLeads, setRecentLeads] = useState<RecentLead[]>([]);
  const [recentEmails, setRecentEmails] = useState<RecentEmail[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/dashboard/stats", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load dashboard data");

      if (data.stats) setStats(data.stats);
      if (Array.isArray(data.recentLeads)) setRecentLeads(data.recentLeads);
      if (Array.isArray(data.recentEmails)) setRecentEmails(data.recentEmails);
    } catch (err: any) {
      toast({
        title: "Dashboard Error",
        description: err.message || "Failed to sync stats",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1600px] mx-auto min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <LayoutDashboard className="h-7 w-7 text-blue-500" />
            Executive Workspace
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Real-time overview of harvested leads, pipeline stages & cold outreach metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={fetchStats}
            disabled={loading}
            className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
            Sync Stats
          </Button>

          <Link href="/scraper">
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-blue-500/20">
              <Radar className="h-3.5 w-3.5 mr-2" /> Scrape Leads
            </Button>
          </Link>
        </div>
      </div>

      {/* Primary KPI Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-5 space-y-2 relative overflow-hidden">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Total Harvested Leads</span>
            <Users className="h-4 w-4 text-blue-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.totalLeads}</div>
          <div className="text-[11px] text-blue-400 flex items-center gap-1 font-mono">
            <TrendingUp className="h-3 w-3" /> Real-time DB sync
          </div>
        </div>

        <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Cold Emails Dispatched</span>
            <Send className="h-4 w-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-black text-white">{stats.totalEmailsSent}</div>
          <div className="text-[11px] text-cyan-400 flex items-center gap-1 font-mono">
            <Clock className="h-3 w-3" /> via Gmail / Resend
          </div>
        </div>

        <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Active Contacted Prospects</span>
            <Clock className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-3xl font-black text-amber-300">{stats.contacted}</div>
          <div className="text-[11px] text-slate-500 font-mono">Outreach in progress</div>
        </div>

        <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-5 space-y-2">
          <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
            <span>Won Deals / Clients</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-black text-emerald-400">{stats.won}</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono">
            Closed in pipeline
          </div>
        </div>
      </div>

      {/* Pipeline Breakdown Bar */}
      <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Columns3 className="h-4 w-4 text-violet-400" /> Pipeline Stage Breakdown
          </h3>
          <Link href="/pipeline" className="text-xs text-blue-400 hover:underline flex items-center gap-1 font-semibold">
            Open Kanban <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="bg-[#0d1424] border border-blue-500/20 rounded-xl p-3 text-center">
            <div className="text-xs text-blue-400 font-semibold">New</div>
            <div className="text-xl font-bold text-white mt-1">{stats.newLeads}</div>
          </div>
          <div className="bg-[#0d1424] border border-cyan-500/20 rounded-xl p-3 text-center">
            <div className="text-xs text-cyan-400 font-semibold">Contacted</div>
            <div className="text-xl font-bold text-white mt-1">{stats.contacted}</div>
          </div>
          <div className="bg-[#0d1424] border border-violet-500/20 rounded-xl p-3 text-center">
            <div className="text-xs text-violet-400 font-semibold">Replied</div>
            <div className="text-xl font-bold text-white mt-1">{stats.replied}</div>
          </div>
          <div className="bg-[#0d1424] border border-emerald-500/20 rounded-xl p-3 text-center">
            <div className="text-xs text-emerald-400 font-semibold">Won</div>
            <div className="text-xl font-bold text-white mt-1">{stats.won}</div>
          </div>
          <div className="bg-[#0d1424] border border-rose-500/20 rounded-xl p-3 text-center">
            <div className="text-xs text-rose-400 font-semibold">Lost</div>
            <div className="text-xl font-bold text-white mt-1">{stats.lost}</div>
          </div>
        </div>
      </div>

      {/* Recent Feed Grids */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-400" /> Recent Harvested Leads
            </h3>
            <Link href="/leads" className="text-xs text-slate-400 hover:text-white">
              View All
            </Link>
          </div>

          <div className="space-y-2">
            {recentLeads.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-6">
                No leads harvested yet. Use NexScraper engine.
              </div>
            ) : (
              recentLeads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="font-bold text-white truncate">{lead.name}</div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-1 truncate">
                      <Building2 className="h-3 w-3 text-slate-500" /> {lead.company || lead.name}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 shrink-0">
                    {lead.status || "NEW"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Emails */}
        <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Send className="h-4 w-4 text-cyan-400" /> Recent Cold Outreach
            </h3>
            <Link href="/email-history" className="text-xs text-slate-400 hover:text-white">
              View History
            </Link>
          </div>

          <div className="space-y-2">
            {recentEmails.length === 0 ? (
              <div className="text-xs text-slate-500 text-center py-6">
                No cold emails sent yet. Select lead in Compose Email.
              </div>
            ) : (
              recentEmails.map((email) => (
                <div
                  key={email.id}
                  className="bg-[#0d1424] border border-slate-800/80 rounded-xl p-3 flex items-center justify-between text-xs"
                >
                  <div className="space-y-0.5 min-w-0 pr-2">
                    <div className="font-bold text-white truncate">{email.subject}</div>
                    <div className="text-cyan-400 font-mono text-[11px] flex items-center gap-1 truncate">
                      <Mail className="h-3 w-3" /> {email.recipient}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
                    {email.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}