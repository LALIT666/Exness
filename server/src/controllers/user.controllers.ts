import express from "express";
import z from "zod";
import db from "../db/db";
import bcrypt from "bcryptjs";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie.utils";

const userSchema = z.object({
  email: z.string().email("Incorrect Email Id"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});

export async function signup(req: express.Request, res: express.Response) {
  try {
    const parsedBody = userSchema.safeParse(req.body);

    if (!parsedBody.success) {
      return res.status(400).json({
        success: false,
        message: parsedBody.error.flatten().fieldErrors,
      });
    }

    const { email, password } = parsedBody.data;

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = await db.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        balanceUsd: true,
      },
    });

    generateTokenAndSetCookie(res, newUser.id);

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      user: newUser,
    });
  } catch (error) {
    console.error("Something wrong in Signup controller: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function signin(req: express.Request, res: express.Response) {
  try {
    const parsedData = userSchema.safeParse(req.body);
    if (!parsedData.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid Credentials",
        error: parsedData.error.flatten().formErrors,
      });
    }

    const { email, password } = parsedData.data;

    const user = await db.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User does not exists",
      });
    }

    const matchingPassword = await bcrypt.compare(password, user.passwordHash);

    if (!matchingPassword) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid password" });
    }

    generateTokenAndSetCookie(res, user.id);

    return res.status(200).json({
      success: true,
      message: "Sign in successful",
      user: {
        ...user,
        passwordHash: undefined,
      },
    });
  } catch (error) {
    console.error("Something went wrong in Singin controller: ", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export async function balance(req: express.Request, res: express.Response) {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      select: {
        balanceUsd: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Balance fetch error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}
