"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"
import {
  Listing,
  ListingCategory,
  ListingCondition,
  LISTING_CATEGORIES,
  CONDITION_LABELS,
} from "@/lib/listings"

interface CreateListingFormProps {
  onSubmit: (listing: Listing) => void
  onClose: () => void
}

export default function CreateListingForm({
  onSubmit,
  onClose,
}: CreateListingFormProps) {
  const [title, setTitle] = useState("")
  const [price, setPrice] = useState("")
  const [category, setCategory] = useState<Exclude<ListingCategory, "all"> | "">("")
  const [condition, setCondition] = useState<ListingCondition | "">("")
  const [description, setDescription] = useState("")

  const categories = LISTING_CATEGORIES.filter((c) => c.value !== "all") as {
    value: Exclude<ListingCategory, "all">
    label: string
  }[]

  const conditions: { value: ListingCondition; label: string }[] = (
    Object.entries(CONDITION_LABELS) as [ListingCondition, string][]
  ).map(([value, label]) => ({ value, label }))

  const isValid =
    title.trim() !== "" &&
    price !== "" &&
    Number(price) > 0 &&
    category !== "" &&
    condition !== ""

  useEffect(() => {
    const originalBodyOverflow = document.body.style.overflow
    const originalBodyTouchAction = document.body.style.touchAction
    const originalHtmlOverflow = document.documentElement.style.overflow

    document.body.style.overflow = "hidden"
    document.body.style.touchAction = "none"
    document.documentElement.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = originalBodyOverflow
      document.body.style.touchAction = originalBodyTouchAction
      document.documentElement.style.overflow = originalHtmlOverflow
    }
  }, [])

  function handleSubmit() {
    if (!isValid || !category || !condition) return

    const listing: Listing = {
      id: crypto.randomUUID(),
      title: title.trim(),
      description: description.trim(),
      price: Number(price),
      category,
      condition,
      createdAt: new Date().toISOString(),
      isMine: true,
    }

    onSubmit(listing)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 px-2 pb-20 pt-2 overscroll-contain sm:items-center sm:p-4">
      <div className="flex max-h-[calc(100dvh-6rem)] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-border bg-background">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="text-lg font-bold">Sell Something</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-border transition-colors hover:bg-card"
          >
            <X className="h-4 w-4 text-muted" />
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          {/* Title */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Title
            </label>
            <input
              type="text"
              placeholder="What are you selling?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </div>

          {/* Price */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Price (£)
            </label>
            <input
              type="number"
              placeholder="0"
              min="0"
              step="0.01"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              onKeyDown={(e) => {
                if (["e", "E", "+", "-"].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              className="w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </div>

          {/* Category picker */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {categories.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCategory(c.value)}
                  className={`rounded-lg border px-2 py-2 text-xs font-medium transition-all ${
                    category === c.value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Condition chips */}
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">
              Condition
            </label>
            <div className="flex flex-wrap gap-2">
              {conditions.map((c) => (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => setCondition(c.value)}
                  className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-all ${
                    condition === c.value
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border text-muted hover:border-accent/50"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-medium text-muted">
              Description (optional)
            </label>
            <textarea
              placeholder="Add some details..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full resize-none rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground outline-none transition-colors focus:border-accent"
            />
          </div>
        </div>

        <div className="border-t border-border bg-background px-5 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] pt-3">
          {/* Submit stays visible while body scrolls */}
          <button
            onClick={handleSubmit}
            disabled={!isValid}
            className="w-full rounded-xl bg-accent py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-40"
          >
            List Item
          </button>
        </div>
      </div>
    </div>
  )
}
