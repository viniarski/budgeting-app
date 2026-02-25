import { NextResponse } from "next/server"
import { DEFAULT_OFFERS, OfferItem } from "@/lib/offers"
import { OfferItemSchema } from "@/lib/validators/domain"

export const runtime = "nodejs"

function normalizeLivePayload(payload: unknown): OfferItem[] {
  const raw = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        Array.isArray((payload as { offers?: unknown[] }).offers)
      ? (payload as { offers: unknown[] }).offers
      : []

  return raw
    .map((item) => OfferItemSchema.safeParse(item))
    .filter((result) => result.success)
    .map((result) => result.data)
}

export async function GET() {
  const feedUrl = process.env.OFFERS_API_URL
  if (!feedUrl) {
    return NextResponse.json({ offers: DEFAULT_OFFERS, source: "fallback" })
  }

  try {
    const response = await fetch(feedUrl, { cache: "no-store" })
    if (!response.ok) {
      return NextResponse.json({ offers: DEFAULT_OFFERS, source: "fallback" })
    }

    const data = (await response.json()) as unknown
    const offers = normalizeLivePayload(data)
    if (offers.length === 0) {
      return NextResponse.json({ offers: DEFAULT_OFFERS, source: "fallback" })
    }

    return NextResponse.json({ offers, source: "live" })
  } catch {
    return NextResponse.json({ offers: DEFAULT_OFFERS, source: "fallback" })
  }
}
