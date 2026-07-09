"use client";

import { useState, useEffect } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from "@/store/slices/categoriesSlice";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag, X, Loader2 } from "lucide-react";
import type { Category } from "@/lib/api";

const ICONS = [
  "🍔","🍕","🍜","☕","🍺",
  "🥛","🥚","🍞","🥣","🌾","🫘",
  "🛒","🏠","💡","📱","🌐",
  "🚗","🚌","✈️","🚕","⛽","🚆",
  "💊","🏥","💪","🏋️",
  "🎮","🎬","🎵","👔","👗","💄","💈","🎁",
  "📚","🎓","🐶","🌱","🔧","💰","🏖️","📝"
];

const COLORS = [
  "#ef4444","#f97316","#eab308","#22c55e","#10b981",
  "#06b6d4","#3b82f6","#6366f1","#8b5cf6","#ec4899",
  "#f43f5e","#84cc16","#14b8a6","#0ea5e9","#a855f7",
];

const DEFAULT_CATEGORIES = [
  { name: "Groceries", icon: "🛒", color: "#22c55e" },
  { name: "Milk & Dairy", icon: "🥛", color: "#06b6d4" },
  { name: "Eggs", icon: "🥚", color: "#eab308" },
  { name: "Bakery (Bread)", icon: "🍞", color: "#f97316" },
  { name: "Curd / Yogurt", icon: "🥣", color: "#84cc16" },
  { name: "Healthy Food (Oats)", icon: "🌾", color: "#a3e635" },
  { name: "Protein (Soya)", icon: "🫘", color: "#65a30d" },
  { name: "House Rent", icon: "🏠", color: "#6366f1" },
  { name: "Electricity Bill", icon: "💡", color: "#facc15" },
  { name: "Mobile Recharge", icon: "📱", color: "#3b82f6" },
  { name: "Internet / WiFi", icon: "🌐", color: "#0ea5e9" },
  { name: "Transport (Bus)", icon: "🚌", color: "#f59e0b" },
  { name: "Cab / Auto", icon: "🚕", color: "#fb923c" },
  { name: "Fuel", icon: "⛽", color: "#ef4444" },
  { name: "Gym", icon: "🏋️", color: "#8b5cf6" },
  { name: "Medical", icon: "💊", color: "#ec4899" },
  { name: "Entertainment", icon: "🎬", color: "#f43f5e" },
  { name: "Shopping", icon: "👗", color: "#d946ef" },
  { name: "Savings", icon: "💰", color: "#10b981" },
];

function CategoryModal({ open, onClose, editingCategory }: any) {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", icon: "📁", color: "#6366f1" });

  useEffect(() => {
    if (editingCategory) {
      setForm(editingCategory);
    } else {
      setForm({ name: "", icon: "📁", color: "#6366f1" });
    }
  }, [editingCategory, open]);

  if (!open) return null;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!token) return;
    setSaving(true);
    try {
      if (editingCategory) {
        await dispatch(updateCategory({
          token,
          id: editingCategory._id,
          data: form
        })).unwrap();
        toast.success("Category updated");
      } else {
        await dispatch(createCategory({ token, data: form })).unwrap();
        toast.success("Category created");
      }
      onClose();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80">
      <div className="w-full max-w-md bg-zinc-900 rounded-2xl p-5 space-y-5 border border-zinc-800">
        
        <div className="flex justify-between items-center">
          <h2 className="text-white font-bold">
            {editingCategory ? "Edit Category" : "New Category"}
          </h2>
          <button onClick={onClose}><X /></button>
        </div>

        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 flex items-center justify-center rounded-xl text-2xl"
            style={{ background: `${form.color}22` }}
          >
            {form.icon}
          </div>
          <div>
            <div className="text-white font-bold">
              {form.name || "Category"}
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Category name"
            className="w-full p-2 rounded bg-zinc-800 text-white"
          />

          <div className="grid grid-cols-6 gap-2">
            {ICONS.map((icon) => (
              <button
                key={icon}
                type="button"
                onClick={() => setForm({ ...form, icon })}
                className="p-2 rounded bg-zinc-800"
              >
                {icon}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, color })}
                className="w-6 h-6 rounded"
                style={{ background: color }}
              />
            ))}
          </div>

          <button className="w-full bg-indigo-600 py-2 rounded text-white">
            {saving ? "Saving..." : "Save"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default function CategoriesPage() {
  const dispatch = useAppDispatch();
  const { token } = useAppSelector((s) => s.auth);
  const { items: categories } = useAppSelector((s) => s.categories);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);

  useEffect(() => {
    if (token) dispatch(fetchCategories(token));
  }, [token]);

  const handleAddDefaults = async () => {
    if (!token) return;
    for (const cat of DEFAULT_CATEGORIES) {
      await dispatch(createCategory({ token, data: cat }));
    }
    toast.success("Defaults added");
    dispatch(fetchCategories(token));
  };

  return (
    <div className="p-6 space-y-6">

      <div className="flex gap-3">
        <button
          onClick={() => setModalOpen(true)}
          className="bg-indigo-600 px-4 py-2 rounded text-white"
        >
          <Plus /> New
        </button>

        <button
          onClick={handleAddDefaults}
          className="border border-zinc-700 px-4 py-2 rounded text-white"
        >
          Add Defaults
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <div key={cat._id} className="p-4 bg-zinc-900 rounded-xl">
            <div className="text-2xl">{cat.icon}</div>
            <div className="text-white">{cat.name}</div>

            <div className="flex gap-2 mt-2">
              <button onClick={() => {
                setEditing(cat);
                setModalOpen(true);
              }}>
                <Pencil />
              </button>

              <button onClick={() =>
                dispatch(deleteCategory({ token, id: cat._id }))
              }>
                <Trash2 />
              </button>
            </div>
          </div>
        ))}
      </div>

      <CategoryModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        editingCategory={editing}
      />
    </div>
  );
}