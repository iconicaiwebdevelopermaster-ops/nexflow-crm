"use client";

import { Droppable } from "@hello-pangea/dnd";
import KanbanCard from "./KanbanCard";
import { Plus } from "lucide-react";

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

interface KanbanColumnProps {
  columnId: string;
  title: string;
  color: string;
  glowColor: string;
  leads: Lead[];
}

export default function KanbanColumn({ columnId, title, color, glowColor, leads }: KanbanColumnProps) {
  return (
    <div className="flex flex-col min-w-[300px] max-w-[340px] w-full">
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${color} shadow-lg ${glowColor}`} />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            {title}
          </h3>
          <span className="text-xs bg-white/5 text-gray-400 px-2 py-0.5 rounded-full font-mono">
            {leads.length}
          </span>
        </div>
        <button className="text-gray-600 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/5">
          <Plus size={14} />
        </button>
      </div>

      {/* Droppable Area */}
      <Droppable droppableId={columnId}>
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className={`
              flex-1 rounded-2xl p-2 min-h-[200px] transition-all duration-200
              ${snapshot.isDraggingOver
                ? "bg-blue-500/5 border-2 border-dashed border-blue-500/30"
                : "bg-[#080B12]/50 border border-white/[0.03]"
              }
            `}
          >
            {leads.map((lead, index) => (
              <KanbanCard key={lead.id} lead={lead} index={index} />
            ))}
            {provided.placeholder}

            {leads.length === 0 && !snapshot.isDraggingOver && (
              <div className="flex flex-col items-center justify-center h-32 text-gray-700">
                <p className="text-xs">No leads yet</p>
                <p className="text-[10px] mt-1">Drag cards here</p>
              </div>
            )}
          </div>
        )}
      </Droppable>
    </div>
  );
}
