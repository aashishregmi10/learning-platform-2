import { env } from "./env.config.js";

/**
 * Async by design — mirrors can-logistic's `getCorsOptions()` so the allow-list
 * can later come from the DB/config service without changing server.js.
 */
export const getCorsOptions = async () => {
  // In development, reflect any origin — the Vite dev port can vary (5173,
  // 5174, 5180…) and requests arrive proxied with that Origin header.
  if (env.nodeEnv !== "production") {
    return { origin: true, credentials: true };
  }

  // Production: strict allow-list from CLIENT_ORIGINS.
  return {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true); // curl / server-to-server
      if (env.clientOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Not allowed by CORS: ${origin}`));
    },
    credentials: true,
  };
};
