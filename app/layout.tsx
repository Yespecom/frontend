import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Yesp Ecom Studio - Complete Ecommerce Platform | Free Store Creation",
  description:
    "Start, run, and grow your online business with Yesp Ecom Studio. Get your professional storefront built FREE by our expert team. Join beta users building successful online stores.",
  keywords: [
    "ecommerce platform",
    "online store builder",
    "free storefront creation",
    "ecommerce website builder",
    "online business platform",
    "ecommerce consulting",
    "free store design",
    "online store development",
    "ecommerce solutions",
    "beta ecommerce platform",
  ],
  authors: [{ name: "Yesp Ecom Studio Team" }],
  creator: "Yesp Ecom Studio",
  publisher: "Yesp Ecom Studio",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://yespstudio.com",
    title: "Yesp Ecom Studio - Complete Ecommerce Platform | Free Store Creation",
    description:
      "Start, run, and grow your online business with Yesp Ecom Studio. Get your professional storefront built FREE by our expert team. Join 500+ beta users building successful online stores.",
    siteName: "Yesp Ecom Studio",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Yesp Ecom Studio - Complete Ecommerce Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Yesp Ecom Studio - Complete Ecommerce Platform | Free Store Creation",
    description:
      "Start, run, and grow your online business with Yesp Ecom Studio. Get your professional storefront built FREE by our expert team.",
    images: ["/twitter-image.png"],
    creator: "@yespecomstudio",
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
    yahoo: "your-yahoo-verification-code",
  },
  alternates: {
    canonical: "https://yespstudio.com",
  },
  category: "technology",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        {/* Additional SEO meta tags */}
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="msapplication-TileColor" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Yesp Ecom Studio" />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />

        {/* Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Yesp Ecom Studio",
              description:
                "Complete ecommerce platform for modern businesses. Get your store built FREE by our expert team.",
              url: "https://yespstudio.com",
              logo: "https://yespstudio.com/logo.png",
              contactPoint: {
                "@type": "ContactPoint",
                telephone: "+91 9751755757",
                contactType: "customer service",
                availableLanguage: "English",
              },
              sameAs: [
                "https://twitter.com/yespecomstudio",
                "https://linkedin.com/company/yespecomstudio",
                "https://facebook.com/yespecomstudio",
              ],
              offers: {
                "@type": "Offer",
                name: "Free Storefront Creation",
                description: "Professional online store built completely FREE by our expert team",
                price: "0",
                priceCurrency: "INR",
              },
            }),
          }}
        />

        {/* Software Application Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareApplication",
              name: "Yesp Ecom Studio",
              operatingSystem: "Web Browser",
              applicationCategory: "BusinessApplication",
              description:
                "Comprehensive ecommerce platform providing all the tools you need to launch, manage, and grow your online business.",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "INR",
                name: "Beta Access",
              },
              aggregateRating: {
                "@type": "AggregateRating",
                ratingValue: "5",
                ratingCount: "500",
              },
              featureList: [
                "Real-time Analytics",
                "Customer Management",
                "Multi-Channel Sales",
                "Secure Payments",
                "Smart Automation",
                "Easy Setup",
              ],
            }),
          }}
        />
      </head>
      <body className={inter.className}>{children}</body>
    </html>
  )
}
