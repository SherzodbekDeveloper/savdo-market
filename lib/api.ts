import type { Item } from "@/types"

const BASE_URL = "https://fakestoreapi.com"
const CACHE_TIME = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: unknown
  timestamp: number
}

const cache = new Map<string, CacheEntry>()

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TIME
}

export async function fetchProducts(): Promise<Item[]> {
  const cacheKey = "products"

  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && isCacheValid(cached)) {
    return cached.data as Item[]
  }

  try {
    const res = await fetch(`${BASE_URL}/products`, {
      next: { revalidate: 300 }, // ISR: revalidate every 5 minutes
    })

    if (!res.ok) throw new Error("Failed to fetch products")

    const data = await res.json()
    cache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  } catch (error) {
    console.error("Fetch error:", error)
    throw error
  }
}

export async function fetchProductById(id: string | string[]): Promise<Item> {
  const cacheKey = `product-${id}`

  // Check cache first
  const cached = cache.get(cacheKey)
  if (cached && isCacheValid(cached)) {
    return cached.data as Item
  }

  try {
    const res = await fetch(`${BASE_URL}/products/${id}`, {
      next: { revalidate: 300 },
    })

    if (!res.ok) throw new Error(`Failed to fetch product ${id}`)

    const data = await res.json()
    cache.set(cacheKey, { data, timestamp: Date.now() })
    return data
  } catch (error) {
    console.error("Fetch error:", error)
    throw error
  }
}
