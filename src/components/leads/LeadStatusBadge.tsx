import React from 'react';
import { Badge } from '@/components/ui/badge';
import { LeadStatus } from '@prisma/client';

const statusConfig: Record<LeadStatus, { label: string; className: string }> = {
  NEW: { label: 'New', className: 'bg-blue-500/10 text-blue-400 border-blue-500/20' },
  QUEUED: { label: 'Queued', className: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' },
  SENT: { label: 'Sent', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  CONTACTED: { label: 'Contacted', className: 'bg-amber-500/10 text-amber-400 border-amber-500/20' },
  FOLLOWUP_1: { label: 'Follow-up #1', className: 'bg-purple-500/10 text-purple-400 border-purple-500/20' },
  FOLLOWUP_2: { label: 'Follow-up #2', className: 'bg-pink-500/10 text-pink-400 border-pink-500/20' },
  REPLIED: { label: 'Replied 🔥', className: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' },
  SKIPPED: { label: 'Skipped', className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' },
  BOUNCED: { label: 'Bounced ❌', className: 'bg-rose-500/10 text-rose-400 border-rose-500/20' },
  UNSUBSCRIBED: { label: 'Opted Out', className: 'bg-gray-500/10 text-gray-400 border-gray-500/20' },
  WON: { label: 'Won 🏆', className: 'bg-green-500/10 text-green-400 border-green-500/20' },
  LOST: { label: 'Lost 🗑️', className: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
}

export function LeadStatusBadge({ status }: LeadStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };

  return (
    <Badge variant="outline" className={`font-medium px-2.5 py-0.5 rounded-full ${config.className}`}>
      {config.label}
    </Badge>
  );
}