import { Request, Response } from "express";
import { z } from "zod";
import mongoose from "mongoose";
import { Expense } from "../models/Expense";
import { Category } from "../models/Category";

const expenseSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Amount must be greater than 0"),
  description: z.string().trim().optional().nullable(),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z
    .enum(["cash", "credit_card", "debit_card", "bank_transfer", "upi"])
    .optional()
    .default("cash"),
});

const buildMatchQuery = (userId: string, query: any) => {
  const match: any = { userId: new mongoose.Types.ObjectId(userId) };

  if (query.startDate || query.endDate) {
    match.date = {};
    if (query.startDate) match.date.$gte = new Date(query.startDate as string);
    if (query.endDate) {
      const end = new Date(query.endDate as string);
      end.setHours(23, 59, 59, 999);
      match.date.$lte = end;
    }
  }

  if (query.categoryId) {
    match.categoryId = new mongoose.Types.ObjectId(query.categoryId as string);
  }

  return match;
};

export const getExpenses = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const {
      page = "1",
      limit = "20",
      sortBy = "date",
      order = "desc",
    } = req.query;
    const skip = (parseInt(page as string) - 1) * parseInt(limit as string);
    const sortOrder = order === "asc" ? 1 : -1;

    const query: any = { userId: req.userId };

    if (req.query.startDate || req.query.endDate) {
      query.date = {};
      if (req.query.startDate)
        query.date.$gte = new Date(req.query.startDate as string);
      if (req.query.endDate) {
        const end = new Date(req.query.endDate as string);
        end.setHours(23, 59, 59, 999);
        query.date.$lte = end;
      }
    }

    if (req.query.categoryId) query.categoryId = req.query.categoryId;

    const [expenses, total] = await Promise.all([
      Expense.find(query)
        .populate("categoryId", "name icon color")
        .sort({ [sortBy as string]: sortOrder })
        .skip(skip)
        .limit(parseInt(limit as string)),
      Expense.countDocuments(query),
    ]);

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page as string),
        limit: parseInt(limit as string),
        totalPages: Math.ceil(total / parseInt(limit as string)),
      },
    });
  } catch (error) {
    console.error("Get expenses error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch expenses" });
  }
};

export const createExpense = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { categoryId, amount, description, date, paymentMethod } =
      expenseSchema.parse(req.body);

    const category = await Category.findOne({
      _id: categoryId,
      userId: req.userId,
    });
    if (!category) {
      res.status(404).json({ success: false, error: "Category not found" });
      return;
    }

    const expense = new Expense({
      userId: req.userId,
      categoryId,
      amount,
      description,
      date: new Date(date),
      paymentMethod,
    });

    await expense.save();
    await expense.populate("categoryId", "name icon color");

    res.status(201).json({ success: true, data: expense });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues });
      return;
    }
    console.error("Create expense error:", error);
    res.status(500).json({ success: false, error: "Failed to create expense" });
  }
};

export const updateExpense = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { categoryId, amount, description, date, paymentMethod } =
      expenseSchema.parse(req.body);

    const category = await Category.findOne({
      _id: categoryId,
      userId: req.userId,
    });
    if (!category) {
      res.status(404).json({ success: false, error: "Category not found" });
      return;
    }

    const expense = await Expense.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { categoryId, amount, description, date: new Date(date), paymentMethod },
      { new: true, runValidators: true },
    ).populate("categoryId", "name icon color");

    if (!expense) {
      res.status(404).json({ success: false, error: "Expense not found" });
      return;
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues });
      return;
    }
    console.error("Update expense error:", error);
    res.status(500).json({ success: false, error: "Failed to update expense" });
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const expense = await Expense.findOneAndDelete({
      _id: req.params.id,
      userId: req.userId,
    });

    if (!expense) {
      res.status(404).json({ success: false, error: "Expense not found" });
      return;
    }

    res.json({ success: true, message: "Expense deleted successfully" });
  } catch (error) {
    console.error("Delete expense error:", error);
    res.status(500).json({ success: false, error: "Failed to delete expense" });
  }
};

