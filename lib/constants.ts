import { Category } from "./types"

export type CategoryTemplate = Omit<Category, "allocated">

export const ALL_CATEGORIES: CategoryTemplate[] = [
  // Essentials
  { id: "rent", name: "Rent", colour: "bg-accent", icon: "Home" },
  { id: "food", name: "Food & Groceries", colour: "bg-accent", icon: "UtensilsCrossed" },
  { id: "bills", name: "Bills & Utilities", colour: "bg-accent", icon: "Zap" },
  { id: "transport", name: "Transport", colour: "bg-accent", icon: "Bus" },
  // Lifestyle
  { id: "eating-out", name: "Eating Out", colour: "bg-accent", icon: "Coffee" },
  { id: "going-out", name: "Going Out", colour: "bg-accent", icon: "PartyPopper" },
  { id: "shopping", name: "Shopping", colour: "bg-accent", icon: "ShoppingBag" },
  { id: "subscriptions", name: "Subscriptions", colour: "bg-accent", icon: "CreditCard" },
  { id: "media", name: "Media & Streaming", colour: "bg-accent", icon: "Tv" },
  { id: "phone", name: "Phone", colour: "bg-accent", icon: "Smartphone" },
  // Personal
  { id: "gym", name: "Gym & Fitness", colour: "bg-accent", icon: "Dumbbell" },
  { id: "clothing", name: "Clothing", colour: "bg-accent", icon: "Shirt" },
  { id: "health", name: "Health", colour: "bg-accent", icon: "Heart" },
  // Academic
  { id: "books", name: "Books & Supplies", colour: "bg-accent", icon: "BookOpen" },
  { id: "courses", name: "Courses & Tools", colour: "bg-accent", icon: "GraduationCap" },
  // Savings
  { id: "savings", name: "Savings", colour: "bg-accent", icon: "PiggyBank" },
  { id: "emergency", name: "Emergency Fund", colour: "bg-accent", icon: "Shield" },
  // Other
  { id: "other", name: "Other", colour: "bg-accent", icon: "MoreHorizontal" },
]

export const DEFAULT_CATEGORY_IDS = [
  "rent",
  "food",
  "transport",
  "subscriptions",
  "going-out",
  "savings",
]

export const STORAGE_KEY = "uniwallet-state"
