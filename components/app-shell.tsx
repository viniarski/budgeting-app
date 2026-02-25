"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/header"
import BottomNav from "@/components/bottom-nav"

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isWelcomePage = pathname === "/"

  return (
    <>
      {!isWelcomePage && <Header />}
      <main
        className={
          isWelcomePage
            ? "min-h-screen w-full"
            : "desktop-main mx-auto max-w-md px-4 pb-24 pt-18 md:mr-6 md:max-w-none md:px-6 md:pb-8 md:pt-22"
        }
      >
        {children}
      </main>
      {!isWelcomePage && <BottomNav />}
    </>
  )
}
