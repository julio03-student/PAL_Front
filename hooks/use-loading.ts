"use client"

import { useState, useCallback } from "react"

export function useLoading() {
  const [isLoading, setIsLoading] = useState(false)

  const withLoading = useCallback(async (fn) => {
    setIsLoading(true)
    try {
      const result = await fn()
      return result
    } catch (error) {
      console.error("Error during loading:", error)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  return { isLoading, withLoading }
}
