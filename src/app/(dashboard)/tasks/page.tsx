"use client";

import React, { useState } from "react";
import Link from "next/link";

interface TaskItem {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  category: string;
}

const INITIAL_TASKS: TaskItem[] = [
  {
    id: "task-1",
    title: "Follow up with warm lead from LinkedIn Harvester",
    description: "Send personalized proposal email via DeepSeek composer to verified decision-makers.",
    priority: "HIGH",
    status: "PENDING",
    dueDate: "Today",
    category: "Outreach"
  },
  {
    id: "task-2",
    title: "Verify Google Places lead batch",
    description: "Run automated MX & disposable email validation before bulk dispatch.",
    priority: "MEDIUM",
    status: "IN_PROGRESS",
    dueDate: "Tomorrow",
    category: "Data Hygiene"
  },
  {
    id: "task-3",
    title: "Review daily cron auto-reply sentiment logs",
    description: "Check pipeline moves for leads classified as MEETING_REQUESTED by AI triage.",
    priority: "LOW",
    status: "COMPLETED",
    dueDate: "Yesterday",
    category: "Pipeline"
  }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskItem[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  const toggleStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t => (t.id === id ? { ...t, status: t.status === "COMPLETED" ? "PENDING" : "COMPLETED" } : t))
    );
  };

  const filtered = tasks.filter(t => {
    if (filter === "PENDING") return t.status !== "COMPLETED";
    if (filter === "COMPLETED") return t.status === "COMPLETED";
    return true;
  });

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6 mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
            📋 Task Management
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track follow-ups, outreach actions, and pipeline deal to-dos.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/scraper"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-slate-300 bg-slate-900 border border-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
          >
            ⚡ Harvest Leads
          </Link>
          <Link
            href="/compose"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 transition-colors shadow-sm"
          >
            + New Email
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer" onClick={() => setFilter("ALL")}>
          <p className="text-xs text-slate-400 font-medium">Total Tasks</p>
          <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer" onClick={() => setFilter("PENDING")}>
          <p className="text-xs text-slate-400 font-medium">Pending</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">{tasks.filter(t => t.status !== "COMPLETED").length}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 cursor-pointer" onClick={() => setFilter("COMPLETED")}>
          <p className="text-xs text-slate-400 font-medium">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">{tasks.filter(t => t.status === "COMPLETED").length}</p>
        </div>
      </div>

      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="divide-y divide-slate-800">
          {filtered.map(task => (
            <div key={task.id} className="p-5 flex items-start gap-3 hover:bg-slate-800/40 transition-colors">
              <input
                type="checkbox"
                checked={task.status === "COMPLETED"}
                onChange={() => toggleStatus(task.id)}
                className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 cursor-pointer"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className={`font-medium ${task.status === "COMPLETED" ? "line-through text-slate-500" : "text-white"}`}>
                    {task.title}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded border border-indigo-500/20 bg-indigo-500/10 text-indigo-400">
                    {task.priority}
                  </span>
                </div>
                <p className="text-sm text-slate-400">{task.description}</p>
              </div>
              <span className="text-xs text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {task.dueDate}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}