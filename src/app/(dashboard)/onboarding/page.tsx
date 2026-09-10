'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Search, Sparkles, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);

  return (
    <div className="min-h-screen bg-[#03050c] text-white flex flex-col justify-center items-center p-6">
      <div className="w-full max-w-2xl bg-[#050815] border border-white/10 rounded-2xl p-8 shadow-2xl relative">
        
        {/* Progress Header */}
        <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-cyan-400">Step {step} of 3</span>
            <h1 className="text-xl font-bold mt-1">Welcome to NexFlow CRM Setup</h1>
          </div>
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`h-2 rounded-full transition-all ${
                  step === i ? 'w-8 bg-cyan-400' : step > i ? 'w-4 bg-emerald-500' : 'w-4 bg-white/10'
                }`} 
              />
            ))}
          </div>
        </div>

        {/* Step 1: Connect Channel */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-indigo-400">
              <Mail className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Step 1: Connect Outreach Channel</h2>
            </div>
            <p className="text-sm text-slate-400">
              NexFlow supports direct Gmail OAuth (recommended for 100% inbox placement) or any standard SMTP server.
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              <a 
                href="/api/auth/gmail"
                className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-cyan-300 mb-1">Gmail OAuth 2.0</div>
                  <div className="text-xs text-slate-400">1-click official connection</div>
                </div>
                <div className="text-xs font-semibold text-cyan-400 mt-4 flex items-center gap-1">Connect Gmail →</div>
              </a>

              <Link 
                href="/settings"
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="font-bold text-white mb-1">Manual SMTP</div>
                  <div className="text-xs text-slate-400">App Password / Hostinger / SendGrid</div>
                </div>
                <div className="text-xs font-semibold text-slate-300 mt-4 flex items-center gap-1">Configure SMTP →</div>
              </Link>
            </div>
          </div>
        )}

        {/* Step 2: Harvest First Leads */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-cyan-400">
              <Search className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Step 2: Scrape Your First B2B Leads</h2>
            </div>
            <p className="text-sm text-slate-400">
              Harvest verified business contacts from Google Maps, LinkedIn X-Ray, or Web search with 1 click.
            </p>
            <Link 
              href="/scraper"
              className="block p-6 rounded-xl border border-indigo-500/30 bg-indigo-500/10 text-center hover:bg-indigo-500/20 transition-all"
            >
              <div className="font-bold text-white text-base mb-1">Open NexScraper Engine</div>
              <div className="text-xs text-indigo-300">Run a search and import 10-20 leads to your workspace</div>
            </Link>
          </div>
        )}

        {/* Step 3: Compose with AI */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="flex items-center gap-3 text-purple-400">
              <Sparkles className="w-6 h-6" />
              <h2 className="text-lg font-bold text-white">Step 3: Launch First AI Campaign</h2>
            </div>
            <p className="text-sm text-slate-400">
              Use GPT-4o to hyper-personalize emails for your imported leads and hit dispatch!
            </p>
            <Link 
              href="/compose"
              className="block p-6 rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-center hover:bg-cyan-500/20 transition-all"
            >
              <div className="font-bold text-cyan-300 text-base mb-1">Open AI Campaign Composer</div>
              <div className="text-xs text-slate-400">Personalize and schedule your outreach campaign</div>
            </Link>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/5">
          {step > 1 ? (
            <button 
              onClick={() => setStep(step - 1)}
              className="px-4 py-2 rounded-lg border border-white/10 hover:bg-white/5 text-xs font-semibold text-slate-300 flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>
          ) : <div />}

          {step < 3 ? (
            <button 
              onClick={() => setStep(step + 1)}
              className="px-5 py-2.5 rounded-lg bg-gradient-to-r from-indigo-500 to-cyan-500 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-indigo-500/20"
            >
              Next Step <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button 
              onClick={() => router.push('/dashboard')}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-xs font-bold text-white flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              Finish Setup & Go to Dashboard <CheckCircle2 className="w-4 h-4" />
            </button>
          )}
        </div>

      </div>
    </div>
  );
}