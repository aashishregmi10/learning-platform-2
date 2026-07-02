import express from "express";

import {
  createQuiz,
  listQuizzes,
  getQuizForStudent,
  submitQuiz,
  listMyAttempts,
  updateQuiz,
  deleteQuiz,
} from "../controllers/quizController.js";
import { protect, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/list", protect, staffOnly, listQuizzes); // authoring list (keys included)
router.post("/", protect, staffOnly, createQuiz);

router.get("/:id", protect, getQuizForStudent); // student-safe (keys stripped)
router.post("/:id/submit", protect, submitQuiz);
router.get("/:id/attempts", protect, listMyAttempts);

router.route("/:id").put(protect, staffOnly, updateQuiz).delete(protect, staffOnly, deleteQuiz);

export default router;
