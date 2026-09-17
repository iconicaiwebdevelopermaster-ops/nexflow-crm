"use client";

import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Building2, Mail, Phone, Globe, GripVertical, ExternalLink, Trash2 } from "lucide-react";

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  website?: string | null;
  status: string;
  source?: string | null;
  notes?: string | null;
  createdAt?: string | Date;
}

interface KanbanCardProps {
  lead: LeadItem;
  onDelete?: (id: string) => void;
  isOverlay?: boolean;
}

export function KanbanCard({ lead, onDelete, isOverlay = false }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: lead.id,
    data: { type: "Lead", lead },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative rounded-xl border p-4 transition-all duration-200 ${
        isDragging
          ? "opacity-30 border-blue-500/50 bg-[#0c1222]"
          : isOverlay
          ? "border-blue-500 bg-[#0f172a] shadow-2xl shadow-blue-500/20 ring-2 ring-blue-500 scale-105 cursor-grabbing"
          : "border-slate-800/80 bg-[#0b101b]/90 hover:border-slate-700 hover:bg-[#0e1626] hover:shadow-lg"
      }`}
    >
      <div className="mb-2.5 flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <button
            {...attributes}
            {...listeners}
            className="cursor-grab touch-none rounded p-0.5 text-slate-500 transition-colors hover:text-slate-300 active:cursor-grabbing"
          >
            <GripVertical className="h-4 w-4" />
          </button>
          <div className="min-w-0">
            <h4 className="truncate text-sm font-semibold tracking-tight text-white">
              {lead.name || "Unnamed Contact"}
            </h4>
            {lead.company && (
              <p className="mt-0.5 flex items-center gap-1.5 truncate text-xs font-medium text-slate-400">
                <Building2 className="h-3 w-3 shrink-0 text-blue-400" />
                <span className="truncate">{lead.company}</span>
              </p>
            )}
          </div>
        </div>

        {onDelete && !isOverlay && (
          <button
            onClick={() => onDelete(lead.id)}
            className="rounded-lg p-1 text-slate-500 opacity-0 transition-all hover:bg-rose-500/10 hover:text-rose-400 group-hover:opacity-100"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      <div className="my-3 space-y-1.5 text-xs text-slate-300">
        {lead.email && (
          <div className="flex items-center gap-2 truncate font-mono text-[11px] text-slate-400">
            <Mail className="h-3 w-3 shrink-0 text-cyan-400" />
            <a href={`mailto:${lead.email}`} className="truncate hover:text-cyan-300" onClick={(e) => e.stopPropagation()}>
              {lead.email}
            </a>
          </div>
        )}
        {lead.phone && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <Phone className="h-3 w-3 shrink-0 text-emerald-400" />
            <a href={`tel:${lead.phone}`} className="hover:text-emerald-300" onClick={(e) => e.stopPropagation()}>
              {lead.phone}
            </a>
          </div>
        )}
        {lead.website && (
          <div className="flex items-center gap-2 truncate text-[11px] text-slate-400">
            <Globe className="h-3 w-3 shrink-0 text-indigo-400" />
            <a
              href={lead.website.startsWith("http") ? lead.website : `https://${lead.website}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 truncate hover:text-indigo-300"
              onClick={(e) => e.stopPropagation()}
            >
              <span className="truncate">{lead.website.replace(/^https?:\/\//, "")}</span>
              <ExternalLink className="h-2.5 w-2.5 shrink-0 opacity-60" />
            </a>
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between border-t border-slate-800/60 pt-2.5">
        <span className="inline-flex items-center rounded-full border border-slate-700/50 bg-slate-800 px-2 py-0.5 text-[10px] font-medium text-slate-400">
          {lead.source || "Direct"}
        </span>
        <span className="font-mono text-[10px] text-slate-500">
          {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric" }) : ""}
        </span>
      </div>
    </div>
  );
}
