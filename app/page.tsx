import { AuditForm } from "@/components/audit-form"
import { AuditResults } from "@/components/audit-results"
import type { AuditResult } from "@/app/api/audit/route"
import { AlertCircle } from "lucide-react"
import { headers } from "next/headers"

async function runAudit(url: string): Promise<{ result?: AuditResult; error?: string }> {
  try {
    // Get the host from headers to build the API URL
    const headersList = await headers()
    const host = headersList.get("host") || "localhost:3000"
    const protocol = headersList.get("x-forwarded-proto") || "http"
    
    const response = await fetch(`${protocol}://${host}/api/audit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
      cache: "no-store",
    })

    const data = await response.json()

    if (!response.ok) {
      return { error: data.error || "Failed to audit the page" }
    }

    return { result: data }
  } catch (err) {
    return { error: err instanceof Error ? err.message : "An unexpected error occurred" }
  }
}

interface PageProps {
  searchParams: Promise<{ url?: string }>
}

export default async function Home({ searchParams }: PageProps) {
  const params = await searchParams
  const urlToAudit = params.url

  let result: AuditResult | undefined
  let error: string | undefined

  if (urlToAudit) {
    const auditResponse = await runAudit(urlToAudit)
    result = auditResponse.result
    error = auditResponse.error
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
            Free SEO audit tool. Analyse any website for technical SEO issues, meta tags,
            schema markup, social previews, and more.
          </p>
        </div>

        {/* Audit Form */}
        <div className="mb-8 print:hidden">
          <AuditForm initialUrl={urlToAudit || ""} />
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

        {/* Results */}
        {result && <AuditResults result={result} />}

        {/* Empty State */}
        {!result && !error && (
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
