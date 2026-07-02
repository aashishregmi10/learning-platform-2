import express from "express";

import { registerDevice } from "../controllers/deviceController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/", protect, registerDevice);

export default router;
