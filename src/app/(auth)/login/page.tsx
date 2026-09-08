export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { LoginForm } from "@/components/forms/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0D14] p-4">
      <div className="w-full max-w-md bg-[#0E131F] border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-blue-500/5">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/25 mb-4">
            N
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Welcome to NexFlow</h1>
          <p className="text-xs text-slate-400 mt-1.5">NexPulseLabs Lead Generation & Outreach Engine</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}