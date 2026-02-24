"use client"

import { useEffect } from "react"

export default function DisableNumberWheel() {
  useEffect(() => {
    function handleWheel(event: WheelEvent) {
      const target = event.target
      if (!(target instanceof HTMLInputElement)) return
      if (target.type !== "number") return
      if (document.activeElement !== target) return
      // Blur on wheel so accidental value changes stop while page scroll remains natural.
      target.blur()
    }

    window.addEventListener("wheel", handleWheel, { passive: true })
    return () => window.removeEventListener("wheel", handleWheel)
  }, [])

  return null
}
