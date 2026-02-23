import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import "./globals.css"
import { BudgetProvider } from "@/contexts/budget-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { SidebarProvider } from "@/contexts/sidebar-context"
import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "UniWallet",
  description: "Student budgeting app for maintenance loans",
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          <SidebarProvider>
            <BudgetProvider>
              <Header />
              <main className="desktop-main mx-auto max-w-md px-4 pb-24 pt-18 md:mr-6 md:max-w-none md:px-6 md:pb-8 md:pt-22">
                {children}
              </main>
              <BottomNav />
            </BudgetProvider>
          </SidebarProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
