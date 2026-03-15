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
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json({ error: "URL is required" }, { status: 400 })
    }

    // Validate URL
    let parsedUrl: URL
    try {
      parsedUrl = new URL(url)
    } catch {
      return NextResponse.json({ error: "Invalid URL format" }, { status: 400 })
    }

    // Fetch the page
    const response = await fetch(parsedUrl.href, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; SEOAuditBot/1.0; +https://rebelmarketer.co.uk)",
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch page: ${response.status}` },
        { status: 400 }
      )
    }

    const html = await response.text()
    const $ = cheerio.load(html)

    // Extract data
    const title = $("title").text().trim()

    // Meta tags
    const meta: Record<string, string> = {}
    $("meta").each((_, el) => {
      const name =
        $(el).attr("name") || $(el).attr("property") || $(el).attr("http-equiv")
      const content = $(el).attr("content")
      if (name && content) {
        meta[name] = content
      }
    })

    // Canonical
    const canonical = $('link[rel="canonical"]').attr("href") || null

    // Schema markup
    const schema: unknown[] = []
    $('script[type="application/ld+json"]').each((_, el) => {
      try {
        schema.push(JSON.parse($(el).html() || ""))
      } catch {
        // Invalid JSON, skip
      }
    })

    // Headings
    const headings: string[] = []
    $("h1, h2, h3, h4, h5, h6").each((_, el) => {
      const tag = el.tagName.toUpperCase()
      const text = $(el).text().trim().substring(0, 60)
      headings.push(`${tag}: ${text}${text.length >= 60 ? "..." : ""}`)
    })

    // Images
    let totalImages = 0
    let missingAlt = 0
    $("img").each((_, el) => {
      totalImages++
      const alt = $(el).attr("alt")
      if (!alt || alt.trim() === "") {
        missingAlt++
      }
    })

    // Word count
    const bodyText = $("body").text().replace(/\s+/g, " ").trim()
    const wordCount = bodyText.split(/\s+/).filter((w) => w.length > 0).length

    // Links
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
          // Relative or invalid link, count as internal
          internalLinks++
        }
      }
    })

    // Generate issues
    const criticals: string[] = []
    const warnings: string[] = []
    const passed: string[] = []

    // Title checks
    if (!title) {
      criticals.push("No page title found")
    } else if (title.length < 30) {
      warnings.push(`Title is too short (${title.length} chars, recommended 50-60)`)
    } else if (title.length > 60) {
      warnings.push(`Title is too long (${title.length} chars, recommended 50-60)`)
    } else {
      passed.push(`Title length is good (${title.length} characters)`)
    }

    // H1 check
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
      passed.push("Open Graph tags found")
    } else {
      warnings.push("Missing or incomplete Open Graph tags")
    }

    // Twitter Card
    if (meta["twitter:card"]) {
      passed.push("Twitter Card meta tag found")
    }

    // Viewport
    if (meta["viewport"]) {
      passed.push("Viewport meta tag found (mobile-friendly)")
    } else {
      warnings.push("No viewport meta tag (may affect mobile rendering)")
    }

    const result: AuditResult = {
      url: parsedUrl.href,
      title,
      meta,
      canonical,
      schema,
      headings,
      images: {
        total: totalImages,
        missingAlt,
      },
      wordCount,
      links: {
        internal: internalLinks,
        external: externalLinks,
      },
      criticals,
      warnings,
      passed,
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error("Audit error:", error)
    return NextResponse.json(
      { error: "Failed to audit the page. Please check the URL and try again." },
      { status: 500 }
    )
  }
}
