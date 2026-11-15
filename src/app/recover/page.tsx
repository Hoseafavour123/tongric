import type { Metadata } from "next";
import { RecoverFormView } from "@/components/auth/recover-form-view";

export const metadata: Metadata = {
  title: "Reset Password",
  description: "Reset your Tongric account password using your offline recovery code.",
};

export default function RecoverPage() {
  return <RecoverFormView />;
}

