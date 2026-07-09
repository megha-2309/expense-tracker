import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";

import authRoutes from "./routes/auth";
import categoryRoutes from "./routes/categories";
import expenseRoutes from "./routes/expenses";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/expenses", expenseRoutes);

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use((req, res) => {
  res
    .status(404)
    .json({ success: false, error: `Route ${req.originalUrl} not found` });
});

app.use(
  (
    err: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({ success: false, error: "Internal server error" });
  },
);

const start = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
};

start();

export default app;
