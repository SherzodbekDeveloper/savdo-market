import { db } from "@/lib/firebase"
import { collection, addDoc, deleteDoc, updateDoc, getDocs, query, onSnapshot } from "firebase/firestore"
import type { CartItem } from "@/types"

export const cartService = {
  // Add item to cart
  async addToCart(userId: string, item: Omit<CartItem, "addedAt">) {
    try {
      const cartRef = collection(db, "users", userId, "cart")
      const existingItems = await getDocs(query(cartRef))

      let found = false
      for (const doc of existingItems.docs) {
        if (doc.data().productId === item.productId) {
          // Update quantity if product already in cart
          await updateDoc(doc.ref, {
            quantity: doc.data().quantity + item.quantity,
          })
          found = true
          break
        }
      }

      if (!found) {
        await addDoc(cartRef, {
          ...item,
          addedAt: new Date(),
        })
      }
    } catch (error) {
      console.error("Error adding to cart:", error)
      throw error
    }
  },

  // Remove item from cart
  async removeFromCart(userId: string, productId: number) {
    try {
      const cartRef = collection(db, "users", userId, "cart")
      const items = await getDocs(query(cartRef))

      for (const doc of items.docs) {
        if (doc.data().productId === productId) {
          await deleteDoc(doc.ref)
          break
        }
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      throw error
    }
  },

  // Update cart item quantity
  async updateCartQuantity(userId: string, productId: number, quantity: number) {
    try {
      const cartRef = collection(db, "users", userId, "cart")
      const items = await getDocs(query(cartRef))

      for (const doc of items.docs) {
        if (doc.data().productId === productId) {
          if (quantity <= 0) {
            await deleteDoc(doc.ref)
          } else {
            await updateDoc(doc.ref, { quantity })
          }
          break
        }
      }
    } catch (error) {
      console.error("Error updating cart:", error)
      throw error
    }
  },

  // Get all cart items with real-time updates
  subscribeToCart(userId: string, callback: (items: CartItem[]) => void) {
    try {
      const cartRef = collection(db, "users", userId, "cart")

      const unsubscribe = onSnapshot(cartRef, (snapshot) => {
        const items: CartItem[] = []
        snapshot.forEach((doc) => {
          const data = doc.data()
          if (data.productId) {
            // Skip metadata doc
            items.push({
              productId: data.productId,
              quantity: data.quantity,
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
      console.error("Error subscribing to cart:", error)
      throw error
    }
  },

  // Clear cart
  async clearCart(userId: string) {
    try {
      const cartRef = collection(db, "users", userId, "cart")
      const items = await getDocs(query(cartRef))

      for (const doc of items.docs) {
        if (doc.id !== "_metadata") {
          await deleteDoc(doc.ref)
        }
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  },
}
