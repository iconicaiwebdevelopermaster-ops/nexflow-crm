export const dynamic = 'force-dynamic';
export const revalidate = 0;
import { SignupForm } from "@/components/forms/SignupForm";

export default function SignupPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0A0D14] p-4">
      <div className="w-full max-w-md bg-[#0E131F] border border-slate-800 rounded-2xl p-8 shadow-2xl shadow-blue-500/5">
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 rounded-xl bg-blue-600 items-center justify-center font-bold text-white text-xl shadow-lg shadow-blue-500/25 mb-4">
            N
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Create Workspace</h1>
          <p className="text-xs text-slate-400 mt-1.5">Start closing high-ticket clients with autopilot CRM</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}