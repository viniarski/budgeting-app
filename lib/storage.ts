import { BudgetState } from "./types"
import { STORAGE_KEY } from "./constants"

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
    return JSON.parse(raw) as BudgetState
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
