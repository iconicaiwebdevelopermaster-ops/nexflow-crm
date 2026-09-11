'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, Clock, CheckCircle2, Send, Loader2, Sparkles, Building2 } from 'lucide-react';

interface SentEmail {
  id: string;
  recipient: string;
  leadName: string;
  company: string;
  subject: string;
  body: string;
  status: string;
  sentAt: string;
}

export default function EmailHistoryPage() {
  const [emails, setEmails] = useState<SentEmail[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/emails');
      const data = await res.json();
      if (data.emails) {
        setEmails(data.emails);
      }
    } catch {
    } finally {
      setLoading(false);
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
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Email History & Outbound Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track dispatched campaign emails, status updates, and delivery logs.
          </p>
        </div>

        <Link
          href="/compose"
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-blue-500 text-white font-bold text-xs shadow-lg transition-all inline-flex items-center gap-2"
        >
          <Sparkles className="w-4 h-4" /> Launch AI Campaign
        </Link>
      </div>

      {emails.length === 0 ? (
        <div className="p-12 text-center bg-[#050815] border border-white/10 rounded-2xl space-y-4">
          <Mail className="w-12 h-12 text-slate-500 mx-auto" />
          <h2 className="text-lg font-bold text-white">No Emails Dispatched Yet</h2>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Harvest leads and launch your first AI email campaign to see delivery logs here.
          </p>
          <Link
            href="/compose"
            className="px-5 py-2.5 rounded-xl bg-cyan-500 text-white text-xs font-bold hover:bg-cyan-600 transition-all inline-flex items-center gap-2"
          >
            <Send className="w-4 h-4" /> Open AI Composer
          </Link>
        </div>
      ) : (
        <div className="bg-[#050815] border border-white/10 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-white/10 text-slate-400 uppercase text-[10px] bg-white/[0.02]">
                  <th className="py-4 px-6">Recipient / Lead</th>
                  <th className="py-4 px-6">Company</th>
                  <th className="py-4 px-6">Subject Line</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6">Date Sent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {emails.map((email) => (
                  <tr key={email.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-white">{email.leadName}</div>
                      <div className="text-[11px] text-cyan-400 font-mono">{email.recipient}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Building2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>{email.company}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-xs truncate font-medium text-slate-200">
                      {email.subject}
                    </td>
                    <td className="py-4 px-6">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        <CheckCircle2 className="w-3 h-3" /> {email.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-slate-400 text-[11px]">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(email.sentAt).toLocaleDateString()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}