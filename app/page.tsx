"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { AuditForm } from "@/components/audit-form"
import { AuditResults } from "@/components/audit-results"
import type { AuditResult } from "@/app/api/audit/route"
import { AlertCircle } from "lucide-react"

function EqualiserApp() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [result, setResult] = useState<AuditResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [initialUrl, setInitialUrl] = useState("")

  // Auto-run audit if ?url= param is present
  useEffect(() => {
    const urlParam = searchParams.get("url")
    if (urlParam) {
      setInitialUrl(urlParam)
      runAudit(urlParam)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const runAudit = async (url: string) => {
    setIsLoading(true)
    setError(null)
    setResult(null)

    // Update URL param so the page is shareable
    const params = new URLSearchParams()
    params.set("url", url)
    router.replace(`?${params.toString()}`, { scroll: false })

    try {
      const response = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
        <div className="text-center mb-8 sm:mb-12 print:mb-6">
          <div className="inline-flex items-center gap-2 mb-5">
            {/* Equaliser icon: vertical bars */}
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
            The <span className="text-primary">Equaliser</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto text-pretty">
            Free SEO audit tool — analyse any website for technical SEO issues, meta tags,
            schema markup, social previews, and more.
          </p>
        </div>

        {/* Audit Form */}
        <div className="mb-8 print:hidden">
          <AuditForm onSubmit={runAudit} isLoading={isLoading} initialUrl={initialUrl} />
        </div>

        {/* Error */}
        {error && (
          <div className="mb-8 p-4 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
            <div>
              <div className="font-medium text-destructive">Error</div>
              <div className="text-sm text-foreground">{error}</div>
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="flex items-end gap-1 h-12 mb-6">
              {[3, 5, 7, 5, 3].map((h, i) => (
                <div
                  key={i}
                  className="w-3 rounded-sm bg-primary"
                  style={{
                    height: `${h * 5}px`,
                    animation: `equalise 0.8s ease-in-out ${i * 0.1}s infinite alternate`,
                  }}
                />
              ))}
            </div>
            <style>{`
              @keyframes equalise {
                from { transform: scaleY(0.4); opacity: 0.5; }
                to   { transform: scaleY(1);   opacity: 1;   }
              }
            `}</style>
            <div className="text-lg font-medium text-foreground">Analysing website...</div>
            <div className="text-sm text-muted-foreground mt-1">
              Checking SEO, robots.txt, sitemap, social tags, and more
            </div>
          </div>
        )}

        {/* Results */}
        {result && !isLoading && <AuditResults result={result} />}

        {/* Empty State */}
        {!result && !isLoading && !error && (
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
              Enter a website URL above to analyse its SEO — meta tags, headings, schema,
              social previews, robots.txt, sitemap, and page speed.
            </div>
          </div>
        )}

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center print:mt-6">
          <p className="text-sm text-muted-foreground">
            The Equaliser by{" "}
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

export default function Home() {
  return (
    <Suspense>
      <EqualiserApp />
    </Suspense>
  )
}
