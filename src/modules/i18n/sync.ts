import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { syncTranslationsWithRepo } from "./i18n-core.ts";
import { createPrismaI18nRepository } from "./i18n-prisma-repo.ts";

const envPath = path.resolve(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  process.loadEnvFile(envPath);
}

if (!process.env.DATABASE_URL) {
  console.error("Error: DATABASE_URL must be configured in .env before running i18n:sync.");
  process.exit(1);
}

const prisma = new PrismaClient();

try {
  const repo = createPrismaI18nRepository(prisma);
  const summary = await syncTranslationsWithRepo(repo);
  console.log(
    `[Tongric i18n] Synced ${summary.languagesSynced} pilot languages and ${summary.keysSynced} translation keys.`,
  );
} finally {
  await prisma.$disconnect();
}

