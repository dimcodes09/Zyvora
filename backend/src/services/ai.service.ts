import Groq from "groq-sdk";

// ── Types ────────────────────────────────────────────────────────────────────

export interface SearchFilters {
  category: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  keywords: string[];
}

// ── Client ───────────────────────────────────────────────────────────────────

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY! });

// ── Constants ─────────────────────────────────────────────────────────────────

const VALID_CATEGORIES = new Set([
  "watches", "perfumes", "wallets", "gadgets", "bags", "jewelry", "clothing",
]);

// Words that pollute keyword search and cause wrong product matches
const BLOCKED_KEYWORDS = new Set([
  // Generic gift words
  "gift", "gifts", "present", "presents", "surprise", "buy", "get", "find",
  "something", "anything", "item", "items", "product", "products",
  // Prepositions / filler
  "for", "under", "below", "above", "around", "within", "upto", "up",
  "the", "a", "an", "and", "or", "with", "in", "on", "at", "of",
  // Price words
  "cheap", "expensive", "affordable", "budget", "price", "cost", "rs", "inr", "rupee", "rupees",
  // People / recipients — these should influence category, not keyword search
  "girlfriend", "boyfriend", "wife", "husband", "partner", "lover",
  "mom", "mother", "mum", "mama", "dad", "father", "papa",
  "friend", "bestie", "bff", "sister", "brother", "bro", "sis",
  "him", "her", "them", "he", "she", "they",
  "girl", "boy", "man", "woman", "men", "women", "person", "someone",
  // Quality adjectives that are too generic to help
  "good", "great", "nice", "best", "top", "perfect", "beautiful", "pretty",
  "special", "unique", "amazing", "awesome", "wonderful",
]);

const MAX_RETRIES   = 2;
const RETRY_DELAY_MS = 600;

// ── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `
You are a precision shopping query parser for an Indian e-commerce gift store.
Your ONLY job is to extract structured JSON search filters from a natural-language query.

══════════════════════════════════════════════════════
OUTPUT FORMAT — return ONLY this JSON, nothing else:
{
  "category": string | null,
  "minPrice": number | null,
  "maxPrice": number | null,
  "keywords": string[]
}
══════════════════════════════════════════════════════

━━━ CATEGORY ━━━
Map to ONE of these exact lowercase values:
  watches | perfumes | wallets | gadgets | bags | jewelry | clothing

Direct synonyms:
  handbag / purse / tote / clutch / satchel     → bags
  fragrance / cologne / scent / edp / edt        → perfumes
  timepiece / wristwatch / watch                 → watches
  ring / bracelet / pendant / earrings / chain   → jewelry
  electronics / tech / device / speaker / earbuds → gadgets
  pants / shirt / dress / kurti / saree / apparel → clothing
  cardholder / card holder / billfold            → wallets

Occasion-based inference (when no explicit product mentioned):
  girlfriend / wife / partner / romantic         → jewelry  (luxury hint → bags)
  mom / mother / mum / elegant / floral          → perfumes (jewellery hint → jewelry)
  dad / father / husband / men / him             → watches  (accessory hint → wallets)
  friend / bestie / unisex                       → bags     (fragrance hint → perfumes)
  wedding / anniversary / engagement             → jewelry
  office / work / professional / corporate       → watches or wallets
  teen / teenager / young / college              → gadgets or bags

  When two categories are possible, pick the more specific one.
  If genuinely ambiguous → null.

━━━ PRICE ━━━
- All amounts in INR (₹).
- "5k" or "5K" = 5000, "1.5k" = 1500, "10k" = 10000.
- "under X" / "below X" / "less than X"   → maxPrice: X, minPrice: null
- "above X" / "more than X" / "at least X" → minPrice: X, maxPrice: null
- "between X and Y" / "X to Y"            → minPrice: X, maxPrice: Y
- No price mentioned                       → both null

━━━ KEYWORDS ━━━
Extract 1–4 SPECIFIC product descriptors only:
  ✅ Include: material (leather, silk, gold), style (minimal, vintage, boho),
             occasion-hint (romantic, festive, formal), design (floral, geometric)
  ❌ Exclude: recipient names, generic words (gift/present/buy/nice/best),
             price words, prepositions, the category word itself

Examples:
  "luxury floral perfume for girlfriend under ₹4000"
    → { "category": "perfumes", "maxPrice": 4000, "minPrice": null, "keywords": ["luxury", "floral"] }

  "elegant leather wallet for dad below 2000"
    → { "category": "wallets", "maxPrice": 2000, "minPrice": null, "keywords": ["elegant", "leather"] }

  "anniversary gift under 10000"
    → { "category": "jewelry", "maxPrice": 10000, "minPrice": null, "keywords": ["anniversary"] }

  "something nice for my friend"
    → { "category": "bags", "maxPrice": null, "minPrice": null, "keywords": [] }
