import { redirect } from "next/navigation";
import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminVerificationQueueView } from "@/components/admin/admin-verification-queue-view";
import { getServerSession } from "@/modules/auth/guards";
import { listPendingVerifications } from "@/modules/profile";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?next=/admin/verifications");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <AdminAccessGate
        currentRole={session.user.role}
        fullName={session.user.fullName}
      />
    );
  }

  const items = await listPendingVerifications(
    { id: session.user.id, role: session.user.role },
    { limit: 100 },
  );

  return <AdminVerificationQueueView initialItems={items} />;
}
