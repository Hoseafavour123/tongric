import { handleApiError, ok } from "@/lib/api-response.ts";
import { requireRole } from "@/modules/auth/guards.ts";
import { listAllLoanApplications, LoanApplicationStatus } from "@/modules/finance";

export async function GET(request: Request) {
  try {
    await requireRole(["ADMIN"]);
    const url = new URL(request.url);
    const statusParam = url.searchParams.get("status") as LoanApplicationStatus | null;

    const applications = await listAllLoanApplications(statusParam ?? undefined);
    return ok(applications);
  } catch (error) {
    return handleApiError(error);
  }
}

