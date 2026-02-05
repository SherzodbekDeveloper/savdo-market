import { db } from "@/lib/firebase"
import type { Item } from "@/types"
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore"

const CACHE_TIME = 5 * 60 * 1000 // 5 minutes

interface CacheEntry {
  data: unknown
  timestamp: number
}

const cache = new Map<string, CacheEntry>()

function isCacheValid(entry: CacheEntry): boolean {
  return Date.now() - entry.timestamp < CACHE_TIME
}

function mapDocToItem(data: any, docId: string): Item {
  const idFromData = typeof data?.id === "number" ? data.id : Number(data?.id)
  const id = Number.isFinite(idFromData) ? idFromData : Number(docId) || Date.now()

  return {
    id,
    docId: String(docId),
    title: data?.title || data?.name || "",
    price: Number(data?.price) || 0,
    desc: data?.desc || data?.description || "",
    category: data?.category || "",
    image: data?.imageUrl || data?.image || "",
    rating: data?.rating || { rate: 0, count: 0 },
    brand: data?.brand || null,
    variants: data?.variants || undefined,
    extra: data?.extra || undefined,
  }
}

export async function fetchProducts(): Promise<Item[]> {
  const cacheKey = "products"

  const cached = cache.get(cacheKey)
  if (cached && isCacheValid(cached)) {
    return cached.data as Item[]
  }

  try {
    const colRef = collection(db, "products")
    const snapshot = await getDocs(colRef)

    const items = snapshot.docs
      .filter((d) => d.id !== "_metadata")
      .map((d) => mapDocToItem(d.data(), d.id))

    cache.set(cacheKey, { data: items, timestamp: Date.now() })
    return items
  } catch (error) {
    console.error("Firestore fetchProducts error:", error)
    throw error
  }
}

export async function fetchProductById(id: string | string[]): Promise<Item> {
  const idStr = Array.isArray(id) ? id[0] : id
  const cacheKey = `product-${idStr}`

  const cached = cache.get(cacheKey)
  if (cached && isCacheValid(cached)) {
    return cached.data as Item
  }

  try {
    // try document id first
    const docRef = doc(db, "products", String(idStr))
    const docSnap = await getDoc(docRef)

    let item: Item | null = null

    if (docSnap.exists()) {
      item = mapDocToItem(docSnap.data(), docSnap.id)
    } else {
      // fallback: query by numeric 'id' field
      const colRef = collection(db, "products")
      const q = query(colRef, where("id", "==", Number(idStr)))
      const snap = await getDocs(q)
      if (!snap.empty) {
        const d = snap.docs[0]
        item = mapDocToItem(d.data(), d.id)
      }
    }

    if (!item) throw new Error(`Product ${idStr} not found`)

    cache.set(cacheKey, { data: item, timestamp: Date.now() })
    return item
  } catch (error) {
    console.error("Firestore fetchProductById error:", error)
    throw error
  }
}

// Invalidate cache when external changes happen (e.g. new product created)
export function invalidateProductsCache(productId?: string | number) {
  cache.delete("products")
  if (productId) cache.delete(`product-${productId}`)
}
