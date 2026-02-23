"use client"

import { useEffect, useState } from "react"
import {
  Tag,
  UtensilsCrossed,
  ShoppingBag,
  Laptop,
  Music,
  Bus,
  Dumbbell,
  Search,
  ExternalLink,
} from "lucide-react"
import { LucideIcon } from "lucide-react"
import { OFFER_FILTERS, OfferCategory, OfferItem } from "@/lib/offers"

const ICON_BY_CATEGORY: Record<Exclude<OfferCategory, "all">, LucideIcon> = {
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  tech: Laptop,
  travel: Bus,
  entertainment: Music,
  health: Dumbbell,
}

export default function OffersPage() {
  const [filter, setFilter] = useState<OfferCategory>("all")
  const [search, setSearch] = useState("")
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<"live" | "fallback">("fallback")

  useEffect(() => {
    let cancelled = false

    async function loadOffers() {
      try {
        const response = await fetch("/api/offers", { cache: "no-store" })
        const data = (await response.json()) as {
          offers?: OfferItem[]
          source?: "live" | "fallback"
        }

        if (!cancelled) {
          setOffers(Array.isArray(data.offers) ? data.offers : [])
          setSource(data.source === "live" ? "live" : "fallback")
        }
      } catch {
        if (!cancelled) {
          setOffers([])
          setSource("fallback")
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void loadOffers()
    return () => {
      cancelled = true
    }
  }, [])

  const filtered = offers.filter((offer) => {
    const matchesCategory = filter === "all" || offer.category === filter
    const matchesSearch =
      !search ||
      offer.name.toLowerCase().includes(search.toLowerCase()) ||
      offer.desc.toLowerCase().includes(search.toLowerCase())

    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-center text-xl font-bold uppercase tracking-wide">
          Student Offers
        </h1>
        <p className="text-center text-xs text-muted">
          Discounts & deals for students
        </p>
      </div>

      <div className="flex items-center justify-center">
        <span
          className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
            source === "live"
              ? "bg-emerald-500/15 text-emerald-500"
              : "bg-amber-500/15 text-amber-500"
          }`}
        >
          {source === "live" ? "Live Data" : "Fallback Data"}
        </span>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        <input
          type="text"
          placeholder="Search offers..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition-colors focus:border-accent"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {OFFER_FILTERS.map((entry) => (
          <button
            key={entry.value}
            onClick={() => setFilter(entry.value)}
            className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              filter === entry.value
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent/50"
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-muted">Loading offers...</div>
      ) : (
        <div className="space-y-2">
          {filtered.map((offer) => {
            const Icon = ICON_BY_CATEGORY[offer.category] ?? Tag
            return (
              <a
                key={offer.id}
                href={offer.url || "#"}
                target={offer.url ? "_blank" : undefined}
                rel={offer.url ? "noopener noreferrer" : undefined}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-accent/30"
              >
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-accent/10">
                  <Icon className="h-5 w-5 text-accent" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{offer.name}</p>
                  <p className="truncate text-xs text-muted">{offer.desc}</p>
                </div>
                <div className="flex flex-shrink-0 items-center gap-2">
                  <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-semibold text-accent">
                    {offer.discount}
                  </span>
                  <ExternalLink className="h-3.5 w-3.5 text-muted" />
                </div>
              </a>
            )
          })}

          {filtered.length === 0 && (
            <div className="py-12 text-center">
              <Tag className="mx-auto mb-2 h-8 w-8 text-muted" />
              <p className="text-sm text-muted">No offers found</p>
            </div>
          )}
        </div>
      )}

      <p className="text-center text-[10px] text-muted">
        Discounts may vary. Always verify with your student ID.
      </p>
    </div>
  )
}
