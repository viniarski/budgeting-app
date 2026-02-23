export type OfferCategory =
  | "all"
  | "food"
  | "shopping"
  | "tech"
  | "travel"
  | "entertainment"
  | "health"

export interface OfferItem {
  id: string
  name: string
  desc: string
  discount: string
  category: Exclude<OfferCategory, "all">
  logoPath?: string
  url?: string
}

export const OFFER_FILTERS: { value: OfferCategory; label: string }[] = [
  { value: "all", label: "All" },
  { value: "food", label: "Food" },
  { value: "shopping", label: "Shopping" },
  { value: "tech", label: "Tech" },
  { value: "travel", label: "Travel" },
  { value: "entertainment", label: "Fun" },
  { value: "health", label: "Health" },
]

export const DEFAULT_OFFERS: OfferItem[] = [
  {
    id: "aviva-student-contents",
    name: "Aviva Student Contents Insurance",
    desc: "Protect laptop, phone, and essentials in halls or shared housing",
    discount: "Student pricing",
    category: "health",
    logoPath: "/aviva-logo.svg",
    url: "https://www.aviva.co.uk/",
  },
  {
    id: "aviva-student-travel",
    name: "Aviva Student Travel Cover",
    desc: "Flexible single-trip cover for study breaks and holidays",
    discount: "Up to 15%",
    category: "travel",
    logoPath: "/aviva-logo.svg",
    url: "https://www.aviva.co.uk/",
  },
  {
    id: "aviva-gadget-cover",
    name: "Aviva Gadget Cover",
    desc: "Optional cover for phones and tablets on student budgets",
    discount: "Bundle savings",
    category: "tech",
    logoPath: "/aviva-logo.svg",
    url: "https://www.aviva.co.uk/",
  },
  {
    id: "amazon-prime-student",
    name: "Amazon Prime Student",
    desc: "6 months free then 50% off",
    discount: "50% off",
    category: "shopping",
  },
  {
    id: "spotify-student",
    name: "Spotify Student",
    desc: "Premium with Hulu & SHOWTIME",
    discount: "50% off",
    category: "entertainment",
  },
  {
    id: "apple-music-student",
    name: "Apple Music",
    desc: "Student plan with Apple TV+",
    discount: "50% off",
    category: "entertainment",
  },
  {
    id: "unidays",
    name: "UNiDAYS",
    desc: "Verified student discounts everywhere",
    discount: "Up to 25%",
    category: "shopping",
  },
  {
    id: "totum-card",
    name: "TOTUM Card",
    desc: "NUS discount card for students",
    discount: "Varies",
    category: "shopping",
  },
  {
    id: "railcard-16-25",
    name: "16-25 Railcard",
    desc: "Save on train tickets across the UK",
    discount: "1/3 off",
    category: "travel",
  },
  {
    id: "mcdonalds-student",
    name: "McDonald's Student",
    desc: "Free cheeseburger or McFlurry deals",
    discount: "Free items",
    category: "food",
  },
  {
    id: "nandos-student",
    name: "Nando's Student",
    desc: "Discounts with valid student ID",
    discount: "20% off",
    category: "food",
  },
  {
    id: "apple-education",
    name: "Apple Education",
    desc: "Mac & iPad education pricing",
    discount: "Up to 10%",
    category: "tech",
  },
  {
    id: "github-student-pack",
    name: "GitHub Student Pack",
    desc: "Free developer tools & credits",
    discount: "Free",
    category: "tech",
  },
  {
    id: "puregym-student",
    name: "PureGym Student",
    desc: "Discounted student membership",
    discount: "30% off",
    category: "health",
  },
  {
    id: "odeon-student",
    name: "Odeon Cinema",
    desc: "Student tickets any day",
    discount: "Up to 25%",
    category: "entertainment",
  },
  {
    id: "coop-student",
    name: "Co-op Student",
    desc: "NUS / TOTUM discounts on groceries",
    discount: "10% off",
    category: "food",
  },
  {
    id: "microsoft-365-student",
    name: "Microsoft 365",
    desc: "Free with university email",
    discount: "Free",
    category: "tech",
  },
  {
    id: "waterstones-student",
    name: "Waterstones",
    desc: "Student discount on books",
    discount: "10% off",
    category: "shopping",
  },
]
