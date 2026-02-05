"use client"

import { useAuth } from "@/contexts/auth-context"
import { cartService } from "@/lib/cart-service"
import { favoritesService } from "@/lib/favorite-service"
import { formatPrice } from '@/lib/utils'
import type { FavoriteItem } from "@/types"
import { ArrowLeft, ShoppingBasketIcon, Trash2 } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function FavoritesPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      const unsubscribe = favoritesService.subscribeToFavorites(user.uid, (items) => {
        setFavorites(items)
        setLoading(false)
      })

      return () => unsubscribe()
    }
  }, [user, authLoading, router])

  const handleRemove = async (productId: number) => {
    if (!user) return
    try {
      await favoritesService.removeFromFavorites(user.uid, productId)
    } catch (error) {
      console.error("Error removing from favorites:", error)
    }
  }

  const handleAddToCart = async (item: FavoriteItem) => {
    if (!user) return
    try {
      await cartService.addToCart(user.uid, {
        productId: item.productId,
        quantity: 1,
        price: item.price,
        title: item.title,
        image: item.image,
      })
      alert("Mahsulot savatga qo‘shildi!")
    } catch (error) {
      console.error("Error adding to cart:", error)
    }
  }

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
          <h1 className="text-3xl font-bold mb-6">Saralanganlar</h1>

          {favorites.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Hozircha saralanganlar yo‘q</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {favorites.map((item) => (
                <div key={item.productId} className="border rounded-lg p-4 flex flex-col">
                  <img
                    src={item.image || "/placeholder.svg"}
                    alt={item.title}
                    className="w-full h-48 object-contain rounded mb-3"
                  />

                  <h3 className="font-semibold line-clamp-2 flex-1">{item.title}</h3>

                  <p className="text-lg font-bold text-blue-600 my-2">{formatPrice(item.price)}</p>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleAddToCart(item)}
                      className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2"
                    >
                      <ShoppingBasketIcon className="w-4 h-4" />
                      Savatga qo‘shish
                    </button>

                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="px-4 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
