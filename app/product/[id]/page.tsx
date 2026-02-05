"use client"

import CustomImage from "@/components/image"
import { useAuth } from "@/contexts/auth-context"
import { useProduct } from "@/hooks/useProduct"
import { cartService } from "@/lib/cart-service"
import { favoritesService } from "@/lib/favorite-service"
import { formatPrice } from "@/lib/utils"
import { ArrowLeft, Heart, Share2 } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { toast } from 'sonner' 

export default function ProductDetailedPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const router = useRouter()
  const { data: product, loading, error } = useProduct(id)
  const [addingToCart, setAddingToCart] = useState(false)
  const [isFavorited, setIsFavorited] = useState(false)
  const [checkingFav, setCheckingFav] = useState(false)

  const [selectedSize, setSelectedSize] = useState<{ value: string; priceDiff: number } | null>(null)
  const [selectedColor, setSelectedColor] = useState<{ value: string; priceDiff: number } | null>(null)

  useEffect(() => {
    if (!product) return
    const sizes = product.variants?.sizes || []
    const colors = product.variants?.colors || []
    setSelectedSize(sizes.length ? sizes[0] : null)
    setSelectedColor(colors.length ? colors[0] : null)
  }, [product])

  const finalPriceNumber = useMemo(() => {
    const base = Number(product?.basePrice || product?.price || 0)
    const sizeDiff = selectedSize?.priceDiff || 0
    const colorDiff = selectedColor?.priceDiff || 0
    return base + sizeDiff + colorDiff
  }, [product, selectedSize, selectedColor])

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
      const selectedDescParts = []
      if (selectedSize) selectedDescParts.push(selectedSize.value)
      if (selectedColor) selectedDescParts.push(selectedColor.value)
      const titleWithVariants = selectedDescParts.length ? `${product.title} — ${selectedDescParts.join(' / ')}` : product.title

      const variantKey = `size:${selectedSize?.value || ''}|color:${selectedColor?.value || ''}`
      await cartService.addToCart(user.uid, {
        productId: product.id,
        variantKey,
        quantity: 1,
        price: finalPriceNumber,
        title: titleWithVariants,
        image: product.imageUrl || product.image || '',
      })
      toast.success("Mahsulot savatchaga qo'shildi!")
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast.error("Mahsulotni savatchaga qo'shib bo'lmadi")
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
          image: product.imageUrl || product.image || '',
        })
        setIsFavorited(true)
        toast.success("Sevimlilarga qo'shildi!")
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
      if (!isFavorited) {
        toast.error("Sevimlilarga qo'shib bo'lmadi")
      }
    } finally {
      setCheckingFav(false)
    }
  }

  function handleBack() {
    router.back()
  }

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">Yuklanmoqda...</p>
      </div>
    </div>
  )
  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-destructive font-semibold mb-2">Xatolik yuz berdi</p>
        <p className="text-muted-foreground">{error}</p>
      </div>
    </div>
  )
  if (!product) return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-muted-foreground">Mahsulot topilmadi</p>
        <p className="text-sm text-muted-foreground mt-2">Iltimos keyinroq urinib ko'ring!</p>
      </div>
    </div>
  )

  const colors = product.variants?.colors || []
  const sizes = product.variants?.sizes || []

  return (
    <section className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Back Button */}
        <button
          onClick={handleBack}
          className="inline-flex items-center gap-2 text-foreground hover:text-primary transition-colors mb-6 font-medium text-sm"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Orqaga</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-12">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="bg-secondary rounded-2xl overflow-hidden border border-border aspect-square lg:sticky lg:top-6">
              <CustomImage 
                product={product} 
                className="w-full h-full object-cover object-center"
              />
            </div>
          </div>

          {/* Details Section */}
          <div className="flex flex-col gap-6">
            {/* Brand & Category */}
            {product.brand && (
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                  {product.brand}
                </p>
              </div>
            )}

            {/* Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
                {product.title}
              </h1>
            </div>
            {/* Description */}
            {product.desc && (
              <p className="text-foreground leading-relaxed text-sm sm:text-base">
                {product.desc}
              </p>
            )}

            {/* Specs Section */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-5 border border-primary/20">
                <h3 className="font-bold text-foreground mb-4 text-sm uppercase tracking-wider">Technical Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  {product.specs.model && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Model</p>
                      <p className="font-semibold text-foreground">{product.specs.model}</p>
                    </div>
                  )}
                  {product.specs.display && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Display</p>
                      <p className="font-semibold text-foreground">{product.specs.display}</p>
                    </div>
                  )}
                  {product.specs.processor && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Processor</p>
                      <p className="font-semibold text-foreground">{product.specs.processor}</p>
                    </div>
                  )}
                  {product.specs.camera && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Camera</p>
                      <p className="font-semibold text-foreground">{product.specs.camera}</p>
                    </div>
                  )}
                  {product.specs.battery && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Battery</p>
                      <p className="font-semibold text-foreground">{product.specs.battery}</p>
                    </div>
                  )}
                  {product.specs.warranty && (
                    <div>
                      <p className="text-xs text-muted-foreground font-semibold mb-1">Warranty</p>
                      <p className="font-semibold text-foreground">{product.specs.warranty}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Extra Information */}
            {product.extra && (
              <div className="bg-secondary rounded-xl p-4 border border-border">
                <h3 className="font-semibold text-foreground mb-3 text-sm">Qo'shimcha ma'lumot</h3>
                <div className="space-y-2">
                  {product.extra.material && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Material:</span>
                      <span className="font-medium text-foreground">{product.extra.material}</span>
                    </div>
                  )}
                  {product.extra.Qalinligi && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Qalinligi:</span>
                      <span className="font-medium text-foreground">{product.extra.Qalinligi}</span>
                    </div>
                  )}
                  {Object.entries(product.extra).map(([key, value]) => {
                    if (key !== 'material' && key !== 'Qalinligi' && typeof value === 'string') {
                      return (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="text-muted-foreground capitalize">{key}:</span>
                          <span className="font-medium text-foreground">{value}</span>
                        </div>
                      )
                    }
                    return null
                  })}
                </div>
              </div>
            )}

            {/* Variants */}
            <div className="space-y-6">
              {/* Colors */}
              {colors.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Rang
                    {selectedColor && selectedColor.priceDiff > 0 && (
                      <span className="text-primary ml-2">
                        +{formatPrice(selectedColor.priceDiff)}
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {colors.map((c) => (
                      <button
                        key={c.value}
                        onClick={() => setSelectedColor(c)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border-2 ${
                          selectedColor?.value === c.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-foreground hover:border-primary/50 hover:bg-secondary'
                        }`}
                      >
                        {c.value}
                        {c.priceDiff > 0 && (
                          <span className="text-xs ml-1 opacity-75">
                            +{formatPrice(c.priceDiff)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Sizes */}
              {sizes.length > 0 && (
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    O'lcham
                    {selectedSize && selectedSize.priceDiff > 0 && (
                      <span className="text-primary ml-2">
                        +{formatPrice(selectedSize.priceDiff)}
                      </span>
                    )}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((s) => (
                      <button
                        key={s.value}
                        onClick={() => setSelectedSize(s)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-all border-2 ${
                          selectedSize?.value === s.value
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border text-foreground hover:border-primary/50 hover:bg-secondary'
                        }`}
                      >
                        {s.value}
                        {s.priceDiff > 0 && (
                          <span className="text-xs ml-1 opacity-75">
                            +{formatPrice(s.priceDiff)}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Price & Actions */}
            <div className="space-y-5 pt-6 border-t border-border">
              <div>
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                  Price
                </p>
                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-black text-primary">
                    {formatPrice(finalPriceNumber)}
                  </span>
                  {finalPriceNumber !== (product.basePrice || product.price) && (
                    <span className="text-sm text-muted-foreground line-through">
                      {formatPrice(Number(product.basePrice || product.price))}
                    </span>
                  )}
                </div>
                {product.quantity && (
                  <p className="text-xs text-muted-foreground mt-2">
                    {product.quantity} units in stock
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                  className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-3.5 px-6 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-base shadow-lg hover:shadow-xl active:scale-95"
                >
                  {addingToCart ? "Qo'shilyapti..." : "Savatchaga qo'shish"}
                </button>

                <button
                  onClick={handleToggleFavorite}
                  disabled={checkingFav}
                  className={`px-5 py-3.5 rounded-xl font-bold transition-all duration-200 border-2 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed ${
                    isFavorited
                      ? "border-red-400 bg-red-50 text-red-600 hover:bg-red-100 hover:border-red-500 shadow-md"
                      : "border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/5"
                  }`}
                >
                  <Heart 
                    className="w-5 h-5" 
                    fill={isFavorited ? "currentColor" : "none"}
                  />
                </button>

                <button
                  className="px-5 py-3.5 rounded-xl font-bold transition-all duration-200 border-2 border-border text-foreground hover:border-primary hover:text-primary hover:bg-primary/5 flex items-center justify-center"
                >
                  <Share2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}