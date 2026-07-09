"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAppSelector } from "@/store/hooks";

export default function HomePage() {
  const router = useRouter();
  const { user, loading } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (!loading) {
      router.replace(user ? "/dashboard" : "/auth/login");
    }
  }, [user, loading, router]);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "rgb(10,10,10)" }}
    >
      <div className="text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-500/30 mx-auto flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="text-zinc-500 text-sm font-dm">Loading Spendly...</p>
      </div>
    </div>
  );
}
