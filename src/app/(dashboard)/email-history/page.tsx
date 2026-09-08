'use client';
import React, { useEffect, useState } from "react";
import { History, Mail, RefreshCw, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";

interface EmailRow {
  id: string;
  subject?: string | null;
  body?: string | null;
  toEmail?: string | null;
  status?: string | null;
  createdAt?: string;
  lead?: {
    id: string;
    name?: string | null;
    email?: string | null;
    company?: string | null;
  } | null;
}

export default function EmailHistoryPage() {
  const [emails, setEmails] = useState<EmailRow[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/emails", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to load");
      const list = data.emails || data.data || [];
      setEmails(Array.isArray(list) ? list : []);
    } catch (err: any) {
      toast({
        title: "Email History Error",
        description: err.message || "Could not load emails",
        variant: "destructive",
      });
      setEmails([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            <History className="h-7 w-7 text-blue-500" />
            Email History
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            All cold emails sent from NexFlow via Gmail SMTP.
          </p>
        </div>
        <Button
          onClick={load}
          disabled={loading}
          className="bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs"
        >
          <RefreshCw className={`h-3.5 w-3.5 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      <div className="bg-[#070b13]/80 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-4 py-3 border-b border-slate-800 flex items-center justify-between">
          <p className="text-xs text-slate-400">
            Total sent records:{" "}
            <span className="text-blue-400 font-bold">{emails.length}</span>
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500 text-sm">Loading email history...</div>
        ) : emails.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            <Mail className="h-10 w-10 mx-auto mb-3 opacity-50" />
            No emails sent yet. Go to <span className="text-blue-400">Compose Email</span> and send
            your first cold email.
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {emails.map((email) => (
              <div key={email.id} className="p-4 hover:bg-slate-900/40 transition">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-bold text-white truncate">
                      {email.subject || "(No subject)"}
                    </h3>
                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-cyan-400" />
                        {email.toEmail || email.lead?.email || "—"}
                      </span>
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3 text-blue-400" />
                        {email.lead?.name || "Unknown lead"}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building2 className="h-3 w-3 text-emerald-400" />
                        {email.lead?.company || "—"}
                      </span>
                    </div>
                    {email.body && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 whitespace-pre-wrap">
                        {email.body}
                      </p>
                    )}
                  </div>
                  <div className="text-right shrink-0 space-y-1">
                    <span className="inline-flex text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                      {(email.status || "SENT").toUpperCase()}
                    </span>
                    <p className="text-[10px] text-slate-500">
                      {(email.sentAt || email.createdAt) ? new Date(email.sentAt || email.createdAt).toLocaleString() : ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

