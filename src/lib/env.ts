import "server-only";
import { parseEnv, type AppEnv } from "./env-schema";

let cachedEnv: AppEnv | null = null;

/**
 * Returns validated server-side environment variables, memoized per process.
 */
export function getEnv(): AppEnv {
  if (!cachedEnv) {
    cachedEnv = parseEnv(process.env);
  }
  return cachedEnv;
}

