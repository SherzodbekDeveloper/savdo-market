import { db } from "@/lib/firebase"
import type { CartItem } from "@/types"
import { addDoc, collection, deleteDoc, getDocs, onSnapshot, query, updateDoc } from "firebase/firestore"

export const cartService = {
  // item may include optional variantKey to distinguish variants
  async addToCart(userId: string, item: Omit<CartItem, "addedAt" | "id">) {
    try {
      const cartRef = collection(db, "users", userId, "cart")
      const existingItems = await getDocs(query(cartRef))

      let found = false
      for (const d of existingItems.docs) {
        const data = d.data()
        const sameProduct = data.productId === item.productId
        const sameVariant = (data.variantKey || null) === (item.variantKey || null)
        if (sameProduct && sameVariant) {
          await updateDoc(d.ref, {
            quantity: (data.quantity || 0) + item.quantity,
            price: item.price,
            title: item.title,
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

  // identifier can be cart doc id (string) or productId (number). If number is passed, variantKey can be provided to disambiguate
  async removeFromCart(userId: string, identifier: string | number, variantKey?: string) {
    try {
      const cartRef = collection(db, "users", userId, "cart")
      const items = await getDocs(query(cartRef))

      for (const d of items.docs) {
        const data = d.data()
        if (typeof identifier === "string") {
          if (d.id === identifier) {
            await deleteDoc(d.ref)
            break
          }
        } else {
          const sameProduct = data.productId === identifier
          const sameVariant = variantKey ? (data.variantKey || null) === variantKey : true
          if (sameProduct && sameVariant) {
            await deleteDoc(d.ref)
            break
          }
        }
      }
    } catch (error) {
      console.error("Error removing from cart:", error)
      throw error
    }
  },

  async updateCartQuantity(userId: string, identifier: string | number, quantity: number, variantKey?: string) {
    try {
      const cartRef = collection(db, "users", userId, "cart")
      const items = await getDocs(query(cartRef))

      for (const d of items.docs) {
        const data = d.data()
        if (typeof identifier === "string") {
          if (d.id === identifier) {
            if (quantity <= 0) {
              await deleteDoc(d.ref)
            } else {
              await updateDoc(d.ref, { quantity })
            }
            break
          }
        } else {
          const sameProduct = data.productId === identifier
          const sameVariant = variantKey ? (data.variantKey || null) === variantKey : true
          if (sameProduct && sameVariant) {
            if (quantity <= 0) {
              await deleteDoc(d.ref)
            } else {
              await updateDoc(d.ref, { quantity })
            }
            break
          }
        }
      }
    } catch (error) {
      console.error("Error updating cart:", error)
      throw error
    }
  },

  subscribeToCart(userId: string, callback: (items: CartItem[]) => void) {
    try {
      const cartRef = collection(db, "users", userId, "cart")

      const unsubscribe = onSnapshot(cartRef, (snapshot) => {
        const items: CartItem[] = []
        snapshot.forEach((d) => {
          const data = d.data()
          if (data.productId) {
            items.push({
              id: d.id,
              productId: data.productId,
              variantKey: data.variantKey || undefined,
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

  async clearCart(userId: string) {
    try {
      const cartRef = collection(db, "users", userId, "cart")
      const items = await getDocs(query(cartRef))

      for (const d of items.docs) {
        if (d.id !== "_metadata") {
          await deleteDoc(d.ref)
        }
      }
    } catch (error) {
      console.error("Error clearing cart:", error)
      throw error
    }
  },
}
