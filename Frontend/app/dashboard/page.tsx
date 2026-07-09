'use client';

import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchSummary, fetchAllAnalytics } from '@/store/slices/analyticsSlice';
import { fetchExpenses } from '@/store/slices/expensesSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { formatCurrency, formatDate } from '@/lib/utils';
import {
  TrendingUp, TrendingDown, Wallet, Calendar, ArrowUpRight,
  Receipt, Tag, Sparkles, AlertCircle, CheckCircle, Info
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import Link from 'next/link';

const statCard = (icon: React.ReactNode, label: string, value: string, sub: string, color: string) => (
  <div className="min-w-0 rounded-2xl p-4 space-y-4 card-hover sm:p-5"
    style={{ background: 'rgb(15,15,18)', border: '1px solid rgb(28,28,35)' }}>
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl flex items-center justify-center"
        style={{ background: `${color}18` }}>
        <div style={{ color }}>{icon}</div>
      </div>
      <ArrowUpRight className="w-4 h-4 text-zinc-600" />
    </div>
    <div>
      <div className="text-xs text-zinc-500 mb-1">{label}</div>
      <div className="font-syne text-xl font-bold text-white break-words sm:text-2xl">{value}</div>
      <div className="text-xs text-zinc-600 mt-1">{sub}</div>
    </div>
  </div>
);

const insightIcon: Record<string, React.ReactNode> = {
  warning: <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />,
  success: <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />,
  info: <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />,
};

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { user, token } = useAppSelector((s) => s.auth);
  const { summary, daily, byCategory, insights, loading } = useAppSelector((s) => s.analytics);
  const { items: expenses } = useAppSelector((s) => s.expenses);
  const { items: categories } = useAppSelector((s) => s.categories);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchAllAnalytics({ token }));
    dispatch(fetchExpenses({ token, filters: { limit: 5 } }));
    dispatch(fetchCategories(token));
  }, [token, dispatch]);

  const recentExpenses = expenses.slice(0, 5);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-6 sm:px-6 lg:space-y-8 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <p className="text-zinc-500 text-sm mb-1">Good to see you back,</p>
          <h1 className="font-syne text-2xl font-bold text-white break-words sm:text-3xl">{user?.name} <span className="gradient-text">👋</span></h1>
        </div>
        <Link href="/dashboard/expenses"
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90 sm:w-auto"
          style={{ background: 'linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))' }}>
          <Receipt className="w-4 h-4" />
          Add Expense
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCard(<Wallet className="w-5 h-5" />, "Today's Spend", formatCurrency(summary?.today.total || 0), `${summary?.today.count || 0} transactions`, '#6366f1')}
        {statCard(<Calendar className="w-5 h-5" />, "This Week", formatCurrency(summary?.thisWeek.total || 0), `${summary?.thisWeek.count || 0} transactions`, '#8b5cf6')}
        {statCard(<TrendingUp className="w-5 h-5" />, "This Month", formatCurrency(summary?.thisMonth.total || 0), `${summary?.thisMonth.count || 0} transactions`, '#a78bfa')}
        {statCard(<Tag className="w-5 h-5" />, "Categories", categories.length.toString(), `${summary?.allTime.count || 0} total expenses`, '#c4b5fd')}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="min-w-0 rounded-2xl p-4 sm:p-6 lg:col-span-2" style={{ background: 'rgb(15,15,18)', border: '1px solid rgb(28,28,35)' }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-syne font-bold text-white">Daily Spending</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Last 30 days</p>
            </div>
            <TrendingDown className="w-5 h-5 text-indigo-400" />
          </div>
          {daily.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">No data yet</div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={daily} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fill: '#52525b', fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#52525b', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ background: 'rgb(20,20,25)', border: '1px solid rgb(38,38,50)', borderRadius: 12, color: '#fff' }}
                  formatter={(v: any) => [formatCurrency(v), 'Spent']}
                />
                <Bar dataKey="total" radius={[6, 6, 0, 0]}
                  fill="url(#barGradient)" />
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99,102,241)" />
                    <stop offset="100%" stopColor="rgb(139,92,246)" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="min-w-0 rounded-2xl p-4 sm:p-6" style={{ background: 'rgb(15,15,18)', border: '1px solid rgb(28,28,35)' }}>
          <div className="mb-6">
            <h2 className="font-syne font-bold text-white">By Category</h2>
            <p className="text-xs text-zinc-500 mt-0.5">This month</p>
          </div>
          {byCategory.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">No data yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={byCategory} cx="50%" cy="50%" innerRadius={45} outerRadius={70}
                    dataKey="total" paddingAngle={3}>
                    {byCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: 'rgb(20,20,25)', border: '1px solid rgb(38,38,50)', borderRadius: 12, color: '#fff' }}
                    formatter={(v: any) => [formatCurrency(v), 'Spent']}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {byCategory.slice(0, 4).map((cat) => (
                  <div key={cat.categoryId} className="flex items-center justify-between gap-3 text-xs">
                    <div className="flex min-w-0 items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: cat.color }} />
                      <span className="truncate text-zinc-400">{cat.name}</span>
                    </div>
                    <span className="shrink-0 text-zinc-300 font-medium">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="min-w-0 rounded-2xl p-4 sm:p-6 lg:col-span-2" style={{ background: 'rgb(15,15,18)', border: '1px solid rgb(28,28,35)' }}>
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-syne font-bold text-white">Recent Expenses</h2>
            <Link href="/dashboard/expenses" className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors">
              View all →
            </Link>
          </div>
          {recentExpenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 space-y-3 text-zinc-600">
              <Receipt className="w-8 h-8" />
              <p className="text-sm">No expenses yet</p>
              <Link href="/dashboard/expenses"
                className="text-xs text-indigo-400 hover:text-indigo-300">Add your first expense →</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentExpenses.map((exp) => (
                <div key={exp._id} className="flex items-center gap-3 rounded-xl p-3 transition-colors hover:bg-white/5 sm:gap-4">
                  <div className="w-9 h-9 rounded-xl flex items-center justify-center text-sm shrink-0"
                    style={{ background: `${exp.categoryId?.color || '#6366f1'}20` }}>
                    <span>{exp.categoryId?.icon || '💸'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-zinc-200 truncate">{exp.description}</div>
                    <div className="text-xs text-zinc-600">{formatDate(exp.date)}</div>
                  </div>
                  <div className="shrink-0 text-right text-sm font-semibold text-white">{formatCurrency(exp.amount)}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="min-w-0 rounded-2xl p-4 sm:p-6" style={{ background: 'rgb(15,15,18)', border: '1px solid rgb(28,28,35)' }}>
          <div className="flex items-center gap-2 mb-5">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <h2 className="font-syne font-bold text-white">Insights</h2>
          </div>
          {insights.length === 0 ? (
            <div className="text-zinc-600 text-sm text-center py-8">
              Add more expenses to get insights
            </div>
          ) : (
            <div className="space-y-3">
              {insights.map((ins, i) => (
                <div key={i} className="flex gap-3 p-3 rounded-xl"
                  style={{
                    background: ins.type === 'warning' ? 'rgba(234,179,8,0.08)' :
                      ins.type === 'success' ? 'rgba(34,197,94,0.08)' : 'rgba(99,102,241,0.08)',
                    border: `1px solid ${ins.type === 'warning' ? 'rgba(234,179,8,0.15)' :
                      ins.type === 'success' ? 'rgba(34,197,94,0.15)' : 'rgba(99,102,241,0.15)'}`,
                  }}>
                  {insightIcon[ins.type]}
                  <p className="text-xs text-zinc-300 leading-relaxed">{ins.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
