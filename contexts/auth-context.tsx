"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { auth, db } from "@/lib/firebase"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "firebase/auth"
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore"
import type { User, AuthContextType } from "@/types"

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Get user data from Firestore
          const userRef = doc(db, "users", firebaseUser.uid)
          const userSnap = await getDoc(userRef)

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
          setUser(null)
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

  const signup = async (email: string, password: string, userData: Partial<User>) => {
    try {
      setError(null)
      setLoading(true)

      // Create auth user
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)

      // Create user document in Firestore with all profile fields
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

      // Initialize empty subcollections with metadata
      await setDoc(doc(db, "users", firebaseUser.uid, "cart", "_metadata"), {
        createdAt: new Date(),
      })
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
