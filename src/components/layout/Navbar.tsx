"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Navbar() {
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-slate-800/80 bg-[#070A12]/80 backdrop-blur-md px-4 md:px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <span className="text-xs md:text-sm text-slate-400">
          Workspace:{" "}
          <span className="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-2.5 py-0.5 text-xs font-medium text-slate-200">
            NexPulseLabs Studio
          </span>
        </span>
      </div>

      <div className="flex items-center gap-3">
        {session?.user && (
          <>
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-medium text-slate-200 leading-none">
                {session.user.name || "User"}
              </span>
              <span className="text-[11px] text-slate-500 leading-none mt-0.5">
                {session.user.email}
              </span>
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-xs font-bold text-white">
              {(session.user.name || session.user.email || "U")
                .charAt(0)
                .toUpperCase()}
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-slate-400 hover:text-slate-100"
              onClick={() => signOut({ callbackUrl: "/login" })}
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </header>
  );
}

export default Navbar;