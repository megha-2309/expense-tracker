"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAllAnalytics } from "@/store/slices/analyticsSlice";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from "recharts";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart as PieIcon,
  Calendar,
  AlertCircle,
  CheckCircle,
  Info,
  Loader2,
} from "lucide-react";

const PRESET_RANGES = [
  { label: "7D", days: 7 },
  { label: "30D", days: 30 },
  { label: "90D", days: 90 },
];

const tooltipStyle = {
  contentStyle: {
    background: "rgb(20,20,25)",
    border: "1px solid rgb(38,38,50)",
    borderRadius: 12,
    color: "#fff",
    fontSize: 12,
  },
  itemStyle: { color: "#a1a1aa" },
};

const insightConfig: Record<
  string,
  { icon: React.ReactNode; bg: string; border: string }
> = {
  warning: {
    icon: <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />,
    bg: "rgba(234,179,8,0.08)",
    border: "rgba(234,179,8,0.2)",
  },
  success: {
    icon: <CheckCircle className="w-4 h-4 text-green-400 shrink-0 mt-0.5" />,
    bg: "rgba(34,197,94,0.08)",
    border: "rgba(34,197,94,0.2)",
  },
  info: {
    icon: <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />,
    bg: "rgba(99,102,241,0.08)",
    border: "rgba(99,102,241,0.2)",
  },
};

