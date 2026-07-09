import { Request, Response } from "express";
import { z } from "zod";
import { Category } from "../models/Category";
import { Expense } from "../models/Expense";

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  icon: z.string().optional().default("📁"),
  color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code like #3B82F6")
    .optional()
    .default("#3B82F6"),
});

export const getCategories = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const categories = await Category.find({ userId: req.userId }).sort({
      createdAt: -1,
    });
    res.json({ success: true, data: categories });
  } catch (error) {
    console.error("Get categories error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch categories" });
  }
};

export const createCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, icon, color } = categorySchema.parse(req.body);

    const existing = await Category.findOne({ userId: req.userId, name });
    if (existing) {
      res.status(409).json({
        success: false,
        error: "Category with this name already exists",
      });
      return;
    }

    const category = new Category({ userId: req.userId, name, icon, color });
    await category.save();

    res.status(201).json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues });
      return;
    }
    console.error("Create category error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to create category" });
  }
};

export const updateCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, icon, color } = categorySchema.parse(req.body);

    const duplicate = await Category.findOne({
      userId: req.userId,
      name,
      _id: { $ne: req.params.id },
    });
    if (duplicate) {
      res.status(409).json({
        success: false,
        error: "Category with this name already exists",
      });
      return;
    }

    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { name, icon, color },
      { new: true, runValidators: true },
    );

    if (!category) {
      res.status(404).json({ success: false, error: "Category not found" });
      return;
    }

    res.json({ success: true, data: category });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues });
      return;
    }
    console.error("Update category error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to update category" });
  }
};

export const deleteCategory = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const category = await Category.findOne({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!category) {
      res.status(404).json({ success: false, error: "Category not found" });
      return;
    }

    const expenseCount = await Expense.countDocuments({
      userId: req.userId,
      categoryId: req.params.id,
    });

    if (expenseCount > 0) {
      res.status(400).json({
        success: false,
        error: `Cannot delete: ${expenseCount} expense(s) use this category. Delete those expenses first or reassign them.`,
      });
      return;
    }

    await category.deleteOne();
    res.json({ success: true, message: "Category deleted successfully" });
  } catch (error) {
    console.error("Delete category error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to delete category" });
  }
};
