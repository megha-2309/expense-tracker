"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowRight,
  CheckCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  TrendingDown,
  XCircle,
} from "lucide-react";
import { authApi } from "@/lib/api";

type TokenStatus = "checking" | "valid" | "invalid";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [tokenStatus, setTokenStatus] = useState<TokenStatus>("checking");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      setTokenStatus("invalid");
      return;
    }

    const validateToken = async () => {
      try {
        await authApi.validateResetToken(token);
        setTokenStatus("valid");
      } catch {
        setTokenStatus("invalid");
      }
    };

    validateToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!token) {
      setError("Reset token is missing");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      await authApi.resetPassword({ token, newPassword });
      setDone(true);
      window.setTimeout(() => router.push("/auth/login"), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  const getStrength = (pwd: string) => {
    if (pwd.length === 0) {
      return { label: "", color: "transparent", width: "0%" };
    }
    if (pwd.length < 6) {
      return { label: "Too short", color: "#ef4444", width: "25%" };
    }
    if (pwd.length < 8) {
      return { label: "Weak", color: "#f97316", width: "50%" };
    }
    if (pwd.length < 12 || !/[A-Z]/.test(pwd) || !/[0-9]/.test(pwd)) {
      return { label: "Good", color: "#eab308", width: "75%" };
    }
    return { label: "Strong", color: "#22c55e", width: "100%" };
  };

  const strength = getStrength(newPassword);

  if (tokenStatus === "checking") {
    return (
      <div
        className="flex min-h-screen items-center justify-center"
        style={{ background: "rgb(8,8,10)" }}
      >
        <div className="space-y-4 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-indigo-400" />
          <p className="text-sm text-zinc-500">Verifying your reset link...</p>
        </div>
      </div>
    );
  }

  if (tokenStatus === "invalid") {
    return (
      <div
        className="flex min-h-screen items-center justify-center px-4 py-8 sm:p-8"
        style={{ background: "rgb(8,8,10)" }}
      >
        <div className="w-full max-w-md space-y-6 text-center">
          <div
            className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl"
            style={{
              background: "rgba(239,68,68,0.12)",
              border: "1px solid rgba(239,68,68,0.25)",
            }}
          >
            <XCircle className="h-8 w-8 text-red-400" />
          </div>
          <div className="space-y-2">
            <h1 className="font-syne text-2xl font-bold text-white">
              Link expired
            </h1>
            <p className="text-sm text-zinc-500">
              This password reset link is invalid or has expired. Request a new
              one below.
            </p>
          </div>
          <Link
            href="/auth/forgot-password"
            className="block w-full rounded-xl py-3 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
            }}
          >
            Request new reset link
          </Link>
          <Link
            href="/auth/login"
            className="block text-sm text-zinc-600 transition-colors hover:text-zinc-400"
          >
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  if (done) {
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
              Password updated
            </h1>
            <p className="text-sm text-zinc-500">
              Your password has been reset successfully. Redirecting you to
              login in 3 seconds...
            </p>
          </div>
          <Link
            href="/auth/login"
            className="block w-full rounded-xl py-3 text-center text-sm font-semibold text-white transition-all hover:opacity-90"
            style={{
              background:
                "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
            }}
          >
            Go to Login
          </Link>
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
          <span className="font-syne text-lg font-bold text-white">Spendly</span>
        </div>

        <div className="space-y-2">
          <h1 className="font-syne text-2xl font-bold text-white sm:text-3xl">
            Set new password
          </h1>
          <p className="text-sm text-zinc-500">
            Choose a strong password you haven&apos;t used before.
          </p>
        </div>

        {error && (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              New password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full rounded-xl py-3 pl-11 pr-12 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                style={{
                  background: "rgb(20,20,25)",
                  border: "1px solid rgb(38,38,50)",
                }}
                onFocus={(e) =>
                  (e.target.style.borderColor = "rgb(99,102,241)")
                }
                onBlur={(e) =>
                  (e.target.style.borderColor = "rgb(38,38,50)")
                }
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {newPassword.length > 0 && (
              <div className="space-y-1">
                <div className="h-1.5 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full rounded-full transition-all duration-300"
                    style={{ width: strength.width, background: strength.color }}
                  />
                </div>
                <span className="text-xs" style={{ color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-zinc-300">
              Confirm new password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                disabled={loading}
                className="w-full rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-zinc-600 outline-none transition-all"
                style={{
                  background: "rgb(20,20,25)",
                  border: `1px solid ${
                    confirmPassword && confirmPassword !== newPassword
                      ? "rgb(239,68,68)"
                      : confirmPassword && confirmPassword === newPassword
                        ? "rgb(34,197,94)"
                        : "rgb(38,38,50)"
                  }`,
                }}
              />
            </div>
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-red-400">Passwords don&apos;t match</p>
            )}
          </div>

          <button
            type="submit"
            disabled={
              loading || newPassword !== confirmPassword || newPassword.length < 6
            }
            className="flex w-full items-center justify-center gap-2 rounded-xl py-3 font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-40"
            style={{
              background:
                "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
            }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                Reset password <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        <Link
          href="/auth/login"
          className="block text-center text-sm text-zinc-600 transition-colors hover:text-zinc-400"
        >
          Back to login
        </Link>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ background: "rgb(8,8,10)" }}
        >
          <Loader2 className="h-8 w-8 animate-spin text-indigo-400" />
        </div>
      }
    >
      <ResetPasswordContent />
    </Suspense>
  );
}
