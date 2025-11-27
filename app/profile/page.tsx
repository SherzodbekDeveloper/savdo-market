"use client"

import type React from "react"

import { useState } from "react"
import { useAuth } from "@/contexts/auth-context"
import { useRouter } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function ProfilePage() {
  const { user, loading, logout, updateProfile, error } = useAuth()
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    phone: user?.phone || "",
    age: user?.age?.toString() || "",
  })
  const [updateError, setUpdateError] = useState<string | null>(null)
  const [updateLoading, setUpdateLoading] = useState(false)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Yuklanmoqda...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 mt-12">
        <p className="text-lg">Siz tizimga kirmagansiz</p>
        <Link href="/auth/login" className="text-blue-600 hover:text-blue-700">
          Kirish sahifasiga o‘tish
        </Link>
      </div>
    )
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setUpdateError(null)
    setUpdateLoading(true)

    try {
      await updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        age: Number.parseInt(formData.age),
      })
      setIsEditing(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : "Yangilashda xatolik yuz berdi"
      setUpdateError(message)
    } finally {
      setUpdateLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
      router.push("/")
    } catch (err) {
      console.error("Chiqish xatosi:", err)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-blue-600 mb-6">
          <ArrowLeft className="w-4 h-4" />
          Bosh sahifaga qaytish
        </Link>

        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold mb-6">Mening Profilim</h1>

          {(error || updateError) && (
            <div className="rounded-md bg-red-50 p-4 mb-4">
              <p className="text-sm text-red-700">{error || updateError}</p>
            </div>
          )}

          {isEditing ? (
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Ism</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Familiya</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Telefon</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Yosh</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-3 py-2 border"
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={updateLoading}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {updateLoading ? "Saqlanmoqda..." : "O‘zgarishlarni saqlash"}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="flex-1 bg-gray-300 text-gray-900 py-2 rounded-md hover:bg-gray-400"
                >
                  Bekor qilish
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Ism</p>
                  <p className="text-lg font-medium">{user.firstName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Familiya</p>
                  <p className="text-lg font-medium">{user.lastName}</p>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="text-lg font-medium">{user.email}</p>
              </div>

              <div>
                <p className="text-sm text-gray-600">Telefon</p>
                <p className="text-lg font-medium">{user.phone || "-"}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Yosh</p>
                  <p className="text-lg font-medium">{user.age || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Hudud</p>
                  <p className="text-lg font-medium">{user.region}</p>
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
                >
                  Profilni tahrirlash
                </button>
                 <button
                  onClick={() => router.push('/order-history')}
                  className="flex-1 bg-yellow-500 text-white py-2 rounded-md hover:bg-yellow-600"
                >
                  Buyurtmalar tarixi
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-red-600 text-white py-2 rounded-md hover:bg-red-700"
                >
                  Chiqish
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
