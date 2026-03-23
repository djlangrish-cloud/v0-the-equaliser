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
  // Maverick: Googlebot view comparison
  maverick: {
    googlebotTitle: string
    googlebotDescription: string
    googlebotH1: string | null
    googlebotWordCount: number
    googlebotCanonical: string | null
    googlebotRobotsMeta: string | null
    googlebotSchemaCount: number
    differences: string[]
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
      const text = await robotsRes.value.text()
      // Verify it looks like a valid robots.txt (not an HTML 404 page)
      const looksLikeRobots = text.toLowerCase().includes("user-agent") || 
                              text.toLowerCase().includes("disallow") ||
                              text.toLowerCase().includes("allow") ||
                              text.toLowerCase().includes("sitemap")
      if (looksLikeRobots) {
        robotsFound = true
        robotsContent = text.substring(0, 500)
      }
    }

    // Helper function to validate XML sitemap content
    const isValidSitemap = async (res: Response): Promise<boolean> => {
      if (!res.ok) return false
      const text = await res.text()
      // Check if content looks like XML sitemap (not HTML 404 page)
      const looksLikeXml = text.trim().startsWith("<?xml") || 
                          text.includes("<urlset") || 
                          text.includes("<sitemapindex")
      return looksLikeXml
    }

    // Check if robots.txt mentions a sitemap
    let sitemapFound = false
    let sitemapUrl: string | null = null
    
    // First try the standard sitemap.xml
    if (sitemapRes.status === "fulfilled") {
      const isValid = await isValidSitemap(sitemapRes.value)
      if (isValid) {
        sitemapFound = true
        sitemapUrl = `${baseOrigin}/sitemap.xml`
      }
    }
    
    // Try to find sitemap URL in robots.txt and validate it
    if (!sitemapFound && robotsContent) {
      const sitemapMatch = robotsContent.match(/Sitemap:\s*(\S+)/i)
      if (sitemapMatch) {
        const robotsSitemapUrl = sitemapMatch[1]
        // Fetch and validate the sitemap from robots.txt
        const robotsSitemapRes = await fetch(robotsSitemapUrl, {
          headers: { "User-Agent": userAgent },
        }).catch(() => null)
        if (robotsSitemapRes) {
          const isValid = await isValidSitemap(robotsSitemapRes)
          if (isValid) {
            sitemapFound = true
            sitemapUrl = robotsSitemapUrl
          }
        }
      }
    }
    
    // Try sitemap_index.xml as fallback
    if (!sitemapFound) {
      const sitemapIndexRes = await fetch(`${baseOrigin}/sitemap_index.xml`, {
        headers: { "User-Agent": userAgent },
      }).catch(() => null)
      if (sitemapIndexRes) {
        const isValid = await isValidSitemap(sitemapIndexRes)
        if (isValid) {
          sitemapFound = true
          sitemapUrl = `${baseOrigin}/sitemap_index.xml`
        }
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

    // --- Maverick: Fetch as Googlebot ---
    const googlebotUA = "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)"
    let maverick = {
      googlebotTitle: "",
      googlebotDescription: "",
      googlebotH1: null as string | null,
      googlebotWordCount: 0,
      googlebotCanonical: null as string | null,
      googlebotRobotsMeta: null as string | null,
      googlebotSchemaCount: 0,
      differences: [] as string[],
    }

    try {
      const gbResponse = await fetch(parsedUrl.href, {
        headers: { "User-Agent": googlebotUA },
      })
      
      if (gbResponse.ok) {
        const gbHtml = await gbResponse.text()
        const $gb = cheerio.load(gbHtml)
        
        maverick.googlebotTitle = $gb("title").text().trim()
        maverick.googlebotDescription = $gb('meta[name="description"]').attr("content") || ""
        maverick.googlebotH1 = $gb("h1").first().text().trim() || null
        maverick.googlebotCanonical = $gb('link[rel="canonical"]').attr("href") || null
        maverick.googlebotRobotsMeta = $gb('meta[name="robots"]').attr("content") || null
        maverick.googlebotSchemaCount = $gb('script[type="application/ld+json"]').length
        
        const gbBodyText = $gb("body").text().replace(/\s+/g, " ").trim()
        maverick.googlebotWordCount = gbBodyText.split(/\s+/).filter((w) => w.length > 0).length

        // Compare and find differences
        if (maverick.googlebotTitle !== title) {
          maverick.differences.push(`Title differs: User sees "${title.substring(0, 50)}..." vs Googlebot sees "${maverick.googlebotTitle.substring(0, 50)}..."`)
        }
        
        const userDesc = meta["description"] || ""
        if (maverick.googlebotDescription !== userDesc) {
          maverick.differences.push("Meta description differs between user and Googlebot view")
        }
        
        const userH1 = $("h1").first().text().trim() || null
        if (maverick.googlebotH1 !== userH1) {
          maverick.differences.push(`H1 differs: User sees "${userH1?.substring(0, 40) || 'none'}..." vs Googlebot sees "${maverick.googlebotH1?.substring(0, 40) || 'none'}..."`)
        }
        
        if (maverick.googlebotCanonical !== canonical) {
          maverick.differences.push("Canonical URL differs between user and Googlebot view")
        }
        
        if (maverick.googlebotSchemaCount !== schema.length) {
          maverick.differences.push(`Schema count differs: User sees ${schema.length} vs Googlebot sees ${maverick.googlebotSchemaCount}`)
        }
        
        const wordDiff = Math.abs(maverick.googlebotWordCount - wordCount)
        const wordDiffPercent = wordCount > 0 ? (wordDiff / wordCount) * 100 : 0
        if (wordDiffPercent > 20) {
          maverick.differences.push(`Content differs significantly: User sees ${wordCount} words vs Googlebot sees ${maverick.googlebotWordCount} words (${wordDiffPercent.toFixed(0)}% difference)`)
        }
        
        // Check for cloaking warning
        if (maverick.googlebotRobotsMeta?.includes("noindex") && !meta["robots"]?.includes("noindex")) {
          criticals.push("Potential cloaking: Googlebot sees noindex but regular users don't")
          maverick.differences.push("CRITICAL: robots meta differs - possible cloaking detected")
        }
        
        // Add to warnings/passed
        if (maverick.differences.length === 0) {
          passed.push("Maverick check: Googlebot sees the same content as users")
        } else if (maverick.differences.some(d => d.includes("CRITICAL"))) {
          // Already added to criticals above
        } else {
          warnings.push(`Maverick check: ${maverick.differences.length} difference(s) between user and Googlebot view`)
        }
      }
    } catch {
      // Silently fail maverick check - it's supplementary
      maverick.differences.push("Could not fetch Googlebot view")
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
      maverick,
    }

    return NextResponse.json(result)
  } catch (error) {
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
