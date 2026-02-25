import { BudgetState } from "./types"
import { STORAGE_KEY } from "./constants"
import { Listing, DEFAULT_LISTINGS, LISTINGS_STORAGE_KEY } from "./listings"
import { BudgetStateSchema, ListingSchema } from "./validators/domain"

const DEFAULT_STATE: BudgetState = {
  budget: null,
  expenses: [],
  isOnboarded: false,
}

export function loadState(): BudgetState {
  if (typeof window === "undefined") return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = BudgetStateSchema.safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : DEFAULT_STATE
  } catch {
    return DEFAULT_STATE
  }
}

export function saveState(state: BudgetState): void {
  if (typeof window === "undefined") return
  try {
    const isDefaultState =
      !state.isOnboarded && state.budget === null && state.expenses.length === 0

    if (isDefaultState) {
      localStorage.removeItem(STORAGE_KEY)
      return
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage might be full or unavailable
  }
}

export function loadListings(): Listing[] {
  if (typeof window === "undefined") return DEFAULT_LISTINGS
  try {
    const raw = localStorage.getItem(LISTINGS_STORAGE_KEY)
    if (!raw) return DEFAULT_LISTINGS
    const parsed = ListingSchema.array().safeParse(JSON.parse(raw))
    return parsed.success ? parsed.data : DEFAULT_LISTINGS
  } catch {
    return DEFAULT_LISTINGS
  }
}

export function saveListings(listings: Listing[]): void {
  if (typeof window === "undefined") return
  try {
    localStorage.setItem(LISTINGS_STORAGE_KEY, JSON.stringify(listings))
  } catch {
    // localStorage might be full or unavailable
  }
}
