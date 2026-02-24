import type { Metadata, Viewport } from "next"
import { Geist, Geist_Mono, Bakbak_One } from "next/font/google"
import "./globals.css"
import { BudgetProvider } from "@/contexts/budget-context"
import { ThemeProvider } from "@/contexts/theme-context"
import { SidebarProvider } from "@/contexts/sidebar-context"
import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"
import DisableNumberWheel from "@/components/disable-number-wheel"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

const bakbakOne = Bakbak_One({
  variable: "--font-bakbak",
  weight: "400",
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function () {
                try {
                  var theme = localStorage.getItem("uniwallet-theme");
                  if (theme === "light" || theme === "dark" || theme === "fancy") {
                    document.documentElement.setAttribute("data-theme", theme);
                  }
                  var hidden = localStorage.getItem("uniwallet-sidebar-hidden");
                  document.documentElement.setAttribute(
                    "data-sidebar",
                    hidden === "true" ? "hidden" : "shown"
                  );
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${bakbakOne.variable} min-h-screen bg-background font-sans text-foreground antialiased`}
      >
        <ThemeProvider>
          <SidebarProvider>
            <BudgetProvider>
              <DisableNumberWheel />
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
