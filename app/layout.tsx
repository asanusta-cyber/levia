import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegister } from "@/components/ui/ServiceWorkerRegister";
import { dictionaries } from "@/lib/i18n/dictionaries";
import { LocaleProvider } from "@/lib/i18n/LocaleProvider";
import { getRequestLocale } from "@/lib/i18n/server";

export function generateMetadata(): Metadata {
  const { meta } = dictionaries[getRequestLocale()];
  return {
    title: meta.title,
    description: meta.description,
    ...staticMetadata,
  };
}

const staticMetadata: Metadata = {
  applicationName: "Levia",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Levia",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/icon-192.png", sizes: "192x192" }],
  },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f5f0" },
    { media: "(prefers-color-scheme: dark)", color: "#1a1816" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const locale = getRequestLocale();
  return (
    <html lang={locale}>
      <body className="min-h-dvh bg-page text-primary">
        <ServiceWorkerRegister />
        <LocaleProvider initialLocale={locale}>
          <main className="mx-auto w-full max-w-md px-5 pb-12 pt-6 sm:max-w-lg">
            {children}
          </main>
        </LocaleProvider>
      </body>
    </html>
  );
}
