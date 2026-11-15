import { redirect } from "next/navigation";
import { TransportProfileView } from "@/components/profile/transport-profile-view";
import { requireAuth } from "@/modules/auth/guards";
import { getTransportProfile } from "@/modules/profile";

export const dynamic = "force-dynamic";

export default async function TransporterProfilePage() {
  const session = await requireAuth().catch(() => null);

  if (!session) {
    redirect("/login?next=/profile/transporter");
  }

  if (
    session.user.role !== "TRANSPORT_PROVIDER" &&
    session.user.role !== "ADMIN"
  ) {
    redirect("/account");
  }

  const profile = await getTransportProfile(session.user.id);

  return <TransportProfileView initialProfile={profile} />;
}

