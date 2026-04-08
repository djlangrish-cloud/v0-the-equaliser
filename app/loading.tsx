"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, Loader2 } from "lucide-react"

const STEPS = [
  "Fetching page...",
  "Checking title & meta tags...",
  "Scanning heading structure...",
  "Auditing images...",
  "Counting internal & external links...",
  "Verifying canonical & schema markup...",
  "Checking robots.txt & sitemap...",
  "Running Googlebot view check...",
  "Compiling results...",
]

export default function Loading() {
  const [currentStep, setCurrentStep] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < STEPS.length - 1) return prev + 1
        clearInterval(interval)
        return prev
      })
    }, 700)
    return () => clearInterval(interval)
  }, [])

  return (
    <main className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 sm:py-12 max-w-5xl">

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 mb-5">
            <div className="flex items-end gap-0.5 h-8">
              {[3, 5, 7, 5, 3].map((h, i) => (
                <div
                  key={i}
                  className="w-2 rounded-sm bg-primary animate-pulse"
                  style={{ height: `${h * 4}px`, animationDelay: `${i * 0.1}s` }}
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

        {/* Processing Banner */}
        <div className="max-w-sm mx-auto py-12">
          <div className="space-y-3">
            {STEPS.map((step, i) => {
              const isDone = i < currentStep
              const isActive = i === currentStep
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 text-sm transition-opacity duration-300 ${
                    i > currentStep ? "opacity-25" : "opacity-100"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                  ) : isActive ? (
                    <Loader2 className="h-4 w-4 text-primary shrink-0 animate-spin" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-muted-foreground/30 shrink-0" />
                  )}
                  <span
                    className={
                      isDone
                        ? "text-muted-foreground"
                        : isActive
                        ? "text-foreground font-medium"
                        : "text-muted-foreground"
                    }
                  >
                    {step}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-8 border-t border-border text-center">
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
