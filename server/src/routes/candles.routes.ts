import { Router } from "express";
import { getCandles } from "../controllers/candles.controllers";

export const candelRouter = Router();

candelRouter.get("/candles", getCandles);
