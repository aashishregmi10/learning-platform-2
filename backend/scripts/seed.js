// Idempotent demo seed. Safe to run repeatedly — it wipes and rebuilds the
// catalog (Subject/Chapter/Content + everything downstream of them) on every
// run, and upserts users/program by natural keys.
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
import Quiz from "../models/Quiz.js";
import LiveClass from "../models/LiveClass.js";
import Certificate from "../models/Certificate.js";
import Entitlement from "../models/Entitlement.js";
import Doubt from "../models/Doubt.js";
import Review from "../models/Review.js";
import Progress from "../models/Progress.js";
import Subscription from "../models/Subscription.js";
import Order from "../models/Order.js";
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

// Two mock students since Google OAuth isn't configured in this dev env:
// Ram has no purchases (tests empty-state UX), Priya has an active 1st Year
// subscription (tests the "student who bought something" experience).
const student = await upsert(User, { email: "student@bsc.np" }, {
  name: "Ram Student", googleId: "seed-student-google", authProvider: "google", role: "student", isVerified: true,
});

const student2 = await upsert(User, { email: "student2@bsc.np" }, {
  name: "Priya Student", googleId: "seed-student2-google", authProvider: "google", role: "student", isVerified: true,
});

// --- catalog: wipe everything downstream of Subject/Chapter, then rebuild ---
await Promise.all([
  Content.deleteMany({}),
  Quiz.deleteMany({}),
  Certificate.deleteMany({}),
  Entitlement.deleteMany({}),
  Doubt.deleteMany({}),
  Review.deleteMany({}),
  Progress.deleteMany({}),
  Subscription.deleteMany({}),
  LiveClass.deleteMany({}),
]);
await Chapter.deleteMany({});
await Subject.deleteMany({});

// findOneAndUpdate (not the create-only `upsert` helper) so re-running the
// seed after a name/description change actually updates the existing doc.
const program = await Program.findOneAndUpdate(
  { slug: "bsc-csit" },
  {
    slug: "bsc-csit", name: "B.Sc", code: "", durationYears: 4, isActive: true,
    description: "Bachelor of Science (TU) — a general science program covering Chemistry, Biology, Physics and Zoology across all four years.",
  },
  { upsert: true, new: true, setDefaultsOnInsert: true }
);

const YEAR_NAMES = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
const SUBJECT_TEMPLATE = [
  { name: "Chemistry", prefix: "CHEM" },
  { name: "Biology", prefix: "BIO" },
  { name: "Physics", prefix: "PHY" },
  { name: "Zoology", prefix: "ZOO" },
];

const subjectsByYear = []; // subjectsByYear[0] = year1's 4 subjects, etc.
const years = []; // years[0] = 1st Year BScYear doc, etc.

for (let yearNumber = 1; yearNumber <= 4; yearNumber++) {
  const bundleOriginal = 6000 + (yearNumber - 1) * 800;
  const bundleDiscounted = 4800 + (yearNumber - 1) * 600;

  const year = await upsert(BScYear, { program: program._id, yearNumber }, {
    yearName: YEAR_NAMES[yearNumber - 1], isActive: true,
    bundlePrice: { originalPrice: bundleOriginal, discountedPrice: bundleDiscounted, currency: "NPR" },
  });
  years.push(year);

  const subjectOriginal = 1800 + (yearNumber - 1) * 200;
  const subjectDiscounted = 1450 + (yearNumber - 1) * 150;

  const subjectsThisYear = [];
  for (const s of SUBJECT_TEMPLATE) {
    const subj = await upsert(
      Subject,
      { program: program._id, year: year._id, slug: slugify(s.name) },
      {
        name: s.name, subjectCode: `${s.prefix}${yearNumber}01`, category: "Core", isActive: true,
        pricing: { originalPrice: subjectOriginal, discountedPrice: subjectDiscounted, currency: "NPR", validityDays: 365 },
      }
    );
    subjectsThisYear.push(subj);
  }
  subjectsByYear.push(subjectsThisYear);

  await BScYear.updateOne({ _id: year._id }, { totalSubjects: subjectsThisYear.length });
}

// assign the demo teacher to every 1st-year subject
await TeacherProfile.findOneAndUpdate(
  { user: teacher._id },
  {
    user: teacher._id,
    assignedSubjects: subjectsByYear[0].map((s) => s._id),
    isApproved: true, approvedBy: admin._id, approvedAt: new Date(),
  },
  { upsert: true }
);

// student enrolled in CSIT
await StudentProfile.findOneAndUpdate(
  { user: student._id },
  { user: student._id, program: program._id, currentYear: "1st Year" },
  { upsert: true }
);
await StudentProfile.findOneAndUpdate(
  { user: student2._id },
  { user: student2._id, program: program._id, currentYear: "1st Year" },
  { upsert: true }
);

