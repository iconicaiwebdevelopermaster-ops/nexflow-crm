"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema } from "@/lib/validations";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      if (res?.error) {
        setError("Invalid email or password");
        setIsLoading(false);
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch (err) {
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
          placeholder="••••••••"
          className="bg-slate-900/80 border-slate-800 text-white placeholder:text-slate-600 focus:border-blue-500"
        />
        {errors.password && <p className="text-[11px] text-red-400">{errors.password.message}</p>}
      </div>

      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium gap-2 mt-2"
      >
        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Sign In to Dashboard"}
        {!isLoading && <ArrowRight className="w-4 h-4" />}
      </Button>

      <p className="text-center text-xs text-slate-400 mt-4">
        Do not have an account?{" "}
        <Link href="/signup" className="text-blue-400 hover:underline font-medium">
          Create one
        </Link>
      </p>
    </form>
  );
}