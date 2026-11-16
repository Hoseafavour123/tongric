import "server-only";
import fs from "node:fs";
import path from "node:path";
import { parseEnv, type AppEnv } from "./env-schema";

let cachedEnv: AppEnv | null = null;

/**
 * Loads key-value pairs from .env or .env.production on disk into process.env
 * if they are not already set in the runtime environment.
 */
function loadEnvFileIntoProcess(): void {
  const candidateFiles = [
    path.resolve(process.cwd(), ".env"),
    path.resolve(process.cwd(), ".env.production"),
  ];

  for (const filePath of candidateFiles) {
    try {
      if (!fs.existsSync(filePath)) continue;
      const content = fs.readFileSync(filePath, "utf-8");
      const lines = content.split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("#")) continue;
        const separatorIdx = trimmed.indexOf("=");
        if (separatorIdx <= 0) continue;

        const key = trimmed.slice(0, separatorIdx).trim();
        let value = trimmed.slice(separatorIdx + 1).trim();

        // Strip surrounding quotes
        if (
          (value.startsWith('"') && value.endsWith('"')) ||
          (value.startsWith("'") && value.endsWith("'"))
        ) {
          value = value.slice(1, -1);
        }

        // Avoid overriding existing runtime variables
        if (!process.env[key] && value) {
          // On Vercel / production, keep NODE_ENV as production
          if (
            key === "NODE_ENV" &&
            (process.env.VERCEL || process.env.NODE_ENV === "production")
          ) {
            continue;
          }
          // On Vercel, if APP_URL is localhost, prefer the live Vercel URL
          if (
            key === "APP_URL" &&
            process.env.VERCEL_URL &&
            value.includes("localhost")
          ) {
            process.env.APP_URL = `https://${process.env.VERCEL_URL}`;
            continue;
          }
          process.env[key] = value;
        }
      }
    } catch {
      // Ignore filesystem read errors silently
    }
  }
}

/**
 * Returns validated server-side environment variables, memoized per process.
 */
export function getEnv(): AppEnv {
  if (!cachedEnv) {
    loadEnvFileIntoProcess();
    cachedEnv = parseEnv(process.env);
  }
  return cachedEnv;
}

