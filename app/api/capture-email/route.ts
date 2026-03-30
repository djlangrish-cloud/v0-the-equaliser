  import { NextResponse } from "next/server";
  import { cookies } from "next/headers";

  const SHEET_URL =
  "https://script.google.com/macros/s/AKfycbyAVi_3EVQ1CIa_BDF_b7D
  6Z5VDAOq2vLj2bZE7e01gY51-j9nsN_1i1gGC5N0KMq8R/exec";

  export async function POST(request: Request) {
    try {
      const { email } = await request.json();

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return NextResponse.json({ error: "Valid email required"
  }, { status: 400 });
      }

      await fetch(SHEET_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const cookieStore = await cookies();
      cookieStore.set("equalizer_email", email, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge: 60 * 60 * 24 * 365,
        path: "/",
      });

      return NextResponse.json({ success: true });
    } catch (err) {
      console.error("Email capture error:", err);
      return NextResponse.json({ error: "Something went wrong" },
   { status: 500 });
    }
  }