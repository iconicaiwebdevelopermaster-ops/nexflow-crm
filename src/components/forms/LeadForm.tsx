"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { leadSchema } from "@/lib/validations";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";

type LeadFormValues = z.infer<typeof leadSchema>;

interface LeadFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export function LeadForm({ initialData, isEditing = false }: LeadFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(leadSchema),
    defaultValues: initialData
      ? {
          name: initialData.name || "",
          email: initialData.email || "",
          phone: initialData.phone || "",
          company: initialData.company || "",
          website: initialData.website || "",
          status: initialData.status || "NEW",
          source: initialData.source || "Manual Scraping",
          notes: initialData.notes || "",
        }
      : {
          name: "",
          email: "",
          phone: "",
          company: "",
          website: "",
          status: "NEW",
          source: "Manual Scraping",
          notes: "",
        },
  });

  const onSubmit = async (data: LeadFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const url = isEditing ? `/api/leads/${initialData.id}` : "/api/leads";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to save lead");
        setIsLoading(false);
        return;
      }

      router.push("/leads");
      router.refresh();
    } catch (err: any) {
      setError("An unexpected error occurred.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-2xl">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label>Full Name *</Label>
          <Input {...register("name")} placeholder="e.g. John Doe" />
          {errors.name && <p className="text-[11px] text-red-400">{errors.name.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Email Address *</Label>
          <Input {...register("email")} type="email" placeholder="john@business.com" />
          {errors.email && <p className="text-[11px] text-red-400">{errors.email.message}</p>}
        </div>

        <div className="space-y-1.5">
          <Label>Company Name</Label>
          <Input {...register("company")} placeholder="e.g. Apex Dental Care" />
        </div>

        <div className="space-y-1.5">
          <Label>Phone Number</Label>
          <Input {...register("phone")} placeholder="+1 234 567 890" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Website URL (optional)</Label>
          <Input {...register("website")} placeholder="https://example.com" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Lead Status</Label>
          <select
            {...register("status")}
            className="flex h-9 w-full rounded-lg border border-slate-800 bg-[#0E131F] px-3 py-1 text-sm text-slate-100 shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            <option value="NEW">New</option>
            <option value="CONTACTED">Contacted</option>
            <option value="REPLIED">Replied</option>
            <option value="WON">Won (Deal Closed)</option>
            <option value="LOST">Lost</option>
          </select>
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label>Notes & Discovery info</Label>
          <Textarea
            {...register("notes")}
            placeholder="e.g. Needs full website redesign. Found via Google Maps."
            rows={4}
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-6 h-9"
        >
          {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : isEditing ? "Update Lead" : "Save Lead"}
        </Button>
        <Link href="/leads">
          <Button variant="ghost" type="button" className="text-xs h-9 gap-1 text-slate-400">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Leads
          </Button>
        </Link>
      </div>
    </form>
  );
}