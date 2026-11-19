import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "@fontsource-variable/space-grotesk";
import "./globals.css";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: "Rune Codes Coding Academy | Coding classes for kids: Scratch, Python & C++",
    template: "%s | Rune Codes",
  },
  description: SITE.description,
  applicationName: SITE.fullName,
  keywords: [
    "coding for kids", "coding academy", "Scratch programming", "Python for kids",
    "C++ for students", "online coding lessons", "1-on-1 coding tutor", "Rune Codes",
  ],
  alternates: { canonical: `${SITE.url}/` },
  openGraph: {
    type: "website",
    url: `${SITE.url}/`,
    siteName: SITE.fullName,
    title: "Rune Codes Coding Academy",
    description: SITE.description,
    images: [{ url: `${SITE.url}/og-image.jpg`, width: 1200, height: 630, alt: "Rune Codes Coding Academy mascot" }],
    locale: "en_MY",
  },
  twitter: {
    card: "summary_large_image",
    title: "Rune Codes Coding Academy",
    description: SITE.description,
    images: [`${SITE.url}/og-image.jpg`],
  },
};

export const viewport: Viewport = {
  themeColor: "#070B14",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: SITE.fullName,
  description: SITE.description,
  email: SITE.email,
  telephone: "+60 14-926 1712",
  url: SITE.url,
  sameAs: [SITE.instagramUrl],
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Flags JS so hero entrance pre-states only apply when animations can actually run. */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('js');setTimeout(function(){document.documentElement.classList.add('js-ready')},2500)",
          }}
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </head>
      <body className="min-h-dvh">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:rounded-full focus:bg-snow focus:px-4 focus:py-2 focus:text-ink"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