function SectionHeader({
  title,
  subtitle,
  icon,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex min-w-0 items-center gap-3">
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center text-indigo-400"
        style={{
          background: "rgba(99,102,241,0.12)",
          border: "1px solid rgba(99,102,241,0.2)",
        }}
      >
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="font-syne font-bold text-white">{title}</h2>
        <p className="text-xs text-zinc-500">{subtitle}</p>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const { summary, daily, byCategory, monthly, insights, loading } =
    useAppSelector((s) => s.analytics);

  const [preset, setPreset] = useState(30);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const getDateRange = (days: number) => {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - (days - 1));
    return {
      startDate: start.toISOString().split("T")[0],
      endDate: end.toISOString().split("T")[0],
    };
  };

  const load = (params?: { startDate?: string; endDate?: string }) => {
    if (!token) return;
    dispatch(fetchAllAnalytics({ token, params }));
  };

  useEffect(() => {
    const range = getDateRange(30);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    load(range);
  }, [token]);

  const applyPreset = (days: number) => {
    setPreset(days);
    const range = getDateRange(days);
    setStartDate(range.startDate);
    setEndDate(range.endDate);
    load(range);
  };

  const applyCustom = () => {
    if (startDate && endDate) {
      setPreset(0);
      load({ startDate, endDate });
    }
  };

  const totalSpend = byCategory.reduce((s, c) => s + c.total, 0);
  const avgDaily = daily.length > 0 ? totalSpend / daily.length : 0;
  const maxDay = daily.reduce((max, d) => (d.total > max.total ? d : max), {
    date: "—",
    total: 0,
  });

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-6 sm:px-6 lg:space-y-8 lg:p-8">
      <div>
        <h1 className="font-syne text-2xl font-bold text-white sm:text-3xl">Analytics</h1>
        <p className="text-zinc-500 text-sm mt-1">
          Analyze your spending patterns and trends
        </p>
      </div>

      <div
        className="flex flex-col items-stretch gap-3 rounded-2xl p-4 sm:flex-row sm:flex-wrap sm:items-center"
        style={{
          background: "rgb(15,15,18)",
          border: "1px solid rgb(28,28,35)",
        }}
      >
        <Calendar className="w-4 h-4 text-zinc-500" />
        <div className="grid grid-cols-3 gap-2 sm:flex">
          {PRESET_RANGES.map(({ label, days }) => (
            <button
              key={days}
              onClick={() => applyPreset(days)}
              className="px-3 py-1.5 rounded-lg text-xs font-medium transition-all"
              style={{
                background:
                  preset === days ? "rgba(99,102,241,0.15)" : "rgb(25,25,30)",
                border: `1px solid ${preset === days ? "rgba(99,102,241,0.4)" : "rgb(38,38,50)"}`,
                color: preset === days ? "rgb(165,180,252)" : "#71717a",
              }}
            >
              Last {label}
            </button>
          ))}
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 sm:w-auto sm:py-1.5"
          />
          <span className="hidden text-zinc-600 text-xs sm:inline">to</span>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-zinc-800 bg-zinc-900 px-3 py-2 text-xs text-white outline-none focus:border-indigo-500 sm:w-auto sm:py-1.5"
          />
          <button
            onClick={applyCustom}
            className="rounded-lg border border-indigo-500/30 px-3 py-2 text-xs font-medium text-indigo-400 transition-colors hover:bg-indigo-500/10 sm:py-1.5"
          >
            Apply
          </button>
        </div>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Total Spend",
            value: formatCurrency(totalSpend),
            icon: <TrendingDown className="w-4 h-4" />,
            color: "#6366f1",
          },
          {
            label: "Avg per Day",
            value: formatCurrency(avgDaily),
            icon: <BarChart3 className="w-4 h-4" />,
            color: "#8b5cf6",
          },
          {
            label: "Peak Day",
            value: maxDay.date !== "—" ? maxDay.date.slice(5) : "—",
            icon: <TrendingUp className="w-4 h-4" />,
            color: "#a78bfa",
          },
          {
            label: "Categories",
            value: String(byCategory.length),
            icon: <PieIcon className="w-4 h-4" />,
            color: "#c4b5fd",
          },
        ].map(({ label, value, icon, color }) => (
          <div
            key={label}
            className="min-w-0 rounded-2xl p-4"
            style={{
              background: "rgb(15,15,18)",
              border: "1px solid rgb(28,28,35)",
            }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center"
                style={{ background: `${color}18`, color }}
              >
                {icon}
              </div>
              <span className="text-xs text-zinc-500">{label}</span>
            </div>
            <div className="font-syne text-xl font-bold text-white break-words">
              {value}
            </div>
          </div>
        ))}
      </div>

      <div
        className="min-w-0 rounded-2xl p-4 sm:p-6"
        style={{
          background: "rgb(15,15,18)",
          border: "1px solid rgb(28,28,35)",
        }}
      >
        <SectionHeader
          title="Daily Spending"
          subtitle={`${daily.length} days in range`}
          icon={<BarChart3 className="w-5 h-5" />}
        />

        {daily.length === 0 ? (
          <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">
            No data for this period
          </div>
        ) : (
          <div className="h-[240px] w-full mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={daily}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="barG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgb(99,102,241)" />
                    <stop
                      offset="100%"
                      stopColor="rgb(139,92,246)"
                      stopOpacity={0.3}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  vertical={false}
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />

                <XAxis
                  dataKey="date"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#52525b", fontSize: 11 }}
                  tickFormatter={(v) => v.slice(5)}
                  interval={Math.floor(daily.length / 10)}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#52525b", fontSize: 11 }}
                />

                <Tooltip
                  {...tooltipStyle}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  formatter={(v: any) => [formatCurrency(v), "Spent"]}
                />

                <Bar
                  dataKey="total"
                  radius={[4, 4, 0, 0]}
                  fill="url(#barG)"
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className="min-w-0 rounded-2xl p-4 sm:p-6"
          style={{
            background: "rgb(15,15,18)",
            border: "1px solid rgb(28,28,35)",
          }}
        >
          <SectionHeader
            title="Category Breakdown"
            subtitle="Where your money goes"
            icon={<PieIcon className="w-5 h-5" />}
          />
          {byCategory.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">
              No data
            </div>
          ) : (
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="h-[200px] w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={byCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="total"
                    paddingAngle={3}
                  >
                    {byCategory.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    {...tooltipStyle}
                    formatter={(v: any) => [formatCurrency(v), ""]}
                  />
                </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex-1 space-y-3 self-center">
                {byCategory.map((cat) => (
                  <div key={cat.categoryId} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex min-w-0 items-center gap-1.5 text-zinc-300">
                        <span>{cat.icon}</span>
                        <span className="truncate">{cat.name}</span>
                      </span>
                      <span className="text-zinc-400 font-medium">
                        {((cat.total / totalSpend) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="h-1.5 rounded-full bg-zinc-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(cat.total / totalSpend) * 100}%`,
                          background: cat.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div
          className="min-w-0 rounded-2xl p-4 sm:p-6"
          style={{
            background: "rgb(15,15,18)",
            border: "1px solid rgb(28,28,35)",
          }}
        >
          <SectionHeader
            title="Monthly Trend"
            subtitle="Last 6 months"
            icon={<TrendingUp className="w-5 h-5" />}
          />
          {monthly.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-zinc-600 text-sm">
              No data
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <LineChart
                data={monthly}
                margin={{ top: 5, right: 5, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#52525b", fontSize: 11 }}
                />
                <YAxis tick={{ fill: "#52525b", fontSize: 11 }} />
                <Tooltip
                  {...tooltipStyle}
                  formatter={(v: any) => [formatCurrency(v), "Spent"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="rgb(99,102,241)"
                  strokeWidth={2}
                  dot={{ fill: "rgb(99,102,241)", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {insights.length > 0 && (
        <div
          className="rounded-2xl p-4 sm:p-6"
          style={{
            background: "rgb(15,15,18)",
            border: "1px solid rgb(28,28,35)",
          }}
        >
          <h2 className="font-syne font-bold text-white mb-4">
            Smart Insights
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {insights.map((ins, i) => {
              const cfg = insightConfig[ins.type];
              return (
                <div
                  key={i}
                  className="flex gap-3 p-4 rounded-xl"
                  style={{
                    background: cfg.bg,
                    border: `1px solid ${cfg.border}`,
                  }}
                >
                  {cfg.icon}
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {ins.message}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
