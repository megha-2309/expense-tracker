"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Loader2,
  Mail,
  TrendingDown,
} from "lucide-react";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await authApi.forgotPassword({ email });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-8 sm:p-8"
        style={{ background: "rgb(8,8,10)" }}
      >
        <div className="w-full max-w-md space-y-6 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(34,197,94,0.12)",
              border: "1px solid rgba(34,197,94,0.25)",
            }}
          >
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>

          <div className="space-y-2">
            <h1 className="font-syne text-2xl font-bold text-white">
              Check your inbox
            </h1>
            <p className="text-sm leading-relaxed text-zinc-500">
              If{" "}
              <span className="break-all font-medium text-zinc-300">
                {email}
              </span>{" "}
              is registered with Spendly, you&apos;ll receive a reset link
              shortly. It expires in{" "}
              <span className="text-zinc-300">1 hour</span>.
            </p>
          </div>

          <div
            className="space-y-2 rounded-xl p-4 text-left text-sm"
            style={{
              background: "rgb(15,15,18)",
              border: "1px solid rgb(28,28,35)",
            }}
          >
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-400">
              What to do next
            </p>
            {[
              "Check your email inbox and spam folder",
              'Click the "Reset Password" button in the email',
              "Enter your new password on the next page",
            ].map((step, i) => (
              <div key={step} className="flex items-start gap-3">
                <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 text-xs text-indigo-400">
                  {i + 1}
                </div>
                <span className="text-zinc-500">{step}</span>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => setSubmitted(false)}
              className="flex-1 rounded-xl border border-zinc-800 py-2.5 text-sm font-medium text-zinc-400 transition-colors hover:bg-zinc-800"
            >
              Try another email
            </button>
            <Link
              href="/auth/login"
              className="flex-1 rounded-xl py-2.5 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
              style={{
                background:
                  "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
              }}
            >
              Back to login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8 sm:p-8"
      style={{ background: "rgb(8,8,10)" }}
    >
      <div className="w-full max-w-md space-y-7 sm:space-y-8">
        <div className="flex items-center gap-3">
          <div
            className="flex h-9 w-9 items-center justify-center rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
            }}
          >
            <TrendingDown className="h-4 w-4 text-white" />
          </div>
          <span className="font-syne text-lg font-bold text-white">
            Spendly
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="font-syne text-2xl font-bold text-white sm:text-3xl">
            Forgot password?
          </h1>
          <p className="text-sm text-zinc-500">
            No worries. Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Email address
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                disabled={loading}
                className="w-full rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all"
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
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50"
            style={{
              background:
                "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
            }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Send reset link <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to login
        </Link>
      </div>
    </div>
  );
}
