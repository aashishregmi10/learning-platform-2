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

console.log(`
✅ Seed complete.

Login credentials
  Admin    : admin@bsc.np    / Admin@123  (staff login)
  Student  : student@bsc.np  (Ram, use the dev-login buttons on /login)
  Student2 : student2@bsc.np (Priya, use the dev-login buttons on /login)

Catalog is empty — create programs, years, subjects and teachers from the admin UI.
`);

await mongoose.disconnect();
process.exit(0);
