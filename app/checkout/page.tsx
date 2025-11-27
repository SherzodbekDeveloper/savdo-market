"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ArrowLeft, MapPin, Phone, Mail } from "lucide-react"
import Link from "next/link"
import { cartService } from "@/lib/cart-service"
import type { CartItem } from "@/types"
import { db } from "@/lib/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { toast } from 'sonner'

interface ShippingInfo {
	firstName: string
	lastName: string
	email: string
	phone: string
	address: string
	city: string
	postalCode: string
	country: string
}

interface OrderData {
	userId: string
	items: CartItem[]
	shippingInfo: ShippingInfo
	totalPrice: number
	paymentMethod: string
	status: string
	createdAt: any
}

export default function CheckoutPage() {
	const { user, loading: authLoading } = useAuth()
	const router = useRouter()
	const [cartItems, setCartItems] = useState<CartItem[]>([])
	const [loading, setLoading] = useState(true)
	const [processing, setProcessing] = useState(false)
	const [paymentMethod, setPaymentMethod] = useState("card")
	const [shippingInfo, setShippingInfo] = useState<ShippingInfo>({
		firstName: "",
		lastName: "",
		email: user?.email || "",
		phone: "",
		address: "",
		city: "",
		postalCode: "",
		country: "Uzbekistan",
	})

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

			// Pre-fill user email
			setShippingInfo((prev) => ({
				...prev,
				email: user.email || "",
			}))

			return () => unsubscribe()
		}
	}, [user, authLoading, router])

	const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const { name, value } = e.target
		setShippingInfo((prev) => ({
			...prev,
			[name]: value,
		}))
	}

	const validateForm = () => {
		const requiredFields = ["firstName", "lastName", "email", "phone", "address", "city", "postalCode", "country"]
		return requiredFields.every((field) => shippingInfo[field as keyof ShippingInfo]?.trim())
	}

	const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)

	if (authLoading || loading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p>Yuklanmoqda...</p>
			</div>
		)
	}

	const handlePlaceOrder = async () => {
		if (!user) {
			toast.error("Buyurtma berish uchun iltimos tizimga kiring")
			return
		}

		if (!validateForm()) {
			toast.error("Iltimos, yetkazish ma'lumotlarini to‘liq kiriting")
			return
		}

		setProcessing(true)

		try {
			const orderData: OrderData = {
				userId: user.uid,
				items: cartItems,
				shippingInfo,
				totalPrice,
				paymentMethod,
				status: "pending",
				createdAt: serverTimestamp(),
			}

			const orderRef = await addDoc(collection(db, "users", user.uid, "orders"), orderData)

			for (const item of cartItems) {
				await cartService.removeFromCart(user.uid, item.productId)
			}

			toast.success("Buyurtma muvaffaqiyatli berildi! Buyurtma ID: " + orderRef.id)

			router.push(`/order-confirmation/${orderRef.id}`)
		} catch (error) {
			console.error("Buyurtma berishda xatolik:", error)
			toast.error("Buyurtma berishda xatolik yuz berdi. Iltimos, qayta urinib ko‘ring.")
		} finally {
			setProcessing(false)
		}
	}


	if (!user) {
		return null
	}

	return (
		<div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
			<div className="max-w-7xl mx-auto">
				<Link href="/cart" className="flex items-center gap-2 text-blue-600 mb-6">
					<ArrowLeft className="w-4 h-4" />
					Savatga qaytish
				</Link>

				<h1 className="text-3xl font-bold mb-8">To‘lov sahifasi</h1>

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
					
					<div className="lg:col-span-2 space-y-8">
						<div className="bg-white rounded-lg shadow p-6">
							<div className="flex items-center gap-2 mb-4">
								<MapPin className="w-5 h-5 text-blue-600" />
								<h2 className="text-xl font-bold">Yetkazish ma’lumotlari</h2>
							</div>

							<form className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Ism</label>
										<input
											type="text"
											name="firstName"
											value={shippingInfo.firstName = user.firstName}
											onChange={handleShippingChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Familiya</label>
										<input
											type="text"
											name="lastName"
											value={shippingInfo.lastName = user.lastName}
											onChange={handleShippingChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
											<Mail className="w-4 h-4" /> Email
										</label>
										<input
											type="email"
											name="email"
											value={shippingInfo.email = user.email}
											onChange={handleShippingChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
											<Phone className="w-4 h-4" /> Telefon
										</label>
										<input
											type="tel"
											name="phone"
											value={shippingInfo.phone = user.phone}
											onChange={handleShippingChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Manzil</label>
									<input
										type="text"
										name="address"
										value={shippingInfo.address}
										onChange={handleShippingChange}
										className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										required
									/>
								</div>

								<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Shahar</label>
										<input
											type="text"
											name="city"
											value={shippingInfo.city}
											onChange={handleShippingChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Pochta indeksi</label>
										<input
											type="text"
											name="postalCode"
											value={shippingInfo.postalCode}
											onChange={handleShippingChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
											required
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">Mamlakat</label>
										<select
											name="country"
											value={shippingInfo.country}
											onChange={handleShippingChange}
											className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
										>
											<option>O‘zbekiston</option>
											<option>Afg‘oniston</option>
											<option>Qozog‘iston</option>
											<option>Qirg‘iziston</option>
											<option>Tojikiston</option>
											<option>Turkmaniston</option>
										</select>
									</div>
								</div>
							</form>
						</div>

						{/* Payment Method */}
						<div className="bg-white rounded-lg shadow p-6">
							<h2 className="text-xl font-bold mb-4">To‘lov usuli</h2>

							<div className="space-y-3">
								<label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
									<input
										type="radio"
										name="payment"
										value="card"
										checked={paymentMethod === "card"}
										onChange={(e) => setPaymentMethod(e.target.value)}
										className="w-4 h-4"
									/>
									<span className="ml-3 font-medium">Kredit/Debet karta</span>
								</label>

								<label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
									<input
										type="radio"
										name="payment"
										value="bank_transfer"
										checked={paymentMethod === "bank_transfer"}
										onChange={(e) => setPaymentMethod(e.target.value)}
										className="w-4 h-4"
									/>
									<span className="ml-3 font-medium">Bank o‘tkazmasi</span>
								</label>

								<label className="flex items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
									<input
										type="radio"
										name="payment"
										value="cash_on_delivery"
										checked={paymentMethod === "cash_on_delivery"}
										onChange={(e) => setPaymentMethod(e.target.value)}
										className="w-4 h-4"
									/>
									<span className="ml-3 font-medium">Naqd to‘lov</span>
								</label>
							</div>
						</div>
					</div>

				
					<div className="bg-white rounded-lg shadow p-6 h-fit sticky top-24">
						<h2 className="text-xl font-bold mb-4">Buyurtma qisqacha</h2>

						<div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
							{cartItems.map((item) => (
								<div key={item.productId} className="flex justify-between text-sm">
									<span className="text-gray-600">{item.title.substring(0, 30)}...</span>
									<span className="font-medium">${(item.price * item.quantity).toFixed(2)}</span>
								</div>
							))}
						</div>

						<div className="border-t space-y-2 pt-4 mb-6">
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Jami</span>
								<span>${totalPrice.toFixed(2)}</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Yetkazish</span>
								<span className="text-green-600 font-medium">Bepul</span>
							</div>
							<div className="flex justify-between text-sm">
								<span className="text-gray-600">Soliq</span>
								<span>${(totalPrice * 0.12).toFixed(2)}</span>
							</div>
							<div className="border-t pt-2 flex justify-between font-bold text-lg">
								<span>Umumiy</span>
								<span>${(totalPrice + totalPrice * 0.12).toFixed(2)}</span>
							</div>
						</div>

						<button
							onClick={handlePlaceOrder}
							disabled={processing}
							className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors font-semibold"
						>
							{processing ? "Jarayon davom etmoqda..." : "Buyurtmani joylashtirish"}
						</button>
					</div>
				</div>
			</div>
		</div>
	)

}
