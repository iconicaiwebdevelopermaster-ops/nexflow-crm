"use client";

import { signOut, useSession } from "next-auth/react";
import { LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="h-16 border-b border-slate-800 bg-[#0A0D14]/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-8 ml-64">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-slate-400">Workspace:</span>
        <span className="text-xs font-semibold text-slate-200 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
          NexPulseLabs Studio
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-semibold text-xs">
            {session?.user?.name ? session.user.name[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-medium text-slate-200">{session?.user?.name || "Founder"}</p>
            <p className="text-[10px] text-slate-400 font-mono">{session?.user?.email}</p>
          </div>
        </div>

        <Button
          variant="ghost"
          size="sm"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="text-slate-400 hover:text-red-400 hover:bg-red-500/10 h-8 px-2.5 gap-1.5"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="text-xs">Logout</span>
        </Button>
      </div>
    </header>
  );
}