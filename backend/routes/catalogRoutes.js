import express from "express";

import { getMyCatalog, getSubjectContent, getPublicCatalog } from "../controllers/catalogController.js";
import { protect, studentOnly, attachUserIfPresent } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/me", protect, studentOnly, getMyCatalog);
router.get("/public/:programSlug", getPublicCatalog); // fully public — program browse for anonymous visitors
router.get("/subject/:id", attachUserIfPresent, getSubjectContent); // public preview; entitlement flag when logged in

export default router;
