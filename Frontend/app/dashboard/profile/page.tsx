'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout } from '@/store/slices/authSlice';
import { User, Mail, LogOut, Shield, TrendingDown, Info } from 'lucide-react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((s) => s.auth);
  const router = useRouter();
  const { items: categories } = useAppSelector((s) => s.categories);
  const { items: expenses } = useAppSelector((s) => s.expenses);

  const handleLogout = () => {
    dispatch(logout());
    toast.success('Signed out');
    router.push('/auth/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 pb-6 sm:px-6 lg:p-8">
      <div>
        <h1 className="font-syne text-2xl font-bold text-white sm:text-3xl">Profile</h1>
        <p className="text-zinc-500 text-sm mt-1">Manage your account</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl p-4 flex flex-col items-center gap-4 text-center sm:p-6"
          style={{ background: 'rgb(15,15,18)', border: '1px solid rgb(28,28,35)' }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center font-syne text-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))' }}>
            {initials}
          </div>
          <div>
            <div className="font-syne text-xl font-bold text-white break-words">{user?.name}</div>
            <div className="text-zinc-500 text-sm mt-1 break-all">{user?.email}</div>
          </div>
          <div className="flex gap-6 w-full pt-2 border-t" style={{ borderColor: 'rgb(28,28,35)' }}>
            <div className="flex-1 text-center">
              <div className="font-syne font-bold text-white">{expenses.length}</div>
              <div className="text-xs text-zinc-600">Expenses</div>
            </div>
            <div className="flex-1 text-center">
              <div className="font-syne font-bold text-white">{categories.length}</div>
              <div className="text-xs text-zinc-600">Categories</div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl p-4 space-y-4 sm:p-6 lg:col-span-2"
          style={{ background: 'rgb(15,15,18)', border: '1px solid rgb(28,28,35)' }}>
          <h2 className="font-syne font-bold text-white">Account Information</h2>

          {[
            { icon: User, label: 'Full Name', value: user?.name },
            { icon: Mail, label: 'Email Address', value: user?.email },
            { icon: Shield, label: 'Account Type', value: 'Personal' },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex min-w-0 items-center gap-3 rounded-xl p-3 sm:gap-4 sm:p-4"
              style={{ background: 'rgb(20,20,25)' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99,102,241,0.1)' }}>
                <Icon className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-zinc-500">{label}</div>
                <div className="text-sm font-medium text-zinc-200 mt-0.5 break-words">{value}</div>
              </div>
            </div>
          ))}

          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 border border-red-500/20 hover:bg-red-500/10 transition-all mt-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </div>

      <div className="rounded-2xl p-4 sm:p-6" style={{ background: 'rgb(15,15,18)', border: '1px solid rgb(28,28,35)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))' }}>
            <TrendingDown className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-syne font-bold text-white">Spendly</div>
            <div className="text-xs text-zinc-600">Personal Expense Tracker · v1.0.0</div>
          </div>
        </div>
        <p className="text-sm text-zinc-500 leading-relaxed">
          Spendly is your personal finance companion. Track daily expenses, organize by categories,
          and gain insights through detailed analytics and visual reports — all stored securely in your own database.
        </p>
        <div className="flex items-center gap-2 mt-4 text-xs text-zinc-600">
          <Info className="w-3.5 h-3.5" />
          Built with Next.js, Node.js, Express, and MongoDB
        </div>
      </div>
    </div>
  );
}
