"use client"

import { useAuth } from "@/contexts/auth-context"
import { db } from "@/lib/firebase"
import { formatPrice } from "@/lib/utils"
import type { Order } from "@/types"
import { collection, getDocs, query } from "firebase/firestore"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function OrderHistoryPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
      return
    }

    if (user) {
      fetchOrders()
    }
  }, [user, authLoading, router])

  const fetchOrders = async () => {
    if (!user) return

    try {
      setLoading(true)
      const ordersRef = collection(db, "users", user.uid, "orders")
      const querySnapshot = await getDocs(query(ordersRef))

      const ordersList: Order[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        ordersList.push({
          orderId: doc.id,
          userId: user.uid,
          items: data.items || [],
          totalPrice: data.totalPrice || 0,
          status: data.status || "pending",
          createdAt: data.createdAt?.toDate() || new Date(),
          shippingAddress: data.shippingAddress || "",
        })
      })

      setOrders(ordersList.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    } catch (error) {
      console.error("Error fetching orders:", error)
    } finally {
      setLoading(false)
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
          <h1 className="text-3xl font-bold mb-6">Buyurtmalar tarixi</h1>

          {orders.length === 0 ? (
            <p className="text-gray-600 text-center py-8">Hozircha buyurtmalar mavjud emas</p>
          ) : (
            <div className="space-y-4">
              {orders.map((order) => (
                <Link key={order.orderId} href={`order-confirmation/${order.orderId}`}>
                  <div className="border rounded-lg p-4 hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-semibold">Buyurtma {order.orderId}</p>
                        <p className="text-sm text-gray-600">{order.createdAt.toLocaleDateString()}</p>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : order.status === "cancelled"
                            ? "bg-red-100 text-red-800"
                            : "bg-yellow-100 text-yellow-800"
                          }`}
                      >
                        {order.status === "completed"
                          ? "Yakunlangan"
                          : order.status === "cancelled"
                            ? "Bekor qilingan"
                            : "Kutilmoqda"}
                      </span>
                    </div>

                    <div className="mt-3 space-y-1 text-sm">
                      <p>Mahsulotlar soni: {order.items.length}</p>
                      <p className="font-semibold">Jami: {formatPrice(order.totalPrice)}</p>
                      {order.shippingAddress && (
                        <p className="text-gray-600">Manzil: {order.shippingAddress}</p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
