import { redirect } from "next/navigation";
import { AdminAccessGate } from "@/components/admin/admin-access-gate";
import { AdminUsersView } from "@/components/admin/admin-users-view";
import { getServerSession } from "@/modules/auth/guards";
import { listUsers } from "@/modules/admin";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  const session = await getServerSession();

  if (!session) {
    redirect("/login?next=/admin/users");
  }

  if (session.user.role !== "ADMIN") {
    return (
      <AdminAccessGate
        currentRole={session.user.role}
        fullName={session.user.fullName}
      />
    );
  }

  const data = await listUsers(
    { id: session.user.id, role: session.user.role },
    { limit: 50 },
  );

  return <AdminUsersView initialUsers={data.users} totalCount={data.totalCount} />;
}

