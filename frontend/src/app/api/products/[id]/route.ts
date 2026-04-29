import { NextRequest, NextResponse } from "next/server";

const BACKEND = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(`${BACKEND}/products/${id}`, {
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        // Forward auth token if present (handles both header styles)
        ...(req.headers.get("authorization") && {
          Authorization: req.headers.get("authorization")!,
        }),
        // Forward cookies (session-based auth)
        ...(req.headers.get("cookie") && {
          Cookie: req.headers.get("cookie")!,
        }),
      },
    });

    // Log full backend error for debugging
    if (!res.ok) {
      const errBody = await res.text();
      console.error(
        `[GET /api/products/${id}] Backend ${res.status}:`,
        errBody
      );
      return NextResponse.json(
        { error: "Product not found", detail: errBody },
        { status: res.status }
      );
    }

    const data = await res.json();
    return NextResponse.json(data, { status: 200 });

  } catch (err) {
    console.error("[GET /api/products/:id] Backend unreachable:", err);
    return NextResponse.json({ error: "Backend unreachable" }, { status: 502 });
  }
}