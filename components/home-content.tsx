"use client"

import { useState, useEffect } from "react"
import { AuditForm } from "@/components/audit-form"
import { AuditResults } from "@/components/audit-results"
import { EmailGate } from "@/components/email-gate"
import type { AuditResult } from "@/app/api/audit/route"
import { AlertCircle } from "lucide-react"

interface HomeContentProps {
  initialUrl: string
  initialResult?: AuditResult
  initialError?: string
  hasEmailCookie: boolean
}

export function HomeContent({ 
  initialUrl, 
  initialResult, 
  initialError,
  hasEmailCookie 
}: HomeContentProps) {
  const [hasAccess, setHasAccess] = useState(hasEmailCookie)
  const [showGate, setShowGate] = useState(!hasEmailCookie)

  // Check cookie on mount (in case SSR missed it)
  useEffect(() => {
    if (hasEmailCookie) {
      setHasAccess(true)
      setShowGate(false)
    }
  }, [hasEmailCookie])

  const handleEmailSuccess = () => {
    setHasAccess(true)
    setShowGate(false)
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12 print:mb-6">
          <div className="inline-flex items-center gap-2 mb-5">
            {/* Equalizer icon: vertical bars */}
            <div className="flex items-end gap-0.5 h-8">
              {[3, 5, 7, 5, 3].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-sm bg-primary"
                  style={{ height: `${h * 4}px` }}
                />
              ))}
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground mb-3 tracking-tight text-balance">
            The <span className="text-primary">Equalizer</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto text-pretty">
            Enter any URL. See exactly what's holding it back.
          </p>
        </div>

        {/* Email Gate */}
        {showGate && (
          <div className="mb-8">
            <EmailGate onSuccess={handleEmailSuccess} />
          </div>
        )}

        {/* Main Content - only show if user has access */}
        {hasAccess && (
          <>
            {/* Audit Form */}
            <div className="mb-8 print:hidden">
              <AuditForm initialUrl={initialUrl} />
            </div>

            {/* Error */}
            {initialError && (
              <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-destructive">Error</div>
                  <div className="text-sm text-foreground">{initialError}</div>
                </div>
              </div>
            )}

            {/* Results */}
            {initialResult && <AuditResults result={initialResult} />}

            {/* Empty State */}
            {!initialResult && !initialError && (
              <div className="text-center py-16">
                <div className="flex items-end gap-1 h-12 justify-center mb-4">
                  {[3, 5, 7, 5, 3].map((h, i) => (
                    <div
                      key={i}
                      className="w-4 rounded-sm bg-secondary"
                      style={{ height: `${h * 5}px` }}
                    />
                  ))}
                </div>
                <div className="text-lg font-medium text-foreground mb-2">Ready to Audit</div>
                <div className="text-sm text-muted-foreground max-w-md mx-auto">
                  Enter a website URL above to analyse its SEO. Check meta tags, headings, schema,
                  social previews, robots.txt, sitemap, and page speed.
                </div>
              </div>
            )}
          </>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center print:mt-6">
          <p className="text-sm text-muted-foreground">
            The Equalizer by{" "}
            <a
              href="https://www.rebelmarketer.co.uk"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline font-medium"
            >
              Rebel Marketer
            </a>
          </p>
        </footer>
      </div>
    </main>
  )
}
