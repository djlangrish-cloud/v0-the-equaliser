"use client"

import { useState } from "react"
import { AuditForm } from "@/components/audit-form"
import { AuditResults } from "@/components/audit-results"
import type { AuditResult } from "@/app/api/audit/route"
import { AlertCircle, Zap } from "lucide-react"

export default function Home() {
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleAudit = async (url: string) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to audit the page")
      }

      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-1.5 mb-4">
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-primary">Free SEO Analysis</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4 text-balance">
            SEO Audit Tool
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto text-pretty">
            Analyze any website for SEO issues, meta tags, schema markup, heading
            structure, and more.
          </p>
        </div>

        {/* Audit Form */}
        <div className="mb-8">
          <AuditForm onSubmit={handleAudit} isLoading={isLoading} />
        </div>

        {/* Error Display */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-destructive">Error</div>
              <div className="text-sm text-foreground">{error}</div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="relative">
              <div className="h-16 w-16 rounded-full border-4 border-secondary border-t-primary animate-spin" />
            </div>
            <div className="mt-6 text-lg font-medium text-foreground">
              Analyzing website...
            </div>
            <div className="text-sm text-muted-foreground mt-1">
              This may take a few seconds
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && <AuditResults result={result} />}

        {/* Empty State */}
        {!result && !isLoading && !error && (
          <div className="text-center py-16">
            <div className="h-16 w-16 mx-auto rounded-full bg-secondary flex items-center justify-center mb-4">
              <Zap className="h-8 w-8 text-primary" />
            </div>
            <div className="text-lg font-medium text-foreground mb-2">
              Ready to Audit
            </div>
            <div className="text-sm text-muted-foreground max-w-md mx-auto">
              Enter a website URL above to analyze its SEO elements including meta
              tags, headings, images, schema markup, and more.
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            Powered by{" "}
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
