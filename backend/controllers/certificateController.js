import asyncHandler from "express-async-handler";

import Certificate from "../models/Certificate.js";
import { subjectCompletion, maybeIssueCertificate } from "../services/certificateService.js";

// @route GET /api/certificates/mine  (student)
export const listMyCertificates = asyncHandler(async (req, res) => {
  const certs = await Certificate.find({ student: req.user._id })
    .populate("subject", "name slug")
    .sort({ issuedAt: -1 });
  res.status(200).json({ data: certs, message: "OK" });
});

// @route GET /api/certificates/subject/:subjectId/status  (student) — progress toward cert
export const getCertificateStatus = asyncHandler(async (req, res) => {
  const completion = await subjectCompletion(req.user._id, req.params.subjectId);
  const certificate = await Certificate.findOne({ student: req.user._id, subject: req.params.subjectId });
  res.status(200).json({ data: { ...completion, certificate }, message: "OK" });
});

// @route POST /api/certificates/issue  (student) — explicit trigger (also auto on completion)
export const issueCertificate = asyncHandler(async (req, res) => {
  const cert = await maybeIssueCertificate({ studentId: req.user._id, subjectId: req.body.subjectId });
  if (!cert) {
    res.status(400);
    throw new Error("Subject not fully completed yet");
  }
  res.status(201).json({ data: cert, message: "Certificate issued" });
});

// @route GET /api/certificates/:number/verify  (public)
export const verifyCertificate = asyncHandler(async (req, res) => {
  const cert = await Certificate.findOne({ certificateNumber: req.params.number })
    .populate("subject", "name")
    .populate("student", "name");
  if (!cert) {
    res.status(404);
    throw new Error("Certificate not found");
  }
  res.status(200).json({
    data: {
      certificateNumber: cert.certificateNumber,
      student: cert.student?.name,
      subject: cert.subject?.name,
      issuedAt: cert.issuedAt,
      completionPercentage: cert.completionPercentage,
    },
    message: "Valid certificate",
  });
});
