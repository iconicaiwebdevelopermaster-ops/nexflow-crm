'use client';

import React, { useState, useEffect } from 'react';
import { Save, CheckCircle2, Loader2, Key, Bot, Mail, Sparkles, Globe } from 'lucide-react';

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const [form, setForm] = useState({
    fromName: '',
    fromEmail: '',
    promoteSite: '',
    promoteTopic: '',
    dailyLimit: 40,
    mapsApiKey: '',
    cseApiKey: '',
    cseCx: '',
    aiEnabled: false,
    aiProvider: 'deepseek',
    aiModel: '',
    deepseekApiKey: '',
    openaiApiKey: '',
    aiExtraPrompt: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      const data = await res.json();
      if (data.settings) {
        setForm(prev => ({ ...prev, ...data.settings }));
      }
    } catch {
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save');
      setToast('Settings saved successfully!');
      setTimeout(() => setToast(null), 3000);
    } catch (err: any) {
      alert(err.message || 'Error saving settings');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-400" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      {toast && (
        <div className="fixed top-5 right-5 z-50 px-5 py-3 rounded-xl bg-emerald-950 border border-emerald-500/50 text-emerald-200 text-sm font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {toast}
        </div>
      )}

      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Settings - Keys & AI Writer</h1>
        <p className="text-xs text-slate-400 mt-1">
          Configure your outreach identity, Google Search/Maps keys, and AI email writer preferences.
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Outbound Identity */}
        <div className="bg-[#050815] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Mail className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white">Outreach Signature & Context</h2>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Your Name (Signature)</label>
              <input
                type="text"
                value={form.fromName}
                onChange={e => setForm({ ...form, fromName: e.target.value })}
                placeholder="e.g. Aamir"
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Promote Website</label>
              <input
                type="text"
                value={form.promoteSite}
                onChange={e => setForm({ ...form, promoteSite: e.target.value })}
                placeholder="e.g. besttradelogic.com"
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Promote Topic / Pitch</label>
              <input
                type="text"
                value={form.promoteTopic}
                onChange={e => setForm({ ...form, promoteTopic: e.target.value })}
                placeholder="e.g. trading & market analysis"
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Daily Send Limit</label>
              <input
                type="number"
                value={form.dailyLimit}
                onChange={e => setForm({ ...form, dailyLimit: parseInt(e.target.value) || 40 })}
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>

        {/* Search API Keys */}
        <div className="bg-[#050815] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-3">
            <Key className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white">Google Lead Scraping Keys</h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Google Maps API Key</label>
              <input
                type="password"
                value={form.mapsApiKey}
                onChange={e => setForm({ ...form, mapsApiKey: e.target.value })}
                placeholder="AIza..."
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Custom Search API Key</label>
              <input
                type="password"
                value={form.cseApiKey}
                onChange={e => setForm({ ...form, cseApiKey: e.target.value })}
                placeholder="AIza... (blank = reuse Maps key)"
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Search Engine ID (cx)</label>
              <input
                type="text"
                value={form.cseCx}
                onChange={e => setForm({ ...form, cseCx: e.target.value })}
                placeholder="e.g. 2159c0f8dae354976"
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>
        </div>

        {/* AI Writer Settings */}
        <div className="bg-[#050815] border border-white/10 rounded-2xl p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-white/5 pb-3">
            <div className="flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              <h2 className="text-sm font-bold text-white">AI Personalized Email Writer</h2>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.aiEnabled}
                onChange={e => setForm({ ...form, aiEnabled: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 text-cyan-500 bg-[#03050c]"
              />
              <span className="text-xs font-semibold text-slate-300">Enable AI Writer</span>
            </label>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">AI Provider</label>
              <select
                value={form.aiProvider}
                onChange={e => setForm({ ...form, aiProvider: e.target.value })}
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              >
                <option value="deepseek">DeepSeek AI (Very Cheap & High Quality)</option>
                <option value="openai">OpenAI / GPT-4o-mini</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">AI Model (blank = default)</label>
              <input
                type="text"
                value={form.aiModel}
                onChange={e => setForm({ ...form, aiModel: e.target.value })}
                placeholder="deepseek-chat / gpt-4o-mini"
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">DeepSeek API Key</label>
              <input
                type="password"
                value={form.deepseekApiKey}
                onChange={e => setForm({ ...form, deepseekApiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">OpenAI API Key</label>
              <input
                type="password"
                value={form.openaiApiKey}
                onChange={e => setForm({ ...form, openaiApiKey: e.target.value })}
                placeholder="sk-..."
                className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">Extra Writing Instructions (Optional)</label>
            <input
              type="text"
              value={form.aiExtraPrompt}
              onChange={e => setForm({ ...form, aiExtraPrompt: e.target.value })}
              placeholder="e.g. keep it very casual, mention their city"
              className="w-full px-3.5 py-2 bg-[#03050c] border border-white/10 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 text-white font-bold text-xs shadow-lg transition-all flex items-center gap-2"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Save Settings
        </button>

      </form>
    </div>
  );
}