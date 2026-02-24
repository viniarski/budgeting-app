import { test, expect } from "@playwright/test"
import { clearAppStorage, seedOnboardedState } from "./helpers"

test("new user can complete onboarding", async ({ page }) => {
  await clearAppStorage(page)

  await page.goto("/")
  await expect(page.getByText("Welcome, Student!")).toBeVisible()

  await page.getByRole("link", { name: "Set Up Your Budget" }).click()
  await expect(page).toHaveURL(/\/setup$/)

  await page.locator('input[type="number"]').first().fill("1200")
  await page.locator('input[type="date"]').first().fill("2026-02-01")
  await page.getByRole("button", { name: "Next", exact: true }).click()

  await expect(page.getByRole("heading", { name: "Assign your money" })).toBeVisible()

  const firstAmountInput = page.locator('input[type="number"]').first()
  await firstAmountInput.fill("500")

  await page.getByRole("button", { name: "Start Budgeting" }).click()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByRole("heading", { name: /monthly budget/i })).toBeVisible()
})

test("user can add an expense from add page", async ({ page }) => {
  await seedOnboardedState(page)

  await page.goto("/add")
  await expect(page.getByRole("heading", { name: "Add Expense" })).toBeVisible()

  await page.locator('input[type="number"]').first().fill("42")
  await page.getByRole("button", { name: "Rent" }).click()
  await page.getByPlaceholder("e.g. Weekly shop").fill("Test expense")

  await page.getByRole("button", { name: "Add Expense" }).click()
  await expect(page.getByText("Expense Added!")).toBeVisible()
  await expect(page).toHaveURL(/\/$/)
  await expect(page.getByText("Test expense")).toBeVisible()
})

test("user can switch theme in settings", async ({ page }) => {
  await seedOnboardedState(page)

  await page.goto("/settings")
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible()

  await page.getByRole("button", { name: "Light" }).click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "light")

  await page.getByRole("button", { name: "Fancy" }).click()
  await expect(page.locator("html")).toHaveAttribute("data-theme", "fancy")
})
