import express from "express";

import {
  createYear,
  listYears,
  getYear,
  updateYear,
  deleteYear,
} from "../controllers/yearController.js";
import { protect, adminOnly, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/list", protect, staffOnly, listYears);
router.post("/", protect, adminOnly, createYear);
router
  .route("/:id")
  .get(protect, staffOnly, getYear)
  .put(protect, adminOnly, updateYear)
  .delete(protect, adminOnly, deleteYear);

export default router;
