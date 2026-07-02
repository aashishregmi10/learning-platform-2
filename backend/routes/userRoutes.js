import express from "express";

import {
  createTeacher,
  listTeachers,
  getTeacher,
  updateTeacherSubjects,
  listUsers,
  deactivateUser,
  approveTeacher,
} from "../controllers/userController.js";
import { updateMe, changePassword } from "../controllers/authController.js";
import { protect, adminOnly, staffOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

// self-service
router.put("/me", protect, updateMe);
router.put("/me/password", protect, staffOnly, changePassword);

// admin: teachers
router.route("/teachers").post(protect, adminOnly, createTeacher).get(protect, adminOnly, listTeachers);
router.get("/teachers/:id", protect, adminOnly, getTeacher);
router.patch("/teachers/:id/approve", protect, adminOnly, approveTeacher);
router.patch("/teachers/:id/subjects", protect, adminOnly, updateTeacherSubjects);

// admin: users
router.get("/", protect, adminOnly, listUsers);
router.patch("/:id/deactivate", protect, adminOnly, deactivateUser);

export default router;
