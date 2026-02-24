import type { Page } from "@playwright/test"

export async function clearAppStorage(page: Page) {
  await page.addInitScript(() => {
    localStorage.removeItem("uniwallet-state")
    localStorage.removeItem("uniwallet-state-id")
    localStorage.removeItem("uniwallet-theme")
  })
}

export async function seedOnboardedState(page: Page) {
  await page.addInitScript(() => {
    const state = {
      budget: {
        id: "budget-e2e",
        name: "Monthly Budget",
        totalAmount: 1200,
        period: "monthly",
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        categories: [
          {
            id: "rent",
            name: "Rent",
            colour: "bg-accent",
            icon: "Home",
            allocated: 600,
          },
          {
            id: "food",
            name: "Food & Groceries",
            colour: "bg-accent",
            icon: "UtensilsCrossed",
            allocated: 300,
          },
          {
            id: "subscriptions",
            name: "Subscriptions",
            colour: "bg-accent",
            icon: "CreditCard",
            allocated: 100,
          },
          {
            id: "transport",
            name: "Transport",
            colour: "bg-accent",
            icon: "Bus",
            allocated: 200,
          },
        ],
      },
      expenses: [],
      isOnboarded: true,
    }

    localStorage.setItem("uniwallet-state", JSON.stringify(state))
    localStorage.setItem("uniwallet-state-id", `e2e-${crypto.randomUUID()}`)
  })
}