// give Priya a real paid 1st Year bundle: an Order, an active Subscription,
// and one Entitlement per 1st-Year subject (this is what actually unlocks
// content — see backend/utils/access.js hasActiveEntitlement).
const year1 = years[0];
const year1Subjects = subjectsByYear[0];
const expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

await Order.deleteMany({ user: student2._id }); // re-seed cleanly each run
const priyaOrder = await Order.create({
  user: student2._id,
  items: [{
    itemType: "year", year: year1._id,
    title: `${year1.yearName} bundle`,
    originalPrice: year1.bundlePrice.originalPrice,
    discountedPrice: year1.bundlePrice.discountedPrice,
  }],
  subtotal: year1.bundlePrice.discountedPrice,
  totalAmount: year1.bundlePrice.discountedPrice,
  status: "paid",
  payment: { gateway: "esewa", paidAt: new Date() },
  fulfilledAt: new Date(),
});

const priyaSubscription = await Subscription.create({
  user: student2._id,
  order: priyaOrder._id,
  type: "year",
  year: year1._id,
  price: { amount: year1.bundlePrice.discountedPrice, originalAmount: year1.bundlePrice.originalPrice },
  expiresAt,
  status: "active",
  payment: { gateway: "esewa", paidAt: new Date() },
});

await Promise.all(
  year1Subjects.map((subj) =>
    Entitlement.create({
      student: student2._id,
      subject: subj._id,
      source: "year",
      subscription: priyaSubscription._id,
      expiresAt,
      isActive: true,
    })
  )
);

// --- chapters + content for every subject ---
// Topical chapter titles per subject. First chapter of each subject is a free
// preview; the rest are locked behind entitlement. Each chapter gets an
// intro note, and the free-preview chapter also gets a demo video link.
const CHAPTERS_BY_SUBJECT = {
  Chemistry: ["Atomic Structure", "Chemical Bonding", "Thermodynamics"],
  Biology: ["Cell Biology", "Genetics", "Evolution"],
  Physics: ["Mechanics", "Waves & Optics", "Electromagnetism"],
  Zoology: ["Animal Diversity", "Animal Physiology", "Ecology & Behaviour"],
};
const DEMO_VIDEO = "https://www.youtube.com/watch?v=KJgsSFOSQv0";

for (let y = 0; y < subjectsByYear.length; y++) {
  for (const subject of subjectsByYear[y]) {
    const titles = CHAPTERS_BY_SUBJECT[subject.name] ?? [];
    let noteCount = 0;
    let videoCount = 0;

    for (let i = 0; i < titles.length; i++) {
      const isPreview = i === 0;
      const chapter = await upsert(
        Chapter,
        { subject: subject._id, chapterNumber: i + 1 },
        {
          title: titles[i], slug: slugify(titles[i]),
          isFreePreview: isPreview, isPublished: true, publishedAt: new Date(),
        }
      );

      await upsert(
        Content,
        { chapter: chapter._id, title: `${titles[i]} — overview` },
        {
          uploadedBy: teacher._id, type: "note", order: 1,
          isPublished: true, publishedAt: new Date(), status: "ready",
          noteData: {
            content: `Introductory notes on ${titles[i]} for ${subject.name} (${YEAR_NAMES[y]}).`,
            isDownloadable: true,
          },
        }
      );
      noteCount += 1;

      if (isPreview) {
        await upsert(
          Content,
          { chapter: chapter._id, title: `${titles[i]} — intro video` },
          {
            uploadedBy: teacher._id, type: "link", order: 2,
            isPublished: true, publishedAt: new Date(), status: "ready",
            storage: { provider: "local", fileKey: DEMO_VIDEO },
          }
        );
        videoCount += 1;
      }
    }

    await Subject.updateOne(
      { _id: subject._id },
      { totalChapters: titles.length, totalNotes: noteCount, totalVideos: videoCount }
    );
  }
}

// --- coupon ---
await upsert(Coupon, { code: "SAVE20" }, {
  discountType: "percentage", discountValue: 20, appliesTo: "all", isActive: true, createdBy: admin._id,
});

console.log(`
✅ Seed complete.

Login credentials
  Admin    : admin@bsc.np    / Admin@123      (staff login)
  Teacher  : teacher@bsc.np  / Teach@123      (staff login)
  Student  : student@bsc.np  (Ram, no purchases — Google-only, use the dev-login buttons on /login)
  Student2 : student2@bsc.np (Priya, active 1st Year subscription — same dev-login flow)

Catalog
  Program  : B.Sc (active)
  Years    : 1st-4th Year, each with a bundle
  Subjects : Chemistry, Biology, Physics, Zoology - in every year (16 total)
  Chapters : 3 per subject (first = free preview) with intro notes + a demo video
  Teacher  : assigned to all 4 subjects of 1st Year
  Coupon   : SAVE20 (20% off)
`);

await mongoose.disconnect();
process.exit(0);
