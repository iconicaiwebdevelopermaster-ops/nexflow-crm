import Link from "next/link";
import {
  Search, Mail, BarChart3, Zap, Shield, Globe,
  ArrowRight, CheckCircle2, Sparkles, MousePointerClick,
  Building2, Database, Send, TrendingUp
} from "lucide-react";

const features = [
  {
    icon: Search,
    title: "4-Engine Lead Scraper",
    desc: "Harvest B2B leads from Google Maps, Web Search, LinkedIn X-Ray & Indeed. Zero third-party tools needed.",
    color: "from-blue-500 to-cyan-500",
  },
  {
    icon: Mail,
    title: "Cold Email Engine",
    desc: "Send personalized cold emails with dynamic variables. 5 pre-built B2B templates. Gmail SMTP powered.",
    color: "from-purple-500 to-pink-500",
  },
  {
    icon: Database,
    title: "Smart CRM Pipeline",
    desc: "Kanban drag-and-drop pipeline. Track every lead from New to Won. Never lose a prospect again.",
    color: "from-green-500 to-emerald-500",
  },
  {
    icon: Zap,
    title: "Deep Contact Crawler",
    desc: "Auto-extracts emails, phone numbers & social profiles from /contact and /about-us pages.",
    color: "from-yellow-500 to-orange-500",
  },
  {
    icon: Shield,
    title: "Zero Duplicates",
    desc: "Strict domain normalization ensures 1 domain = 1 unique lead. Clean data, always.",
    color: "from-red-500 to-rose-500",
  },
  {
    icon: TrendingUp,
    title: "Activity & Task Logger",
    desc: "Auto-logs every email sent, lead created, and note added. Full audit trail of your outreach.",
    color: "from-indigo-500 to-violet-500",
  },
];

const stats = [
  { value: "4", label: "Scraping Engines" },
  { value: "100%", label: "Data Availability" },
  { value: "0", label: "Duplicate Leads" },
  { value: "5", label: "Email Templates" },
];

const steps = [
  {
    num: "01",
    title: "Scrape Leads",
    desc: "Enter a keyword or location. NexScraper pulls verified B2B contacts in seconds.",
    icon: MousePointerClick,
  },
  {
    num: "02",
    title: "Enrich & Organize",
    desc: "Deep crawler finds emails, phones & socials. Leads auto-organize in your pipeline.",
    icon: Building2,
  },
  {
    num: "03",
    title: "Send & Close",
    desc: "Launch cold email campaigns with 1 click. Track replies and close deals.",
    icon: Send,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0A0D14]">
      {/* ===== NAVBAR ===== */}
      <nav className="fixed top-0 w-full z-50 bg-[#0A0D14]/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-white">
              Nex<span className="text-blue-400">Flow</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="/pricing" className="hover:text-white transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/signup"
              className="text-sm bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-all"
            >
              Start Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ===== HERO ===== */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Background Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-blue-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-20 right-0 w-[400px] h-[400px] bg-purple-600/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
            <Sparkles size={14} className="text-blue-400" />
            <span className="text-xs text-blue-300 font-medium">
              NexScraper v3.0 — 4-Engine Lead Harvesting
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-7xl font-black leading-[1.1] mb-6">
            <span className="text-white">B2B Leads on</span>
            <br />
            <span className="bg-gradient-to-r from-blue-400 via-cyan-400 to-blue-500 bg-clip-text text-transparent">
              Autopilot
            </span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Scrape high-quality leads from Google Maps, LinkedIn & Indeed.
            Send personalized cold emails. Close deals — all from one
            <span className="text-white font-medium"> dark-mode CRM</span>.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/signup"
              className="group flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold text-base transition-all shadow-lg shadow-blue-600/25 hover:shadow-blue-500/40"
            >
              Start Scraping Free
              <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="#how-it-works"
              className="flex items-center gap-2 text-gray-400 hover:text-white px-6 py-3.5 rounded-xl border border-white/10 hover:border-white/20 transition-all"
            >
              See How It Works
            </a>
          </div>

          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20 max-w-3xl mx-auto">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl md:text-4xl font-black text-white">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1 uppercase tracking-wider">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURES ===== */}
      <section id="features" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Everything You Need to{" "}
              <span className="text-blue-400">Close Deals</span>
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              No more juggling 5 different tools. NexFlow replaces your scraper, CRM, and email sender.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.title}
                className="group relative bg-[#0E1220]/60 border border-white/5 rounded-2xl p-6 hover:border-blue-500/20 transition-all duration-300 hover:bg-[#111628]/60"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${f.color} flex items-center justify-center mb-4 opacity-80 group-hover:opacity-100 transition-opacity`}>
                  <f.icon size={20} className="text-white" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== HOW IT WORKS ===== */}
      <section id="how-it-works" className="py-24 px-6 bg-[#080B12]">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              3 Steps to Your First Client
            </h2>
            <p className="text-gray-500">From zero to booked meeting in under 30 minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step) => (
              <div key={step.num} className="relative text-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center mx-auto mb-6">
                  <step.icon size={24} className="text-blue-400" />
                </div>
                <div className="text-xs text-blue-500 font-mono font-bold mb-2">STEP {step.num}</div>
                <h3 className="text-xl font-bold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FINAL CTA ===== */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <div className="relative bg-gradient-to-br from-blue-600/10 to-purple-600/10 border border-blue-500/20 rounded-3xl p-12 md:p-16 overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-[80px]" />
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
              Ready to Fill Your Pipeline?
            </h2>
            <p className="text-gray-400 mb-8 relative z-10">
              Join agencies and founders who use NexFlow to generate 100+ qualified leads per week.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-8 py-3.5 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/25 relative z-10"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer className="border-t border-white/5 py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap size={14} className="text-blue-400" />
            <span className="text-sm text-gray-500">
              NexFlow CRM by{" "}
              <a href="https://nexpulselabs.com" className="text-gray-400 hover:text-white transition-colors">
                NexPulseLabs
              </a>
            </span>
          </div>
          <p className="text-xs text-gray-700">
            © 2025 NexPulseLabs. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
