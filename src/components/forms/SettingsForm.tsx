'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function SettingsForm({ initialSmtp }: { initialSmtp: any }) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    smtpHost: initialSmtp?.smtpHost || 'smtp.gmail.com',
    smtpPort: initialSmtp?.smtpPort || 587,
    smtpUser: initialSmtp?.smtpUser || '',
    smtpPass: initialSmtp?.smtpPass || '',
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('/api/settings/smtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save SMTP settings');

      toast({
        title: 'SMTP Config Saved!',
        description: 'Your manual SMTP credentials are now active as an outreach channel.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">SMTP Host</Label>
          <Input
            value={formData.smtpHost}
            onChange={(e) => setFormData({ ...formData, smtpHost: e.target.value })}
            placeholder="smtp.gmail.com"
            className="bg-slate-950 border-slate-800 text-xs text-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">SMTP Port</Label>
          <Input
            type="number"
            value={formData.smtpPort}
            onChange={(e) => setFormData({ ...formData, smtpPort: parseInt(e.target.value) || 587 })}
            placeholder="587"
            className="bg-slate-950 border-slate-800 text-xs text-slate-200"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">Email Address / Username</Label>
          <Input
            type="email"
            value={formData.smtpUser}
            onChange={(e) => setFormData({ ...formData, smtpUser: e.target.value })}
            placeholder="your-email@gmail.com"
            className="bg-slate-950 border-slate-800 text-xs text-slate-200"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs text-slate-300">App Password / SMTP Password</Label>
          <Input
            type="password"
            value={formData.smtpPass}
            onChange={(e) => setFormData({ ...formData, smtpPass: e.target.value })}
            placeholder="••••••••••••••••"
            className="bg-slate-950 border-slate-800 text-xs text-slate-200"
          />
          <p className="text-[10px] text-slate-500">
            For Gmail: Use a 16-character App Password from Google Security Account settings.
          </p>
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={loading}
          className="bg-purple-600 hover:bg-purple-500 text-white text-xs h-9 px-4"
        >
          {loading ? 'Saving...' : 'Save Manual SMTP Credentials'}
        </Button>
      </div>
    </form>
  );
}