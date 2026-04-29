import type { Request, Response, NextFunction } from "express";
import type { FilterQuery } from "mongoose";
import { Product } from "../models/Product.js";
import type { IProduct } from "../models/Product.js";
import { extractFilters } from "../services/ai.service.js";

// ── Types ────────────────────────────────────────────────────────────────────

interface AiSearchRequestBody {
  query: string;
}

interface SearchFilters {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  keywords: string[];
}

interface AiSearchResponse {
  success: true;
  filters: SearchFilters;
  products: IProduct[];
}

interface AiSearchErrorResponse {
  success: false;
  error: string;
}

// ── Category synonym map ──────────────────────────────────────────────────────

const CATEGORY_SYNONYMS: Record<string, string[]> = {
  watches:  ["watch", "watches", "timepiece", "wristwatch"],
  perfumes: ["perfume", "perfumes", "fragrance", "fragrances", "scent", "cologne", "eau de parfum", "edp", "edt"],
  wallets:  ["wallet", "wallets", "cardholder", "card holder", "billfold"],
  gadgets:  ["gadget", "gadgets", "electronics", "tech", "device", "devices"],
  bags:     ["bag", "bags", "handbag", "handbags", "purse", "purses", "tote", "clutch", "satchel"],
  jewelry:  ["jewelry", "jewellery", "jewel", "jewels", "ring", "rings", "bracelet", "bracelets", "necklace", "pendant", "earring", "earrings"],
  clothing: ["clothing", "clothes", "apparel", "outfit", "dress", "shirt", "top", "bottom", "wear"],
};

// ── Category resolution ───────────────────────────────────────────────────────

interface ResolvedCategory {
  canonical: string;
  allTerms: string[]; // canonical + all synonyms — used in $in DB clause
}

