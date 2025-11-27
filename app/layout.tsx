import type { Metadata } from "next"
import { Geist, Montserrat } from "next/font/google"
import "./globals.css"
import Navbar from '@/components/navbar'
import { CustomCursor } from '@/components/custom-cursor'
import { AuthProvider } from "@/contexts/auth-context"
import Footer from '@/components/footer'
import { Toaster } from '@/components/ui/sonner'


const montserrat = Montserrat({
  subsets: ["latin"],
  display: 'swap'
})

export function generateViewport() {
  return "width=device-width, initial-scale=1"
}

export const metadata: Metadata = {
  title: "Savdo Market – Oson va Tez Onlayn Xarid",
  description: "Minglab mahsulotlarda chegirmalar bilan onlayn xarid qiling. Tez yetkazib berish va qulay to‘lovlar bilan Savdo Market.",
  keywords: "online shop, xarid, chegirma, Savdo Market, onlayn do‘kon, mahsulotlar",
  authors: [{ name: "Savdo Market" }],
  icons: {
    icon: "/icon.png",
    apple: "/icon.png"
  }
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${montserrat.className} antialiased`}
      >
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
          <Toaster position='top-right' />
          <CustomCursor />
        </AuthProvider>
      </body>
    </html>
  )
}
