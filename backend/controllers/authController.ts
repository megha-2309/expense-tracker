import { Request, Response } from "express";
import { z } from "zod";
import { User } from "../models/User";
import { generateToken } from "../utils/jwt";

const registerSchema = z.object({
  name: z.string().min(1, "Name is required").trim(),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = registerSchema.parse(req.body);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      res
        .status(409)
        .json({ success: false, error: "Email already registered" });
      return;
    }

    const user = new User({ name, email, password });
    await user.save();

    const token = generateToken(user._id.toString());

    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues });
      return;
    }
    console.error("Register error:", error);
    res.status(500).json({ success: false, error: "Registration failed" });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
      return;
    }

    const isValid = await user.comparePassword(password);
    if (!isValid) {
      res
        .status(401)
        .json({ success: false, error: "Invalid email or password" });
      return;
    }

    const token = generateToken(user._id.toString());

    res.json({
      success: true,
      data: {
        token,
        user: { id: user._id, name: user.name, email: user.email },
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues });
      return;
    }
    console.error("Login error:", error);
    res.status(500).json({ success: false, error: "Login failed" });
  }
};

export const getProfile = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const user = await User.findById(req.userId);
    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to fetch profile" });
  }
};
