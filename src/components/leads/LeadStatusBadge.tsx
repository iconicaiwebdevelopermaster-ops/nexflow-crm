import { Badge } from "@/components/ui/badge";
import { LeadStatus } from "@/types";

export function LeadStatusBadge({ status }: { status: LeadStatus }) {
  switch (status) {
    case "NEW":
      return <Badge variant="default" className="bg-blue-500/10 text-blue-400 border-blue-500/30">New</Badge>;
    case "CONTACTED":
      return <Badge variant="warning" className="bg-amber-500/10 text-amber-400 border-amber-500/30">Contacted</Badge>;
    case "REPLIED":
      return <Badge variant="secondary" className="bg-purple-500/10 text-purple-400 border-purple-500/30">Replied</Badge>;
    case "WON":
      return <Badge variant="success" className="bg-emerald-500/10 text-emerald-400 border-emerald-500/30">Won (Closed)</Badge>;
    case "LOST":
      return <Badge variant="destructive" className="bg-red-500/10 text-red-400 border-red-500/30">Lost</Badge>;
    default:
      return <Badge variant="outline">{status}</Badge>;
  }
}