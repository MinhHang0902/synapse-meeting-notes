import "../globals.css";
import type { Metadata } from "next/types";
import { Provider } from "@/components/provider";
import { notFound } from "next/navigation";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { LoadingProvider } from "@/contexts/LoadingContext";
import { locales } from "@/lib/utils/i18n";

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Real Estate",
  generator: "Next.js",
  applicationName: "Real Estate",
  referrer: "origin-when-cross-origin",
  keywords: ["Next.js", "React", "JavaScript", "Boilerplate", "Template", "shadcn-ui"],
  authors: [{ name: "Do Tien Dat" /*, url: ${appUrl}/about (nếu có) */ }],
  creator: "Do Tien Dat",
  publisher: "Do Tien Dat",
  metadataBase: new URL(appUrl),
  openGraph: {
    title: "Real Estate",
    description: "Next.js, TailwindCSS and shadcn-ui Starter Template",
    url: appUrl,
    siteName: "Real Estate",
    images: [
      // { url: ${appUrl}/og.png, width: 1200, height: 630, alt: "Real Estate" }
    ],
    locale: "en-US",
    type: "website",
  },
  robots: { index: true },
  formatDetection: { email: false, address: false, telephone: false },
  // alternates: { canonical: appUrl },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  const { locale } = await params;
  if (!locales.includes(locale as any)) notFound();

  const messages = await getMessages({ locale });

  return (
    <html lang={locale} suppressHydrationWarning>
      <body>
        <Provider attribute="class" defaultTheme="light" enableSystem={false} forcedTheme="light">
          <NextIntlClientProvider locale={locale} messages={messages}>
            <LoadingProvider>
              <main className="bg-white text-zinc-700 dark:bg-black dark:text-zinc-400">
                {children}
              </main>
            </LoadingProvider>
          </NextIntlClientProvider>
        </Provider>
      </body>
    </html>
  );
}