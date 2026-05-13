import { NextRequest, NextResponse } from "next/server";

// Server-side routes MUST use BACKEND_URL (localhost) — not NEXT_PUBLIC_API_URL
// which points to the LAN IP and causes ConnectTimeoutError when called from the server.
const BACKEND =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

export async function GET(_req: NextRequest) {
  // Fail fast — 5 s instead of the default 10 s undici timeout
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${BACKEND}/products/reels`, {
      cache: "no-store",
      signal: controller.signal,
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errBody = await res.text();
      console.error("[GET /api/reels] Backend error:", res.status, errBody);
      return NextResponse.json(
        { error: "Failed to fetch reels", products: [] },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });

  } catch (err: unknown) {
    clearTimeout(timer);

    const isTimeout =
      err instanceof Error &&
      (err.name === "AbortError" || (err as NodeJS.ErrnoException).code === "UND_ERR_CONNECT_TIMEOUT");

    console.error(
      isTimeout
        ? "[GET /api/reels] Backend timed out — is the server running on localhost:5000?"
        : "[GET /api/reels] Unreachable:",
      err
    );

    // Return a graceful empty payload so the client shows "No reels yet"
    // instead of an unhandled 502 that breaks the page.
    return NextResponse.json(
      { error: "Backend unreachable", products: [] },
      { status: 503 }
    );
  }
}