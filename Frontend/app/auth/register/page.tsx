"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { registerThunk, clearError } from "@/store/slices/authSlice";
import {
  Mail,
  Lock,
  User,
  ArrowRight,
  TrendingDown,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isClient, setIsClient] = useState(false);
  const dispatch = useAppDispatch();
  const router = useRouter();
  const { loading, error } = useAppSelector((s) => s.auth);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const inputStyle = {
    background: "rgb(20,20,25)",
    border: "1px solid rgb(38,38,50)",
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    dispatch(clearError());
    const result = await dispatch(registerThunk({ name, email, password }));
    if (registerThunk.fulfilled.match(result)) {
      toast.success("Account created!");
      router.push("/dashboard");
    } else {
      toast.error((result.payload as string) || "Registration failed");
    }
  };

  const fields = [
    {
      label: "Full Name",
      type: "text",
      value: name,
      set: setName,
      icon: User,
      placeholder: "John Doe",
    },
    {
      label: "Email",
      type: "email",
      value: email,
      set: setEmail,
      icon: Mail,
      placeholder: "you@example.com",
    },
    {
      label: "Password",
      type: "password",
      value: password,
      set: setPassword,
      icon: Lock,
      placeholder: "••••••••",
    },
    {
      label: "Confirm Password",
      type: "password",
      value: confirm,
      set: setConfirm,
      icon: Lock,
      placeholder: "••••••••",
    },
  ];

  return (
    <div
      className="flex min-h-screen items-center justify-center px-4 py-8 sm:p-8"
      style={{ background: "rgb(8,8,10)" }}
    >
      <div className="w-full max-w-md space-y-7 sm:space-y-8">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center mx-auto">
            <TrendingDown className="w-6 h-6 text-white" />
          </div>
          <h2 className="font-syne text-2xl font-bold text-white sm:text-3xl">
            Create your account
          </h2>
          <p className="text-zinc-500">Start tracking your expenses for free</p>
        </div>

        {error && (
          <div className="px-4 py-3 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map(
            ({ label, type, value, set, icon: Icon, placeholder }) => (
              <div key={label} className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">
                  {label}
                </label>
                <div className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                  <input
                    type={type}
                    value={value}
                    onChange={(e) => set(e.target.value)}
                    placeholder={placeholder}
                    required
                    disabled={loading}
                    className="w-full pl-11 pr-4 py-3 rounded-xl text-sm text-white placeholder-zinc-600 outline-none transition-all"
                    style={inputStyle}
                    onFocus={(e) =>
                      (e.target.style.borderColor = "rgb(99,102,241)")
                    }
                    onBlur={(e) =>
                      (e.target.style.borderColor = "rgb(38,38,50)")
                    }
                  />
                </div>
              </div>
            ),
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98] disabled:opacity-50 mt-2"
            style={{
              background:
                "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
            }}
          >
            {isClient && loading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <>
                Create Account <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <p className="text-center text-zinc-500 text-sm">
          Already have an account?{" "}
          <Link
            href="/auth/login"
            className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
