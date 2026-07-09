"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
} from "@/store/slices/expensesSlice";
import { fetchCategories } from "@/store/slices/categoriesSlice";
import { formatCurrency, formatDate } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Receipt,
  Filter,
  ChevronLeft,
  ChevronRight,
  X,
  Loader2,
  CreditCard,
  Banknote,
  Smartphone,
  Building2,
} from "lucide-react";
import type { Expense } from "@/lib/api";

const PAYMENT_ICONS: Record<string, React.ReactNode> = {
  cash: <Banknote className="w-3 h-3" />,
  credit_card: <CreditCard className="w-3 h-3" />,
  debit_card: <CreditCard className="w-3 h-3" />,
  bank_transfer: <Building2 className="w-3 h-3" />,
  upi: <Smartphone className="w-3 h-3" />,
};

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash",
  credit_card: "Credit",
  debit_card: "Debit",
  bank_transfer: "Bank",
  upi: "UPI",
};

interface ExpenseModalProps {
  open: boolean;
  onClose: () => void;
  editingExpense: Expense | null;
}

function ExpenseModal({ open, onClose, editingExpense }: ExpenseModalProps) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const { items: categories } = useAppSelector((s) => s.categories);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    categoryId: "",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
    paymentMethod: "cash",
  });

  useEffect(() => {
    if (editingExpense) {
      setForm({
        categoryId: editingExpense.categoryId?._id || "",
        amount: String(editingExpense.amount),
        description: editingExpense.description,
        date: new Date(editingExpense.date).toISOString().split("T")[0],
        paymentMethod: editingExpense.paymentMethod || "cash",
      });
    } else {
      setForm({
        categoryId: "",
        amount: "",
        description: "",
        date: new Date().toISOString().split("T")[0],
        paymentMethod: "cash",
      });
    }
  }, [editingExpense, open]);

  if (!open) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        categoryId: form.categoryId,
        amount: parseFloat(form.amount),
        description: form.description,
        date: form.date,
        paymentMethod: form.paymentMethod,
      };
      if (editingExpense) {
        await dispatch(
          updateExpense({ token, id: editingExpense._id, data: payload }),
        ).unwrap();
        toast.success("Expense updated");
      } else {
        await dispatch(createExpense({ token, data: payload })).unwrap();
        toast.success("Expense added");
      }
      onClose();
    } catch (err: any) {
      toast.error(err || "Failed to save expense");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 rounded-xl text-sm text-white placeholder-zinc-600 outline-none transition-all bg-zinc-900 border border-zinc-800 focus:border-indigo-500";

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-3 sm:items-center sm:p-4"
      style={{ background: "rgba(0,0,0,0.8)" }}
    >
      <div
        className="max-h-[calc(100dvh-1.5rem)] w-full max-w-lg overflow-y-auto rounded-2xl p-4 space-y-5 sm:max-h-[calc(100dvh-2rem)] sm:p-6"
        style={{
          background: "rgb(15,15,18)",
          border: "1px solid rgb(38,38,50)",
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-syne text-xl font-bold text-white">
            {editingExpense ? "Edit Expense" : "Add New Expense"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">
                Amount (₹)
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                placeholder="0.00"
                required
                className={inputClass}
                value={form.amount}
                onChange={(e) => setForm({ ...form, amount: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-zinc-400">Date</label>
              <input
                type="date"
                required
                className={inputClass}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Description
            </label>
            <input
              type="text"
              placeholder="What did you spend on?"
              className={inputClass}
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Category
            </label>
            <select
              required
              className={inputClass}
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">Select category</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-400">
              Payment Method
            </label>
            <div className="grid grid-cols-2 gap-2 min-[420px]:grid-cols-3 sm:grid-cols-5">
              {Object.entries(PAYMENT_LABELS).map(([val, label]) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => setForm({ ...form, paymentMethod: val })}
                  className="flex flex-col items-center gap-1 py-2 px-1 rounded-xl text-xs transition-all"
                  style={{
                    background:
                      form.paymentMethod === val
                        ? "rgba(99,102,241,0.15)"
                        : "rgb(25,25,30)",
                    border: `1px solid ${form.paymentMethod === val ? "rgba(99,102,241,0.4)" : "rgb(38,38,50)"}`,
                    color:
                      form.paymentMethod === val
                        ? "rgb(165,180,252)"
                        : "#71717a",
                  }}
                >
                  {PAYMENT_ICONS[val]}
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-medium text-zinc-400 border border-zinc-800 hover:bg-zinc-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
              }}
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : editingExpense ? (
                "Update"
              ) : (
                "Add Expense"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ExpensesPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const {
    items: expenses,
    pagination,
    loading,
  } = useAppSelector((s) => s.expenses);
  const { items: categories } = useAppSelector((s) => s.categories);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const load = () => {
    if (!token) return;
    dispatch(
      fetchExpenses({
        token,
        filters: {
          page,
          limit: 15,
          ...(filterCategory && { categoryId: filterCategory }),
          ...(startDate && { startDate }),
          ...(endDate && { endDate }),
        },
      }),
    );
  };

  useEffect(() => {
    if (token) {
      dispatch(fetchCategories(token));
    }
  }, [token, dispatch]);
  useEffect(() => {
    load();
  }, [token, page, filterCategory, startDate, endDate]);

  const handleDelete = async (id: string) => {
    if (!token || !confirm("Delete this expense?")) return;
    setDeletingId(id);
    try {
      await dispatch(deleteExpense({ token, id })).unwrap();
      toast.success("Expense deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    } finally {
      setDeletingId(null);
    }
  };

  const filtered = expenses.filter(
    (e) =>
      search === "" ||
      e.description.toLowerCase().includes(search.toLowerCase()) ||
      (e.categoryId?.name || "").toLowerCase().includes(search.toLowerCase()),
  );

  const clearFilters = () => {
    setFilterCategory("");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };
  const hasFilters = filterCategory || startDate || endDate;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 pb-6 sm:px-6 lg:p-8">
      <ExpenseModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingExpense(null);
          load();
        }}
        editingExpense={editingExpense}
      />

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-syne text-2xl font-bold text-white sm:text-3xl">
            Expenses
          </h1>
          <p className="text-zinc-500 text-sm mt-1">
            {pagination?.total
              ? `${pagination.total} total expenses`
              : "Track all your spending"}
          </p>
        </div>
        <button
          onClick={() => {
            setEditingExpense(null);
            setModalOpen(true);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90 sm:w-auto"
          style={{
            background:
              "linear-gradient(135deg, rgb(99,102,241), rgb(139,92,246))",
          }}
        >
          <Plus className="w-4 h-4" />
          Add Expense
        </button>
      </div>

      <div
        className="rounded-2xl p-4 space-y-3"
        style={{
          background: "rgb(15,15,18)",
          border: "1px solid rgb(28,28,35)",
        }}
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600" />
            <input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-white placeholder-zinc-600 outline-none bg-zinc-900 border border-zinc-800 focus:border-indigo-500 transition-all"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all sm:justify-start"
            style={{
              background: showFilters
                ? "rgba(99,102,241,0.15)"
                : "rgb(25,25,30)",
              border: `1px solid ${showFilters ? "rgba(99,102,241,0.3)" : "rgb(38,38,50)"}`,
              color: showFilters ? "rgb(165,180,252)" : "#71717a",
            }}
          >
            <Filter className="w-4 h-4" />
            Filters{" "}
            {hasFilters && (
              <span className="w-2 h-2 rounded-full bg-indigo-400 ml-1" />
            )}
          </button>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center justify-center rounded-xl border border-zinc-800 px-3 py-2.5 text-sm text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2 border-t border-zinc-800">
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">Category</label>
              <select
                value={filterCategory}
                onChange={(e) => {
                  setFilterCategory(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl text-sm text-white bg-zinc-900 border border-zinc-800 focus:border-indigo-500 outline-none"
              >
                <option value="">All Categories</option>
                {categories.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.icon} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">From Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl text-sm text-white bg-zinc-900 border border-zinc-800 focus:border-indigo-500 outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-zinc-500">To Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => {
                  setEndDate(e.target.value);
                  setPage(1);
                }}
                className="w-full px-3 py-2 rounded-xl text-sm text-white bg-zinc-900 border border-zinc-800 focus:border-indigo-500 outline-none"
              />
            </div>
          </div>
        )}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgb(15,15,18)",
          border: "1px solid rgb(28,28,35)",
        }}
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 space-y-3 text-zinc-600">
            <Receipt className="w-12 h-12" />
            <p className="font-medium">No expenses found</p>
            <p className="text-sm text-zinc-700">
              {search || hasFilters
                ? "Try adjusting your search or filters"
                : "Add your first expense to get started"}
            </p>
          </div>
        ) : (
          <>
            <div
              className="hidden grid-cols-12 gap-4 px-5 py-3 border-b text-xs font-medium text-zinc-600 uppercase tracking-wider lg:grid"
              style={{ borderColor: "rgb(28,28,35)" }}
            >
              <div className="col-span-1">Date</div>
              <div className="col-span-4">Description</div>
              <div className="col-span-3">Category</div>
              <div className="col-span-2">Payment</div>
              <div className="col-span-1 text-right">Amount</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {filtered.map((exp) => (
              <div
                key={exp._id}
                className="group grid grid-cols-1 gap-3 border-b px-4 py-4 transition-colors hover:bg-white/[0.02] sm:px-5 lg:grid-cols-12 lg:items-center lg:gap-4"
                style={{ borderColor: "rgb(22,22,26)" }}
              >
                <div className="text-xs text-zinc-500 lg:col-span-1">
                  {formatDate(exp.date)}
                </div>
                <div className="min-w-0 lg:col-span-4">
                  <span className="block truncate text-sm font-medium text-zinc-200">
                    {exp.description}
                  </span>
                </div>
                <div className="min-w-0 lg:col-span-3">
                  {exp.categoryId ? (
                    <span
                      className="inline-flex max-w-full items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-medium"
                      style={{
                        background: `${exp.categoryId.color}18`,
                        color: exp.categoryId.color,
                      }}
                    >
                      <span>{exp.categoryId.icon}</span>
                      <span className="truncate">{exp.categoryId.name}</span>
                    </span>
                  ) : (
                    <span className="text-zinc-600 text-xs">—</span>
                  )}
                </div>
                <div className="lg:col-span-2">
                  <span className="inline-flex items-center gap-1 text-xs text-zinc-500">
                    {PAYMENT_ICONS[exp.paymentMethod]}
                    {PAYMENT_LABELS[exp.paymentMethod] || exp.paymentMethod}
                  </span>
                </div>
                <div className="font-syne text-sm font-bold text-white lg:col-span-1 lg:text-right">
                  {formatCurrency(exp.amount)}
                </div>
                <div className="flex justify-end gap-1 opacity-100 transition-opacity lg:col-span-1 lg:opacity-0 lg:group-hover:opacity-100">
                  <button
                    onClick={() => {
                      setEditingExpense(exp);
                      setModalOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDelete(exp._id)}
                    disabled={deletingId === exp._id}
                    className="p-1.5 rounded-lg text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                  >
                    {deletingId === exp._id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col gap-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-center text-zinc-600 sm:text-left">
            Showing {(page - 1) * 15 + 1}–
            {Math.min(page * 15, pagination.total)} of {pagination.total}
          </span>
          <div className="flex justify-center gap-2 sm:justify-end">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 rounded-lg text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-all disabled:opacity-40"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-4 py-2 rounded-lg text-zinc-300 border border-zinc-800">
              {page} / {pagination.totalPages}
            </span>
            <button
              onClick={() =>
                setPage((p) => Math.min(pagination.totalPages, p + 1))
              }
              disabled={page === pagination.totalPages}
              className="p-2 rounded-lg text-zinc-500 hover:text-white border border-zinc-800 hover:border-zinc-600 transition-all disabled:opacity-40"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
