import React from 'react';
import Link from 'next/link';
import { 
  Zap, 
  Search, 
  Mail, 
  CheckCircle2, 
  ArrowRight, 
  Database, 
  Sparkles, 
  Flame,
  Globe
} from 'lucide-react';

export const dynamic = 'force-dynamic';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#03050c] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* ─── NAVIGATION ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#03050c]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">
              N
            </div>
            <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              NexFlow <span className="text-cyan-400 text-xs px-2 py-0.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 ml-1">v8.0</span>
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#scraper" className="hover:text-white transition-colors">4-Source Scraper</a>
            <a href="#comparison" className="hover:text-white transition-colors">Comparison</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-slate-300 hover:text-white px-4 py-2 rounded-lg hover:bg-white/5 transition-all"
            >
              Sign In
            </Link>
            <Link 
              href="/signup" 
              className="text-sm font-semibold bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 hover:opacity-90 text-white px-5 py-2.5 rounded-lg shadow-lg shadow-indigo-500/25 transition-all flex items-center gap-2"
            >
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-36 pb-20 px-6 overflow-hidden">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-500/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-cyan-500/15 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-indigo-300 text-xs font-medium mb-8">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            All-In-One B2B Growth Engine • Lead Scraping & AI Cold Outreach
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.1] mb-6">
            Find Clients & Send High-Converting <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-cyan-400 via-indigo-300 to-purple-400 bg-clip-text text-transparent">
              AI Cold Emails on Autopilot
            </span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Scrape verified B2B leads from Google Maps, LinkedIn & Web search. Write hyper-personalized 1-to-1 emails with GPT-4o, and dispatch inbox-grade campaigns via Gmail OAuth.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 text-white font-semibold shadow-xl shadow-cyan-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-base"
            >
              Start Generating Leads Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-4 rounded-xl border border-white/10 hover:border-white/20 bg-white/5 hover:bg-white/10 text-slate-300 font-medium transition-all text-base"
            >
              Explore Workspace Demo
            </Link>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto pt-8 border-t border-white/5 text-left">
            <div className="p-4 rounded-xl bg-[#050815]/60 border border-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-white mb-1">4 Sources</div>
              <div className="text-xs text-slate-400">Maps, Web, LinkedIn & Indeed</div>
            </div>
            <div className="p-4 rounded-xl bg-[#050815]/60 border border-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-cyan-400 mb-1">100% Inbox</div>
              <div className="text-xs text-slate-400">Official Gmail OAuth 2.0</div>
            </div>
            <div className="p-4 rounded-xl bg-[#050815]/60 border border-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-indigo-400 mb-1">GPT-4o</div>
              <div className="text-xs text-slate-400">Deep AI Personalization</div>
            </div>
            <div className="p-4 rounded-xl bg-[#050815]/60 border border-white/5 backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-400 mb-1">Zero SaaS Fees</div>
              <div className="text-xs text-slate-400">Self-Hosted PostgreSQL</div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── 4-SOURCE SCRAPER SECTION ─── */}
      <section id="scraper" className="py-24 px-6 border-t border-white/5 bg-[#050815]/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">NexScraper Engine v3.0</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white mb-4">Harvest High-Intent B2B Leads in Seconds</p>
            <p className="text-slate-400 text-sm sm:text-base">
              Say goodbye to expensive list providers. Scrape real-time, verified business emails directly into your CRM.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Google Maps",
                desc: "Harvest local business owners, dental clinics, realtors, and law firms with phone numbers and addresses.",
                tag: "Local B2B",
                icon: Database,
                color: "text-amber-400"
              },
              {
                title: "LinkedIn X-Ray",
                desc: "Pinpoint Founders, CEOs, CMOs and decision makers by niche, location, and company size.",
                tag: "Decision Makers",
                icon: Search,
                color: "text-blue-400"
              },
              {
                title: "Web Search Harvester",
                desc: "Extract emails and business intelligence from corporate websites and SaaS platforms.",
                tag: "Global SaaS & Tech",
                icon: Globe,
                color: "text-cyan-400"
              },
              {
                title: "Indeed Hiring X-Ray",
                desc: "Find fast-growing companies actively hiring talent with budget to spend on your services.",
                tag: "High Intent",
                icon: Flame,
                color: "text-rose-400"
              }
            ].map((item, i) => (
              <div key={i} className="p-6 rounded-2xl bg-[#080d24]/60 border border-white/5 hover:border-indigo-500/30 transition-all group">
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-white/5 ${item.color}`}>
                    <item.icon className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
                    {item.tag}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">{item.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COMPETITOR COMPARISON SECTION ─── */}
      <section id="comparison" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-3">Why NexFlow?</h2>
            <p className="text-3xl sm:text-4xl font-bold text-white mb-4">Unbeatable Features & Zero Monthly Subscriptions</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/10 text-xs font-semibold text-slate-400 uppercase">
                  <th className="py-4 px-6">Feature</th>
                  <th className="py-4 px-6 text-cyan-400 bg-cyan-500/10 rounded-t-xl">NexFlow CRM</th>
                  <th className="py-4 px-6">Apollo.io</th>
                  <th className="py-4 px-6">Instantly</th>
                </tr>
              </thead>
              <tbody className="text-sm divide-y divide-white/5 text-slate-300">
                <tr>
                  <td className="py-4 px-6 font-medium text-white">4-Source Lead Scraping</td>
                  <td className="py-4 px-6 bg-cyan-500/10 font-bold text-cyan-300">Included (Free)</td>
                  <td className="py-4 px-6 text-slate-500">Extra Credits $$</td>
                  <td className="py-4 px-6 text-rose-500">Not Included</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Gmail OAuth 2.0 Sending</td>
                  <td className="py-4 px-6 bg-cyan-500/10 font-bold text-cyan-300">Native Inbox API</td>
                  <td className="py-4 px-6 text-slate-400">Yes</td>
                  <td className="py-4 px-6 text-slate-400">Yes</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">GPT-4o Deep AI Personalization</td>
                  <td className="py-4 px-6 bg-cyan-500/10 font-bold text-cyan-300">Built-in</td>
                  <td className="py-4 px-6 text-slate-500">Addon Cost</td>
                  <td className="py-4 px-6 text-slate-500">Addon Cost</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Visual Drag & Drop Kanban</td>
                  <td className="py-4 px-6 bg-cyan-500/10 font-bold text-cyan-300">Full Pipeline</td>
                  <td className="py-4 px-6 text-rose-500">No</td>
                  <td className="py-4 px-6 text-rose-500">No</td>
                </tr>
                <tr>
                  <td className="py-4 px-6 font-medium text-white">Monthly Cost</td>
                  <td className="py-4 px-6 bg-cyan-500/10 font-extrabold text-emerald-400 text-base">$0 / mo</td>
                  <td className="py-4 px-6 text-slate-400">$49 - $99/mo</td>
                  <td className="py-4 px-6 text-slate-400">$37 - $79/mo</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── PRICING SECTION ─── */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5 bg-[#050815]/40">
        <div className="max-w-4xl mx-auto text-center mb-16">
          <h2 className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3">Transparent Plans</h2>
          <p className="text-3xl sm:text-4xl font-bold text-white mb-4">Start Free, Scale Without Limits</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free / Community */}
          <div className="p-8 rounded-2xl bg-[#080d24]/60 border border-white/10 flex flex-col justify-between">
            <div>
              <div className="text-sm font-semibold text-slate-400 mb-2">Self-Hosted Community</div>
              <div className="text-4xl font-black text-white mb-6">$0 <span className="text-xs text-slate-400 font-normal">/ forever</span></div>
              <ul className="space-y-3.5 text-xs text-slate-300 mb-8">
                {['Unlimited Lead Storage', '4-Source Scraping Engine', 'Gmail OAuth & SMTP Outbound', 'Drag & Drop Kanban Pipeline', 'Automated Reply Detection'].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link 
              href="/signup" 
              className="w-full py-3.5 rounded-xl border border-white/20 hover:border-white/40 text-center text-sm font-semibold text-white transition-all block"
            >
              Get Started Free
            </Link>
          </div>

          {/* Pro / Cloud */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-indigo-900/30 to-[#080d24]/80 border-2 border-indigo-500/50 flex flex-col justify-between relative shadow-2xl shadow-indigo-500/10">
            <div className="absolute -top-3 right-6 px-3 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-[10px] font-bold tracking-wider uppercase text-white">
              Recommended
            </div>
            <div>
              <div className="text-sm font-semibold text-indigo-300 mb-2">Agency & Growth</div>
              <div className="text-4xl font-black text-white mb-6">$29 <span className="text-xs text-slate-400 font-normal">/ month</span></div>
              <ul className="space-y-3.5 text-xs text-slate-200 mb-8">
                {['Everything in Community', 'Multi-Sender Warm-up Support', 'High-Speed GPT-4o Dedicated Queue', 'Automated Multi-Stage Followup Sequences', 'Priority Cloud Telemetry & Webhooks'].map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link 
              href="/signup" 
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 text-center text-sm font-bold text-white shadow-lg shadow-indigo-500/25 hover:opacity-95 transition-all block"
            >
              Upgrade to Agency
            </Link>
          </div>
        </div>
      </section>

      {/* ─── CLEAN FOOTER (NO SECRET ADMIN LINK) ─── */}
      <footer className="border-t border-white/5 py-12 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-300">
            <div className="w-5 h-5 rounded-md bg-indigo-500 flex items-center justify-center text-[10px] text-white">N</div>
            NexFlow CRM v8.0
          </div>
          <div>© {new Date().getFullYear()} NexPulseLabs Inc. All rights reserved.</div>
          <div className="flex items-center gap-6">
            <Link href="/login" className="hover:text-slate-300 transition-colors">Sign In</Link>
            <Link href="/signup" className="hover:text-slate-300 transition-colors">Create Account</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}