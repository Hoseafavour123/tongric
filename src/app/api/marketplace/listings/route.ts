import { handleApiError, ok } from "@/lib/api-response";
import { ValidationError } from "@/lib/errors";
import { requireAuth } from "@/modules/auth/guards";
import {
  createProduceListing,
  listActiveListings,
  produceGradeEnum,
  type ProduceGrade,
} from "@/modules/marketplace";

function extractClientIp(request: Request): string | null {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const firstHop = forwarded.split(",")[0]?.trim();
    if (firstHop) {
      return firstHop.slice(0, 64);
    }
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  return realIp ? realIp.slice(0, 64) : null;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cropCode = searchParams.get("cropCode") ?? undefined;
    const lga = searchParams.get("lga") ?? undefined;
    const gradeRaw = searchParams.get("grade") ?? undefined;

    let grade: ProduceGrade | undefined;
    if (gradeRaw) {
      const parsedGrade = produceGradeEnum.safeParse(gradeRaw);
      if (parsedGrade.success) {
        grade = parsedGrade.data;
      }
    }

    const listings = await listActiveListings({
      cropCode,
      lga,
      grade,
    });

    return ok({ listings });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();

    const body = await request.json().catch(() => {
      throw new ValidationError("Invalid JSON request body.");
    });

    const ipAddress = extractClientIp(request);

    const listing = await createProduceListing(
      { id: session.user.id, role: session.user.role },
      body,
      { ipAddress },
    );

    return ok({ listing }, 201);
  } catch (error) {
    return handleApiError(error);
  }
}

