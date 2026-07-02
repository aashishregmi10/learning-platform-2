import express from "express";

import {
  createProgram,
  listPrograms,
  listActivePrograms,
  getProgram,
  updateProgram,
  deleteProgram,
} from "../controllers/programController.js";
import { protect, adminOnly, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/active", listActivePrograms); // public
router.get("/list", protect, staffOnly, listPrograms);
router.post("/", protect, adminOnly, createProgram);
router
  .route("/:id")
  .get(protect, staffOnly, getProgram)
  .put(protect, adminOnly, updateProgram)
  .delete(protect, adminOnly, deleteProgram);

export default router;
