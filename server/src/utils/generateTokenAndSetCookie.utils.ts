import type { Response } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { getCookieOptions } from "./priceConversion.utils";

dotenv.config();

export const generateTokenAndSetCookie = (
  res: Response,
  userId: number | string,
) => {
  const secret = process.env.JWT_SECRET || "fallback_secret_for_dev";

  const jwtToken = jwt.sign({ userId }, secret, {
    expiresIn: "1d",
  });

  res.cookie("token", jwtToken, getCookieOptions());
};
