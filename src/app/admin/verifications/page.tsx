import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { AdminVerificationQueueView } from "@/components/admin/admin-verification-queue-view";
import { requireRole } from "@/modules/auth/guards";
import { listPendingVerifications } from "@/modules/profile";

export const dynamic = "force-dynamic";

export default async function AdminVerificationsPage() {
  const session = await requireRole(["ADMIN"]).catch(() => null);

  if (!session) {
    redirect("/login?next=/admin/verifications");
  }

  const items = await listPendingVerifications(
    { id: session.user.id, role: session.user.role },
    { limit: 100 },
  );

  return (
    <AppShell>
      <AdminVerificationQueueView initialItems={items} />
    </AppShell>
  );
}
