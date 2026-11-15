import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { AuthProvider } from "@/components/auth/auth-provider";
import { NextI18nProvider } from "@/components/i18n/next-i18n-provider";
import { AppShell } from "@/components/layout/app-shell";
import { LowDataProvider } from "@/components/layout/low-data-provider";
import { WorkspaceModeProvider } from "@/components/layout/workspace-mode-provider";
import { PwaRegister } from "@/components/pwa-register";
import { getCurrentUser } from "@/modules/auth/auth.service";
import { SESSION_COOKIE_NAME } from "@/modules/auth/sessions";
import {
  getActiveLanguages,
  getSafeDictionaryForSsr,
} from "@/modules/i18n/i18n.service";
import {
  LOCALE_COOKIE_NAME,
  resolveLocaleFromCookie,
} from "@/modules/i18n/locale-cookie";
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

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, activeLanguages] = await Promise.all([
    cookies(),
    getActiveLanguages(),
  ]);

  const allowedCodes = new Set(activeLanguages.map((lang) => lang.code));
  const rawLocale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;
  const { locale, hasExplicitLocale } = resolveLocaleFromCookie(
    rawLocale,
    allowedCodes,
  );
  const dictionaryPayload = await getSafeDictionaryForSsr(locale);

  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  let initialUser = null;
  if (sessionToken) {
    try {
      const session = await getCurrentUser(sessionToken);
      if (session) {
        initialUser = {
          id: session.user.id,
          fullName: session.user.fullName,
          phoneNumber: session.user.phoneNumber,
          email: session.user.email,
          role: session.user.role,
          accountStatus: session.user.accountStatus,
          preferredLanguageCode: session.user.preferredLanguageCode,
        };
      }
    } catch {
      initialUser = null;
    }
  }

  return (
    <html lang={dictionaryPayload.locale}>
      <body className="min-h-screen bg-white text-gray-900 antialiased">
        <PwaRegister />
        <NextI18nProvider
          initialLocale={dictionaryPayload.locale}
          initialLanguages={dictionaryPayload.languages}
          initialMessages={dictionaryPayload.messages}
          initialHasExplicitLocale={hasExplicitLocale}
        >
          <LowDataProvider>
            <WorkspaceModeProvider>
              <AuthProvider initialUser={initialUser}>
                <AppShell>{children}</AppShell>
              </AuthProvider>
            </WorkspaceModeProvider>
          </LowDataProvider>
        </NextI18nProvider>
      </body>
    </html>
  );
}