function resolveCategory(raw: string): ResolvedCategory | null {
  const n = raw.toLowerCase().trim();

  for (const [canonical, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    const allTerms = [canonical, ...synonyms];
    if (allTerms.includes(n)) return { canonical, allTerms };
  }

  // Partial match fallback: "luxury bags" → bags
  for (const [canonical, synonyms] of Object.entries(CATEGORY_SYNONYMS)) {
    const allTerms = [canonical, ...synonyms];
    if (allTerms.some((t) => n.includes(t))) return { canonical, allTerms };
  }

  return null;
}

// ── Clause builders ───────────────────────────────────────────────────────────

function categoryClause(resolved: ResolvedCategory): FilterQuery<IProduct> {
  return {
    category: {
      $in: resolved.allTerms.map((t) => new RegExp(`^${t}$`, "i")),
    },
  };
}

function priceClause(
  min: number | null,
  max: number | null
): FilterQuery<IProduct> | null {
  if (min === null && max === null) return null;
  return {
    price: {
      ...(min !== null && { $gte: min }),
      ...(max !== null && { $lte: max }),
    },
  };
}

function keywordClause(keywords: string[]): FilterQuery<IProduct> | null {
  if (keywords.length === 0) return null;
  return {
    $or: keywords.flatMap((k) => [
      { name:        { $regex: k, $options: "i" } },
      { description: { $regex: k, $options: "i" } },
    ]),
  };
}

function and(
  ...clauses: Array<FilterQuery<IProduct> | null>
): FilterQuery<IProduct> {
  const valid = clauses.filter((c): c is FilterQuery<IProduct> => c !== null);
  if (valid.length === 0) return {};
  if (valid.length === 1) return valid[0]!;
  return { $and: valid };
}

// ── Ranking ───────────────────────────────────────────────────────────────────

function score(
  p: IProduct,
  filters: SearchFilters,
  resolved: ResolvedCategory | null
): number {
  let s = 0;

  if (resolved) {
    const cat = (p.category ?? "").toLowerCase();
    if (resolved.allTerms.includes(cat)) s += 30;
  }

  for (const kw of filters.keywords) {
    const re = new RegExp(kw, "i");
    if (re.test(p.name ?? ""))        s += 10;
    if (re.test(p.description ?? "")) s += 5;
  }

  // Price proximity: reward items closer to the budget ceiling
  if (filters.maxPrice !== null && p.price != null && p.price <= filters.maxPrice) {
    s += Math.round((p.price / filters.maxPrice) * 5);
  }

  return s;
}

function rank(
  products: IProduct[],
  filters: SearchFilters,
  resolved: ResolvedCategory | null
): IProduct[] {
  return [...products].sort(
    (a, b) => score(b, filters, resolved) - score(a, filters, resolved)
  );
}

// ── Search strategy ───────────────────────────────────────────────────────────
//
// GOLDEN RULE: price is a hard constraint — NEVER drop it if the user stated one.
//
// With category:
//   S1  cat + price + keywords   → tightest match
//   S2  cat + price              → drop keywords (may be too narrow)
//   ↳  If S2 = 0 AND price was specified → return [] (nothing in budget, be honest)
//   ↳  If S2 = 0 AND no price → S3: cat only
//
// Without category (or cat had 0 DB docs):
//   S4  keywords + price
//   S5  keywords only            → only if no price was stated
//
// We never silently return out-of-budget products.

const SELECT   = "name price category image description";
const MAX_DOCS = 24;

async function runSearch(
  filters: SearchFilters,
  resolved: ResolvedCategory | null
): Promise<IProduct[]> {
  const catC = resolved ? categoryClause(resolved) : null;
  const priC = priceClause(filters.minPrice, filters.maxPrice);
  const kwC  = keywordClause(filters.keywords);
  const hasPriceConstraint = priC !== null;

  const find = (q: FilterQuery<IProduct>) =>
    Product.find(q).select(SELECT).limit(MAX_DOCS).lean<IProduct[]>();

  // ── Category path ──────────────────────────────────────────────────────────
  if (catC) {
    // S1: category + price + keywords
    const r1 = await find(and(catC, priC, kwC));
    if (r1.length > 0) {
      console.log(`[search] S1 hit: ${r1.length}`);
      return rank(r1, filters, resolved);
    }

    // S2: category + price (keywords dropped)
    // Always run this if price is set — this is what enforces the budget.
// S2: category + price (keywords dropped)
if (priC) {
  const r2 = await find(and(catC, priC));
  if (r2.length > 0) {
    console.log(`[search] S2 hit: ${r2.length}`);
    return rank(r2, filters, resolved);
  }

  // ── S2.5: category had nothing in budget → search ALL categories within price ──
  // Catches cases where Groq inferred wrong category but price is correct
  console.log(`[search] S2 miss — trying cross-category price search`);
  const r2b = await find(and(priC, kwC));   // price + keywords, no category lock
  if (r2b.length > 0) {
    console.log(`[search] S2.5 hit: ${r2b.length}`);
    return rank(r2b, filters, resolved);
  }

  // Still nothing — price range genuinely has no products at all
  console.log(`[search] S2.5 miss — nothing in budget across all categories`);
  return [];
}

    // S3: category only — only reached when NO price was specified
    const r3 = await find(catC);
    if (r3.length > 0) {
      console.log(`[search] S3 hit: ${r3.length}`);
      return rank(r3, filters, resolved);
    }

    // Category exists in synonym map but 0 DB docs → fall through to keyword search
    console.log(`[search] "${resolved!.canonical}" has no DB documents, falling back`);
  }

  // ── No-category / fallback path ────────────────────────────────────────────

  // S4: keywords + price
  if (kwC && priC) {
    const r4 = await find(and(kwC, priC));
    if (r4.length > 0) {
      console.log(`[search] S4 hit: ${r4.length}`);
      return rank(r4, filters, resolved);
    }

    // Price stated but no keyword match within budget → return empty.
    if (hasPriceConstraint) {
      console.log(`[search] no keyword results within budget`);
      return [];
    }
  }

  // S5: keywords only (no price constraint at all)
  if (kwC && !hasPriceConstraint) {
    const r5 = await find(kwC);
    if (r5.length > 0) {
      console.log(`[search] S5 hit: ${r5.length}`);
      return rank(r5, filters, resolved);
    }
  }

  console.log("[search] no results");
  return [];
}

// ── Controller ────────────────────────────────────────────────────────────────

export const aiSearch = async (
  req: Request<{}, AiSearchResponse | AiSearchErrorResponse, AiSearchRequestBody>,
  res: Response<AiSearchResponse | AiSearchErrorResponse>,
  next: NextFunction
): Promise<void> => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== "string" || query.trim() === "") {
      res.status(400).json({
        success: false,
        error: "query is required and must be a non-empty string.",
      });
      return;
    }

    const filters  = await extractFilters(query.trim());
    console.log("[AI] filters:", filters);

    const resolved = filters.category ? resolveCategory(filters.category) : null;
    console.log("[AI] resolved category:", resolved?.canonical ?? "none");

    const products = await runSearch(filters, resolved);
    console.log(`[DB] ${products.length} products returned`);

    res.status(200).json({ success: true, filters, products });
  } catch (err) {
    next(err);
  }
};