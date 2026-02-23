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

interface BudgetContextValue {
  state: BudgetState
  dispatch: React.Dispatch<Action>
  isHydrated: boolean
}

const BudgetContext = createContext<BudgetContextValue | null>(null)

export function BudgetProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState)
  const [isHydrated, setIsHydrated] = useState(false)

  // Hydrate from localStorage on mount
  useEffect(() => {
    const saved = loadState()
    if (saved.isOnboarded) {
      dispatch({ type: "HYDRATE", payload: saved })
    }
    setIsHydrated(true)
  }, [])

  // Persist to localStorage only after hydration
  useEffect(() => {
    if (isHydrated) {
      saveState(state)
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
