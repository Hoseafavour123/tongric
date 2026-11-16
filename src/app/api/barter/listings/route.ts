import { handleApiError, ok, created } from "@/lib/api-response.ts";
import { requireAuth } from "@/modules/auth/guards.ts";
import {
  createExchangeListing,
  listExchangeListings,
  createExchangeListingSchema,
  exchangeListingFilterSchema,
} from "@/modules/barter";

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const filterInput = {
      status: url.searchParams.get("status") || undefined,
      locationLga: url.searchParams.get("locationLga") || undefined,
      itemType: url.searchParams.get("itemType") || undefined,
      search: url.searchParams.get("search") || undefined,
      farmerId: url.searchParams.get("farmerId") || undefined,
    };

    const filter = exchangeListingFilterSchema.parse(filterInput);
    const listings = await listExchangeListings(filter);

    return ok(listings);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: Request) {
  try {
    const session = await requireAuth();
    const body = await request.json();
    const input = createExchangeListingSchema.parse(body);

    const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();

    const listing = await createExchangeListing(
      {
        userId: session.user.id,
        role: session.user.role,
        ipAddress: clientIp,
      },
      input,
    );

    return created(listing);
  } catch (error) {
    return handleApiError(error);
  }
}

