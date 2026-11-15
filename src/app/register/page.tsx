import type { Metadata } from "next";
import { RegisterFormView } from "@/components/auth/register-form-view";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Create your Tongric account with a Nigerian phone number, account role, preferred language, and NDPA 2023 consent.",
};

export default function RegisterPage() {
  return <RegisterFormView />;
}

