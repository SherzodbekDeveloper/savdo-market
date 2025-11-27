import { db } from "@/lib/firebase"
import { collection, addDoc, deleteDoc, getDocs, query, onSnapshot } from "firebase/firestore"
import type { FavoriteItem } from "@/types"

export const favoritesService = {
  // Add item to favorites
  async addToFavorites(userId: string, item: Omit<FavoriteItem, "addedAt">) {
    try {
      const favRef = collection(db, "users", userId, "favorites")
      const existingItems = await getDocs(query(favRef))

      // Check if already in favorites
      for (const doc of existingItems.docs) {
        if (doc.data().productId === item.productId) {
          throw new Error("Item already in favorites")
        }
      }

      await addDoc(favRef, {
        ...item,
        addedAt: new Date(),
      })
    } catch (error) {
      console.error("Error adding to favorites:", error)
      throw error
    }
  },

  // Remove item from favorites
  async removeFromFavorites(userId: string, productId: number) {
    try {
      const favRef = collection(db, "users", userId, "favorites")
      const items = await getDocs(query(favRef))

      for (const doc of items.docs) {
        if (doc.data().productId === productId) {
          await deleteDoc(doc.ref)
          break
        }
      }
    } catch (error) {
      console.error("Error removing from favorites:", error)
      throw error
    }
  },

  // Get all favorites with real-time updates
  subscribeToFavorites(userId: string, callback: (items: FavoriteItem[]) => void) {
    try {
      const favRef = collection(db, "users", userId, "favorites")

      const unsubscribe = onSnapshot(favRef, (snapshot) => {
        const items: FavoriteItem[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.productId) {
            // Skip metadata doc
            items.push({
              productId: data.productId,
              addedAt: data.addedAt?.toDate() || new Date(),
              price: data.price,
              title: data.title,
              image: data.image,
            })
          }
        })
        callback(items)
      })

      return unsubscribe
    } catch (error) {
      console.error("Error subscribing to favorites:", error)
      throw error
    }
  },

  // Check if item is in favorites
  async isFavorited(userId: string, productId: number): Promise<boolean> {
    try {
      const favRef = collection(db, "users", userId, "favorites")
      const items = await getDocs(query(favRef))

      for (const doc of items.docs) {
        if (doc.data().productId === productId) {
          return true
        }
      }
      return false
    } catch (error) {
      console.error("Error checking favorites:", error)
      return false
    }
  },
}
