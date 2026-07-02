import express from "express";

import {
  googleLogin,
  staffLogin,
  devLogin,
  getMe,
} from "../controllers/authController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/google", googleLogin);
router.post("/login", staffLogin);
router.post("/dev-login", devLogin); // non-production guard inside the handler
router.get("/me", protect, getMe);

export default router;
