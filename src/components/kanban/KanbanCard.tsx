"use client";

import { Draggable } from "@hello-pangea/dnd";
import { Mail, Building2, Phone, Globe, MoreVertical } from "lucide-react";

interface Lead {
  id: string;
  name: string;
  email: string;
  company: string;
  phone?: string;
  website?: string;
  source?: string;
  status: string;
}

interface KanbanCardProps {
  lead: Lead;
  index: number;
}

const sourceColors: Record<string, string> = {
  "Google Maps": "bg-green-500/20 text-green-400",
  "Web Search": "bg-blue-500/20 text-blue-400",
  "LinkedIn": "bg-sky-500/20 text-sky-400",
  "Indeed": "bg-purple-500/20 text-purple-400",
  "CSV Import": "bg-yellow-500/20 text-yellow-400",
};

export default function KanbanCard({ lead, index }: KanbanCardProps) {
  return (
    <Draggable draggableId={lead.id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={`
            group relative rounded-xl border p-4 mb-3 cursor-grab active:cursor-grabbing
            transition-all duration-200
            ${snapshot.isDragging
              ? "bg-[#131825] border-blue-500/60 shadow-2xl shadow-blue-500/20 scale-[1.02] rotate-1"
              : "bg-[#0E1220]/80 border-white/5 hover:border-blue-500/30 hover:bg-[#111628]"
            }
          `}
        >
          {/* Top Row: Name + Menu */}
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-semibold text-white leading-tight">
              {lead.name}
            </h4>
            <button className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-white transition-opacity">
              <MoreVertical size={14} />
            </button>
          </div>

          {/* Company */}
          <div className="flex items-center gap-1.5 mb-2">
            <Building2 size={12} className="text-gray-500" />
            <span className="text-xs text-gray-400 truncate">{lead.company}</span>
          </div>

          {/* Email */}
          {lead.email && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Mail size={11} className="text-blue-400" />
              <span className="text-xs text-gray-500 truncate">{lead.email}</span>
            </div>
          )}

          {/* Phone */}
          {lead.phone && (
            <div className="flex items-center gap-1.5 mb-1.5">
              <Phone size={11} className="text-green-400" />
              <span className="text-xs text-gray-500">{lead.phone}</span>
            </div>
          )}

          {/* Bottom Row: Source Badge */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-white/5">
            {lead.source && (
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${sourceColors[lead.source] || "bg-gray-500/20 text-gray-400"}`}>
                {lead.source}
              </span>
            )}
            {lead.website && (
              <a
                href={lead.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-400 transition-colors"
              >
                <Globe size={12} />
              </a>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
}
