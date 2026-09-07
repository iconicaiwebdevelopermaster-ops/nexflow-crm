"use client";

import React, { useState, useEffect } from "react";
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
} from "@dnd-kit/core";
import { sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { KanbanColumn, ColumnDefinition } from "./kanban-column";
import { KanbanCard, LeadItem } from "./kanban-card";
import { useToast } from "@/components/ui/use-toast";

export const PIPELINE_COLUMNS: ColumnDefinition[] = [
  {
    id: "NEW",
    title: "New Leads",
    color: "text-cyan-400",
    badgeBg: "bg-cyan-500/10",
    badgeBorder: "border-cyan-500/20",
    dotColor: "bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]",
  },
  {
    id: "CONTACTED",
    title: "Contacted",
    color: "text-blue-400",
    badgeBg: "bg-blue-500/10",
    badgeBorder: "border-blue-500/20",
    dotColor: "bg-blue-400 shadow-[0_0_8px_rgba(59,130,246,0.8)]",
  },
  {
    id: "IN_PROGRESS",
    title: "In Discussion",
    color: "text-amber-400",
    badgeBg: "bg-amber-500/10",
    badgeBorder: "border-amber-500/20",
    dotColor: "bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)]",
  },
  {
    id: "WON",
    title: "Closed Won",
    color: "text-emerald-400",
    badgeBg: "bg-emerald-500/10",
    badgeBorder: "border-emerald-500/20",
    dotColor: "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]",
  },
  {
    id: "LOST",
    title: "Closed Lost",
    color: "text-rose-400",
    badgeBg: "bg-rose-500/10",
    badgeBorder: "border-rose-500/20",
    dotColor: "bg-rose-400",
  },
];

interface KanbanBoardProps {
  initialLeads: LeadItem[];
  onLeadUpdated?: () => void;
}

export function KanbanBoard({ initialLeads, onLeadUpdated }: KanbanBoardProps) {
  const [leads, setLeads] = useState<LeadItem[]>(initialLeads);
  const [activeLead, setActiveLead] = useState<LeadItem | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    setLeads(initialLeads);
  }, [initialLeads]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const current = leads.find((lead) => lead.id === event.active.id);
    if (current) setActiveLead(current);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id === over.id) return;

    const isOverAColumn = PIPELINE_COLUMNS.some((col) => col.id === over.id);
    const overLead = leads.find((l) => l.id === over.id);

    if (isOverAColumn) {
      setLeads((prev) =>
        prev.map((lead) => (lead.id === active.id ? { ...lead, status: over.id as string } : lead))
      );
    } else if (overLead) {
      const activeLeadItem = leads.find((l) => l.id === active.id);
      if (activeLeadItem && activeLeadItem.status !== overLead.status) {
        setLeads((prev) =>
          prev.map((lead) => (lead.id === active.id ? { ...lead, status: overLead.status } : lead))
        );
      }
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveLead(null);
    if (!over) return;

    const activeLeadItem = leads.find((l) => l.id === active.id);
    if (!activeLeadItem) return;

    let targetStatus = activeLeadItem.status;
    const isColumn = PIPELINE_COLUMNS.some((c) => c.id === over.id);

    if (isColumn) {
      targetStatus = over.id as string;
    } else {
      const overLead = leads.find((l) => l.id === over.id);
      if (overLead) targetStatus = overLead.status;
    }

    // Optimistic already applied in dragOver — persist now
    setLeads((prev) =>
      prev.map((l) => (l.id === activeLeadItem.id ? { ...l, status: targetStatus } : l))
    );

    try {
      const res = await fetch(`/api/leads/${activeLeadItem.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });

      if (!res.ok) throw new Error("Failed to update status");

      toast({
        title: "Stage Updated",
        description: `${activeLeadItem.name || "Lead"} → ${targetStatus}`,
      });
      onLeadUpdated?.();
    } catch (err: any) {
      toast({
        title: "Update Failed",
        description: err.message || "Could not sync status",
        variant: "destructive",
      });
      setLeads(initialLeads);
    }
  };

  const handleDeleteLead = async (id: string) => {
    if (!confirm("Delete this lead?")) return;
    try {
      const res = await fetch(`/api/leads/${id}`, { method: "DELETE" });
      if (res.ok) {
        setLeads((prev) => prev.filter((l) => l.id !== id));
        toast({ title: "Lead Deleted", description: "Removed from pipeline." });
        onLeadUpdated?.();
      }
    } catch {
      toast({ title: "Error", description: "Failed to delete lead.", variant: "destructive" });
    }
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex items-start gap-4 overflow-x-auto pb-6 pt-2">
        {PIPELINE_COLUMNS.map((col) => {
          const colLeads = leads.filter((l) => (l.status || "NEW").toUpperCase() === col.id);
          return (
            <KanbanColumn key={col.id} column={col} leads={colLeads} onDeleteLead={handleDeleteLead} />
          );
        })}
      </div>

      <DragOverlay>{activeLead ? <KanbanCard lead={activeLead} isOverlay /> : null}</DragOverlay>
    </DndContext>
  );
}
