"use client"

import ProductItem from "@/components/productItem"
import { useProducts } from "@/hooks/useProduct"

function CardsSection() {
  const { data: products, loading, error } = useProducts()

  if (loading) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-8 xl:px-0 mt-52">
        <div className="flex flex-col space-y-12">
          <h1 className="text-5xl font-bold text-center">DO‘KONIMIZ TAKLIFLARI</h1>
          <div className="grid md:grid-cols-4 grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-96 bg-gray-200 rounded-2xl animate-pulse" />
            ))}
          </div>
        </div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="min-h-screen max-w-7xl mx-auto px-8 xl:px-0 mt-52">

        <div className="flex flex-col space-y-12">
          <h1 className="text-5xl font-bold text-center">DO‘KONIMIZ TAKLIFLARI</h1>
          <div className="text-center text-red-600">Mahsulotlarni yuklashda xatolik: {error}</div>
        </div>

      </main>
    )
  }

  return (
    <main  className="min-h-screen max-w-7xl mx-auto px-8 xl:px-0 mt-52">
      <section id='takliflar'>
        <div className="flex flex-col space-y-12" >
          <h1 className="text-5xl font-bold text-center">DO‘KONIMIZ TAKLIFLARI</h1>
          <div className="grid md:grid-cols-4 grid-cols-1 sm:grid-cols-2 gap-4">
            {products?.map((item) => (
              <ProductItem key={item.id} item={item} />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}

export default CardsSection
