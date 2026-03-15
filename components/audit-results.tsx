"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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
} from "lucide-react"
import type { AuditResult } from "@/app/api/audit/route"

interface AuditResultsProps {
  result: AuditResult
}

export function AuditResults({ result }: AuditResultsProps) {
  const totalIssues = result.criticals.length + result.warnings.length
  const score = Math.max(
    0,
    100 - result.criticals.length * 20 - result.warnings.length * 5
  )

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-success"
    if (score >= 50) return "text-warning"
    return "text-destructive"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-success/10 border-success/30"
    if (score >= 50) return "bg-warning/10 border-warning/30"
    return "bg-destructive/10 border-destructive/30"
  }

  return (
    <div className="w-full space-y-6">
      {/* Score Card */}
      <Card className={`border-2 ${getScoreBg(score)}`}>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div
                className={`text-5xl sm:text-6xl font-bold ${getScoreColor(score)}`}
              >
                {score}
              </div>
              <div className="text-left">
                <div className="text-lg font-semibold text-foreground">
                  SEO Score
                </div>
                <div className="text-sm text-muted-foreground">
                  {totalIssues === 0
                    ? "No issues found!"
                    : `${totalIssues} issue${totalIssues !== 1 ? "s" : ""} detected`}
                </div>
              </div>
            </div>
            <div className="text-center sm:text-right">
              <div className="text-sm text-muted-foreground truncate max-w-xs">
                {result.url}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Critical Issues */}
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
                  <li
                    key={i}
                    className="text-sm text-foreground flex items-start gap-2"
                  >
                    <span className="text-destructive mt-0.5">•</span>
                    {issue}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Warnings */}
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
                  <li
                    key={i}
                    className="text-sm text-foreground flex items-start gap-2"
                  >
                    <span className="text-warning mt-0.5">•</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {/* Passed Checks */}
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
                {result.passed.map((passed, i) => (
                  <li
                    key={i}
                    className="text-sm text-foreground flex items-start gap-2"
                  >
                    <span className="text-success mt-0.5">•</span>
                    {passed}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Page Details */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Title & Meta */}
        <Card className="bg-card border-border">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base text-foreground">
              <FileText className="h-5 w-5 text-primary" />
              Title & Meta
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                Page Title
              </div>
              <div className="text-sm text-foreground">
                {result.title || "Not found"}
              </div>
            </div>
            {result.meta["description"] && (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Meta Description
                </div>
                <div className="text-sm text-foreground line-clamp-3">
                  {result.meta["description"]}
                </div>
              </div>
            )}
            {result.canonical && (
              <div>
                <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1">
                  Canonical URL
                </div>
                <div className="text-sm text-foreground truncate">
                  {result.canonical}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Stats */}
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
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-foreground">
                    {result.wordCount.toLocaleString()}
                  </div>
                  <div className="text-xs text-muted-foreground">Words</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Image className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-foreground">
                    {result.images.total}
                  </div>
                  <div className="text-xs text-muted-foreground">Images</div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-foreground">
                    {result.links.internal}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Internal Links
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <Link2 className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-foreground">
                    {result.links.external}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    External Links
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

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
                    <span className="font-mono text-xs bg-secondary text-primary px-1.5 py-0.5 rounded">
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
              {result.schema.map((schema, i) => (
                <pre
                  key={i}
                  className="text-xs bg-secondary p-3 rounded-lg overflow-x-auto text-foreground"
                >
                  {JSON.stringify(schema, null, 2)}
                </pre>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
