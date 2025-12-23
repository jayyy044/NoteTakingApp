"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function Home() {
  const router = useRouter()

  useEffect(() => {
    const randomId = Math.random().toString(36).substring(2, 15)
    router.push(`/editor/${randomId}`)
  }, [router])

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh" }}>
      <p>Redirecting to new document...</p>
    </div>
  )
}
