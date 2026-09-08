import { Card } from '@/components/ui/card';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function Page() {
  return (
    <div className="space-y-5 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-50">Admin Logs</h1>
        <p className="text-sm text-slate-400 mt-1">Super admin actions (coming soon — table ready in schema)</p>
      </div>
      <Card className="p-8 bg-slate-900/70 border-slate-800 text-center text-sm text-slate-500">
        Admin action logging UI next. Schema table <code className="text-slate-300">admin_logs</code> already exists.
      </Card>
    </div>
  );
}