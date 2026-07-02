import express from "express";

import {
  listMyCertificates,
  getCertificateStatus,
  issueCertificate,
  verifyCertificate,
} from "../controllers/certificateController.js";
import { protect, studentOnly } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/mine", protect, studentOnly, listMyCertificates);
router.get("/subject/:subjectId/status", protect, studentOnly, getCertificateStatus);
router.post("/issue", protect, studentOnly, issueCertificate);
router.get("/:number/verify", verifyCertificate); // public

export default router;
