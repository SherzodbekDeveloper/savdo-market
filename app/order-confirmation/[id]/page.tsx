"use client"

import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { formatPrice } from "@/lib/utils"
import { doc, getDoc } from "firebase/firestore"
import { CheckCircle, Home, Package, Truck } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { use, useEffect, useState } from "react"

interface OrderItem {
  title: string
  price: number
  quantity: number
  image?: string
}

interface OrderData {
  items: OrderItem[]
  totalPrice: number
  status: string
  shippingInfo: {
    firstName: string
    lastName: string
    address: string
    city: string
    postalCode: string
  }
  createdAt: any
}

export default function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user && resolvedParams.id) {
      const fetchOrder = async () => {
        try {
          const orderRef = doc(db, "users", user.uid, "orders", resolvedParams.id)
          const orderSnap = await getDoc(orderRef)

          if (orderSnap.exists()) {
            setOrder(orderSnap.data() as OrderData)
          } else {
            router.push("/")
          }
        } catch (error) {
          console.error("Buyurtma olishda xatolik:", error)
          router.push("/")
        } finally {
          setLoading(false)
        }
      }

      fetchOrder()
    }
  }, [user, authLoading, router, resolvedParams.id])

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yuklanmoqda...</p>
      </div>
    )
  }

  if (!order) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-2xl mx-auto">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <CheckCircle className="w-16 h-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Buyurtma tasdiqlandi!</h1>
          <p className="text-gray-600">Sizning xaridingiz uchun rahmat</p>
        </div>

        {/* Order ID */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <p className="text-sm text-gray-600">Buyurtma ID</p>
          <p className="text-2xl font-bold text-gray-900">{resolvedParams.id}</p>
        </div>

        {/* Order Timeline */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-6">Buyurtma holati</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <Package className="w-6 h-6 text-blue-600 mb-2" />
                <div className="w-1 h-12 bg-blue-200"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Buyurtma qabul qilindi</p>
                <p className="text-sm text-gray-600">Sizning buyurtmangiz qabul qilindi</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <Truck className="w-6 h-6 text-gray-400 mb-2" />
                <div className="w-1 h-12 bg-gray-200"></div>
              </div>
              <div>
                <p className="font-semibold text-gray-900">Jo‘natildi</p>
                <p className="text-sm text-gray-600">Tez orada yetkaziladi</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <Home className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Yetkazildi</p>
                <p className="text-sm text-gray-600">Tez orada yetkaziladi</p>
              </div>
            </div>
          </div>
        </div>

        {/* Order Details */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Buyurtma tafsilotlari</h2>
          <div className="space-y-3 mb-4">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm border-b pb-2">
                <span>
                  {item.title.substring(0, 40)}... x{item.quantity}
                </span>
                <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Jami</span>
              <span className="font-bold">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-bold mb-4">Yetkazish manzili</h2>
          <div className="text-gray-600 space-y-1">
            <p>
              {order.shippingInfo.firstName} {order.shippingInfo.lastName}
            </p>
            <p>{order.shippingInfo.address}</p>
            <p>
              {order.shippingInfo.city}, {order.shippingInfo.postalCode}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/order-history"
            className="flex-1 text-center bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Barcha buyurtmalarni ko‘rish
          </Link>
          <Link
            href="/"
            className="flex-1 text-center bg-gray-200 text-gray-900 py-3 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
          >
            Xaridni davom ettirish
          </Link>
        </div>
      </div>
    </div>
  )
}
