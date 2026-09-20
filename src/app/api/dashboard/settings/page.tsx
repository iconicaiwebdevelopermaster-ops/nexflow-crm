// path: src/app/(dashboard)/settings/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Input states (Strictly empty by default)
  const [fromName, setFromName] = useState("");
  const [fromEmail, setFromEmail] = useState("");
  const [promoteSite, setPromoteSite] = useState("");
  const [promoteTopic, setPromoteTopic] = useState("");
  const [aiProvider, setAiProvider] = useState("deepseek");
  const [aiExtraPrompt, setAiExtraPrompt] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");

  // 1. Fetch saved user settings on mount
  useEffect(() => {
    async function loadSettings() {
      try {
        const res = await fetch("/api/settings");
        if (!res.ok) throw new Error("Failed to load settings");
        const data = await res.json();

        // Populate state with database values OR safe empty strings
        setFromName(data.fromName || "");
        setFromEmail(data.fromEmail || "");
        setPromoteSite(data.promoteSite || "");
        setPromoteTopic(data.promoteTopic || "");
        setAiProvider(data.aiProvider || "deepseek");
        setAiExtraPrompt(data.aiExtraPrompt || "");
        setSmtpUser(data.smtpUser || "");
        setSmtpPass(data.smtpPass ? "••••••••••••" : ""); // Mask visually if exists
      } catch (err: any) {
        setError(err.message || "An error occurred");
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  // 2. Handle Save
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        fromName,
        fromEmail,
        promoteSite,
        promoteTopic,
        aiProvider,
        aiExtraPrompt,
        smtpUser,
        // Only send password if user changed it (not masked placeholder)
        smtpPass: smtpPass === "••••••••••••" ? undefined : smtpPass,
      };

      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update settings");

      setMessage("Settings updated successfully!");
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            Settings & Integrations
          </h1>
          <p className="text-slate-400 mt-2">
            Configure your sender profile, email outreach identities, and private AI engine parameters.
          </p>
        </div>

        {message && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-lg text-sm">
            ✓ {message}
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-lg text-sm">
            ⚠️ {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          {/* Section 1: Outreach Profile */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-indigo-400">Outreach Identity</h2>
            <p className="text-xs text-slate-500">How your cold leads perceive you. Every field starts blank for new users.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Your Signature Name</label>
                <input
                  type="text"
                  value={fromName}
                  onChange={(e) => setFromName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">From Email Address</label>
                <input
                  type="email"
                  value={fromEmail}
                  onChange={(e) => setFromEmail(e.target.value)}
                  placeholder="e.g. john@yourdomain.com"
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Promote Website</label>
                <input
                  type="text"
                  value={promoteSite}
                  onChange={(e) => setPromoteSite(e.target.value)}
                  placeholder="e.g. company.com"
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Promote Topic / Pitch</label>
                <input
                  type="text"
                  value={promoteTopic}
                  onChange={(e) => setPromoteTopic(e.target.value)}
                  placeholder="e.g. Custom AI Web Development & Automation"
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 2: AI Composer Tuning */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-indigo-400">AI Personalized Writer Configuration</h2>
            <p className="text-xs text-slate-500">Pick which engine personalizes your emails. Your keys override our system keys.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Preferred AI Provider</label>
                <select
                  value={aiProvider}
                  onChange={(e) => setAiProvider(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                >
                  <option value="deepseek">DeepSeek AI (Super Personalization)</option>
                  <option value="openai">OpenAI GPT-4o-mini</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Custom Writing Rules</label>
                <input
                  type="text"
                  value={aiExtraPrompt}
                  onChange={(e) => setAiExtraPrompt(e.target.value)}
                  placeholder="e.g. keep sentences under 15 words, sound friendly but professional"
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Private SMTP Connection */}
          <div className="bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-indigo-400">Private Gmail / SMTP Credentials</h2>
            <p className="text-xs text-slate-500">Add your Gmail or SMTP App Password to dispatch outreach campaigns directly.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Gmail App Username</label>
                <input
                  type="text"
                  value={smtpUser}
                  onChange={(e) => setSmtpUser(e.target.value)}
                  placeholder="e.g. you@gmail.com"
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-300">Gmail App Password</label>
                <input
                  type="password"
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  placeholder="e.g. abcd efgh ijkl mnop"
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Save Action */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800 text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-500/10 focus:outline-none"
            >
              {saving ? "Saving Changes..." : "Save Settings"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}