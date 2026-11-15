import type { Metadata } from "next";
import { PrivacyNoticeView } from "@/components/auth/privacy-notice-view";

export const metadata: Metadata = {
  title: "Privacy Notice (NDPA 2023)",
  description:
    "How Tongric protects your phone number, profile, and documents under the Nigeria Data Protection Act (NDPA 2023).",
};

export default function PrivacyPage() {
  return <PrivacyNoticeView />;
}

