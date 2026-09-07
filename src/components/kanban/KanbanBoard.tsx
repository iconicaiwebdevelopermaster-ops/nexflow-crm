'use client';

import React, { useState } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from '@dnd-kit/core';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

export const PIPELINE_STAGES = [
  { id: 'NEW', title: 'New Leads', color: 'border-blue-500/40 bg-blue-500/10 text-blue-400' },
  { id: 'QUEUED', title: 'Queued', color: 'border-cyan-500/40 bg-cyan-500/10 text-cyan-400' },
  { id: 'SENT', title: 'Sent', color: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  { id: 'CONTACTED', title: 'Contacted', color: 'border-amber-500/40 bg-amber-500/10 text-amber-400' },
  { id: 'FOLLOWUP_1', title: 'Follow-up #1', color: 'border-purple-500/40 bg-purple-500/10 text-purple-400' },
  { id: 'FOLLOWUP_2', title: 'Follow-up #2', color: 'border-pink-500/40 bg-pink-500/10 text-pink-400' },
  { id: 'REPLIED', title: 'Replied 🔥', color: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400' },
  { id: 'WON', title: 'Deal Won 🏆', color: 'border-green-500/40 bg-green-500/10 text-green-400' },
  { id: 'LOST', title: 'Lost 🗑️', color: 'border-rose-500/40 bg-rose-500/10 text-rose-400' },
];

function KanbanCardItem({ lead }: { lead: any }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
    data: lead,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`p-3 rounded-lg border bg-slate-900/90 border-slate-800 hover:border-slate-700 cursor-grab active:cursor-grabbing transition shadow-sm ${
        isDragging ? 'opacity-40 ring-2 ring-blue-500' : ''
      }`}
    >
      <div className="font-semibold text-slate-100 text-sm truncate">{lead.name || 'Unnamed Lead'}</div>
      <div className="text-xs text-slate-400 truncate mt-0.5">{lead.email}</div>
      {lead.company && (
        <div className="text-xs text-blue-400 font-medium mt-1 truncate">{lead.company}</div>
      )}
      {lead.phone && (
        <div className="text-[11px] text-slate-500 mt-1 truncate">{lead.phone}</div>
      )}
    </div>
  );
}

function KanbanColumnItem({
  stage,
  leads,
}: {
  stage: (typeof PIPELINE_STAGES)[0];
  leads: any[];
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: stage.id,
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-72 md:w-80 rounded-xl p-3 flex flex-col transition border ${
        isOver
          ? 'bg-slate-900/90 border-blue-500/60 ring-2 ring-blue-500/20'
          : 'bg-slate-900/50 border-slate-800/80'
      }`}
    >
      <div className="flex items-center justify-between mb-3 px-1">
        <span className="font-semibold text-sm text-slate-200">{stage.title}</span>
        <Badge variant="outline" className={stage.color}>
          {leads.length}
        </Badge>
      </div>

      <div className="space-y-2 flex-1 min-h-[350px]">
        {leads.length === 0 ? (
          <div className="h-28 flex items-center justify-center border border-dashed border-slate-800 rounded-lg text-xs text-slate-600">
            Drop leads here
          </div>
        ) : (
          leads.map((lead) => <KanbanCardItem key={lead.id} lead={lead} />)
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ initialLeads = [] }: { initialLeads: any[] }) {
  const [leads, setLeads] = useState<any[]>(initialLeads);
  const [activeLead, setActiveLead] = useState<any | null>(null);
  const { toast } = useToast();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const found = leads.find((l) => l.id === event.active.id);
    if (found) setActiveLead(found);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);

    if (!over) return;

    const leadId = active.id as string;
    const newStatus = over.id as string;

    const currentLead = leads.find((l) => l.id === leadId);
    if (!currentLead || currentLead.status === newStatus) return;

    // Optimistic Update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );

    try {
      const res = await fetch('/api/leads/update-status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, status: newStatus }),
      });

      if (!res.ok) throw new Error('Status update failed');

      toast({
        title: 'Stage Updated',
        description: `${currentLead.name || 'Lead'} moved to ${newStatus}`,
      });
    } catch (err) {
      // Revert on error
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: currentLead.status } : l))
      );
      toast({
        title: 'Error',
        description: 'Failed to update lead stage.',
        variant: 'destructive',
      });
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 select-none min-h-[500px]">
        {PIPELINE_STAGES.map((stage) => {
          const stageLeads = leads.filter((l) => l.status === stage.id);
          return (
            <KanbanColumnItem key={stage.id} stage={stage} leads={stageLeads} />
          );
        })}
      </div>

      <DragOverlay>
        {activeLead ? (
          <div className="p-3 rounded-lg border bg-slate-900 border-blue-500 shadow-xl opacity-90 w-72">
            <div className="font-semibold text-slate-100 text-sm">{activeLead.name}</div>
            <div className="text-xs text-slate-400">{activeLead.email}</div>
            {activeLead.company && (
              <div className="text-xs text-blue-400 font-medium mt-1">{activeLead.company}</div>
            )}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}