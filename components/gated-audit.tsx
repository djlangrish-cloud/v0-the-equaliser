"use client"

import { useState, useEffect, useRef } from "react"
import { EmailGate } from "./email-gate"
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog"

interface GatedAuditProps {
  children: React.ReactNode
  auditUrl?: string
}

const FREE_LIMIT = 3
const STORAGE_KEY_EMAIL = "equalizer_email"
const STORAGE_KEY_USES = "equalizer_uses"

export function GatedAudit({ children, auditUrl }: GatedAuditProps) {
  const [ready, setReady] = useState(false)
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [showGate, setShowGate] = useState(false)
  const prevAuditUrl = useRef<string | undefined>(undefined)

  useEffect(() => {
    const email = localStorage.getItem(STORAGE_KEY_EMAIL)
    if (email) {
      setIsUnlocked(true)
      setReady(true)
      return
    }

    let count = parseInt(localStorage.getItem(STORAGE_KEY_USES) || "0", 10)

    // Increment on each new audit URL (not on re-renders of the same URL)
    if (auditUrl && auditUrl !== prevAuditUrl.current) {
      prevAuditUrl.current = auditUrl
      count += 1
      localStorage.setItem(STORAGE_KEY_USES, String(count))
    }

    // Show popup if they've exceeded free uses
    setShowGate(count > FREE_LIMIT || (!auditUrl && count >= FREE_LIMIT))
    setReady(true)
  }, [auditUrl])

  if (!ready) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="flex items-end gap-1 h-12">
          {[3, 5, 7, 5, 3].map((h, i) => (
            <div
              key={i}
              className="w-3 rounded-sm bg-primary animate-pulse"
              style={{
                height: `${h * 4}px`,
                animationDelay: `${i * 100}ms`,
              }}
            />
          ))}
        </div>
      </div>
    )
  }

  return (
    <>
      {children}
      <Dialog
        open={showGate && !isUnlocked}
        onOpenChange={() => {}}
      >
        <DialogContent
          showCloseButton={false}
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
          className="max-w-md"
        >
          <EmailGate
            popup
            onUnlocked={() => {
              setIsUnlocked(true)
              setShowGate(false)
            }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
