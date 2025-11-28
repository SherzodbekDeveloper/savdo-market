"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import type { User, AuthContextType } from "@/types"


// Context yaratiladigan qismi. Context bu loyihada global state boshqarish
const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {

    // Bu saytga kirganda faqat 1 marta ishlaydi agar user da o'zgarish bolsa faqat shu callback ichidagi kod ishlaydi
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {

          // User malumotlarini firebase dan ovolish qismi.
          //Agar firebaseUser bolsa users fieldidan firebaseUser.uid ga teng foydalanuvchi malumotini ol deyabmiz.
          const userRef = doc(db, "users", firebaseUser.uid)

          const userSnap = await getDoc(userRef)
          // agar user ni malumotlari yaratilgan bolsa quyidagi malumotlarni olib kel deyabmiz agar bolmasa defualt "" yoki 0 saqlanadi.
          if (userSnap.exists()) {
            const userData = userSnap.data()
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              firstName: userData.firstName || "",
              lastName: userData.lastName || "",
              phone: userData.phone || "",
              age: userData.age || 0,
              region: userData.region || "",
              createdAt: userData.createdAt?.toDate() || new Date(),
              updatedAt: userData.updatedAt?.toDate() || new Date(),
            })
          }
        } else {
          setUser(null) // aks xolda null qaytar deyabmiz
        }
        setError(null)
      } catch (err) {
        console.error("Auth state error:", err)
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])


  //Partial<User> -> hamma maydonlar majburiy emas (firstName yo phone bo‘lmasligi mumkin).
  const signup = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setError(null)
      setLoading(true)

      // User yaratish
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      // Userni barcha kerakli bolgan profile documentlar bilan yaratish
      await setDoc(doc(db, "users", firebaseUser.uid), {
        email: firebaseUser.email,
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        phone: userData.phone || "",
        age: userData.age || 0,
        region: userData.region || "Uzbekistan",
        createdAt: new Date(),
        updatedAt: new Date(),
      })

      // Userni ichidan cart fieldini yaratyabmiz.
      //_metadata → bu faqat papkani boshida yaratish uchun ishlatiladi.
      //Chunki Firestore papka ("subcollection") ni bo‘sh holda yaratmaydi. 
      // Ichiga hech bo‘lmasa 1 ta document kerak.

      await setDoc(doc(db, "users", firebaseUser.uid, "cart", "_metadata"), {
        createdAt: new Date(),
      })
      // Bu ham cart bilan bir xil
      await setDoc(doc(db, "users", firebaseUser.uid, "favorites", "_metadata"), {
        createdAt: new Date(),
      })
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Signup failed"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)
      // firebase orqali login qilish, bu firebase ga email password ni yuboradi agar togri bolsa user tizimga kiradi.
      await signInWithEmailAndPassword(auth, email, password)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Login failed"
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
      setUser(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Logout failed"
      setError(errorMessage)
      throw err
    }
  }

  const updateProfile = async (userData: Partial<User>) => {
    try {
      setError(null)
      if (!user) throw new Error("No user logged in")

      await updateDoc(doc(db, "users", user.uid), {
        ...userData,
        updatedAt: new Date(),
      })

      // Update local state
      setUser((prev) => (prev ? { ...prev, ...userData, updatedAt: new Date() } : null))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Update failed"
      setError(errorMessage)
      throw err
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, error, signup, login, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
