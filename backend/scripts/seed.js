// Minimal seed — just the login accounts. Catalog (programs/years/subjects/
// chapters/content/teachers/coupons) is now created by hand through the admin
// UI, so this script no longer touches any of that.
//   node scripts/seed.js
import dns from "dns";
dns.setServers(["8.8.8.8", "1.1.1.1"]);
import "dotenv/config";
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "../config/db.config.js";
import User from "../models/User.js";
import StudentProfile from "../models/StudentProfile.js";
import Subject from "../models/Subject.js";
import Subscription from "../models/Subscription.js";
import Entitlement from "../models/Entitlement.js";

const upsert = async (Model, find, create) => {
  let doc = await Model.findOne(find);
  if (!doc) doc = await Model.create({ ...find, ...create });
  return doc;
};

await connectDB();

// --- admin — left as is ---
const adminHash = await bcrypt.hash("Admin@123", 10);
const admin = await upsert(User, { email: "admin@bsc.np" }, {
  name: "Aashish Admin", passwordHash: adminHash, authProvider: "password", role: "admin", isVerified: true,
});

// Two mock students since Google OAuth isn't configured in this dev env —
// dev-login on /login signs in as either without a real Google account.
const student = await upsert(User, { email: "student@bsc.np" }, {
  name: "Ram Student", googleId: "seed-student-google", authProvider: "google", role: "student", isVerified: true,
});

const student2 = await upsert(User, { email: "student2@bsc.np" }, {
  name: "Priya Student", googleId: "seed-student2-google", authProvider: "google", role: "student", isVerified: true,
});

await StudentProfile.findOneAndUpdate(
  { user: student._id },
  { user: student._id },
  { upsert: true }
);
await StudentProfile.findOneAndUpdate(
  { user: student2._id },
  { user: student2._id },
  { upsert: true }
);

// Priya is the "already paid" test account. The catalog is now built by hand
// through the admin UI rather than seeded, so instead of granting access to
// specific hard-coded subjects (which would silently stop matching reality),
// re-grant her an active entitlement to every subject that exists right now.
// Re-run this script after adding subjects and she stays a working example.
await Entitlement.deleteMany({ student: student2._id });
await Subscription.deleteMany({ user: student2._id, type: "program" });

const activeSubjects = await Subject.find({ isActive: true, isDeleted: false });
let entitledCount = 0;

if (activeSubjects.length > 0) {
  const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  // Point the subscription at a real program, otherwise the card on
  // /app/student/subscriptions renders with no name.
  const programId = activeSubjects[0].program;

  const blanketGrant = await Subscription.create({
    user: student2._id,
    type: "program",
    program: programId,
    price: { amount: 0, currency: "NPR" }, // seeded, not a real purchase
    startedAt: new Date(),
    expiresAt,
    status: "active",
  });

  // Mirror it onto the profile so the catalog resolves the same program even
  // before falling back to entitlements.
  await StudentProfile.updateOne({ user: student2._id }, { program: programId });

  await Promise.all(
    activeSubjects.map((subject) =>
      Entitlement.create({
        student: student2._id,
        subject: subject._id,
        source: "program",
        subscription: blanketGrant._id,
        expiresAt,
        isActive: true,
      })
    )
  );
  entitledCount = activeSubjects.length;
}

console.log(`
✅ Seed complete.

Login credentials
  Admin    : admin@bsc.np    / Admin@123  (staff login)
  Student  : student@bsc.np  (Ram, no purchases — dev-login buttons on /login)
  Student2 : student2@bsc.np (Priya, entitled to ${entitledCount} active subject${entitledCount === 1 ? "" : "s"})

${activeSubjects.length === 0 ? "No subjects exist yet — create some from the admin UI, then re-run this script to entitle Priya to them." : ""}`);

await mongoose.disconnect();
process.exit(0);
