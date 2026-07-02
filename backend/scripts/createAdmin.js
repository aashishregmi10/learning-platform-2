// Bootstrap the first admin. Usage:
//   node scripts/createAdmin.js "Admin Name" admin@example.com SomePassword
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

import { connectDB } from "../config/db.config.js";
import User from "../models/User.js";

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error(
    'Usage: node scripts/createAdmin.js "Name" email@example.com password'
  );
  process.exit(1);
}

await connectDB();

const existing = await User.findOne({ email: email.toLowerCase() });
if (existing) {
  console.error(`A user with email ${email} already exists.`);
  await mongoose.disconnect();
  process.exit(1);
}

const passwordHash = await bcrypt.hash(password, 10);
const admin = await User.create({
  name,
  email,
  passwordHash,
  authProvider: "password",
  role: "admin",
  isVerified: true,
});

console.log(`✅ Admin created: ${admin.email} (${admin._id})`);
await mongoose.disconnect();
process.exit(0);
