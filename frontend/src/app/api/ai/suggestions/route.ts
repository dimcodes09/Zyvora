import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q")?.trim().toLowerCase() ?? "";

  if (!q) {
    return NextResponse.json([], { status: 200 });
  }

  const suggestions: string[] = [
    `${q}`,
    `luxury ${q}`,
    `${q} for men`,
    `${q} for women`,
    `${q} under ₹999`,
    `${q} under ₹5000`,
    `premium ${q} gift`,
    `${q} hamper`,
    `${q} set`,
    `best ${q} gifts`,
  ]
    // Remove duplicates and keep max 6 results
    .filter((s, i, arr) => arr.indexOf(s) === i)
    .slice(0, 6);

  return NextResponse.json(suggestions, {
    status: 200,
    headers: {
      "Cache-Control": "no-store",
    },
  });
}