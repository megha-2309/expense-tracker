import { Router } from "express";
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  getSummary,
  getDailyAnalytics,
  getCategoryAnalytics,
  getMonthlyAnalytics,
  getInsights,
} from "../controllers/expenseController";
import { authMiddleware } from "../middleware/auth";

const router = Router();

router.use(authMiddleware);

router.get("/analytics/summary", getSummary);
router.get("/analytics/daily", getDailyAnalytics);
router.get("/analytics/category", getCategoryAnalytics);
router.get("/analytics/monthly", getMonthlyAnalytics);
router.get("/analytics/insights", getInsights);

router.get("/", getExpenses);
router.post("/", createExpense);
router.put("/:id", updateExpense);
router.delete("/:id", deleteExpense);

export default router;
