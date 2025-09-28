import "./globals.css";

import type { Metadata } from "next/types";
import { Provider } from "@/components/provider";

export const metadata: Metadata = {
  title: "Neit",
  generator: "Next.js",
  applicationName: "Neit",
  referrer: "origin-when-cross-origin",
  keywords: [
    "Next.js",
    "React",
    "JavaScript",
    "Boilerplate",
    "Template",
    "shadcn-ui",
  ],
  authors: [{ name: "Virgil", url: "https://obedd.vercel.app" }],
  creator: "Virgil",
  publisher: "Virgil",
  alternates: {},
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://Neit.vercel.app"),
  openGraph: {
    title: "Neit",
    description: "Next.js, TailwindCSS and shadcn-ui Starter Template",
    url: "https://Neit.vercel.app",
    siteName: "Neit",
    images: [
      {
        url: "https://Neit.vercel.app/og.png",
        width: 800,
        height: 600,
      },
      {
        url: "https://Neit.vercel.app/og-dark.png",
        width: 1800,
        height: 1600,
        alt: "Next.js, TailwindCSS and shadcn-ui Starter Template",
      },
    ],
    locale: "en-US",
    type: "website",
  },
  robots: {
    index: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Provider attribute="class" defaultTheme="system" enableSystem>
          <main
            className={`bg-white text-zinc-700 dark:bg-black dark:text-zinc-400`}
          >
            {children}
          </main>
        </Provider>
      </body>
    </html>
  );
}
