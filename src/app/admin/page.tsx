import { redirect } from "next/navigation";
import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminDashboardView } from "@/components/admin/admin-dashboard-view";
import { getServerSession } from "@/modules/auth/guards";
import { getDashboardMetrics } from "@/modules/admin";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?next=/admin");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <AdminAccessGate
        currentRole={session.user.role}
        fullName={session.user.fullName}
      />
    );
  }

  const metrics = await getDashboardMetrics({
    id: session.user.id,
    role: session.user.role,
  });

  return <AdminDashboardView metrics={metrics} />;
}

