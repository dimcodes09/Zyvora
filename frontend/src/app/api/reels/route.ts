import { NextRequest, NextResponse } from "next/server";

// Proxies to → GET http://localhost:5000/api/products/reels
const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(`${BACKEND}/products/reels`, {
      cache: "no-store",
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[GET /api/reels] Backend error:", errBody);
      return NextResponse.json({ error: "Failed to fetch reels" }, { status: res.status });
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error("[GET /api/reels] Unreachable:", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}