import Router from "express";
import verifyToken from "../middleware/verifyToken.middleware";
import { closeTrade, openTrade } from "../controllers/trade.controllers";

export const tradeRouter = Router();

tradeRouter.post("/", verifyToken, openTrade);
tradeRouter.post("/close", verifyToken, closeTrade);
