import { handleApiError, ok, created } from "@/lib/api-response.ts";
import { requireAuth } from "@/modules/auth/guards.ts";
import {
  createLoanApplication,
  listLoanApplicationsForFarmer,
  createLoanApplicationSchema,
} from "@/modules/finance";

export async function GET() {
  try {
    const session = await requireAuth();
    const applications = await listLoanApplicationsForFarmer(session.user.id);
    return ok(applications);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const input = createLoanApplicationSchema.parse(body);

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const application = await createLoanApplication(
      {
        userId: session.user.id,
        role: session.user.role,
        ipAddress: clientIp,
      },
      input,
    );

    return created(application);
  } catch (error) {
    return handleApiError(error);
  }
}

