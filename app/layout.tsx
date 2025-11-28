import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import "./globals.css"

const _geist = Geist({ subsets: ["latin"] })
const _geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "UmojaFund - Plateforme de Crowdfunding",
  description: "Autonomisez les communautés grâce au financement collaboratif. Soutenez des projets innovants et faites la différence.",
  icons: {
    icon: [
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/logo.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/logo.png",
    shortcut: "/logo.png",
  },
  openGraph: {
    title: "UmojaFund - Plateforme de Crowdfunding",
    description: "Autonomisez les communautés grâce au financement collaboratif.",
    url: "https://umojafund.com",
    siteName: "UmojaFund",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "UmojaFund Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UmojaFund - Plateforme de Crowdfunding",
    description: "Autonomisez les communautés grâce au financement collaboratif.",
    images: ["/logo.png"],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
