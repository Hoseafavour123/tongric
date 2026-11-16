import { redirect } from "next/navigation";
import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminAuditLogsView } from "@/components/admin/admin-audit-logs-view";
import { getServerSession } from "@/modules/auth/guards";
import { listAuditLogs } from "@/modules/admin";

export const dynamic = "force-dynamic";

export default async function AdminAuditLogsPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?next=/admin/audit-logs");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <AdminAccessGate
        currentRole={session.user.role}
        fullName={session.user.fullName}
      />
    );
  }

  const data = await listAuditLogs(
    { id: session.user.id, role: session.user.role },
    { limit: 50 },
  );

  return <AdminAuditLogsView initialLogs={data.logs} totalCount={data.totalCount} />;
}

