import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import { CORE_NAV_ITEMS } from "@/lib/navigation";
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

        {/* Desktop top bar: clean, simple single-row navigation */}
        <header className="hidden border-b border-gray-200 bg-white md:block">
          <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-6">
            <div className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-green-700 text-sm font-bold text-white"
              >
                T
              </span>
              <span className="text-lg font-semibold tracking-tight text-gray-900">
                Tongric
              </span>
            </div>
            <nav aria-label="Primary navigation" className="flex items-center gap-6">
              {CORE_NAV_ITEMS.map((item) =>
                item.enabledInCurrentPhase ? (
                  <a
                    key={item.id}
                    href={item.href}
                    className="text-sm font-medium text-green-800 underline decoration-green-700 decoration-2 underline-offset-4"
                  >
                    {item.defaultLabel}
                  </a>
                ) : (
                  <span
                    key={item.id}
                    aria-disabled="true"
                    className="text-sm text-gray-400"
                    title="Available in upcoming phases"
                  >
                    {item.defaultLabel}
                  </span>
                ),
              )}
            </nav>
          </div>
        </header>

        {/* Mobile top brand header */}
        <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 md:hidden">
          <div className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="inline-flex h-7 w-7 items-center justify-center rounded-md bg-green-700 text-xs font-bold text-white"
            >
              T
            </span>
            <span className="text-base font-semibold text-gray-900">Tongric</span>
          </div>
          <span className="rounded bg-green-50 px-2 py-0.5 text-xs font-medium text-green-800">
            Benue Pilot MVP
          </span>
        </header>

        <main className="mx-auto max-w-5xl px-4 pb-24 pt-6 sm:px-6 md:pb-12">
          {children}
        </main>

        {/* Mobile app-style bottom tab navigation */}
        <nav
          aria-label="Mobile sections"
          className="fixed inset-x-0 bottom-0 z-30 border-t border-gray-200 bg-white md:hidden"
        >
          <ul className="grid grid-cols-5">
            {CORE_NAV_ITEMS.map((item) => (
              <li key={item.id}>
                {item.enabledInCurrentPhase ? (
                  <a
                    href={item.href}
                    className="flex min-h-14 flex-col items-center justify-center px-1 py-2 text-xs font-semibold text-green-800"
                  >
                    <span className="mb-1 h-1.5 w-6 rounded-full bg-green-700" />
                    <span>{item.defaultLabel}</span>
                  </a>
                ) : (
                  <span
                    aria-disabled="true"
                    className="flex min-h-14 flex-col items-center justify-center px-1 py-2 text-xs text-gray-400"
                  >
                    <span className="mb-1 h-1.5 w-6 rounded-full bg-transparent" />
                    <span>{item.defaultLabel}</span>
                  </span>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </body>
    </html>
  );
}

