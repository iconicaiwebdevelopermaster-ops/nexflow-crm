'use client';
import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CSVImportPage() {
  const router = useRouter();
  const [csvString, setCsvString] = useState("");
  const [sourceName, setSourceName] = useState("Google Maps Scraping");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setCsvString(text);
    };
    reader.readAsText(file);
  };

  const handleImport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!csvString) {
      setError("Please select a valid CSV file first.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const res = await fetch("/api/leads/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          csvData: csvString,
          source: sourceName,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || "Failed to process and import file.");
        setIsLoading(false);
        return;
      }

      setSuccessMsg(json.message || `Successfully imported leads!`);
      setTimeout(() => {
        router.push("/leads");
        router.refresh();
      }, 2000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred during import.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <div className="mb-4">
        <Link href="/leads" className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads
        </Link>
      </div>

      <PageHeader
        title="Import Leads via CSV"
        description="Upload Outscraper, Apollo, or Google Maps scraped leads in bulk."
      />

      <form onSubmit={handleImport} className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800 space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>{successMsg} Redirecting...</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>Outreach Source Name</Label>
          <Input
            value={sourceName}
            onChange={(e) => setSourceName(e.target.value)}
            placeholder="e.g. Google Maps New York Dental Clinic"
            className="bg-[#0A0D14] border-slate-800 text-xs"
          />
        </div>

        <div className="space-y-2">
          <Label>Select CSV File</Label>
          <div className="border border-dashed border-slate-800 rounded-xl p-8 text-center bg-[#0A0D14] hover:border-slate-700 transition-colors relative">
            <Upload className="w-8 h-8 text-slate-500 mx-auto mb-3" />
            <span className="text-xs text-slate-400 block mb-1">
              Drag & Drop your .csv file here, or click to browse
            </span>
            <span className="text-[10px] text-slate-600 block">
              Required headers: <span className="font-mono">Name</span>, <span className="font-mono">Email</span>
            </span>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
          </div>
          {csvString && (
            <span className="text-[10px] text-emerald-400 block font-mono">
              âœ“ CSV loaded successfully, ready to push.
            </span>
          )}
        </div>

        <Button
          type="submit"
          disabled={isLoading || !csvString}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-6 h-9 gap-1.5"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
          Import Leads to Database
        </Button>
      </form>
    </div>
  );
}