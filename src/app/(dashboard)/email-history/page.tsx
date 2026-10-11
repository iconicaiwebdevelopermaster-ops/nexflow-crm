"use client";

import React, { useState, useEffect } from "react";

export default function EmailsHistoryPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEmails() {
      try {
        const res = await fetch("/api/emails");
        if (res.ok) {
          const data = await res.json();
          setEmails(data.emails || data || []);
        }
      } catch (e) {
      } finally {
        setLoading(false);
      }
    }
    loadEmails();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-10 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-indigo-400 bg-clip-text text-transparent">
          Outbound Email History
        </h1>
        <p className="text-xs md:text-sm text-slate-400 mt-1">
          Track all dispatched emails, delivery status, and recipient logs.
        </p>
      </div>

      <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400 text-sm animate-pulse">Loading email logs...</div>
        ) : emails.length === 0 ? (
          <div className="p-8 text-center text-slate-500 text-sm">No emails dispatched yet. Go to /compose to send your first email.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Subject</th>
                  <th className="p-4">Method</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Sent At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {emails.map((e: any, idx: number) => (
                  <tr key={e.id || idx} className="hover:bg-slate-900/40">
                    <td className="p-4 font-medium text-slate-100">{e.recipient}</td>
                    <td className="p-4 text-slate-300 max-w-xs truncate">{e.subject || "No Subject"}</td>
                    <td className="p-4 text-slate-400 uppercase">{e.method || "SMTP"}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800">
                        {e.status || "SENT"}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500">{new Date(e.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}