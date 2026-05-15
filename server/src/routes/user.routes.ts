import express from "express";
import { balance, signin, signup } from "../controllers/user.controllers";
import verifyToken from "../middleware/verifyToken.middleware";

const router = express.Router();

router.post("/signup", signup);
router.post("/signin", signin);
router.get("/balance", verifyToken, balance);
export default router;
