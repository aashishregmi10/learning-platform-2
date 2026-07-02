import dns from "dns";
import mongoose from "mongoose";

import { env } from "./env.config.js";

export const connectDB = async () => {
  try {
    // Some networks/resolvers refuse SRV lookups (mongodb+srv). Force a
    // public resolver so Atlas hostnames resolve reliably.
    if (env.mongoUri?.startsWith("mongodb+srv")) {
      dns.setServers(["8.8.8.8", "1.1.1.1"]);
    }
    mongoose.set("strictQuery", true);
    const conn = await mongoose.connect(env.mongoUri);
    console.log(`🍃 MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    // Fail fast — the API is useless without a DB.
    process.exit(1);
  }
};
