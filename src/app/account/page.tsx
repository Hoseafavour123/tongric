import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AccountOverviewView } from "@/components/auth/account-overview-view";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { SESSION_COOKIE_NAME } from "@/modules/auth/sessions";

export const metadata: Metadata = {
  title: "Your Account",
  description: "View and manage your verified Tongric account details and role preferences.",
};

export default async function AccountPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  let initialUser = null;
  if (token) {
    try {
      const session = await getCurrentUser(token);
      if (session) {
        initialUser = {
          id: session.user.id,
          fullName: session.user.fullName,
          phoneNumber: session.user.phoneNumber,
          email: session.user.email,
          role: session.user.role,
          accountStatus: session.user.accountStatus,
          preferredLanguageCode: session.user.preferredLanguageCode,
          createdAt: session.user.createdAt.toISOString(),
        };
      }
    } catch {
      initialUser = null;
    }
  }

  return <AccountOverviewView initialUser={initialUser} />;
}

