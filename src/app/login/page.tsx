import type { Metadata } from "next";
import { LoginFormView } from "@/components/auth/login-form-view";

export const metadata: Metadata = {
  title: "Log In",
  description: "Log in to your Tongric account using your Nigerian phone number and password.",
};

interface LoginPageProps {
  searchParams?: Promise<{ redirect?: string; returnUrl?: string; next?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedParams = searchParams ? await searchParams : undefined;
  const redirectPath =
    resolvedParams?.redirect || resolvedParams?.returnUrl || resolvedParams?.next || "/";

  return <LoginFormView redirectPath={redirectPath} />;
}

