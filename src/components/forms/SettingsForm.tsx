"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { settingsSchema } from "@/lib/validations";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, CheckCircle2, ShieldCheck, Mail } from "lucide-react";

type SettingsFormValues = z.infer<typeof settingsSchema>;

interface SettingsFormProps {
  initialUser: {
    name: string | null;
    email: string;
    smtpHost: string | null;
    smtpPort: number | null;
    smtpUser: string | null;
  };
}

export function SettingsForm({ initialUser }: SettingsFormProps) {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      name: initialUser?.name || "",
      smtpHost: initialUser?.smtpHost || "smtp.gmail.com",
      smtpPort: initialUser?.smtpPort || 465,
      smtpUser: initialUser?.smtpUser || "",
      smtpPass: "",
    },
  });

  const onSubmit = async (data: SettingsFormValues) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.name,
          smtpHost: data.smtpHost || null,
          smtpPort: data.smtpPort ? Number(data.smtpPort) : null,
          smtpUser: data.smtpUser || null,
          smtpPass: data.smtpPass || undefined,
        }),
      });

      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Failed to update settings.");
        setIsLoading(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}
      {success && (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" /> Settings updated successfully!
        </div>
      )}

      <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800 space-y-4">
        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-blue-400" /> Founder Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>Full Name</Label>
            <Input {...register("name")} className="bg-[#0A0D14] border-slate-800 text-xs" />
            {errors.name && <p className="text-[11px] text-red-400">{errors.name.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label>Login Email (Read-only)</Label>
            <Input value={initialUser.email} disabled className="bg-slate-900 border-slate-800 text-xs text-slate-500 cursor-not-allowed" />
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl bg-[#0E131F] border border-slate-800 space-y-4">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Mail className="w-4 h-4 text-emerald-400" /> Gmail SMTP Configuration
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Configure your Gmail App Password to send outreach emails directly from your personal Gmail address.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label>SMTP Host</Label>
            <Input {...register("smtpHost")} placeholder="smtp.gmail.com" className="bg-[#0A0D14] border-slate-800 text-xs" />
          </div>
          <div className="space-y-1.5">
            <Label>SMTP Port</Label>
            <Input type="number" {...register("smtpPort")} placeholder="465" className="bg-[#0A0D14] border-slate-800 text-xs" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Gmail Address (SMTP Username)</Label>
            <Input {...register("smtpUser")} placeholder="yourname@gmail.com" className="bg-[#0A0D14] border-slate-800 text-xs" />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label>Gmail App Password (16-characters)</Label>
            <Input type="password" {...register("smtpPass")} placeholder="•••••••••••••••• (Leave blank to keep unchanged)" className="bg-[#0A0D14] border-slate-800 text-xs" />
          </div>
        </div>
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs px-6 h-9"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Configuration"}
      </Button>
    </form>
  );
}