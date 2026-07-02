// Idempotent demo seed. Safe to run repeatedly — it upserts by natural keys.
//   node scripts/seed.js
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "../config/db.config.js";
import User from "../models/User.js";
import TeacherProfile from "../models/TeacherProfile.js";
import StudentProfile from "../models/StudentProfile.js";
import Program from "../models/Program.js";
import BScYear from "../models/BScYear.js";
import Subject from "../models/Subject.js";
import Chapter from "../models/Chapter.js";
import Content from "../models/Content.js";
import Coupon from "../models/Coupon.js";
import { slugify } from "../utils/slug.js";

const upsert = async (Model, find, create) => {
  let doc = await Model.findOne(find);
  if (!doc) doc = await Model.create({ ...find, ...create });
  return doc;
};

await connectDB();

// --- users ---
const adminHash = await bcrypt.hash("Admin@123", 10);
const admin = await upsert(User, { email: "admin@bsc.np" }, {
  name: "Aashish Admin", passwordHash: adminHash, authProvider: "password", role: "admin", isVerified: true,
});

const teacherHash = await bcrypt.hash("Teach@123", 10);
const teacher = await upsert(User, { email: "teacher@bsc.np" }, {
  name: "Dr. Sita Sharma", passwordHash: teacherHash, authProvider: "password", role: "teacher", isVerified: true,
});

const student = await upsert(User, { email: "student@bsc.np" }, {
  name: "Ram Student", googleId: "seed-student-google", authProvider: "google", role: "student", isVerified: true,
});

// --- catalog ---
const program = await upsert(Program, { slug: "bsc-csit" }, {
  name: "B.Sc CSIT", code: "CSIT", durationYears: 4, isActive: true,
  description: "Bachelor of Science in Computer Science & Information Technology (TU).",
});

const year1 = await upsert(BScYear, { program: program._id, yearNumber: 1 }, {
  yearName: "1st Year", isActive: true,
  bundlePrice: { originalPrice: 20000, discountedPrice: 15000, currency: "NPR" },
});

const subjectsSeed = [
  { name: "Introduction to C Programming", code: "CSC110", price: [2500, 1999] },
  { name: "Digital Logic", code: "CSC111", price: [2200, 1799] },
];
const subjects = [];
for (const s of subjectsSeed) {
  const subj = await upsert(
    Subject,
    { program: program._id, year: year1._id, slug: slugify(s.name) },
    {
      name: s.name, subjectCode: s.code, category: "Core", isActive: true,
      pricing: { originalPrice: s.price[0], discountedPrice: s.price[1], currency: "NPR", validityDays: 365 },
    }
  );
  subjects.push(subj);
}

// assign both subjects to the teacher
await TeacherProfile.findOneAndUpdate(
  { user: teacher._id },
  { user: teacher._id, assignedSubjects: subjects.map((s) => s._id), isApproved: true, approvedBy: admin._id, approvedAt: new Date() },
  { upsert: true }
);

// student enrolled in CSIT
await StudentProfile.findOneAndUpdate(
  { user: student._id },
  { user: student._id, program: program._id, currentYear: "1st Year" },
  { upsert: true }
);

// --- chapters + content for the C subject ---
const cSubject = subjects[0];
const ch1 = await upsert(Chapter, { subject: cSubject._id, chapterNumber: 1 }, {
  title: "Getting Started with C", slug: "getting-started-with-c", isFreePreview: true, isPublished: true, publishedAt: new Date(),
});
const ch2 = await upsert(Chapter, { subject: cSubject._id, chapterNumber: 2 }, {
  title: "Pointers & Memory", slug: "pointers-memory", isFreePreview: false, isPublished: true, publishedAt: new Date(),
});

await upsert(Content, { chapter: ch1._id, title: "What is C?" }, {
  uploadedBy: teacher._id, type: "note", order: 1, isPublished: true, publishedAt: new Date(), status: "ready",
  noteData: { content: "C is a general-purpose procedural programming language created by Dennis Ritchie...", isDownloadable: true },
});
await upsert(Content, { chapter: ch1._id, title: "C compiler setup (video)" }, {
  uploadedBy: teacher._id, type: "link", order: 2, isPublished: true, publishedAt: new Date(), status: "ready",
  storage: { provider: "local", fileKey: "https://www.youtube.com/watch?v=KJgsSFOSQv0" },
});
await upsert(Content, { chapter: ch2._id, title: "Pointer arithmetic (paid note)" }, {
  uploadedBy: teacher._id, type: "note", order: 1, isPublished: true, publishedAt: new Date(), status: "ready",
  noteData: { content: "A pointer stores the address of another variable. Pointer arithmetic...", isDownloadable: true },
});

// keep cached counters roughly in sync
await Subject.updateOne({ _id: cSubject._id }, { totalChapters: 2, totalNotes: 2 });

// --- coupon ---
await upsert(Coupon, { code: "SAVE20" }, {
  discountType: "percentage", discountValue: 20, appliesTo: "all", isActive: true, createdBy: admin._id,
});

console.log(`
✅ Seed complete.

Login credentials
  Admin    : admin@bsc.np    / Admin@123      (staff login)
  Teacher  : teacher@bsc.np  / Teach@123      (staff login)
  Student  : student@bsc.np  (Google-only; use the "Dev login as student" button in dev)

Catalog
  Program  : B.Sc CSIT (active)
  Year     : 1st Year — bundle NPR 15,000
  Subjects : Introduction to C Programming (NPR 1,999), Digital Logic (NPR 1,799)
  Chapters : "Getting Started with C" (free preview) + "Pointers & Memory" (paid)
  Coupon   : SAVE20 (20% off)
`);

await mongoose.disconnect();
process.exit(0);
