import express from "express";

import { sessionHeartbeat, listMySessions, deleteSession } from "../controllers/sessionController.js";
import { protect, studentOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/heartbeat", protect, studentOnly, sessionHeartbeat);
router.get("/mine", protect, studentOnly, listMySessions);
router.delete("/:deviceId", protect, studentOnly, deleteSession);

export default router;
