"use client";

import React from "react";
import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { KanbanCard, LeadItem } from "./kanban-card";

export interface ColumnDefinition {
  id: string;
  title: string;
  color: string;
  badgeBg: string;
  badgeBorder: string;
  dotColor: string;
}

interface KanbanColumnProps {
  column: ColumnDefinition;
  leads: LeadItem[];
  onDeleteLead?: (id: string) => void;
}

export function KanbanColumn({ column, leads, onDeleteLead }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: "Column", column },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex w-full min-w-[290px] max-w-[340px] flex-1 flex-col rounded-2xl border transition-all duration-200 ${
        isOver
          ? "border-blue-500/60 bg-[#0d1527] ring-2 ring-blue-500/20"
          : "border-slate-800/80 bg-[#070b13]/80 backdrop-blur-xl"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-800/80 p-3.5">
        <div className="flex items-center gap-2.5">
          <div className={`h-2.5 w-2.5 rounded-full ${column.dotColor}`} />
          <h3 className="text-sm font-semibold tracking-wide text-slate-200">{column.title}</h3>
        </div>
        <span className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${column.badgeBg} ${column.color} ${column.badgeBorder}`}>
          {leads.length}
        </span>
      </div>

      <div className="flex max-h-[calc(100vh-280px)] min-h-[160px] flex-1 flex-col gap-3 overflow-y-auto p-3">
        <SortableContext items={leads.map((l) => l.id)} strategy={verticalListSortingStrategy}>
          {leads.map((lead) => (
            <KanbanCard key={lead.id} lead={lead} onDelete={onDeleteLead} />
          ))}
        </SortableContext>

        {leads.length === 0 && (
          <div className="flex min-h-[120px] flex-1 flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-800/60 p-6 text-center text-xs text-slate-500">
            <span>No leads here</span>
            <span className="mt-1 text-[10px] text-slate-600">Drop leads into this stage</span>
          </div>
        )}
      </div>
    </div>
  );
}
