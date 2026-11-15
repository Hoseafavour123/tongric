import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/app-shell";
import { FarmerProfileView } from "@/components/profile/farmer-profile-view";
import { requireAuth } from "@/modules/auth/guards";
import { getFarmerProfile } from "@/modules/profile";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await requireAuth().catch(() => null);

  if (!session) {
    redirect("/login?next=/profile");
  }

  if (session.user.role !== "FARMER" && session.user.role !== "ADMIN") {
    redirect("/account");
  }

  const profile = await getFarmerProfile(session.user.id);

  return (
    <AppShell>
      <FarmerProfileView initialProfile={profile} />
    </AppShell>
  );
}