export const getSummary = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const now = new Date();

    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const aggregate = async (start: Date) =>
      Expense.aggregate([
        { $match: { userId, date: { $gte: start } } },
        {
          $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } },
        },
      ]);

    const [todayData, weekData, monthData, allData] = await Promise.all([
      aggregate(startOfToday),
      aggregate(startOfWeek),
      aggregate(startOfMonth),
      Expense.aggregate([
        { $match: { userId } },
        {
          $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } },
        },
      ]),
    ]);

    res.json({
      success: true,
      data: {
        today: {
          total: todayData[0]?.total || 0,
          count: todayData[0]?.count || 0,
        },
        thisWeek: {
          total: weekData[0]?.total || 0,
          count: weekData[0]?.count || 0,
        },
        thisMonth: {
          total: monthData[0]?.total || 0,
          count: monthData[0]?.count || 0,
        },
        allTime: {
          total: allData[0]?.total || 0,
          count: allData[0]?.count || 0,
        },
      },
    });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch summary" });
  }
};

export const getDailyAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const match = buildMatchQuery(req.userId!, req.query);

    if (!match.date) {
      const start = new Date();
      start.setDate(start.getDate() - 29);
      start.setHours(0, 0, 0, 0);
      match.date = { $gte: start };
    }

    const data = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" },
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } },
      {
        $project: {
          _id: 0,
          date: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: {
                $dateFromParts: {
                  year: "$_id.year",
                  month: "$_id.month",
                  day: "$_id.day",
                },
              },
            },
          },
          total: 1,
          count: 1,
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Daily analytics error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch daily analytics" });
  }
};

export const getCategoryAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const match = buildMatchQuery(req.userId!, req.query);

    const data = await Expense.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$categoryId",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      { $unwind: "$category" },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: "$category.name",
          icon: "$category.icon",
          color: "$category.color",
          total: 1,
          count: 1,
        },
      },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Category analytics error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch category analytics" });
  }
};

export const getMonthlyAnalytics = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const start = new Date();
    start.setMonth(start.getMonth() - 5);
    start.setDate(1);
    start.setHours(0, 0, 0, 0);

    const data = await Expense.aggregate([
      { $match: { userId, date: { $gte: start } } },
      {
        $group: {
          _id: { year: { $year: "$date" }, month: { $month: "$date" } },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
      {
        $project: {
          _id: 0,
          year: "$_id.year",
          month: "$_id.month",
          label: {
            $concat: [
              { $toString: "$_id.year" },
              "-",
              {
                $cond: [
                  { $lt: ["$_id.month", 10] },
                  { $concat: ["0", { $toString: "$_id.month" }] },
                  { $toString: "$_id.month" },
                ],
              },
            ],
          },
          total: 1,
          count: 1,
        },
      },
    ]);

    res.json({ success: true, data });
  } catch (error) {
    console.error("Monthly analytics error:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch monthly analytics" });
  }
};

export const getInsights = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.userId!);
    const now = new Date();

    const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = new Date(
      now.getFullYear(),
      now.getMonth(),
      0,
      23,
      59,
      59,
    );

    const [thisMonth, lastMonth, topCategory] = await Promise.all([
      Expense.aggregate([
        { $match: { userId, date: { $gte: thisMonthStart } } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        {
          $match: {
            userId,
            date: { $gte: lastMonthStart, $lte: lastMonthEnd },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId, date: { $gte: thisMonthStart } } },
        { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
        { $sort: { total: -1 } },
        { $limit: 1 },
        {
          $lookup: {
            from: "categories",
            localField: "_id",
            foreignField: "_id",
            as: "category",
          },
        },
        { $unwind: "$category" },
      ]),
    ]);

    const thisTotal = thisMonth[0]?.total || 0;
    const lastTotal = lastMonth[0]?.total || 0;
    const diff =
      lastTotal > 0 ? ((thisTotal - lastTotal) / lastTotal) * 100 : 0;

    const insights = [];

    if (lastTotal > 0) {
      insights.push({
        type: diff > 0 ? "warning" : "success",
        message:
          diff > 0
            ? `You spent ${Math.abs(diff).toFixed(1)}% more than last month`
            : `You spent ${Math.abs(diff).toFixed(1)}% less than last month — great job!`,
      });
    }

    if (topCategory.length > 0) {
      const cat = topCategory[0];
      insights.push({
        type: "info",
        message: `Top category this month: ${cat.category.icon} ${cat.category.name} (₹${cat.total.toFixed(2)})`,
      });
    }

    if (thisTotal > 0) {
      const dayOfMonth = now.getDate();
      const avgPerDay = thisTotal / dayOfMonth;
      const projected =
        avgPerDay *
        new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
      insights.push({
        type: "info",
        message: `At current pace, you'll spend ~₹${projected.toFixed(0)} this month`,
      });
    }

    res.json({ success: true, data: insights });
  } catch (error) {
    console.error("Insights error:", error);
    res.status(500).json({ success: false, error: "Failed to fetch insights" });
  }
};
