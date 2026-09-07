import React from "react";
import Link from "next/link";
import { ArrowRight, Bot, Zap, Shield, Sparkles } from "lucide-react";

export const dynamic = "force-dynamic";

export default function MarketingPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-medium mb-8">
        <Sparkles className="w-3.5 h-3.5" /> NexFlow v4.0 Live
      </div>

      <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight max-w-4xl text-white mb-6">
        AI-Powered B2B Lead Gen &{" "}
        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
          Automated Cold Outreach
        </span>
      </h1>

      <p className="max-w-2xl text-slate-400 text-base sm:text-lg mb-10">
        Scrape verified leads from Maps, Web & LinkedIn. Send inbox-grade AI personalized sequences via Gmail OAuth with auto reply detection.
      </p>

      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-6 py-3 rounded-lg transition-colors shadow-lg shadow-blue-500/20"
        >
          Launch Workspace <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          href="/login"
          className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-200 font-medium px-6 py-3 rounded-lg transition-colors"
        >
          View Documentation
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mt-20 text-left">
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
          <Zap className="w-6 h-6 text-blue-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">NexScraper v3.0</h3>
          <p className="text-sm text-slate-400">4-source deep extraction with 3-layer fail-proof fallback engine.</p>
        </div>
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
          <Bot className="w-6 h-6 text-cyan-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">AI Composer (GPT-4o)</h3>
          <p className="text-sm text-slate-400">1-click hyper-personalized icebreakers and tailored value propositions.</p>
        </div>
        <div className="p-6 rounded-xl border border-white/10 bg-white/[0.02]">
          <Shield className="w-6 h-6 text-emerald-400 mb-3" />
          <h3 className="font-semibold text-white mb-1">Gmail OAuth & Follow-ups</h3>
          <p className="text-sm text-slate-400">Thread-aware inbox delivery with automatic reply detection & rate limiting.</p>
        </div>
      </div>
    </main>
  );
}
