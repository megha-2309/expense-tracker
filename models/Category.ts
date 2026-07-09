import mongoose, { Document, Model } from "mongoose";

export interface ICategory extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  icon: string;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
      index: true,
    },
    name: {
      type: String,
      required: [true, "Category name is required"],
      trim: true,
      maxlength: [50, "Name cannot exceed 50 characters"],
    },
    icon: {
      type: String,
      default: "📁",
    },
    color: {
      type: String,
      default: "#3B82F6",
      match: [/^#[0-9A-Fa-f]{6}$/, "Color must be a valid hex code"],
    },
  },
  {
    timestamps: true,
  },
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });

export const Category: Model<ICategory> = mongoose.model<ICategory>(
  "Category",
  categorySchema,
);
