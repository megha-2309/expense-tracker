// 'use client';

// import Link from 'next/link';
// import { usePathname, useRouter } from 'next/navigation';
// import { useAppDispatch, useAppSelector } from '@/store/hooks';
// import { logout } from '@/store/slices/authSlice';
// import {
//   LayoutDashboard, Receipt, Tag, BarChart3, User,
//   LogOut, TrendingDown, ChevronRight
// } from 'lucide-react';
// import { cn } from '@/lib/utils';
// import { toast } from 'sonner';

// const navItems = [
//   { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
//   { href: '/dashboard/expenses', label: 'Expenses', icon: Receipt },
//   { href: '/dashboard/categories', label: 'Categories', icon: Tag },
//   { href: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
//   { href: '/dashboard/profile', label: 'Profile', icon: User },
// ];

// export function Sidebar() {
//   const pathname = usePathname();
//   const router = useRouter();
//   const dispatch = useAppDispatch();
//   const { user } = useAppSelector((s) => s.auth);

//   const handleLogout = () => {
//     dispatch(logout());
//     toast.success('Logged out');
//     router.push('/auth/login');
//   };

//   return (
//     <aside className="w-60 flex flex-col shrink-0 border-r" style={{
//       background: 'rgb(12,12,15)',
//       borderColor: 'rgb(28,28,35)',
//     }}>
//       <div className="p-6 border-b" style={{ borderColor: 'rgb(28,28,35)' }}>
//         <div className="flex items-center gap-3">
//           <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
//             style={{ background: 'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))' }}>
//             <TrendingDown className="w-4 h-4 text-white" />
//           </div>
//           <div>
//             <div className="font-syne font-bold text-white text-lg leading-none">Spendly</div>
//             <div className="text-xs text-zinc-600 mt-0.5">Expense Tracker</div>
//           </div>
//         </div>
//       </div>

//       <nav className="flex-1 p-3 space-y-1">
//         {navItems.map(({ href, label, icon: Icon }) => {
//           const active = pathname === href;
//           return (
//             <Link key={href} href={href}
//               className={cn(
//                 'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group',
//                 active
//                   ? 'text-white'
//                   : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
//               )}
//               style={active ? {
//                 background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))',
//                 border: '1px solid rgba(99,102,241,0.2)',
//               } : {}}
//             >
//               <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-indigo-400' : '')} />
//               <span>{label}</span>
//               {active && <ChevronRight className="w-3 h-3 text-indigo-400 ml-auto" />}
//             </Link>
//           );
//         })}
//       </nav>

//       <div className="p-3 border-t" style={{ borderColor: 'rgb(28,28,35)' }}>
//         <div className="px-3 py-2 mb-1">
//           <div className="text-sm font-medium text-zinc-300 truncate">{user?.name}</div>
//           <div className="text-xs text-zinc-600 truncate">{user?.email}</div>
//         </div>
//         <button onClick={handleLogout}
//           className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150">
//           <LogOut className="w-4 h-4" />
//           <span>Sign out</span>
//         </button>
//       </div>
//     </aside>
//   );
// }

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/slices/authSlice";
import {
  LayoutDashboard,
  Receipt,
  Tag,
  BarChart3,
  User,
  LogOut,
  TrendingDown,
  ChevronRight,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/expenses", label: "Expenses", icon: Receipt },
  { href: "/dashboard/categories", label: "Categories", icon: Tag },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/dashboard/profile", label: "Profile", icon: User },
];

export function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    dispatch(logout());
    toast.success("Logged out");
    router.push("/auth/login");
  };

  return (
    <>
      <header
        className="fixed inset-x-0 top-0 z-40 flex h-16 items-center justify-between border-b px-4 backdrop-blur-xl lg:hidden"
        style={{
          background: "rgba(12,12,15,0.92)",
          borderColor: "rgb(28,28,35)",
        }}
      >
        <Link href="/dashboard" className="flex min-w-0 items-center gap-3">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl"
            style={{
              background:
                "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
            }}
          >
            <TrendingDown className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <div className="font-syne text-lg font-bold leading-none text-white">
              Spendly
            </div>
            <div className="mt-0.5 text-xs text-zinc-600">
              Expense Tracker
            </div>
          </div>
        </Link>

        <button
          onClick={() => setIsOpen(true)}
          aria-label="Open navigation"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-400 transition-colors hover:text-white"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 right-0 z-50 flex w-64 max-w-[85vw] shrink-0 flex-col border-l transition-transform duration-300 lg:static lg:translate-x-0 lg:border-l-0 lg:border-r",
          isOpen ? "translate-x-0" : "translate-x-full",
        )}
        style={{
          background: "rgb(12,12,15)",
          borderColor: "rgb(28,28,35)",
        }}
      >
        <div
          className="p-6 border-b flex items-center justify-between"
          style={{ borderColor: "rgb(28,28,35)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background:
                  "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
              }}
            >
              <TrendingDown className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-syne font-bold text-white text-lg leading-none">
                Spendly
              </div>
              <div className="text-xs text-zinc-600 mt-0.5">
                Expense Tracker
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            aria-label="Close navigation"
            className="p-1 text-zinc-500 hover:text-white lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group",
                  active
                    ? "text-white"
                    : "text-zinc-500 hover:text-zinc-300 hover:bg-white/5",
                )}
                style={
                  active
                    ? {
                        background:
                          "linear-gradient(135deg, rgba(99,102,241,0.15), rgba(139,92,246,0.1))",
                        border: "1px solid rgba(99,102,241,0.2)",
                      }
                    : {}
                }
              >
                <Icon
                  className={cn(
                    "w-4 h-4 shrink-0",
                    active ? "text-indigo-400" : "",
                  )}
                />
                <span>{label}</span>
                {active && (
                  <ChevronRight className="w-3 h-3 text-indigo-400 ml-auto" />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t" style={{ borderColor: "rgb(28,28,35)" }}>
          <div className="px-3 py-2 mb-1">
            <div className="text-sm font-medium text-zinc-300 truncate">
              {user?.name}
            </div>
            <div className="text-xs text-zinc-600 truncate">{user?.email}</div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all duration-150"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
