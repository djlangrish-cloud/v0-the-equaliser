"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface EmailGateProps {
  onUnlocked: () => void
  popup?: boolean
}

export function EmailGate({ onUnlocked, popup = false }: EmailGateProps) {
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

      localStorage.setItem("equalizer_email", email)
      onUnlocked()
    } catch {
      setError("Failed to submit. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (popup) {
    return (
      <div className="flex flex-col gap-1 text-center">
        <div className="flex items-end justify-center gap-0.5 h-6 mb-3">
          {[3, 5, 7, 5, 3].map((h, i) => (
            <div
              key={i}
              className="w-1.5 rounded-sm bg-primary"
              style={{ height: `${h * 3}px` }}
            />
          ))}
        </div>
        <h2 className="text-xl font-bold text-foreground">Sign up to keep using</h2>
        <p className="text-muted-foreground text-sm mb-4">
          It&apos;s free — no card required. Just an email so we can keep the lights on.
        </p>
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <Input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="bg-input text-center"
          />
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? <Spinner className="mr-2" /> : null}
            {isLoading ? "Signing up..." : "Get free access"}
          </Button>
          <p className="text-xs text-muted-foreground">
            No spam. Unsubscribe anytime.
          </p>
        </form>
      </div>
    )
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
