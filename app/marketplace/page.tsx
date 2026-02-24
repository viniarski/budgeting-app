"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
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
  Plus,
  ShoppingCart,
} from "lucide-react"
import { LucideIcon } from "lucide-react"
import { OFFER_FILTERS, OfferCategory, OfferItem } from "@/lib/offers"
import {
  Listing,
  ListingCategory,
  LISTING_CATEGORIES,
} from "@/lib/listings"
import { loadListings, saveListings } from "@/lib/storage"
import ListingCard from "@/components/marketplace/listing-card"
import CreateListingForm from "@/components/marketplace/create-listing-form"

type Tab = "offers" | "buy-sell"

const ICON_BY_CATEGORY: Record<Exclude<OfferCategory, "all">, LucideIcon> = {
  food: UtensilsCrossed,
  shopping: ShoppingBag,
  tech: Laptop,
  travel: Bus,
  entertainment: Music,
  health: Dumbbell,
}

export default function MarketplacePage() {
  const [tab, setTab] = useState<Tab>("offers")

  // ── Offers state ──
  const [offerFilter, setOfferFilter] = useState<OfferCategory>("all")
  const [offerSearch, setOfferSearch] = useState("")
  const [offers, setOffers] = useState<OfferItem[]>([])
  const [loading, setLoading] = useState(true)
  const [source, setSource] = useState<"live" | "fallback">("fallback")

  // ── Buy & Sell state ──
  const [listings, setListings] = useState<Listing[]>([])
  const [listingFilter, setListingFilter] = useState<ListingCategory>("all")
  const [listingSearch, setListingSearch] = useState("")
  const [showForm, setShowForm] = useState(false)

  // Load offers
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

  // Load listings from localStorage
  useEffect(() => {
    setListings(loadListings())
  }, [])

  // ── Filtered data ──
  const filteredOffers = offers.filter((offer) => {
    const matchesCategory =
      offerFilter === "all" || offer.category === offerFilter
    const matchesSearch =
      !offerSearch ||
      offer.name.toLowerCase().includes(offerSearch.toLowerCase()) ||
      offer.desc.toLowerCase().includes(offerSearch.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const filteredListings = listings.filter((listing) => {
    const matchesCategory =
      listingFilter === "all" || listing.category === listingFilter
    const matchesSearch =
      !listingSearch ||
      listing.title.toLowerCase().includes(listingSearch.toLowerCase()) ||
      listing.description.toLowerCase().includes(listingSearch.toLowerCase())
    return matchesCategory && matchesSearch
  })

  function handleCreateListing(listing: Listing) {
    const updated = [listing, ...listings]
    setListings(updated)
    saveListings(updated)
    setShowForm(false)
  }

  return (
    <div className="space-y-5">
      {/* Page heading */}
      <div>
        <h1 className="font-heading text-center text-xl font-bold uppercase tracking-wide">
          Marketplace
        </h1>
        <p className="text-center text-xs text-muted">
          Deals, discounts & student buy/sell
        </p>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("offers")}
          className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-all ${
            tab === "offers"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:border-accent/50"
          }`}
        >
          Offers
        </button>
        <button
          onClick={() => setTab("buy-sell")}
          className={`flex-1 rounded-xl border py-2 text-sm font-semibold transition-all ${
            tab === "buy-sell"
              ? "border-accent bg-accent/10 text-accent"
              : "border-border text-muted hover:border-accent/50"
          }`}
        >
          Buy & Sell
        </button>
      </div>

      {/* ═══════════ OFFERS TAB ═══════════ */}
      {tab === "offers" && (
        <>
          <div className="flex items-center justify-center">
            <span
              className={`rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide ${
                source === "live"
                  ? "bg-success/15 text-success"
                  : "bg-warning/15 text-warning"
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
              value={offerSearch}
              onChange={(e) => setOfferSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {OFFER_FILTERS.map((entry) => (
              <button
                key={entry.value}
                onClick={() => setOfferFilter(entry.value)}
                className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  offerFilter === entry.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted hover:border-accent/50"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="py-12 text-center text-sm text-muted">
              Loading offers...
            </div>
          ) : (
            <div className="space-y-2">
              {filteredOffers.map((offer) => {
                const Icon = ICON_BY_CATEGORY[offer.category] ?? Tag
                return (
                  <a
                    key={offer.id}
                    href={offer.url || "#"}
                    target={offer.url ? "_blank" : undefined}
                    rel={offer.url ? "noopener noreferrer" : undefined}
                    className="flex items-center gap-3 rounded-xl border border-border bg-card p-3 transition-colors hover:border-accent/30"
                  >
                    <div
                      className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg ${
                        offer.logoPath ? "bg-white" : "bg-accent/10"
                      }`}
                    >
                      {offer.logoPath ? (
                        <Image
                          src={offer.logoPath}
                          alt={`${offer.name} logo`}
                          width={40}
                          height={40}
                          className="h-8 w-8 rounded object-contain"
                        />
                      ) : (
                        <Icon className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium">{offer.name}</p>
                      <p className="truncate text-xs text-muted">
                        {offer.desc}
                      </p>
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

              {filteredOffers.length === 0 && (
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
        </>
      )}

      {/* ═══════════ BUY & SELL TAB ═══════════ */}
      {tab === "buy-sell" && (
        <>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search listings..."
              value={listingSearch}
              onChange={(e) => setListingSearch(e.target.value)}
              className="w-full rounded-xl border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </div>

          {/* Category filters */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {LISTING_CATEGORIES.map((entry) => (
              <button
                key={entry.value}
                onClick={() => setListingFilter(entry.value)}
                className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                  listingFilter === entry.value
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border text-muted hover:border-accent/50"
                }`}
              >
                {entry.label}
              </button>
            ))}
          </div>

          {/* Listing grid */}
          {filteredListings.length > 0 ? (
            <div className="grid grid-cols-2 gap-2.5">
              {filteredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center">
              <ShoppingCart className="mx-auto mb-2 h-8 w-8 text-muted" />
              <p className="text-sm text-muted">No listings found</p>
            </div>
          )}

          {/* Sell Something button */}
          <button
            onClick={() => setShowForm(true)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            <Plus className="h-4 w-4" />
            Sell Something
          </button>

          {/* Create listing modal */}
          {showForm && (
            <CreateListingForm
              onSubmit={handleCreateListing}
              onClose={() => setShowForm(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
