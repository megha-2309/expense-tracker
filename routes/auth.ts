import { Router } from "express";
import { register, login, getProfile } from "../controllers/authController";
import { authMiddleware } from "../middleware/auth";
import {
  forgotPassword,
  resetPassword,
  validateResetToken,
} from "../controllers/passwordResetController";

const router = Router();

router.post("/register", register);
router.post("/login", login);
router.get("/profile", authMiddleware, getProfile);

router.post("/forgot-password", forgotPassword);
router.get("/reset-password/validate", validateResetToken);
router.post("/reset-password", resetPassword);

export default router;
