import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Send, FileText } from "lucide-react";
import Link from "next/link";

interface TemplateCardProps {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
}

export function TemplateCard({ id, name, category, subject, body }: TemplateCardProps) {
  return (
    <Card className="flex flex-col justify-between border-slate-800 bg-[#0E131F] hover:border-slate-700 transition-colors">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Badge variant="outline" className="text-[10px] bg-slate-800/80 border-slate-700">
            {category}
          </Badge>
          <FileText className="w-4 h-4 text-blue-400" />
        </div>
        <CardTitle className="text-sm font-semibold">{name}</CardTitle>
        <CardDescription className="text-xs text-slate-400 font-mono line-clamp-1">
          Subj: {subject}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <p className="text-xs text-slate-400 line-clamp-4 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/80 whitespace-pre-wrap">
          {body}
        </p>
      </CardContent>
      <CardFooter className="pt-0">
        <Link href={`/emails/compose?templateId=${id}`} className="w-full">
          <Button variant="outline" className="w-full text-xs h-8 gap-1.5 border-blue-500/30 text-blue-400 hover:bg-blue-500/10">
            <Send className="w-3 h-3" /> Use This Template
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}