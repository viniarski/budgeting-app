import { z } from "zod"

export const BudgetPeriodSchema = z.enum(["weekly", "monthly", "termly"])

export const CategorySchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  allocated: z.number().finite(),
  colour: z.string().min(1),
  icon: z.string().min(1),
})

export const BudgetSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  totalAmount: z.number().finite(),
  period: BudgetPeriodSchema,
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  categories: z.array(CategorySchema),
})

export const ExpenseSchema = z.object({
  id: z.string().min(1),
  amount: z.number().finite(),
  categoryId: z.string().min(1),
  description: z.string(),
  date: z.string().min(1),
})

export const BudgetStateSchema = z.object({
  budget: BudgetSchema.nullable(),
  expenses: z.array(ExpenseSchema),
  isOnboarded: z.boolean(),
})

const listingCategorySchema = z.enum([
  "textbooks",
  "furniture",
  "electronics",
  "clothing",
  "kitchen",
  "other",
])

const listingConditionSchema = z.enum(["new", "like-new", "good", "fair"])

export const ListingSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  description: z.string().min(1),
  price: z.number().finite(),
  category: listingCategorySchema,
  condition: listingConditionSchema,
  createdAt: z.string().min(1),
  isMine: z.boolean(),
})

const offerCategorySchema = z.enum([
  "food",
  "shopping",
  "tech",
  "travel",
  "entertainment",
  "health",
])

export const OfferItemSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  desc: z.string().min(1),
  discount: z.string().min(1),
  category: offerCategorySchema,
  logoPath: z.string().min(1).optional(),
  url: z.string().min(1).optional(),
})
