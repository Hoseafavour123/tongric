import { redirect } from "next/navigation";
import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminDisputesView } from "@/components/admin/admin-disputes-view";
import { getServerSession } from "@/modules/auth/guards";
import { listDisputedOrders } from "@/modules/admin";

export const dynamic = "force-dynamic";

export default async function AdminDisputesPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?next=/admin/disputes");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <AdminAccessGate
        currentRole={session.user.role}
        fullName={session.user.fullName}
      />
    );
  }

  const disputes = await listDisputedOrders({
    id: session.user.id,
    role: session.user.role,
  });

  return <AdminDisputesView initialDisputes={disputes} />;
}

