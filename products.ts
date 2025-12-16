export interface Product {
  id: string
  name: string
  description: string
  priceInCents: number
  tier: "standard" | "premium"
  features: string[]
}

export const PRODUCTS: Product[] = [
  {
    id: "standard-monthly",
    name: "Standard",
    description: "Plan lunar Standard cu diagnosticări nelimitate",
    priceInCents: 999, // $9.99
    tier: "standard",
    features: ["Diagnosticări nelimitate", "Rapoarte detaliate", "Istoric ultimele 10 diagnosticări", "Suport email"],
  },
  {
    id: "premium-monthly",
    name: "Premium",
    description: "Plan lunar Premium cu toate funcțiile avansate",
    priceInCents: 1999, // $19.99
    tier: "premium",
    features: [
      "Tot din Standard, plus:",
      "Analiză tehnică avansată",
      "Istoric nelimitat",
      "Procesare prioritară",
      "Alerte de întreținere predictivă",
      "Export PDF",
    ],
  },
]
