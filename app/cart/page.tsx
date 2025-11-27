"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ArrowLeft, Trash2 } from "lucide-react"
import Link from "next/link"
import { cartService } from "@/lib/cart-service"
import type { CartItem } from "@/types"

export default function CartPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      const unsubscribe = cartService.subscribeToCart(user.uid, (items) => {
        setCartItems(items)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [user, authLoading, router])

  const handleRemove = async (productId: number) => {
    if (!user) return
    try {
      await cartService.removeFromCart(user.uid, productId)
    } catch (error) {
      console.error("Error removing from cart:", error)
    }
  }
  const handleCheckout = () => {
    router.push("/checkout")
  }


  const handleQuantityChange = async (productId: number, newQuantity: number) => {
    if (!user) return
    try {
      await cartService.updateCartQuantity(user.uid, productId, newQuantity)
    } catch (error) {
      console.error("Error updating quantity:", error)
    }
  }

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yuklanmoqda...</p>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Bosh sahifaga qaytish
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6">Savat</h1>

          {cartItems.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Savatingiz bo‘sh</p>
          ) : (
            <>
              <div className="space-y-4 mb-6">
                {cartItems.map((item) => (
                  <div key={item.productId} className="flex gap-4 border rounded-lg p-4">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.title}
                      className="w-20 h-20 object-contain rounded"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-gray-600">${item.price}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQuantityChange(item.productId, Math.max(1, item.quantity - 1))}
                        className="px-2 py-1 border rounded"
                      >
                        -
                      </button>
                      <span className="px-4">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="px-2 py-1 border rounded"
                      >
                        +
                      </button>
                    </div>
                    <button onClick={() => handleRemove(item.productId)} className="text-red-600 hover:text-red-800">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-bold mb-4">
                  <span>Jami:</span>
                  <span>${totalPrice.toFixed(2)}</span>
                </div>
                <button   onClick={handleCheckout} className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700">
                  To‘lovga o‘tish
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
