"use client"

import { useState } from "react"
import {
  Tag,
  UtensilsCrossed,
  ShoppingBag,
  Laptop,
  Music,
  Bus,
  Dumbbell,
  Film,
  BookOpen,
  ExternalLink,
  Search,
} from "lucide-react"
import { LucideIcon } from "lucide-react"

type Category = "all" | "food" | "shopping" | "tech" | "travel" | "entertainment" | "health"

interface Offer {
  name: string
  desc: string
  discount: string
  category: Category
  icon: LucideIcon
}

const FILTERS: { value: Category; label: string }[] = [
  { value: "all", label: "All" },
  { value: "food", label: "Food" },
  { value: "shopping", label: "Shopping" },
  { value: "tech", label: "Tech" },
  { value: "travel", label: "Travel" },
  { value: "entertainment", label: "Fun" },
  { value: "health", label: "Health" },
]

const OFFERS: Offer[] = [
  {
    name: "Amazon Prime Student",
    desc: "6 months free then 50% off",
    discount: "50% off",
    category: "shopping",
    icon: ShoppingBag,
  },
  {
    name: "Spotify Student",
    desc: "Premium with Hulu & SHOWTIME",
    discount: "50% off",
    category: "entertainment",
    icon: Music,
  },
  {
    name: "Apple Music",
    desc: "Student plan with Apple TV+",
    discount: "50% off",
    category: "entertainment",
    icon: Music,
  },
  {
    name: "UNiDAYS",
    desc: "Verified student discounts everywhere",
    discount: "Up to 25%",
    category: "shopping",
    icon: Tag,
  },
  {
    name: "TOTUM Card",
    desc: "NUS discount card for students",
    discount: "Varies",
    category: "shopping",
    icon: Tag,
  },
  {
    name: "16-25 Railcard",
    desc: "Save on train tickets across the UK",
    discount: "1/3 off",
    category: "travel",
    icon: Bus,
  },
  {
    name: "McDonald's Student",
    desc: "Free cheeseburger or McFlurry deals",
    discount: "Free items",
    category: "food",
    icon: UtensilsCrossed,
  },
  {
    name: "Nando's Student",
    desc: "Discounts with valid student ID",
    discount: "20% off",
    category: "food",
    icon: UtensilsCrossed,
  },
  {
    name: "Apple Education",
    desc: "Mac & iPad education pricing",
    discount: "Up to 10%",
    category: "tech",
    icon: Laptop,
  },
  {
    name: "GitHub Student Pack",
    desc: "Free developer tools & credits",
    discount: "Free",
    category: "tech",
    icon: Laptop,
  },
  {
    name: "PureGym Student",
    desc: "Discounted student membership",
    discount: "30% off",
    category: "health",
    icon: Dumbbell,
  },
  {
    name: "Odeon Cinema",
    desc: "Student tickets any day",
    discount: "Up to 25%",
    category: "entertainment",
    icon: Film,
  },
  {
    name: "Co-op Student",
    desc: "NUS / TOTUM discounts on groceries",
    discount: "10% off",
    category: "food",
    icon: UtensilsCrossed,
  },
  {
    name: "Microsoft 365",
    desc: "Free with university email",
    discount: "Free",
    category: "tech",
    icon: Laptop,
  },
  {
    name: "Waterstones",
    desc: "Student discount on books",
    discount: "10% off",
    category: "shopping",
    icon: BookOpen,
  },
]

export default function OffersPage() {
  const [filter, setFilter] = useState<Category>("all")
  const [search, setSearch] = useState("")

  const filtered = OFFERS.filter((o) => {
    const matchesCategory = filter === "all" || o.category === filter
    const matchesSearch =
      !search ||
      o.name.toLowerCase().includes(search.toLowerCase()) ||
      o.desc.toLowerCase().includes(search.toLowerCase())
    return matchesCategory && matchesSearch
  })

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-bold">Student Offers</h1>
        <p className="text-xs text-muted">Discounts & deals for students</p>
      </div>

      {/* Search */}
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

      {/* Category filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`flex-shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
              filter === f.value
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-muted hover:border-accent/50"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Offers list */}
      <div className="space-y-2">
        {filtered.map((offer) => {
          const Icon = offer.icon
          return (
            <div
              key={offer.name}
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
            </div>
          )
        })}

        {filtered.length === 0 && (
          <div className="py-12 text-center">
            <Tag className="mx-auto mb-2 h-8 w-8 text-muted" />
            <p className="text-sm text-muted">No offers found</p>
          </div>
        )}
      </div>

      <p className="text-center text-[10px] text-muted">
        Discounts may vary. Always verify with your student ID.
      </p>
    </div>
  )
}
