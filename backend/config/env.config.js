import dotenv from "dotenv";

dotenv.config();

const REQUIRED = ["MONGO_URI", "JWT_SECRET"];

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: process.env.PORT || 5000,
  mongoUri: process.env.MONGO_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  googleClientId: process.env.GOOGLE_CLIENT_ID || "",
  clientOrigins: (process.env.CLIENT_ORIGINS || "http://localhost:5173")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),

  apiBaseUrl: process.env.API_BASE_URL || "http://localhost:5000",
  clientBaseUrl: process.env.CLIENT_BASE_URL || "http://localhost:5180",

  esewa: {
    merchantCode: process.env.ESEWA_MERCHANT_CODE || "EPAYTEST",
    secretKey: process.env.ESEWA_SECRET_KEY || "8gBm/:&EnhH.1/q",
    formUrl:
      process.env.ESEWA_FORM_URL ||
      "https://rc-epay.esewa.com.np/api/epay/main/v2/form",
    statusUrl:
      process.env.ESEWA_STATUS_URL ||
      "https://rc.esewa.com.np/api/epay/transaction/status/",
  },
};

export const validateEnv = () => {
  const missing = REQUIRED.filter((key) => !process.env[key]);
  if (missing.length) {
    console.warn(
      `⚠️  Missing env vars: ${missing.join(", ")}. See backend/.env.example`
    );
  }
};
