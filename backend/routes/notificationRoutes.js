import express from "express";

import { listMyNotifications, markNotificationRead } from "../controllers/notificationController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, listMyNotifications);
router.patch("/:id/read", protect, markNotificationRead);

export default router;
