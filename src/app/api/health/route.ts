import { fail, ok } from "@/lib/api-response";
import { getDb } from "@/lib/db";
import { getEnv } from "@/lib/env";
import { checkDatabaseHealth } from "@/lib/health-service";

export const dynamic = "force-dynamic";

export async function GET() {
  const { DATABASE_URL } = getEnv();

  const result = await checkDatabaseHealth(Boolean(DATABASE_URL), async () => {
    const db = getDb();
    await db.$queryRaw`SELECT 1`;
  });

  if (!result.healthy) {
    return fail("SERVICE_UNAVAILABLE", "Database connection unavailable", 503, {
      database: result.database,
      timestamp: result.timestamp,
    });
  }

  return ok({
    status: "ok",
    database: result.database,
    timestamp: result.timestamp,
  });
}

