"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

const CONSENT_KEY = "equalizer_cookie_consent"

function updateGtmConsent(granted: boolean) {
  if (typeof window === "undefined") return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push("consent", "update", {
    analytics_storage: granted ? "granted" : "denied",
    ad_storage: granted ? "granted" : "denied",
    ad_user_data: granted ? "granted" : "denied",
    ad_personalization: granted ? "granted" : "denied",
  })
}

export function CookieBanner() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem(CONSENT_KEY)
    if (!consent) {
      setShow(true)
    } else if (consent === "granted") {
      updateGtmConsent(true)
    }
  }, [])

  const accept = () => {
    localStorage.setItem(CONSENT_KEY, "granted")
    updateGtmConsent(true)
    setShow(false)
  }

  const decline = () => {
    localStorage.setItem(CONSENT_KEY, "denied")
    updateGtmConsent(false)
    setShow(false)
  }

  if (!show) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur p-4">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <p className="text-sm text-muted-foreground flex-1">
          We use cookies for analytics and ad conversion measurement. No personalised ads.{" "}
          <Link href="/privacy-policy" className="text-primary hover:underline">
            Privacy policy
          </Link>
        </p>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={decline}>
            Decline
          </Button>
          <Button size="sm" onClick={accept}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  )
}
