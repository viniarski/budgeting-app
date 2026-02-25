"use client"

import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useState,
  ReactNode,
} from "react"
import { BudgetState, Budget, Expense } from "@/lib/types"
import { loadState, saveState } from "@/lib/storage"

type Action =
  | { type: "SET_BUDGET"; payload: Budget }
  | { type: "ADD_EXPENSE"; payload: Expense }
  | { type: "DELETE_EXPENSE"; payload: string }
  | { type: "RESET" }
  | { type: "HYDRATE"; payload: BudgetState }

function reducer(state: BudgetState, action: Action): BudgetState {
  switch (action.type) {
    case "SET_BUDGET":
      return { ...state, budget: action.payload, isOnboarded: true }
    case "ADD_EXPENSE":
      return { ...state, expenses: [...state.expenses, action.payload] }
    case "DELETE_EXPENSE":
      return {
        ...state,
        expenses: state.expenses.filter((e) => e.id !== action.payload),
      }
    case "RESET":
      return { budget: null, expenses: [], isOnboarded: false }
    case "HYDRATE":
      return action.payload
    default:
      return state
  }
}

const initialState: BudgetState = {
  budget: null,
  expenses: [],
  isOnboarded: false,
}

const STATE_CLIENT_ID_KEY = "uniwallet-state-id"

function getStateId(): string {
  if (typeof window === "undefined") return "default"
  const existing = localStorage.getItem(STATE_CLIENT_ID_KEY)
  if (existing) return existing
  const generated = crypto.randomUUID()
  localStorage.setItem(STATE_CLIENT_ID_KEY, generated)
  return generated
}

function hasMeaningfulState(state: BudgetState): boolean {
  return state.isOnboarded || state.budget !== null || state.expenses.length > 0
}

interface BudgetContextValue {
  state: BudgetState
  dispatch: React.Dispatch<Action>
  isHydrated: boolean
}

const BudgetContext = createContext<BudgetContextValue | null>(null)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage first, then use DB state if available.
  useEffect(() => {
    let cancelled = false

    async function hydrate() {
      const local = loadState()
      const localHasState = hasMeaningfulState(local)
      const localSerialized = JSON.stringify(local)

      // Unblock UI immediately from local state; DB sync continues in background.
      if (!cancelled) {
        if (localHasState) {
          dispatch({ type: "HYDRATE", payload: local })
        }
        setIsHydrated(true)
      }

      const stateId = getStateId()

      try {
        const response = await fetch(`/api/state?stateId=${encodeURIComponent(stateId)}`, {
          cache: "no-store",
        })
        if (response.ok) {
          const data = (await response.json()) as { state?: BudgetState | null }
          if (data.state && hasMeaningfulState(data.state)) {
            saveState(data.state)
            if (!cancelled) {
              const remoteSerialized = JSON.stringify(data.state)
              if (remoteSerialized !== localSerialized) {
                dispatch({ type: "HYDRATE", payload: data.state })
              }
            }
          }
        }
      } catch {
        // If DB is unavailable, keep local state only.
      }
    }

    void hydrate()
    return () => {
      cancelled = true
    }
  }, [])

  // Persist to localStorage and sync to DB after hydration.
  useEffect(() => {
    if (!isHydrated) return

    saveState(state)

    const controller = new AbortController()
    const stateId = getStateId()
    const timer = setTimeout(() => {
      void fetch(`/api/state?stateId=${encodeURIComponent(stateId)}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
        signal: controller.signal,
      }).catch(() => {
        // Silent fallback to localStorage-only mode.
      })
    }, 250)

    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [state, isHydrated])

  return (
    <BudgetContext.Provider value={{ state, dispatch, isHydrated }}>
      {children}
    </BudgetContext.Provider>
  )
}

export function useBudget() {
  const context = useContext(BudgetContext)
  if (!context) {
    throw new Error("useBudget must be used within a BudgetProvider")
  }
  return context
}
