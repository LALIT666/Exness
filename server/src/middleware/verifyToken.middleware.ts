import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();
//mene global types bhi bana diya hai industry standard but mere ko ye aacha laga
export interface AuthenticatedRequest extends Request {
  userId?: string;
}

export default function verifyToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized -- No token provided",
    });
  }

  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET not defined");
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };

    req.userId = decoded.userId;

    next();
  } catch (error) {
    console.error("Something went wrong in verifyToken Middleware", error);

    return res.status(401).json({
      success: false,
      message: "Invalid or Expired Token",
    });
  }
}
