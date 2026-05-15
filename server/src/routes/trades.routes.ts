import { Router } from "express";
import verifyToken from "../middleware/verifyToken.middleware";
import {
  usersClosedTrades,
  usersOpenTrades,
} from "../controllers/trades.controllers";

export const tradesRouter = Router();

tradesRouter.get("/openTrades", verifyToken, usersOpenTrades);
tradesRouter.get("/closedTrades", verifyToken, usersClosedTrades);
