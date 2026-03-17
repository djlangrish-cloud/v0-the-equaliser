import { NextRequest, NextResponse } from "next/server"
import * as cheerio from "cheerio"

export interface AuditResult {
  url: string
  title: string
  meta: Record<string, string>
  canonical: string | null
  schema: unknown[]
  headings: string[]
  images: {
    total: number
    missingAlt: number
  }
  wordCount: number
  links: {
    internal: number
    external: number
  }
  criticals: string[]
  warnings: string[]
  passed: string[]
  loadTimeMs: number
  robots: {
    found: boolean
    content: string | null
  }
  sitemap: {
    found: boolean
    url: string | null
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    const userAgent =
      "Mozilla/5.0 (compatible; TheEqualizer/1.0; +https://rebelmarketer.co.uk)"

    // Fetch the main page (timed)
    const startTime = Date.now()
    const response = await fetch(parsedUrl.href, {
      headers: { "User-Agent": userAgent },
    })
    const loadTimeMs = Date.now() - startTime

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${response.status}` },
        { status: 400 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Fetch robots.txt and sitemap in parallel
    const baseOrigin = parsedUrl.origin
    const [robotsRes, sitemapRes] = await Promise.allSettled([
      fetch(`${baseOrigin}/robots.txt`, { headers: { "User-Agent": userAgent } }),
      fetch(`${baseOrigin}/sitemap.xml`, { headers: { "User-Agent": userAgent } }),
    ])

    let robotsFound = false
    let robotsContent: string | null = null
    if (robotsRes.status === "fulfilled" && robotsRes.value.ok) {
      robotsFound = true
      const text = await robotsRes.value.text()
      robotsContent = text.substring(0, 500)
    }

    // Also check if robots.txt mentions a sitemap
    let sitemapFound = false
    let sitemapUrl: string | null = null
    if (sitemapRes.status === "fulfilled" && sitemapRes.value.ok) {
      sitemapFound = true
      sitemapUrl = `${baseOrigin}/sitemap.xml`
    }
    // Try to find sitemap in robots.txt
    if (!sitemapFound && robotsContent) {
      const sitemapMatch = robotsContent.match(/Sitemap:\s*(\S+)/i)
      if (sitemapMatch) {
        sitemapFound = true
        sitemapUrl = sitemapMatch[1]
      }
    }
    // Try sitemap_index.xml as fallback
    if (!sitemapFound) {
      const sitemapIndexRes = await fetch(`${baseOrigin}/sitemap_index.xml`, {
        headers: { "User-Agent": userAgent },
      }).catch(() => null)
      if (sitemapIndexRes?.ok) {
        sitemapFound = true
        sitemapUrl = `${baseOrigin}/sitemap_index.xml`
      }
    }

    // --- Extract data ---
    const title = $("title").text().trim()

    const meta: Record<string, string> = {}
    $("meta").each((_, el) => {
      const name =
        $(el).attr("name") || $(el).attr("property") || $(el).attr("http-equiv")
      const content = $(el).attr("content")
      if (name && content) {
        meta[name] = content
      }
    })

    const canonical = $('link[rel="canonical"]').attr("href") || null

    const schema: unknown[] = []
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        schema.push(JSON.parse($(el).html() || ""))
      } catch {
        // skip invalid JSON
      }
    })

    const headings: string[] = []
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const tag = el.tagName.toUpperCase()
      const text = $(el).text().trim().substring(0, 60)
      headings.push(`${tag}: ${text}${text.length >= 60 ? "..." : ""}`)
    })

    let totalImages = 0
    let missingAlt = 0
    $("img").each((_, el) => {
      totalImages++
      const alt = $(el).attr("alt")
      if (!alt || alt.trim() === "") missingAlt++
    })

    const bodyText = $("body").text().replace(/\s+/g, " ").trim()
    const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length

    let internalLinks = 0
    let externalLinks = 0
    $("a[href]").each((_, el) => {
      const href = $(el).attr("href")
      if (href) {
        try {
          const linkUrl = new URL(href, parsedUrl.href)
          if (linkUrl.hostname === parsedUrl.hostname) {
            internalLinks++
          } else {
            externalLinks++
          }
        } catch {
          internalLinks++
        }
      }
    })

    // --- Generate issues ---
    const criticals: string[] = []
    const warnings: string[] = []
    const passed: string[] = []

    // Title
    if (!title) {
      criticals.push("No page title found")
    } else if (title.length < 30) {
      warnings.push(`Title is too short (${title.length} chars, recommended 50-60)`)
    } else if (title.length > 60) {
      warnings.push(`Title is too long (${title.length} chars, recommended 50-60)`)
    } else {
      passed.push(`Title length is good (${title.length} characters)`)
    }

    // H1
    const h1Count = $("h1").length
    if (h1Count === 0) {
      criticals.push("No H1 heading detected")
    } else if (h1Count > 1) {
      warnings.push(`Multiple H1 headings found (${h1Count})`)
    } else {
      passed.push("Single H1 heading found")
    }

    // Meta description
    const metaDescription = meta["description"] || meta["og:description"]
    if (!metaDescription) {
      warnings.push("No meta description found")
    } else if (metaDescription.length < 120) {
      warnings.push(
        `Meta description is short (${metaDescription.length} chars, recommended 150-160)`
      )
    } else if (metaDescription.length > 160) {
      warnings.push(
        `Meta description is long (${metaDescription.length} chars, recommended 150-160)`
      )
    } else {
      passed.push(`Meta description length is good (${metaDescription.length} characters)`)
    }

    // Canonical
    if (!canonical) {
      warnings.push("No canonical tag found")
    } else {
      passed.push("Canonical tag found")
    }

    // Schema
    if (schema.length === 0) {
      warnings.push("No schema markup detected")
    } else {
      passed.push(`Schema markup found (${schema.length} block${schema.length > 1 ? "s" : ""})`)
    }

    // Images
    if (missingAlt > 0) {
      warnings.push(`${missingAlt} image${missingAlt > 1 ? "s" : ""} missing alt text`)
    } else if (totalImages > 0) {
      passed.push(`All ${totalImages} images have alt text`)
    }

    // Content
    if (wordCount < 300) {
      warnings.push(`Thin content: only ${wordCount} words (recommended 300+)`)
    } else {
      passed.push(`Good content length (${wordCount} words)`)
    }

    // Open Graph
    if (meta["og:title"] && meta["og:description"] && meta["og:image"]) {
      passed.push("Open Graph tags are complete")
    } else if (meta["og:title"] || meta["og:description"]) {
      warnings.push("Open Graph tags are incomplete (missing og:image or description)")
    } else {
      warnings.push("No Open Graph tags found")
    }

    // Twitter Card
    if (meta["twitter:card"]) {
      passed.push("Twitter Card meta tag found")
    } else {
      warnings.push("No Twitter Card meta tag found")
    }

    // Viewport
    if (meta["viewport"]) {
      passed.push("Viewport meta tag found (mobile-friendly)")
    } else {
      warnings.push("No viewport meta tag (may affect mobile rendering)")
    }

    // Robots.txt
    if (robotsFound) {
      passed.push("robots.txt found and accessible")
    } else {
      warnings.push("robots.txt not found")
    }

    // Sitemap
    if (sitemapFound) {
      passed.push("XML sitemap found")
    } else {
      warnings.push("No XML sitemap found")
    }

    // Page speed
    if (loadTimeMs < 1000) {
      passed.push(`Fast server response time (${loadTimeMs}ms)`)
    } else if (loadTimeMs < 3000) {
      warnings.push(`Moderate server response time (${loadTimeMs}ms, aim for under 1s)`)
    } else {
      criticals.push(`Slow server response time (${loadTimeMs}ms, aim for under 1s)`)
    }

    const result: AuditResult = {
      url: parsedUrl.href,
      title,
      meta,
      canonical,
      schema,
      headings,
      images: { total: totalImages, missingAlt },
      wordCount,
      links: { internal: internalLinks, external: externalLinks },
      criticals,
      warnings,
      passed,
      loadTimeMs,
      robots: { found: robotsFound, content: robotsContent },
      sitemap: { found: sitemapFound, url: sitemapUrl },
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Equalizer audit error:", error)
    
    // Provide more helpful error messages for common issues
    const errorMessage = error instanceof Error ? error.message : String(error)
    const cause = (error as { cause?: { message?: string; code?: string; reason?: string } })?.cause
    const causeCode = cause?.code || ""
    const causeReason = cause?.reason || ""
    const causeMessage = cause?.message || ""
    
    // SSL/TLS certificate errors
    if (
      causeCode.includes("CERT") || 
      causeCode.includes("TLS") || 
      causeCode.includes("SSL") ||
      causeReason.includes("cert") ||
      causeMessage.includes("certificate")
    ) {
      return NextResponse.json(
        { error: "This website has an SSL certificate issue. The site may be misconfigured or using an invalid certificate." },
        { status: 400 }
      )
    }
    
    // DNS resolution errors
    if (errorMessage.includes("ENOTFOUND") || errorMessage.includes("getaddrinfo") || causeCode === "ENOTFOUND") {
      return NextResponse.json(
        { error: "Could not find this website. Please check the URL is correct." },
        { status: 400 }
      )
    }
    
    // Timeout errors
    if (errorMessage.includes("ETIMEDOUT") || errorMessage.includes("timeout") || causeCode === "ETIMEDOUT") {
      return NextResponse.json(
        { error: "The website took too long to respond. Please try again later." },
        { status: 400 }
      )
    }
    
    // Connection refused
    if (causeCode === "ECONNREFUSED") {
      return NextResponse.json(
        { error: "Connection refused. The website may be down or blocking requests." },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: "Failed to audit the page. Please check the URL and try again." },
      { status: 500 }
    )
  }
}
