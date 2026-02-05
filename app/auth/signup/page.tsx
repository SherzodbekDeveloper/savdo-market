"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import Link from "next/link"

export default function SignupPage() {
  const router = useRouter()
  const { signup, loading, error: authError } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    phone: "",
    age: "",
    region: "Uzbekistan",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    
    if (formData.password !== formData.confirmPassword) {
      setError("Parollar bir xil emas")
      return
    }

    if (formData.password.length < 6) {
      setError("Parol kamida 6 ta belgidan iborat bo‘lishi kerak")
      return
    }

    if (!formData.firstName || !formData.lastName) {
      setError("Iltimos, barcha maydonlarni to‘ldiring")
      return
    }

    try {
      await signup(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        age: Number.parseInt(formData.age),
        region: formData.region,
        email: formData.email,
      })
      router.push("/")
    } catch (err) {
      const message = err instanceof Error ? err.message : "Ro‘yxatdan o‘tishda xatolik yuz berdi"
      setError(message)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 mt-12">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Hisob yarating</h2>
        </div>

        {(error || authError) && (
          <div className="rounded-md bg-red-50 p-4">
            <p className="text-sm text-red-700">{error || authError}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="text"
              name="firstName"
              placeholder="Ism"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              name="lastName"
              placeholder="Familiya"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <input
            type="email"
            name="email"
            placeholder="Email manzil"
            value={formData.email}
            onChange={handleChange}
            required
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="tel"
            name="phone"
            placeholder="Telefon raqam"
            value={formData.phone}
            onChange={handleChange}
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />

          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              name="age"
              placeholder="Yosh"
              value={formData.age}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="Uzbekistan">O‘zbekiston</option>
            </select>
          </div>

          <input
            type="password"
            name="password"
            placeholder="Parol"
            value={formData.password}
            onChange={handleChange}
            required
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Parolni tasdiqlang"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />

          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {loading ? "Hisob yaratilmoqda..." : "Ro‘yxatdan o‘tish"}
          </button>

          <p className="text-center text-sm text-gray-600">
            Hisobingiz bormi?{" "}
            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
              Kirish
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
