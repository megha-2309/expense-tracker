"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { loginThunk, clearError } from "@/store/slices/authSlice";
import { Mail, Lock, ArrowRight, TrendingDown, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isClient, setIsClient] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((s) => s.auth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    dispatch(clearError());
    const result = await dispatch(loginThunk({ email, password }));
    if (loginThunk.fulfilled.match(result)) {
      toast.success("Welcome back!");
      router.push("/dashboard");
    } else {
      toast.error((result.payload as string) || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex" style={{ background: "rgb(8,8,10)" }}>
      <div
        className="relative hidden w-1/2 min-w-[28rem] flex-col justify-between overflow-hidden p-10 xl:flex xl:p-16"
        style={{
          background:
            "linear-gradient(135deg, rgb(15,15,20) 0%, rgb(20,18,35) 100%)",
        }}
      >
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 30% 40%, rgb(99,102,241) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgb(139,92,246) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center">
              <TrendingDown className="w-5 h-5 text-white" />
            </div>
            <span className="font-syne font-bold text-xl text-white">
              Spendly
            </span>
          </div>
        </div>
        <div className="relative z-10 space-y-6">
          <h1 className="font-syne text-4xl font-bold leading-tight text-white 2xl:text-5xl">
            Take control of your
            <br />
            <span className="gradient-text">finances today</span>
          </h1>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Track expenses, analyze patterns, and make smarter money decisions
            with beautiful visual insights.
          </p>
          <div className="flex gap-6 pt-4">
            {[
              ["₹0", "Setup cost"],
              ["100%", "Private"],
              ["Live", "Analytics"],
            ].map(([val, label]) => (
              <div key={label}>
                <div className="font-syne text-2xl font-bold text-indigo-400">
                  {val}
                </div>
                <div className="text-zinc-500 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10 text-zinc-600 text-sm">
          Built for personal finance management
        </div>
      </div>

      <div className="flex min-w-0 flex-1 items-center justify-center px-4 py-8 sm:p-8">
        <div className="w-full max-w-md space-y-7 sm:space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2 lg:hidden mb-6">
              <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-white" />
              </div>
              <span className="font-syne font-bold text-lg text-white">
                Spendly
              </span>
            </div>
            <h2 className="font-syne text-2xl font-bold text-white sm:text-3xl">
              Welcome back
            </h2>
            <p className="text-zinc-500">Sign in to your expense tracker</p>
          </div>

          {error && (
            <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-zinc-600 outline-none transition-all"
                  style={{
                    background: "rgb(20,20,25)",
                    border: "1px solid rgb(38,38,50)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgb(99,102,241)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "rgb(38,38,50)")}
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-3">
                <label className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <Link
                  href="/auth/forgot-password"
                  className="text-xs font-medium text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={loading}
                  className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-zinc-600 outline-none transition-all"
                  style={{
                    background: "rgb(20,20,25)",
                    border: "1px solid rgb(38,38,50)",
                  }}
                  onFocus={(e) =>
                    (e.target.style.borderColor = "rgb(99,102,241)")
                  }
                  onBlur={(e) => (e.target.style.borderColor = "rgb(38,38,50)")}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all duration-200 hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
              }}
            >
              {isClient && loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  Sign In <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-zinc-500 text-sm">
            Don't have an account?{" "}
            <Link
              href="/auth/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
            >
              Create one free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
