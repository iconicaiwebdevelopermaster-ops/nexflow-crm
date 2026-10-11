"use client";

import React, { useState } from "react";
import Link from "next/link";

interface Task {
  id: string;
  title: string;
  description: string;
  priority: "HIGH" | "MEDIUM" | "LOW";
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED";
  dueDate: string;
  category: string;
}

const INITIAL_TASKS: Task[] = [
  {
    id: "task-1",
    title: "Follow up with warm lead from LinkedIn Harvester",
    description: "Send personalized proposal email via DeepSeek composer to Austin tech leads.",
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
    description: "Check pipeline moves for leads classified as MEETING_REQUESTED by AI.",
    priority: "LOW",
    status: "COMPLETED",
    dueDate: "Yesterday",
    category: "Pipeline"
  },
  {
    id: "task-4",
    title: "Connect 2nd Gmail inbox for round-robin dispatch",
    description: "Distribute daily volume across multiple inboxes to protect sender reputation.",
    priority: "HIGH",
    status: "PENDING",
    dueDate: "Oct 28",
    category: "Deliverability"
  }
];

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [filter, setFilter] = useState<"ALL" | "PENDING" | "COMPLETED">("ALL");

  const toggleTaskStatus = (id: string) => {
    setTasks(prev =>
      prev.map(t => {
        if (t.id === id) {
          const nextStatus = t.status === "COMPLETED" ? "PENDING" : "COMPLETED";
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
  };

  const filteredTasks = tasks.filter(t => {
    if (filter === "PENDING") return t.status !== "COMPLETED";
    if (filter === "COMPLETED") return t.status === "COMPLETED";
    return true;
  });

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case "HIGH":
        return "bg-rose-500/10 text-rose-400 border-rose-500/20";
      case "MEDIUM":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      default:
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10">
      {/* Header */}
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

      {/* Counters */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700" onClick={() => setFilter("ALL")}>
          <p className="text-xs text-slate-400 font-medium">Total Active Tasks</p>
          <p className="text-2xl font-bold text-white mt-1">{tasks.length}</p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700" onClick={() => setFilter("PENDING")}>
          <p className="text-xs text-slate-400 font-medium">Pending Follow-ups</p>
          <p className="text-2xl font-bold text-amber-400 mt-1">
            {tasks.filter(t => t.status !== "COMPLETED").length}
          </p>
        </div>
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 cursor-pointer hover:border-slate-700" onClick={() => setFilter("COMPLETED")}>
          <p className="text-xs text-slate-400 font-medium">Completed</p>
          <p className="text-2xl font-bold text-emerald-400 mt-1">
            {tasks.filter(t => t.status === "COMPLETED").length}
          </p>
        </div>
      </div>

      {/* Tasks Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-sm font-semibold text-slate-300">Action Items</span>
          <div className="flex gap-2">
            {(["ALL", "PENDING", "COMPLETED"] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`text-xs px-3 py-1 rounded-md transition-colors ${
                  filter === tab ? "bg-indigo-600 text-white" : "bg-slate-800 text-slate-400 hover:text-white"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-slate-800">
          {filteredTasks.map(task => (
            <div
              key={task.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-800/40 transition-colors"
            >
              <div className="flex items-start gap-3">
                <input
                  type="checkbox"
                  checked={task.status === "COMPLETED"}
                  onChange={() => toggleTaskStatus(task.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className={`font-medium text-base ${task.status === "COMPLETED" ? "line-through text-slate-500" : "text-white"}`}>
                      {task.title}
                    </h3>
                    <span className={`text-xs px-2 py-0.5 rounded border font-semibold ${getPriorityClass(task.priority)}`}>
                      {task.priority}
                    </span>
                  </div>
                  <p className="text-sm text-slate-400">{task.description}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 pl-7 md:pl-0">
                <span className="bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                  Due: {task.dueDate}
                </span>
                <span className="text-slate-500 font-mono">{task.category}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
