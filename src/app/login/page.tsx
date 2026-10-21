"use client";

import React, { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email: email.trim(),
        password: password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        setLoading(false);
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch {
      setError("Something went wrong. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white">NexFlow CRM</h1>
          <p className="text-sm text-slate-400 mt-1">B2B Lead Generation Platform</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-5">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs text-slate-400 mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexflow.com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-slate-400 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Your password"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-medium rounded-lg text-sm transition-all"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center">
      <p className="text-slate-400 text-sm">Loading...</p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <LoginForm />
    </Suspense>
  );
}