"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import CustomImage from "@/components/image"
import { ArrowLeft, Heart } from "lucide-react"
import { useRouter } from "next/navigation"
import ReactStars from "react-stars"
import { useAuth } from "@/contexts/auth-context"
import { cartService } from "@/lib/cart-service"
import { favoritesService } from "@/lib/favorite-service"
import type { Item } from "@/types"
import { toast } from 'sonner'

export default function ProductDetailedPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const [product, setProduct] = useState<Item | null>(null)
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [checkingFav, setCheckingFav] = useState(false)

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`https://fakestoreapi.com/products/${id}`)
        const data = await res.json()
        setProduct(data)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchProduct()
    }
  }, [id])

  useEffect(() => {
    if (user && product) {
      checkFavoriteStatus()
    }
  }, [user, product])

  async function checkFavoriteStatus() {
    if (!user || !product) return
    try {
      setCheckingFav(true)
      const favStatus = await favoritesService.isFavorited(user.uid, product.id)
      setIsFavorited(favStatus)
    } catch (error) {
      console.error("Error checking favorite status:", error)
    } finally {
      setCheckingFav(false)
    }
  }

  async function handleAddToCart() {
    if (!user) {
      toast.error("Bu amalni bajarish uchun tizimga kirishingiz kerak.")
      return
    }

    if (!product) return

    try {
      setAddingToCart(true)
      await cartService.addToCart(user.uid, {
        productId: product.id,
        quantity: 1,
        price: product.price,
        title: product.title,
        image: product.image,
      })
      toast.success("Mahsulot savatchaga qo‘shildi!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Mahsulotni savatchaga qo‘shib bo‘lmadi")
    } finally {
      setAddingToCart(false)
    }
  }

  async function handleToggleFavorite() {
    if (!user) {
      toast.error("Bu amalni bajarish uchun tizimga kirishingiz kerak.")
      return
    }

    if (!product) return

    try {
      setCheckingFav(true)
      if (isFavorited) {
        await favoritesService.removeFromFavorites(user.uid, product.id)
        setIsFavorited(false)
        toast.success("Sevimlilardan olib tashlandi")
      } else {
        await favoritesService.addToFavorites(user.uid, {
          productId: product.id,
          price: product.price,
          title: product.title,
          image: product.image,
        })
        setIsFavorited(true)
        toast.success("Sevimlilarga qo‘shildi!")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      if (!isFavorited) {
        toast.error("Sevimlilarga qo‘shib bo‘lmadi")
      }
    } finally {
      setCheckingFav(false)
    }
  }

  function handleBack() {
    router.back()
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Yuklanmoqda...</div>
  if (!product) return <div className="mt-50 text-center">Mahsulot topilmadi, iltimos keyinroq urinib ko‘ring!</div>

  return (
    <section className="text-gray-600 body-font overflow-hidden">
      <div className="max-w-7xl px-5 py-24 mx-auto">
        <button
          onClick={handleBack}
          className="button px-2 py-1 flex items-center gap-2 hover:bg-gray-100 rounded transition"
        >
          <ArrowLeft className="w-4 h-4 text-blue-500" />
          Orqaga
        </button>
        <div className="lg:w-4/5 mx-auto flex flex-wrap">
          <CustomImage product={product} className=" w-full lg:h-auto h-64 rounded" />
          <div className="lg:w-1/2 w-full lg:pl-10 lg:py-6 mt-6 lg:mt-0">
            <h2 className="text-sm title-font text-gray-500 tracking-widest">{product.category}</h2>
            <h1 className="text-gray-900 text-3xl title-font font-medium mb-1">{product.title}</h1>
            <div className="flex mb-4">
              <span className="flex items-center">
                {product.rating?.rate && (
                  <div className="flex items-center">
                    <ReactStars count={5} size={24} value={product.rating.rate} edit={false} color2={"#2196F3"} />
                  </div>
                )}

                <span className="text-gray-600 ml-2">
                  {product.rating?.rate} ({product.rating?.count} Sharh)
                </span>
              </span>
              <span className="flex ml-3 pl-3 py-2 border-l-2 border-gray-200 space-x-2s">
                <a className="text-gray-500 hover:text-blue-500 transition">
                  {/* icons */}
                </a>
              </span>
            </div>
            <p className="leading-relaxed">{product.description}</p>

            <div className="flex mt-6 items-center pb-5 border-b-2 border-gray-100 mb-5">
              <div className="flex">
                <span className="mr-3">Rang</span>
                <button className="border-2 border-gray-300 rounded-full w-6 h-6 focus:outline-none hover:border-blue-500 transition"></button>
                <button className="border-2 border-gray-300 ml-1 bg-gray-700 rounded-full w-6 h-6 focus:outline-none hover:border-blue-500 transition"></button>
                <button className="border-2 border-gray-300 ml-1 bg-blue-500 rounded-full w-6 h-6 focus:outline-none hover:border-blue-500 transition"></button>
              </div>
              <div className="flex ml-6 items-center">
                <span className="mr-3">O‘lcham</span>
                <div className="relative">
                  <select className="rounded border appearance-none border-gray-300 py-2 focus:outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-base pl-3 pr-10">
                    <option>Kichik (SM)</option>
                    <option>O‘rta (M)</option>
                    <option>Katta (L)</option>
                    <option>Juda katta (XL)</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex">
              <span className="title-font font-medium text-2xl text-gray-900">${product.price}</span>
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className="flex ml-auto text-white bg-blue-500 border-0 py-2 px-6 focus:outline-none hover:bg-blue-600 rounded disabled:bg-gray-400 transition"
              >
                {addingToCart ? "Qo‘shilmoqda..." : "Savatchaga qo‘shish"}
              </button>

              <button
                onClick={handleToggleFavorite}
                disabled={checkingFav}
                className={`rounded-full w-10 h-10 p-0 border-0 inline-flex items-center justify-center ml-4 transition ${
                  isFavorited ? "bg-red-200 text-red-600" : "bg-gray-200 text-gray-500 hover:bg-gray-300"
                } disabled:opacity-50`}
              >
                <Heart className="w-5 h-5" fill={isFavorited ? "currentColor" : "none"} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}