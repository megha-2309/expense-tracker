import { Request, Response } from "express";
import crypto from "crypto";
import { z } from "zod";
import { User } from "../models/User";
import { PasswordResetToken } from "../models/PasswordResetToken";
import { sendPasswordResetEmail } from "../utils/email";

const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const forgotPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { email } = forgotPasswordSchema.parse(req.body);

    const successResponse = {
      success: true,
      message:
        "If this email is registered, you will receive a reset link shortly.",
    };

    const user = await User.findOne({ email });

    if (!user) {
      res.json(successResponse);
      return;
    }

    await PasswordResetToken.deleteMany({ userId: user._id });

    const rawToken = crypto.randomBytes(32).toString("hex");

    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await PasswordResetToken.create({
      userId: user._id,
      token: hashedToken,
      expiresAt,
    });

    await sendPasswordResetEmail(email, user.name, rawToken);

    res.json(successResponse);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues });
      return;
    }
    console.error("Forgot password error:", error);
    res.status(500).json({
      success: false,
      error: "Something went wrong. Please try again.",
    });
  }
};

export const validateResetToken = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token } = req.query;

    if (!token || typeof token !== "string") {
      res.status(400).json({ success: false, error: "Token is required" });
      return;
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      res.status(400).json({
        success: false,
        error:
          "This reset link is invalid or has expired. Please request a new one.",
      });
      return;
    }

    res.json({ success: true, message: "Token is valid" });
  } catch (error) {
    console.error("Validate token error:", error);
    res.status(500).json({ success: false, error: "Failed to validate token" });
  }
};

const resetPasswordSchema = z.object({
  token: z.string().min(1, "Token is required"),
  newPassword: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .max(100, "Password is too long"),
});

export const resetPassword = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const resetToken = await PasswordResetToken.findOne({
      token: hashedToken,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      res.status(400).json({
        success: false,
        error:
          "This reset link is invalid or has expired. Please request a new one.",
      });
      return;
    }

    const user = await User.findById(resetToken.userId);

    if (!user) {
      res.status(404).json({ success: false, error: "User not found" });
      return;
    }

    user.password = newPassword;
    await user.save();
    await PasswordResetToken.deleteOne({ _id: resetToken._id });

    console.log(`Password reset successful for user: ${user.email}`);

    res.json({
      success: true,
      message:
        "Password reset successfully. You can now log in with your new password.",
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, error: error.issues });
      return;
    }
    console.error("Reset password error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to reset password. Please try again.",
    });
  }
};
