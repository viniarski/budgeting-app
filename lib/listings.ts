export type ListingCategory =
  | "all"
  | "textbooks"
  | "furniture"
  | "electronics"
  | "clothing"
  | "kitchen"
  | "other"

export type ListingCondition = "new" | "like-new" | "good" | "fair"

export interface Listing {
  id: string
  title: string
  description: string
  price: number
  category: Exclude<ListingCategory, "all">
  condition: ListingCondition
  createdAt: string
  isMine: boolean
}

export const LISTINGS_STORAGE_KEY = "uniwallet_listings"

export const LISTING_CATEGORIES: { value: ListingCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "textbooks", label: "Textbooks" },
  { value: "furniture", label: "Furniture" },
  { value: "electronics", label: "Electronics" },
  { value: "clothing", label: "Clothing" },
  { value: "kitchen", label: "Kitchen" },
  { value: "other", label: "Other" },
]

export const CONDITION_LABELS: Record<ListingCondition, string> = {
  new: "New",
  "like-new": "Like New",
  good: "Good",
  fair: "Fair",
}

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString()
}

export const DEFAULT_LISTINGS: Listing[] = [
  {
    id: "sample-1",
    title: "Intro to Psychology Textbook",
    description: "Barely used, highlighted a few pages. 4th edition.",
    price: 12,
    category: "textbooks",
    condition: "like-new",
    createdAt: daysAgo(1),
    isMine: false,
  },
  {
    id: "sample-2",
    title: "IKEA Desk Lamp",
    description: "White TERTIAL lamp, works perfectly. Bulb included.",
    price: 5,
    category: "furniture",
    condition: "good",
    createdAt: daysAgo(2),
    isMine: false,
  },
  {
    id: "sample-3",
    title: "Sony WH-1000XM4 Headphones",
    description: "Noise cancelling, great condition. Comes with case and cable.",
    price: 95,
    category: "electronics",
    condition: "good",
    createdAt: daysAgo(3),
    isMine: false,
  },
  {
    id: "sample-4",
    title: "North Face Puffer Jacket (M)",
    description: "Black 700-fill, worn one season. No rips or stains.",
    price: 60,
    category: "clothing",
    condition: "good",
    createdAt: daysAgo(1),
    isMine: false,
  },
  {
    id: "sample-5",
    title: "Mini Fridge",
    description: "Perfect for a dorm room. 46L, clean and working.",
    price: 30,
    category: "kitchen",
    condition: "fair",
    createdAt: daysAgo(5),
    isMine: false,
  },
  {
    id: "sample-6",
    title: "Casio Scientific Calculator",
    description: "FX-991EX, perfect for engineering modules.",
    price: 8,
    category: "electronics",
    condition: "like-new",
    createdAt: daysAgo(0),
    isMine: false,
  },
  {
    id: "sample-7",
    title: "Organic Chemistry (Clayden) 2nd Ed",
    description: "The big one. Some wear on spine but pages are clean.",
    price: 18,
    category: "textbooks",
    condition: "fair",
    createdAt: daysAgo(4),
    isMine: false,
  },
  {
    id: "sample-8",
    title: "Kettle & Toaster Set",
    description: "Russell Hobbs matching set. Moving out, need gone ASAP.",
    price: 15,
    category: "kitchen",
    condition: "good",
    createdAt: daysAgo(2),
    isMine: false,
  },
]
