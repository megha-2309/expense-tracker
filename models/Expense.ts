import mongoose, { Document, Model } from "mongoose";

export interface IExpense extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;
  amount: number;
  description?: string;
  date: Date;
  paymentMethod:
    | "cash"
    | "credit_card"
    | "debit_card"
    | "bank_transfer"
    | "upi";
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new mongoose.Schema<IExpense>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category ID is required"],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [0.01, "Amount must be greater than 0"],
    },
    description: {
      type: String,
      required: false,
      trim: true,
      maxlength: [200, "Description cannot exceed 200 characters"],
    },
    date: {
      type: Date,
      required: [true, "Date is required"],
      index: true,
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "credit_card", "debit_card", "bank_transfer", "upi"],
      default: "cash",
    },
  },
  {
    timestamps: true,
  },
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, categoryId: 1 });

export const Expense: Model<IExpense> = mongoose.model<IExpense>(
  "Expense",
  expenseSchema,
);
