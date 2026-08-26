"use client";

import { useState } from "react";
import { Check, Trash2, Plus, Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  dueDate: string | null;
  createdAt: string;
  lead?: { name: string } | null;
}

export function TaskList({ initialTasks, leads = [] }: { initialTasks: any[]; leads?: any[] }) {
  const router = useRouter();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [newTitle, setNewTitle] = useState("");
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          leadId: selectedLeadId || null,
        }),
      });

      const json = await res.json();
      if (res.ok && json.data) {
        setTasks((prev) => [json.data, ...prev]);
        setNewTitle("");
        setSelectedLeadId("");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggle = async (id: string, currentStatus: boolean) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !currentStatus } : t))
    );

    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !currentStatus }),
      });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));

    try {
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
      router.refresh();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Add Task Box */}
      <form onSubmit={handleAddTask} className="p-4 rounded-xl bg-[#0E131F] border border-slate-800 flex flex-col sm:flex-row gap-3">
        <Input
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="What needs to get done? (e.g. Follow-up call with Dr. Sarah)"
          className="bg-[#0A0D14] border-slate-800 text-xs flex-1"
        />
        {leads.length > 0 && (
          <select
            value={selectedLeadId}
            onChange={(e) => setSelectedLeadId(e.target.value)}
            className="h-9 rounded-lg border border-slate-800 bg-[#0A0D14] px-3 text-xs text-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="">-- Attach Lead (Optional) --</option>
            {leads.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name}
              </option>
            ))}
          </select>
        )}
        <Button
          type="submit"
          disabled={isSubmitting || !newTitle.trim()}
          className="bg-blue-600 hover:bg-blue-500 text-white text-xs h-9 px-4 gap-1.5 whitespace-nowrap"
        >
          {isSubmitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Plus className="w-3.5 h-3.5" />}
          Add Task
        </Button>
      </form>

      {/* Task Items List */}
      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="p-8 text-center border border-dashed border-slate-800 rounded-xl text-slate-500 text-xs">
            No tasks pending. You are completely caught up!
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                task.completed
                  ? "bg-slate-900/30 border-slate-800/40 opacity-60"
                  : "bg-[#0E131F] border-slate-800 hover:border-slate-700"
              }`}
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => handleToggle(task.id, task.completed)}
                  className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                    task.completed
                      ? "bg-blue-600 border-blue-500 text-white"
                      : "border-slate-700 hover:border-blue-500 bg-[#0A0D14]"
                  }`}
                >
                  {task.completed && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                </button>

                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-medium truncate ${
                      task.completed ? "line-through text-slate-500" : "text-slate-200"
                    }`}
                  >
                    {task.title}
                  </p>
                  <div className="flex items-center gap-3 mt-0.5 text-[10px] text-slate-500">
                    {task.lead && (
                      <span className="text-blue-400 font-medium">Lead: {task.lead.name}</span>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5" /> {formatDate(task.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(task.id)}
                className="h-7 w-7 p-0 text-slate-500 hover:text-red-400"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}