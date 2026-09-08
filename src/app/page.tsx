export const dynamic = 'force-dynamic';
export const revalidate = 0;
import React from "react";
import Link from "next/link";
import { ArrowRight, Bot, Zap, Shield, Sparkles, Database, Mail, BarChart3 } from "lucide-react";


export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0A0D14] text-white flex flex-col justify-between selection:bg-blue-500 selection:text-white">
      {/* Top Navbar */}
      <header className="border-b border-white/10 px-6 py-4 flex items-center justify-between max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/30">
            N
          </div>
          <span className="font-bold text-lg tracking-tight">NexFlow CRM</span>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 ml-2">v4.0 Live</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-sm text-slate-300 hover:text-white transition-colors">
            Sign In
          </Link>
          <Link
            href="/login"
            className="text-sm bg-blue-600 hover:bg-blue-500 text-white font-medium px-4 py-2 rounded-lg transition-colors shadow-md shadow-blue-500/20"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center max-w-5xl mx-auto w-full">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8">
          <Sparkles className="w-3.5 h-3.5" /> Autonomous B2B Lead Gen & Outreach Platform
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight">
          Find High-Ticket Leads & Close Deals with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500">
            AI Cold Outreach
          </span>
        </h1>

        <p className="max-w-2xl text-slate-400 text-base sm:text-lg mb-10">
          Scrape verified leads from Google Maps, Web & LinkedIn. Send inbox-grade AI personalized cold emails via Gmail OAuth with auto reply detection & follow-ups.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20 text-base"
          >
            Launch Workspace <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/login"
            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium px-6 py-3 rounded-lg transition-colors text-base"
          >
            Documentation
          </Link>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mt-20 text-left w-full">
          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-blue-500/30 transition-colors">
            <Database className="w-6 h-6 text-blue-400 mb-3" />
            <h3 className="font-semibold text-white mb-1">NexScraper v3.0</h3>
            <p className="text-sm text-slate-400">4-source deep crawler with 3-layer fail-proof fallback engine.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-cyan-500/30 transition-colors">
            <Bot className="w-6 h-6 text-cyan-400 mb-3" />
            <h3 className="font-semibold text-white mb-1">AI Composer (GPT-4o)</h3>
            <p className="text-sm text-slate-400">1-click hyper-personalized icebreakers and tailored value propositions.</p>
          </div>
          <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02] hover:border-emerald-500/30 transition-colors">
            <Mail className="w-6 h-6 text-emerald-400 mb-3" />
            <h3 className="font-semibold text-white mb-1">Gmail OAuth Outreach</h3>
            <p className="text-sm text-slate-400">Thread-aware inbox delivery with automatic reply detection & rate limiting.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 py-6 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} NexFlow CRM by NexPulseLabs. All rights reserved.
      </footer>
    </div>
  );
}
