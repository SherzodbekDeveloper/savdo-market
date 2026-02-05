"use client"

import { useAuth } from "@/contexts/auth-context"
import { cartService } from "@/lib/cart-service"
import { favoritesService } from "@/lib/favorite-service"
import { formatPrice } from "@/lib/utils"
import { Heart, ShoppingCart, TrendingUp } from "lucide-react"
import Image from 'next/image'
import Link from "next/link"
import { useEffect, useState } from "react"
import { toast } from 'sonner'
import CustomImage from "./image"

type ProductItemProps = {
  item: any
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
        image: item.imageUrl || item.image || '',
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
          image: item.imageUrl || item.image || '',
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
    <div className="group h-full bg-card rounded-2xl overflow-hidden border border-border/50 transition-all duration-300 hover:shadow-xl hover:border-primary/40 hover:-translate-y-1 flex flex-col">
      <Link 
        href={`product/${item.docId ?? item.id}`} 
        className="relative block w-full aspect-square overflow-hidden bg-gradient-to-br from-secondary to-secondary/50"
      >
        <CustomImage 
          fill 
          product={item} 
          className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
        />
        {/* Badge */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {item.quantity && item.quantity < 10 && (
            <div className="bg-red-500 text-white px-2.5 py-1 rounded-full text-xs font-bold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              {item.quantity} left
            </div>
          )}
          <div className="bg-primary text-primary-foreground px-2.5 py-1 rounded-full text-xs font-semibold">
            Save 15%
          </div>
        </div>
      </Link>
      
      <div className="p-4 flex-1 flex flex-col">
        {/* Brand */}
        {item.brand && (
          <p className="text-xs font-semibold uppercase text-primary/70 mb-1.5 tracking-wider">
            {item.brand}
          </p>
        )}

        {/* Title */}
        <h2 className="text-sm font-bold text-foreground line-clamp-2 mb-3 leading-tight group-hover:text-primary transition-colors">
          {item.title}
        </h2>

        {/* Key Specs */}
        {item.specs && (
          <div className="mb-3 space-y-1 text-xs text-muted-foreground">
            {item.specs.model && <p className="line-clamp-1">📱 {item.specs.model}</p>}
            {item.specs.display && <p className="line-clamp-1">🖥️ {item.specs.display}</p>}
            {item.specs.camera && <p className="line-clamp-1">📸 {item.specs.camera}</p>}
          </div>
        )}

        {/* Price Section */}
        <div className="mb-4 mt-auto">
          <div className="flex items-baseline gap-2 mb-1">
            <p className="text-lg font-bold text-primary">
              {formatPrice(item.price)}
            </p>
            {item.variants && item.variants.length > 0 && (
              <span className="text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full font-medium">
                +{item.variants.length} variants
              </span>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleAddToCart}
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-2.5 px-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed text-sm active:scale-95"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">{isLoading ? "Adding..." : "Add"}</span>
            <span className="sm:hidden">{isLoading ? "..." : "+"}</span>
          </button>
          <button
            onClick={handleToggleFavorite}
            disabled={isLoading}
            className={`px-3 py-2.5 border-2 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
              isFavorited
                ? "bg-red-50/80 border-red-400 text-red-600 hover:bg-red-100 hover:border-red-500"
                : "border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
            }`}
          >
            <Heart className="w-4 h-4" fill={isFavorited ? "currentColor" : "none"} />
          </button>
        </div>
      </div>
    </div>
  )
}
