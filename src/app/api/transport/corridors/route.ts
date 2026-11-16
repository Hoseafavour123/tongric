import { ok } from "@/lib/api-response";
import { getCorridors } from "@/modules/transport";

export async function GET() {
  const corridors = getCorridors();
  return ok({ corridors });
}

