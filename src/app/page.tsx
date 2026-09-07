import React from "react";
import Link from "next/link";
import { 
  Radar, 
  Users, 
  Send, 
  Zap, 
  CheckCircle2, 
  ArrowRight, 
  ShieldCheck, 
  Globe2, 
  Bot, 
  Sparkles,
  BarChart3,
  Search
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#060a12] text-slate-100 font-sans selection:bg-blue-500 selection:text-white">
      {/* Background Gradients */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute top-[40%] -left-[10%] w-[500px] h-[500px] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Navigation Header */}
      <header className="relative z-50 border-b border-slate-800/80 bg-[#060a12]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-black text-white text-xl shadow-lg shadow-blue-500/25">
              N
            </div>
            <div>
              <span className="text-xl font-black tracking-tight text-white">NexFlow</span>
              <span className="text-xs text-blue-400 block -mt-1 font-semibold">CRM v3.0</span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#scraper" className="hover:text-white transition-colors">NexScraper Engine</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </nav>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-4 py-2"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-semibold bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40 flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 pt-20 pb-16 px-6 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold mb-8 backdrop-blur-md">
          <Sparkles className="h-3.5 w-3.5" />
          Powered by NexScraper Engine v3.0 — Unlimited B2B Leads
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white tracking-tight max-w-5xl mx-auto leading-[1.1]">
          Harvest High-Ticket B2B Leads & <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-400">Automate Cold Outreach</span>
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto leading-relaxed">
          The all-in-one B2B Lead Scraping & CRM platform for agencies and SaaS founders. Scrape Google Maps, LinkedIn, and Indeed natively into your pipeline without monthly data costs.
        </p>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            href="/signup" 
            className="w-full sm:w-auto text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-8 py-4 rounded-xl transition-all shadow-xl shadow-blue-600/30 hover:scale-[1.02] flex items-center justify-center gap-2"
          >
            Start Free Trial <ArrowRight className="h-5 w-5" />
          </Link>
          <a 
            href="#features" 
            className="w-full sm:w-auto text-base font-semibold border border-slate-800 bg-[#0d1424]/80 text-slate-300 hover:bg-slate-800 hover:text-white px-8 py-4 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            Explore Platform
          </a>
        </div>

        {/* Feature Badges */}
        <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Zero Monthly Scraper Fees</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Direct Gmail / SMTP Integration</span>
          <span className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-emerald-400" /> Real-time Kanban Lead Pipeline</span>
        </div>
      </section>

      {/* Dashboard Preview Mockup */}
      <section className="relative z-10 max-w-6xl mx-auto px-6 mb-28">
        <div className="rounded-2xl border border-slate-800/80 bg-[#0a0f1d]/90 p-3 shadow-2xl shadow-blue-500/10 backdrop-blur-2xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-800/80">
            <div className="h-3 w-3 rounded-full bg-rose-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            <span className="text-xs text-slate-500 font-mono ml-2">app.nexflow.io/dashboard</span>
          </div>
          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
            <div className="border border-slate-800/80 rounded-xl p-5 bg-[#060a12]/60">
              <Radar className="h-8 w-8 text-cyan-400 mb-3" />
              <h3 className="font-bold text-white text-base">NexScraper Engine</h3>
              <p className="text-xs text-slate-400 mt-1">4 Modes: Maps, Search, LinkedIn & Indeed X-Ray.</p>
            </div>
            <div className="border border-slate-800/80 rounded-xl p-5 bg-[#060a12]/60">
              <Users className="h-8 w-8 text-blue-400 mb-3" />
              <h3 className="font-bold text-white text-base">Kanban Pipeline</h3>
              <p className="text-xs text-slate-400 mt-1">Drag and drop leads from New to Closed Won.</p>
            </div>
            <div className="border border-slate-800/80 rounded-xl p-5 bg-[#060a12]/60">
              <Send className="h-8 w-8 text-indigo-400 mb-3" />
              <h3 className="font-bold text-white text-base">Automated Outreach</h3>
              <p className="text-xs text-slate-400 mt-1">SMTP email sender with variable tag replacement.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 py-20 border-t border-slate-800/80 bg-[#04070e]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-extrabold text-white">Simple, Transparent Pricing</h2>
          <p className="text-slate-400 text-sm mt-2 max-w-xl mx-auto">Scale your outreach without paying per-lead data markups.</p>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {/* Starter */}
            <div className="border border-slate-800 rounded-2xl p-8 bg-[#070b14] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Starter</h3>
                <div className="mt-4 text-3xl font-black text-white">$29 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <p className="text-xs text-slate-400 mt-2">For freelancers & solo founders.</p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> 500 Leads / month</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> Kanban Lead Pipeline</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> Gmail SMTP Outreach</li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 rounded-xl transition">Choose Starter</Link>
            </div>

            {/* Pro */}
            <div className="border-2 border-blue-500 rounded-2xl p-8 bg-[#0a1120] relative shadow-2xl shadow-blue-500/20 flex flex-col justify-between">
              <div className="absolute -top-3 right-6 bg-blue-600 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full">Most Popular</div>
              <div>
                <h3 className="text-lg font-bold text-white">Pro Agency</h3>
                <div className="mt-4 text-3xl font-black text-white">$79 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <p className="text-xs text-slate-400 mt-2">For growing agencies & sales teams.</p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> Unlimited Lead Scraping</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> 4 Scraping Engines (LinkedIn, Maps, Indeed)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> Advanced Email Analytics</li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-3 rounded-xl transition shadow-lg shadow-blue-600/30">Get Pro Access</Link>
            </div>

            {/* Enterprise */}
            <div className="border border-slate-800 rounded-2xl p-8 bg-[#070b14] flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white">Scale</h3>
                <div className="mt-4 text-3xl font-black text-white">$199 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
                <p className="text-xs text-slate-400 mt-2">For high-volume outreach operations.</p>
                <ul className="mt-6 space-y-3 text-xs text-slate-300">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> Dedicated Proxy Pool</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> Multi-Inbox Rotation</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-blue-400" /> Priority 24/7 Support</li>
                </ul>
              </div>
              <Link href="/signup" className="mt-8 block text-center bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold py-3 rounded-xl transition">Contact Sales</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 py-10 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} NexFlow CRM by NexPulseLabs studio. All rights reserved.</p>
      </footer>
    </div>
  );
}
