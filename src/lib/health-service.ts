export interface HealthCheckResult {
  healthy: boolean;
  statusCode: 200 | 503;
  database: "connected" | "disconnected";
  timestamp: string;
}

/**
 * Verifies database reachability without exposing credentials or internal error details.
 */
export async function checkDatabaseHealth(
  hasDatabaseUrl: boolean,
  probeQuery: () => Promise<unknown>,
): Promise<HealthCheckResult> {
  const timestamp = new Date().toISOString();

  if (!hasDatabaseUrl) {
    return {
      healthy: false,
      statusCode: 503,
      database: "disconnected",
      timestamp,
    };
  }

  try {
    await probeQuery();
    return {
      healthy: true,
      statusCode: 200,
      database: "connected",
      timestamp,
    };
  } catch (error) {
    console.error("[Tongric Health Check] Database probe failed:", error);
    return {
      healthy: false,
      statusCode: 503,
      database: "disconnected",
      timestamp,
    };
  }
}

