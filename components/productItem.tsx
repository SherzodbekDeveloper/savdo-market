"use client"

import { ShoppingBasketIcon, StarIcon, HeartIcon } from "lucide-react"
import Link from "next/link"
import CustomImage from "./image"
import { useAuth } from "@/contexts/auth-context"
import { cartService } from "@/lib/cart-service"
import { favoritesService } from "@/lib/favorite-service"
import { useState, useEffect } from "react"
import type { Item } from "@/types"
import { toast } from 'sonner'
import Image from 'next/image'

type ProductItemProps = {
  item: Item
}

export default function ProductItem({ item }: ProductItemProps) {
  const { user } = useAuth()
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (user && item?.id) {
      checkFavoriteStatus()
    }
  }, [user, item])

  const checkFavoriteStatus = async () => {
    if (!user) return
    try {
      const favorited = await favoritesService.isFavorited(user.uid, item.id)
      setIsFavorited(favorited)
    } catch (error) {
      console.error("Saralanganlar holatini tekshirishda xato:", error)
    }
  }

  const handleAddToCart = async () => {
    if (!user) {
      toast.error("Savatga qo'shish uchun tizimga kirishingiz kerak")
      return
    }


    setIsLoading(true)
    try {
      await cartService.addToCart(user.uid, {
        productId: item.id,
        quantity: 1,
        price: item.price,
        title: item.title,
        image: item.image,
      })
      toast.success("Mahsulot savatchaga qo'shildi!")
    } catch (error) {
      console.error("Savatga qo'shishda xato:", error)
      toast.error("Mahsulotni savatchaga qo'shishda xato yuz berdi")
    } finally {
      setIsLoading(false)
    }


  }

  const handleToggleFavorite = async () => {
    if (!user) {
      toast.error("Saralanganlarga qo'shish uchun tizimga kirishingiz kerak")
      return
    }


    setIsLoading(true)
    try {
      if (isFavorited) {
        await favoritesService.removeFromFavorites(user.uid, item.id)
        setIsFavorited(false)
      } else {
        await favoritesService.addToFavorites(user.uid, {
          productId: item.id,
          price: item.price,
          title: item.title,
          image: item.image,
        })
        setIsFavorited(true)
      }
    } catch (error) {
      console.error("Saralanganlar holatini o'zgartirishda xato:", error)
    } finally {
      setIsLoading(false)
    }


  }

  return (
    <div className="rounded-2xl hover:shadow-sm group">
      <Link href={`product/${item.id}`} className="block relative object-center h-80 rounded overflow-hidden"> <CustomImage fill product={item} />
      </Link>
      <div className="mt-4 p-4 pt-1">
        <p className="mt-1">${item.price}</p>
        <div className="h-20">
          <h2 className="text-gray-900 title-font text-lg font-medium line-clamp-2">{item.title}</h2>
        </div>
        <div className="flex items-center gap-1 text-sm">
          <Image src="/blueStar.png" alt="star" width={16} height={16} />
          <span>
            {item.rating.rate} ({item.rating.count} baholash) </span>
        </div>
        <div className="flex gap-2 mt-2">
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1 button w-full bg-blue-500 text-white border-transparent cursor-pointer flex items-center justify-center gap-1 rounded-xl hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingBasketIcon className="w-4 h-4" />
            {isLoading ? "Qo'shilmoqda..." : "Qo'shish"} </button>
          <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`button px-3 border-2 rounded-xl cursor-pointer flex items-center justify-center transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${isFavorited
              ? "bg-red-500 border-red-500 text-white hover:bg-red-600"
              : "border-gray-300 text-gray-600 hover:border-red-500 hover:text-red-500"
              }`}
          >
            <HeartIcon className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  )
}
