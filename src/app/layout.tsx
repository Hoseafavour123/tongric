import type { Metadata, Viewport } from "next";
import { AppShell } from "@/components/layout/app-shell";
import { WorkspaceModeProvider } from "@/components/layout/workspace-mode-provider";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tongric — Agricultural Commerce & Logistics",
    template: "%s | Tongric",
  },
  description:
    "Multilingual agricultural commerce, logistics coordination and financing access for smallholder farmers in Nigeria.",
  applicationName: "Tongric",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Tongric",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#15803d",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <PwaRegister />
        <WorkspaceModeProvider>
          <AppShell>{children}</AppShell>
        </WorkspaceModeProvider>
      </body>
    </html>
  );
}
