import { NextRequest, NextResponse } from "next/server";

// Server-side routes MUST use BACKEND_URL (localhost) — not NEXT_PUBLIC_API_URL
// which points to the LAN IP and causes ConnectTimeoutError when called from the server.
const BACKEND =
  process.env.BACKEND_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 5000);

  try {
    const res = await fetch(`${BACKEND}/products/${id}`, {
      cache: "no-store",
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        ...(req.headers.get("authorization") && {
          Authorization: req.headers.get("authorization")!,
        }),
        ...(req.headers.get("cookie") && {
          Cookie: req.headers.get("cookie")!,
        }),
      },
    });

    clearTimeout(timer);

    if (!res.ok) {
      const errBody = await res.text();
      console.error(`[GET /api/products/${id}] Backend ${res.status}:`, errBody);
      return NextResponse.json(
        { error: "Product not found", detail: errBody },
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
        ? `[GET /api/products/${id}] Backend timed out`
        : `[GET /api/products/${id}] Unreachable:`,
      err
    );

    return NextResponse.json(
      { error: "Backend unreachable" },
      { status: 503 }
    );
  }
}