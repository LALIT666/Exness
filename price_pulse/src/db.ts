import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

dotenv.config();

declare global {
  var prisma: PrismaClient | undefined;
}

const prismaInstance = global.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prismaInstance;
}

export default prismaInstance;
