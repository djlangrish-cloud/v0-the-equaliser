"use client"

import { useState, useEffect } from "react"
import { EmailGate } from "./email-gate"

interface GatedAuditProps {
  children: React.ReactNode
}

export function GatedAudit({ children }: GatedAuditProps) {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null)

  useEffect(() => {
    // Check if user has already entered their email
    const email = localStorage.getItem("equalizer_email")
    setIsUnlocked(!!email)
  }, [])

  // Show nothing while checking (prevents flash)
  if (isUnlocked === null) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-end gap-1 h-12">
          {[3, 5, 7, 5, 3].map((h, i) => (
            <div
              key={i}
              className="w-3 rounded-sm bg-primary animate-pulse"
              style={{ 
                height: `${h * 4}px`,
                animationDelay: `${i * 100}ms`
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  if (!isUnlocked) {
    return (
      <div className="py-8">
        <EmailGate onUnlocked={() => setIsUnlocked(true)} />
      </div>
    )
  }

  return <>{children}</>
}
