import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Platform Settings</h1>
        <p className="text-sm text-slate-400 mt-1">Global SaaS config (limits, features flags)</p>
      </div>
      <Card className="p-5 bg-slate-900/70 border-slate-800 space-y-3 text-sm">
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">Default daily email quota</span>
          <span className="text-slate-100 font-mono">40 / day</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">Follow-up delay</span>
          <span className="text-slate-100 font-mono">4 days</span>
        </div>
        <div className="flex justify-between border-b border-slate-800 pb-2">
          <span className="text-slate-400">Max follow-ups</span>
          <span className="text-slate-100 font-mono">2</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-400">Secret admin route</span>
          <span className="text-red-400 font-mono">/mrwoo</span>
        </div>
      </Card>
    </div>
  );
}