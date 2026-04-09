"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  CheckCircle2,
  XCircle,
  FileText,
  Link2,
  Image,
  Heading,
  Code2,
  Globe,
  Share2,
  Printer,
  Check,
  Bot,
  Map,
  Zap,
  Facebook,
  Twitter,
  Eye,
  Download,
} from "lucide-react"
import type { AuditResult } from "@/app/api/audit/route"

interface AuditResultsProps {
  result: AuditResult
}

const CSV_STORAGE_KEY = "equalizer_audit_rows"
const CSV_HEADERS = [
  "Site", "URL", "Audit Date", "SEO Score", "Score Rating",
  "Critical Issues", "Warnings", "Passed",
  "Missing H1", "No Canonical Tag", "No Schema Markup", "Missing Meta Description",
  "Images Missing Alt Text", "Word Count", "Internal Links", "External Links",
  "Schema Blocks", "Schema Type", "Maverick Result", "Maverick Differences", "Segment",
]

function buildRow(result: AuditResult, score: number): string {
  const esc = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`
  const site = new URL(result.url).hostname
  const auditDate = new Date().toLocaleDateString("en-GB")
  const scoreRating = score >= 85 ? "Good" : score >= 50 ? "Needs Work" : "Poor"
  const missingH1 = result.criticals.some(c => c.toLowerCase().includes("h1")) ? "Yes" : "No"
  const noCanonical = result.warnings.some(w => w.toLowerCase().includes("canonical")) ? "Yes" : "No"
  const noSchema = result.warnings.some(w => w.toLowerCase().includes("schema")) ? "Yes" : "No"
  const noMetaDesc = result.warnings.some(w => w.toLowerCase().includes("meta description")) ? "Yes" : "No"
  const schemaTypes = result.schema
    .map(s => (s as Record<string, unknown>)["@type"])
    .filter(Boolean)
    .join(", ")
  const maverickDiffs = result.maverick?.differences.filter(d => !d.includes("Could not")).length ?? 0
  const maverickResult = maverickDiffs === 0 ? "Match" : `${maverickDiffs} Differences`

  return [
    esc(site), esc(result.url), esc(auditDate), esc(score), esc(scoreRating),
    esc(result.criticals.length), esc(result.warnings.length), esc(result.passed.length),
    esc(missingH1), esc(noCanonical), esc(noSchema), esc(noMetaDesc),
    esc(result.images.missingAlt), esc(result.wordCount),
    esc(result.links.internal), esc(result.links.external),
    esc(result.schema.length), esc(schemaTypes),
    esc(maverickResult), esc(maverickDiffs), esc(""),
  ].join(",")
}

export function AuditResults({ result }: AuditResultsProps) {
  const [copied, setCopied] = useState(false)
  const [savedCount, setSavedCount] = useState(0)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(CSV_STORAGE_KEY) || "[]")
    setSavedCount(stored.length)
  }, [])

  const totalIssues = result.criticals.length + result.warnings.length
  const score = Math.max(
    0,
    100 - result.criticals.length * 20 - result.warnings.length * 5
  )

  const getScoreColor = (s: number) => {
    if (s >= 80) return "text-success"
    if (s >= 50) return "text-warning"
    return "text-destructive"
  }

  const getScoreBg = (s: number) => {
    if (s >= 80) return "bg-success/10 border-success/30"
    if (s >= 50) return "bg-warning/10 border-warning/30"
    return "bg-destructive/10 border-destructive/30"
  }

  const getScoreLabel = (s: number) => {
    if (s >= 80) return "Good"
    if (s >= 50) return "Needs Work"
    return "Poor"
  }

  const getSpeedLabel = (ms: number) => {
    if (ms < 1000) return { label: "Fast", color: "text-success", bg: "bg-success/10 border-success/30" }
    if (ms < 3000) return { label: "Moderate", color: "text-warning", bg: "bg-warning/10 border-warning/30" }
    return { label: "Slow", color: "text-destructive", bg: "bg-destructive/10 border-destructive/30" }
  }

  const speed = getSpeedLabel(result.loadTimeMs)

  const handleShare = async () => {
    const shareUrl = `${window.location.origin}${window.location.pathname}?url=${encodeURIComponent(result.url)}`
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback: select the URL
      prompt("Copy this shareable link:", shareUrl)
    }
  }

  const handlePrint = () => {
    setTimeout(() => window.print(), 100)
  }

  const handleSaveRow = () => {
    const stored: string[] = JSON.parse(localStorage.getItem(CSV_STORAGE_KEY) || "[]")
    const row = buildRow(result, score)
    stored.push(row)
    localStorage.setItem(CSV_STORAGE_KEY, JSON.stringify(stored))
    setSavedCount(stored.length)
  }

  const handleExportAll = () => {
    const stored: string[] = JSON.parse(localStorage.getItem(CSV_STORAGE_KEY) || "[]")
    if (stored.length === 0) return
    const csv = [CSV_HEADERS.join(","), ...stored].join("\n")
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `equalizer-study-${new Date().toLocaleDateString("en-GB").replace(/\//g, "-")}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleClearRows = () => {
    localStorage.removeItem(CSV_STORAGE_KEY)
    setSavedCount(0)
  }

  // OG / Social preview data
  const ogTitle = result.meta["og:title"] || result.title || ""
  const ogDescription = result.meta["og:description"] || result.meta["description"] || ""
  const ogImage = result.meta["og:image"] || ""
  const twitterTitle = result.meta["twitter:title"] || ogTitle
  const twitterDescription = result.meta["twitter:description"] || ogDescription
  const twitterImage = result.meta["twitter:image"] || ogImage
  const twitterCard = result.meta["twitter:card"] || "summary"
  const siteName = result.meta["og:site_name"] || new URL(result.url).hostname
  const hasSocialData = ogTitle || ogDescription || ogImage

  return (
    <div className="w-full space-y-6 print:space-y-4">
      {/* Score + Actions Row */}
      <Card className={`border-2 ${getScoreBg(score)}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-5">
              <div className="text-center">
                <div className={`text-6xl font-bold leading-none ${getScoreColor(score)}`}>
                  {score}
                </div>
                <div className={`text-sm font-semibold mt-1 ${getScoreColor(score)}`}>
                  {getScoreLabel(score)}
                </div>
              </div>
              <div>
                <div className="text-lg font-semibold text-foreground">SEO Score</div>
                <div className="text-sm text-muted-foreground">
                  {totalIssues === 0
                    ? "No issues found!"
                    : `${totalIssues} issue${totalIssues !== 1 ? "s" : ""} detected`}
                </div>
                <div className="text-xs text-muted-foreground truncate max-w-xs mt-1">
                  {result.url}
                </div>
              </div>
            </div>

            {/* Speed pill + Action buttons */}
            <div className="flex flex-wrap items-center gap-2 print:hidden">
              <div className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full border ${speed.bg}`}>
                <Zap className={`h-3.5 w-3.5 ${speed.color}`} />
                <span className={speed.color}>{speed.label} · {result.loadTimeMs}ms</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="h-8 gap-1.5 border-border text-foreground hover:bg-secondary"
              >
                {copied ? (
                  <><Check className="h-3.5 w-3.5 text-success" /> Copied!</>
                ) : (
                  <><Share2 className="h-3.5 w-3.5" /> Share</>
                )}
              </Button>
              {typeof window !== "undefined" && window.location.hostname === "localhost" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleSaveRow}
                    className="h-8 gap-1.5 border-border text-foreground hover:bg-secondary"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Save Row {savedCount > 0 && `(${savedCount})`}
                  </Button>
                  {savedCount > 0 && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportAll}
                        className="h-8 gap-1.5 border-border text-foreground hover:bg-secondary"
                      >
                        Export All ({savedCount})
                      </Button>
                      <button
                        onClick={handleClearRows}
                        className="text-xs text-muted-foreground hover:text-destructive underline"
                      >
                        Clear
                      </button>
                    </>
                  )}
                </>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="h-8 gap-1.5 border-border text-foreground hover:bg-secondary"
              >
                <Printer className="h-3.5 w-3.5" />
                Print
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {result.criticals.length > 0 && (
          <Card className="border-destructive/50 bg-destructive/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-destructive text-base">
                <XCircle className="h-5 w-5" />
                Critical Issues ({result.criticals.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.criticals.map((issue, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-destructive mt-0.5 shrink-0">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {result.warnings.length > 0 && (
          <Card className="border-warning/50 bg-warning/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-warning text-base">
                <AlertTriangle className="h-5 w-5" />
                Warnings ({result.warnings.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.warnings.map((warning, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-warning mt-0.5 shrink-0">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {result.passed.length > 0 && (
          <Card className="border-success/50 bg-success/5">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-success text-base">
                <CheckCircle2 className="h-5 w-5" />
                Passed ({result.passed.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {result.passed.map((p, i) => (
                  <li key={i} className="text-sm text-foreground flex items-start gap-2">
                    <span className="text-success mt-0.5 shrink-0">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Page Details Row */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Title & Meta */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Title &amp; Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Page Title</div>
              <div className="text-sm text-foreground">{result.title || "Not found"}</div>
            </div>
            {result.meta["description"] && (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Meta Description</div>
                <div className="text-sm text-foreground line-clamp-3">{result.meta["description"]}</div>
              </div>
            )}
            {result.canonical && (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Canonical URL</div>
                <div className="text-sm text-foreground truncate">{result.canonical}</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Page Stats */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Globe className="h-5 w-5 text-primary" />
              Page Stats
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-foreground">{result.wordCount.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-foreground">{result.images.total}</div>
                  <div className="text-xs text-muted-foreground">Images</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-foreground">{result.links.internal}</div>
                  <div className="text-xs text-muted-foreground">Internal Links</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                  <Link2 className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-foreground">{result.links.external}</div>
                  <div className="text-xs text-muted-foreground">External Links</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Robots + Sitemap Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className={`border-border ${result.robots.found ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Bot className="h-5 w-5 text-primary" />
              robots.txt
              <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${result.robots.found ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                {result.robots.found ? "Found" : "Not Found"}
              </span>
            </CardTitle>
          </CardHeader>
          {result.robots.found && result.robots.content && (
            <CardContent>
              <pre className="text-xs bg-secondary p-3 rounded-lg overflow-x-auto text-muted-foreground max-h-32 whitespace-pre-wrap">
                {result.robots.content}
                {result.robots.content.length >= 500 ? "\n..." : ""}
              </pre>
            </CardContent>
          )}
          {!result.robots.found && (
            <CardContent>
              <p className="text-sm text-muted-foreground">
                No robots.txt found at <span className="font-mono">{new URL(result.url).origin}/robots.txt</span>. This file helps search engines understand crawl rules for your site.
              </p>
            </CardContent>
          )}
        </Card>

        <Card className={`border-border ${result.sitemap.found ? "bg-success/5 border-success/30" : "bg-destructive/5 border-destructive/30"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Map className="h-5 w-5 text-primary" />
              XML Sitemap
              <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${result.sitemap.found ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"}`}>
                {result.sitemap.found ? "Found" : "Not Found"}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.sitemap.found && result.sitemap.url ? (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Sitemap URL</div>
                <a
                  href={result.sitemap.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline break-all"
                >
                  {result.sitemap.url}
                </a>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                No XML sitemap found. A sitemap helps search engines discover and index all pages on your site.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Social Preview Cards */}
      {hasSocialData && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Share2 className="h-5 w-5 text-primary" />
              Social Previews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-6 md:grid-cols-2">
              {/* Facebook / OG Preview */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Facebook className="h-4 w-4 text-[#1877F2]" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Facebook / Open Graph</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-border bg-secondary">
                  {ogImage ? (
                    <div className="w-full aspect-[1.91/1] bg-muted overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={ogImage}
                        alt="OG preview"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  ) : (
                    <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center">
                      <Image className="h-8 w-8 text-muted-foreground opacity-40" />
                    </div>
                  )}
                  <div className="p-3 border-t border-border">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground mb-0.5">{siteName}</div>
                    <div className="text-sm font-semibold text-foreground line-clamp-1">{ogTitle || "No OG title set"}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{ogDescription || "No OG description set"}</div>
                  </div>
                </div>
              </div>

              {/* Twitter/X Preview */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Twitter className="h-4 w-4 text-foreground" />
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Twitter / X Card</span>
                </div>
                <div className="rounded-lg overflow-hidden border border-border bg-secondary">
                  {twitterCard === "summary_large_image" && twitterImage ? (
                    <div className="w-full aspect-[1.91/1] bg-muted overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={twitterImage}
                        alt="Twitter card preview"
                        className="w-full h-full object-cover"
                        crossOrigin="anonymous"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = "none"
                        }}
                      />
                    </div>
                  ) : twitterImage ? (
                    <div className="flex gap-0">
                      <div className="w-24 h-24 bg-muted shrink-0 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={twitterImage}
                          alt="Twitter card thumbnail"
                          className="w-full h-full object-cover"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = "none"
                          }}
                        />
                      </div>
                      <div className="p-3 flex-1 border-l border-border">
                        <div className="text-sm font-semibold text-foreground line-clamp-1">{twitterTitle || "No title"}</div>
                        <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{twitterDescription}</div>
                        <div className="text-xs text-muted-foreground mt-1">{siteName}</div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full aspect-[1.91/1] bg-muted flex items-center justify-center">
                      <Twitter className="h-8 w-8 text-muted-foreground opacity-40" />
                    </div>
                  )}
                  {(twitterCard === "summary_large_image" || !twitterImage) && (
                    <div className="p-3 border-t border-border">
                      <div className="text-sm font-semibold text-foreground line-clamp-1">{twitterTitle || "No Twitter title set"}</div>
                      <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{twitterDescription || "No Twitter description set"}</div>
                      <div className="text-xs text-muted-foreground mt-1">{siteName}</div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Headings Structure */}
      {result.headings.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Heading className="h-5 w-5 text-primary" />
              Heading Structure ({result.headings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5 max-h-64 overflow-y-auto">
              {result.headings.slice(0, 20).map((heading, i) => {
                const [tag, ...textParts] = heading.split(": ")
                const text = textParts.join(": ")
                const level = parseInt(tag.replace("H", "")) || 1
                return (
                  <div
                    key={i}
                    className="flex items-start gap-2 text-sm"
                    style={{ paddingLeft: `${(level - 1) * 16}px` }}
                  >
                    <span className="font-mono text-xs bg-secondary text-primary px-1.5 py-0.5 rounded shrink-0">
                      {tag}
                    </span>
                    <span className="text-foreground">{text}</span>
                  </div>
                )
              })}
              {result.headings.length > 20 && (
                <div className="text-sm text-muted-foreground pt-2">
                  ... and {result.headings.length - 20} more headings
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schema Markup */}
      {result.schema.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Code2 className="h-5 w-5 text-primary" />
              Schema Markup ({result.schema.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {result.schema.map((s, i) => (
                <pre
                  key={i}
                  className="text-xs bg-secondary p-3 rounded-lg overflow-x-auto text-foreground"
                >
                  {JSON.stringify(s, null, 2)}
                </pre>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Maverick: Googlebot View */}
      {result.maverick && (
        <Card className={`border-border ${result.maverick.differences.length === 0 ? "bg-success/5 border-success/30" : result.maverick.differences.some(d => d.includes("CRITICAL")) ? "bg-destructive/5 border-destructive/30" : "bg-warning/5 border-warning/30"}`}>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <Eye className="h-5 w-5 text-primary" />
              Maverick: Googlebot View
              <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full ${result.maverick.differences.length === 0 ? "bg-success/20 text-success" : result.maverick.differences.some(d => d.includes("CRITICAL")) ? "bg-destructive/20 text-destructive" : "bg-warning/20 text-warning"}`}>
                {result.maverick.differences.length === 0 ? "Match" : `${result.maverick.differences.length} Difference${result.maverick.differences.length !== 1 ? "s" : ""}`}
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {result.maverick.differences.length > 0 ? (
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground mb-2">
                  Differences detected between what users see and what Googlebot sees:
                </div>
                <ul className="space-y-2">
                  {result.maverick.differences.map((diff, i) => (
                    <li key={i} className={`text-sm flex items-start gap-2 ${diff.includes("CRITICAL") ? "text-destructive" : "text-foreground"}`}>
                      <span className={`mt-0.5 shrink-0 ${diff.includes("CRITICAL") ? "text-destructive" : "text-warning"}`}>
                        {diff.includes("CRITICAL") ? <XCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                      </span>
                      {diff}
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-success text-sm">
                <CheckCircle2 className="h-4 w-4" />
                Googlebot sees the same content as regular users. No cloaking detected.
              </div>
            )}
            
            {/* Googlebot stats comparison */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-3 border-t border-border">
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Googlebot Title</div>
                <div className="text-sm text-foreground truncate">{result.maverick.googlebotTitle || "None"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Googlebot H1</div>
                <div className="text-sm text-foreground truncate">{result.maverick.googlebotH1 || "None"}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Googlebot Words</div>
                <div className="text-sm text-foreground">{result.maverick.googlebotWordCount.toLocaleString()}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Googlebot Schema</div>
                <div className="text-sm text-foreground">{result.maverick.googlebotSchemaCount} block{result.maverick.googlebotSchemaCount !== 1 ? "s" : ""}</div>
              </div>
            </div>
            
            {result.maverick.googlebotRobotsMeta && (
              <div className="pt-3 border-t border-border">
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">Googlebot Robots Meta</div>
                <div className="text-sm font-mono bg-secondary px-2 py-1 rounded text-foreground">{result.maverick.googlebotRobotsMeta}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
