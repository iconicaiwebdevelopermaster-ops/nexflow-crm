"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signupSchema } from "@/lib/validations";
import { loginAction } from "@/app/actions/authActions";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

type SignupFormValues = z.infer<typeof signupSchema>;

export function SignupForm() {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
  });

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || "Failed to create account");
        setIsLoading(false);
        return;
      }

      const loginRes = await loginAction(data.email, data.password);
      if (loginRes && loginRes.success) {
        window.location.href = "/dashboard";
      } else {
        window.location.href = "/login";
      }
    } catch (err: any) {
      setError("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {error && (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-medium">
          {error}
        </div>
      )}

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-xs">Full Name</Label>
        <Input
          {...register("name")}
          placeholder="Founder Name"
          className="bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
        />
        {errors.name && <p className="text-[11px] text-red-400">{errors.name.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-xs">Email Address</Label>
        <Input
          {...register("email")}
          type="email"
          placeholder="you@nexpulselabs.com"
          className="bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
        />
        {errors.email && <p className="text-[11px] text-red-400">{errors.email.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label className="text-slate-300 text-xs">Password</Label>
        <Input
          {...register("password")}
          type="password"
          placeholder="Min 6 characters"
          className="bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
        />
        {errors.password && <p className="text-[11px] text-red-400">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium gap-2 mt-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Founder Account"}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </Button>

      <p className="text-center text-xs text-slate-400 mt-4">
        Already have an account?{" "}
        <Link href="/signup" className="text-blue-400 hover:underline font-medium">
          Sign In
        </Link>
      </p>
    </form>
  );
}