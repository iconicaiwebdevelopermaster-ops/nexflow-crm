"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

const ToastProvider = ({ children }: { children: React.ReactNode }) => <>{children}</>

const Toast = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { variant?: string }>(
  ({ className, variant, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "pointer-events-auto relative flex items-center justify-between rounded-lg border border-blue-500/30 bg-[#0E131F]/95 px-3.5 py-2 shadow-xl backdrop-blur-md text-slate-100 animate-in fade-in slide-in-from-top-2 duration-200",
        variant === "destructive" && "border-red-500/50 bg-red-950/90 text-red-200",
        className
      )}
      {...props}
    />
  )
)
Toast.displayName = "Toast"

const ToastTitle = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[11px] font-bold text-blue-400 tracking-wide", className)} {...props} />
))
ToastTitle.displayName = "ToastTitle"

const ToastDescription = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-[10px] text-slate-300", className)} {...props} />
))
ToastDescription.displayName = "ToastDescription"

export { ToastProvider, Toast, ToastTitle, ToastDescription }