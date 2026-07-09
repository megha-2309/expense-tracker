import jwt from "jsonwebtoken";

const getSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error("JWT_SECRET environment variable is not set");
  return secret;
};

export const generateToken = (userId: string): string => {
  return jwt.sign({ userId }, getSecret(), { expiresIn: "7d" });
};

export const verifyToken = (token: string): { userId: string } | null => {
  try {
    return jwt.verify(token, getSecret()) as { userId: string };
  } catch {
    return null;
  }
};
