import { Router } from "express";
import { getAssest } from "../controllers/assest.controller";

export const assetRouter = Router();

assetRouter.get("/", getAssest);
