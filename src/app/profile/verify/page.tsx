import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { VerificationSubmissionView } from "@/components/profile/verification-submission-view";
import { requireAuth } from "@/modules/auth/guards";
import {
  getBuyerProfile,
  getFarmerProfile,
  getLatestVerificationDocument,
  getTransportProfile,
  type VerificationStatus,
} from "@/modules/profile";

export const dynamic = "force-dynamic";

export default async function VerificationPage() {
  const session = await requireAuth().catch(() => null);

  if (!session) {
    redirect("/login?next=/profile/verify");
  }

  const [document, farmerProfile, buyerProfile, transportProfile] =
    await Promise.all([
      getLatestVerificationDocument(
        { id: session.user.id, role: session.user.role },
        session.user.id,
      ),
      getFarmerProfile(session.user.id),
      getBuyerProfile(session.user.id),
      getTransportProfile(session.user.id),
    ]);

  // Determine current active profile status
  let currentStatus: VerificationStatus = "UNVERIFIED";
  if (farmerProfile) {
    currentStatus = farmerProfile.verificationStatus;
  } else if (buyerProfile) {
    currentStatus = buyerProfile.verificationStatus;
  } else if (transportProfile) {
    currentStatus = transportProfile.verificationStatus;
  }

  return (
    <AppShell>
      <VerificationSubmissionView
        initialDocument={document}
        currentStatus={currentStatus}
      />
    </AppShell>
  );
}