`.trim();

// ── Helpers ───────────────────────────────────────────────────────────────────

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Normalise raw user input before sending to Groq */
function normaliseQuery(query: string): string {
  return query
    .trim()
    .replace(/₹/g, "INR ")           // Groq tokenises ₹ poorly
    .replace(/\s+/g, " ")
    .slice(0, 300);                   // hard cap — no prompt injection novels
}

// ── Validation ────────────────────────────────────────────────────────────────

function isValidFilters(value: unknown): value is SearchFilters {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    (typeof v.category === "string" || v.category === null) &&
    (typeof v.minPrice === "number"  || v.minPrice === null) &&
    (typeof v.maxPrice === "number"  || v.maxPrice === null) &&
    Array.isArray(v.keywords) &&
    v.keywords.every((k) => typeof k === "string")
  );
}

// ── Sanitise ──────────────────────────────────────────────────────────────────

function sanitiseFilters(raw: SearchFilters): SearchFilters {
  // Category — lowercase + canonical check
  let category: string | null = null;
  if (raw.category !== null) {
    const c = raw.category.toLowerCase().trim();
    // Accept canonical values; keep unknown ones for controller synonym map
    category = c.length > 0 ? c : null;
  }

  // Prices — clamp negatives, swap if inverted
  let minPrice = raw.minPrice !== null ? Math.max(0, Math.round(raw.minPrice)) : null;
  let maxPrice = raw.maxPrice !== null ? Math.max(0, Math.round(raw.maxPrice)) : null;
  if (minPrice !== null && maxPrice !== null && minPrice > maxPrice) {
    [minPrice, maxPrice] = [maxPrice, minPrice];   // auto-correct inverted range
  }

  // Keywords — deduplicate, lowercase, strip blocked words, min 2 chars
  const keywords = [
    ...new Set(
      raw.keywords
        .map((k) => k.toLowerCase().trim())
        .filter((k) => k.length >= 2 && !BLOCKED_KEYWORDS.has(k))
    ),
  ].slice(0, 4);   // max 4 keywords

  return { category, minPrice, maxPrice, keywords };
}

// ── Fallback parser ───────────────────────────────────────────────────────────
// Used when Groq fails completely — extracts price from the raw query heuristically.

function fallbackFilters(query: string): SearchFilters {
  const lower = query.toLowerCase();

  // Price extraction — matches "under 5000", "below 3k", "₹2000", etc.
  const priceMatch = lower.match(/(?:under|below|upto|up to|less than|within|inr|rs\.?|₹)\s*(\d+\.?\d*)\s*k?/i);
  let maxPrice: number | null = null;
  if (priceMatch) {
    const val = parseFloat(priceMatch[1] ?? "0");
    maxPrice = lower.includes("k") ? val * 1000 : val;
  }

  // Keywords — take meaningful words, exclude blocked
  const words = lower
    .replace(/[^a-z\s]/g, "")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !BLOCKED_KEYWORDS.has(w))
    .slice(0, 3);

  console.warn("[ai.service] Using fallback filter extraction for query:", query);

  return { category: null, minPrice: null, maxPrice, keywords: words };
}

// ── Core extraction with retry ────────────────────────────────────────────────

async function callGroq(query: string, attempt = 0): Promise<string> {
  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      temperature: 0,
      max_tokens: 200,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user",   content: query },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "";
    if (!content) throw new Error("Empty response from Groq.");
    return content;

  } catch (err) {
    if (attempt < MAX_RETRIES) {
      console.warn(`[ai.service] Groq attempt ${attempt + 1} failed, retrying in ${RETRY_DELAY_MS}ms…`);
      await sleep(RETRY_DELAY_MS * (attempt + 1));   // exponential-ish back-off
      return callGroq(query, attempt + 1);
    }
    throw err;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function extractFilters(query: string): Promise<SearchFilters> {
  if (!query || query.trim() === "") {
    throw new Error("query must be a non-empty string.");
  }

  const normalisedQuery = normaliseQuery(query);

  let rawContent: string;

  try {
    rawContent = await callGroq(normalisedQuery);
  } catch (err) {
    // All retries exhausted — use heuristic fallback so the user still gets results
    console.error("[ai.service] Groq permanently failed:", err);
    return fallbackFilters(normalisedQuery);
  }

  // Strip accidental markdown fences (safety net even with response_format)
  const cleaned = rawContent
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    console.error("[ai.service] JSON parse failed. Raw:", rawContent);
    return fallbackFilters(normalisedQuery);
  }

  if (!isValidFilters(parsed)) {
    console.error("[ai.service] Schema mismatch:", JSON.stringify(parsed));
    return fallbackFilters(normalisedQuery);
  }

  const filters = sanitiseFilters(parsed);

  // ── Dev logging (remove in production or guard with NODE_ENV) ──────────────
  if (process.env.NODE_ENV !== "production") {
    console.log("[ai.service] query    :", normalisedQuery);
    console.log("[ai.service] raw      :", cleaned);
    console.log("[ai.service] filters  :", JSON.stringify(filters));
  }

  return filters;
}