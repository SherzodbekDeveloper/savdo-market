"use client"

import { useState, useEffect } from "react"
import type { Item, FetchState } from "@/types"
import { fetchProducts, fetchProductById } from "@/lib/api"

export function useProducts(): FetchState<Item[]> {
  const [state, setState] = useState<FetchState<Item[]>>({
    data: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    const controller = new AbortController()
    ;(async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        const data = await fetchProducts()
        setState({ data, error: null, loading: false })
      } catch (error) {
        setState({
          data: null,
          error: error instanceof Error ? error.message : "An error occurred",
          loading: false,
        })
      }
    })()

    return () => controller.abort()
  }, [])

  return state
}

export function useProduct(id: string | string[] | undefined) {
  const [state, setState] = useState<FetchState<Item>>({
    data: null,
    error: null,
    loading: true,
  })

  useEffect(() => {
    if (!id) {
      setState({ data: null, error: "No product ID", loading: false })
      return
    }

    const controller = new AbortController()
    ;(async () => {
      try {
        setState((prev) => ({ ...prev, loading: true, error: null }))
        const data = await fetchProductById(id)
        setState({ data, error: null, loading: false })
      } catch (error) {
        setState({
          data: null,
          error: error instanceof Error ? error.message : "An error occurred",
          loading: false,
        })
      }
    })()

    return () => controller.abort()
  }, [id])

  return state
}
