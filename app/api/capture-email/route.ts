import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== "string") {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 })
    }

    const supabase = await createClient()

    // Insert or update (upsert) the email
    const { error } = await supabase
      .from("email_captures")
      .upsert(
        { email: email.toLowerCase().trim() },
        { onConflict: "email" }
      )

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json({ error: "Failed to save email" }, { status: 500 })
    }

    // Send to webhook (Zapier, Make, etc.) if configured
    const webhookUrl = process.env.EMAIL_CAPTURE_WEBHOOK_URL
    if (webhookUrl) {
      // Fire and forget - don't block the response
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.toLowerCase().trim(),
          source: "equalizer",
          captured_at: new Date().toISOString(),
        }),
      }).catch(() => {
        // Silently fail - webhook is optional
      })
    }

    // Create response with cookie
    const response = NextResponse.json({ success: true })
    
    // Set cookie for 1 year
    response.cookies.set("equalizer_email", email.toLowerCase().trim(), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })

    return response
  } catch (error) {
    console.error("Email capture error:", error)
    return NextResponse.json({ error: "An error occurred" }, { status: 500 })
  }
}
