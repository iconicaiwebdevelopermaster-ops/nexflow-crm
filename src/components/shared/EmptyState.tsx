import { Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
  title: string;
  description: string;
  actionText?: string;
  actionHref?: string;
}

export function EmptyState({ title, description, actionText, actionHref }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-slate-800 rounded-2xl bg-[#0E131F]/50">
      <div className="w-12 h-12 rounded-full bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-4">
        <Users className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-white">{title}</h3>
      <p className="text-xs text-slate-400 max-w-sm mt-1 mb-6">{description}</p>
      {actionText && actionHref && (
        <Link href={actionHref}>
          <Button className="bg-blue-600 hover:bg-blue-500 text-white text-xs gap-1.5 h-9">
            <Plus className="w-4 h-4" />
            {actionText}
          </Button>
        </Link>
      )}
    </div>
  );
}