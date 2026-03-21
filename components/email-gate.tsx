"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface EmailGateProps {
  onUnlocked: () => void
}

export function EmailGate({ onUnlocked }: EmailGateProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const response = await fetch("/api/capture-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Something went wrong")
        return
      }

      // Store in localStorage so they don't have to enter again
      localStorage.setItem("equalizer_email", email)
      onUnlocked()
    } catch {
      setError("Failed to submit. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto border-border/50 bg-card/50 backdrop-blur">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Unlock The Equalizer</CardTitle>
        <CardDescription className="text-muted-foreground">
          Enter your email to get free access to our SEO audit tool
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-input"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Spinner className="mr-2" /> : null}
            {isLoading ? "Unlocking..." : "Get Free Access"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            No spam. Unsubscribe anytime.
          </p>
        </form>
      </CardContent>
    </Card>
  )
}
