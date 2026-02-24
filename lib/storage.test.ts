import { loadState, saveState, loadListings, saveListings } from "@/lib/storage"
import { STORAGE_KEY } from "@/lib/constants"
import { LISTINGS_STORAGE_KEY } from "@/lib/listings"
import type { BudgetState } from "@/lib/types"
import { vi } from "vitest"

describe("storage", () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it("returns default state when no stored state exists", () => {
    expect(loadState()).toEqual({
      budget: null,
      expenses: [],
      isOnboarded: false,
    })
  })

  it("loads stored budget state", () => {
    const state: BudgetState = {
      budget: {
        id: "b1",
        name: "Monthly Budget",
        totalAmount: 1000,
        period: "monthly",
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        categories: [],
      },
      expenses: [],
      isOnboarded: true,
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    expect(loadState()).toEqual(state)
  })

  it("falls back to default state for invalid JSON", () => {
    localStorage.setItem(STORAGE_KEY, "not-json")
    expect(loadState()).toEqual({
      budget: null,
      expenses: [],
      isOnboarded: false,
    })
  })

  it("removes key when saving default state", () => {
    localStorage.setItem(STORAGE_KEY, "stale")

    saveState({
      budget: null,
      expenses: [],
      isOnboarded: false,
    })

    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it("persists non-default state", () => {
    const state: BudgetState = {
      budget: {
        id: "b1",
        name: "Monthly Budget",
        totalAmount: 1000,
        period: "monthly",
        startDate: "2026-02-01",
        endDate: "2026-02-28",
        categories: [],
      },
      expenses: [
        {
          id: "e1",
          amount: 10,
          categoryId: "food",
          description: "Lunch",
          date: "2026-02-10",
        },
      ],
      isOnboarded: true,
    }

    saveState(state)
    expect(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}")).toEqual(state)
  })

  it("saves and loads listings", () => {
    const listings = [
      {
        id: "l1",
        title: "Desk Lamp",
        description: "Used once",
        price: 7,
        category: "furniture" as const,
        condition: "good" as const,
        createdAt: "2026-02-10T12:00:00.000Z",
        isMine: true,
      },
    ]

    saveListings(listings)
    expect(loadListings()).toEqual(listings)
    expect(JSON.parse(localStorage.getItem(LISTINGS_STORAGE_KEY) ?? "[]")).toEqual(
      listings
    )
  })

  it("returns default listings for invalid listings JSON", () => {
    localStorage.setItem(LISTINGS_STORAGE_KEY, "invalid-json")
    expect(loadListings().length).toBeGreaterThan(0)
  })

  it("does not throw when saving state and localStorage.setItem fails", () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded")
      })

    expect(() =>
      saveState({
        budget: {
          id: "b1",
          name: "Monthly Budget",
          totalAmount: 500,
          period: "monthly",
          startDate: "2026-02-01",
          endDate: "2026-02-28",
          categories: [],
        },
        expenses: [],
        isOnboarded: true,
      })
    ).not.toThrow()

    setItemSpy.mockRestore()
  })

  it("does not throw when saving listings and localStorage.setItem fails", () => {
    const setItemSpy = vi
      .spyOn(Storage.prototype, "setItem")
      .mockImplementation(() => {
        throw new Error("quota exceeded")
      })

    expect(() =>
      saveListings([
        {
          id: "l1",
          title: "Desk Lamp",
          description: "Used once",
          price: 7,
          category: "furniture",
          condition: "good",
          createdAt: "2026-02-10T12:00:00.000Z",
          isMine: false,
        },
      ])
    ).not.toThrow()

    setItemSpy.mockRestore()
  })

  it("does not throw when removing default state and localStorage.removeItem fails", () => {
    const removeItemSpy = vi
      .spyOn(Storage.prototype, "removeItem")
      .mockImplementation(() => {
        throw new Error("storage blocked")
      })

    expect(() =>
      saveState({
        budget: null,
        expenses: [],
        isOnboarded: false,
      })
    ).not.toThrow()

    removeItemSpy.mockRestore()
  })
})
