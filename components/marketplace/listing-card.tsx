"use client"

import {
  BookOpen,
  Sofa,
  Laptop,
  Shirt,
  CookingPot,
  Package,
} from "lucide-react"
import { LucideIcon } from "lucide-react"
import { Listing, ListingCondition, CONDITION_LABELS } from "@/lib/listings"

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  textbooks: BookOpen,
  furniture: Sofa,
  electronics: Laptop,
  clothing: Shirt,
  kitchen: CookingPot,
  other: Package,
}

const CONDITION_COLOURS: Record<ListingCondition, string> = {
  new: "bg-success/15 text-success",
  "like-new": "bg-accent/15 text-accent",
  good: "bg-warning/15 text-warning",
  fair: "bg-muted/15 text-muted",
}

function relativeTime(dateStr: string): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffMins = Math.floor(diffMs / 60_000)
  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours}h ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return "1d ago"
  return `${diffDays}d ago`
}

interface ListingCardProps {
  listing: Listing
}

export default function ListingCard({ listing }: ListingCardProps) {
  const Icon = CATEGORY_ICONS[listing.category] ?? Package

  return (
    <div className="flex flex-col rounded-xl border border-border bg-card p-3 transition-colors hover:border-accent/30">
      {/* Icon + price row */}
      <div className="mb-2 flex items-start justify-between">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
          <Icon className="h-4.5 w-4.5 text-accent" />
        </div>
        <span className="text-base font-bold text-accent">
          £{listing.price}
        </span>
      </div>

      {/* Title */}
      <p className="mb-1 line-clamp-2 text-sm font-medium leading-snug">
        {listing.title}
      </p>

      {/* Badges row */}
      <div className="mt-auto flex items-center gap-1.5 pt-2">
        <span
          className={`rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${CONDITION_COLOURS[listing.condition]}`}
        >
          {CONDITION_LABELS[listing.condition]}
        </span>
        {listing.isMine && (
          <span className="rounded-md bg-accent/15 px-1.5 py-0.5 text-[10px] font-semibold text-accent">
            You
          </span>
        )}
        <span className="ml-auto text-[10px] text-muted">
          {relativeTime(listing.createdAt)}
        </span>
      </div>
    </div>
  )
}
