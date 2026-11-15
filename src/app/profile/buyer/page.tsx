import { redirect } from "next/navigation";
import { BuyerProfileView } from "@/components/profile/buyer-profile-view";
import { requireAuth } from "@/modules/auth/guards";
import { getBuyerProfile } from "@/modules/profile";

export const dynamic = "force-dynamic";

export default async function BuyerProfilePage() {
  const session = await requireAuth().catch(() => null);

  if (!session) {
    redirect("/login?next=/profile/buyer");
  }

  if (session.user.role !== "BUYER" && session.user.role !== "ADMIN") {
    redirect("/account");
  }

  const profile = await getBuyerProfile(session.user.id);

  return <BuyerProfileView initialProfile={profile} />;
}

