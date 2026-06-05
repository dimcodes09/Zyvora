import { useState } from "react";

// ── Shared types (re-exported so the component can import from one place) ──────

export interface ChatProduct {
  _id: string;
  name: string;
  category: string;
  price: number;
  image?: string;
}

export type ChatMsg =
  | { role: "bot";  kind: "text";     text: string }
  | { role: "user"; kind: "text";     text: string }
  | { role: "bot";  kind: "products"; products: ChatProduct[] };

// ── Hook ──────────────────────────────────────────────────────────────────────

// NEXT_PUBLIC_API_URL already contains the /api prefix (e.g. "http://localhost:5000/api")
// We strip it here so the hook can build full paths without double /api
const _envUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api";
const BACKEND_ORIGIN = _envUrl.replace(/\/api\/?$/, ""); // → "http://localhost:5000"

const INITIAL_MESSAGES: ChatMsg[] = [
  {
    role: "bot",
    kind: "text",
    text: "Hello! ✨ Tell me about the person you're gifting. What's the occasion?",
  },
];

export function useZyvoraChat() {
  const [messages, setMessages] = useState<ChatMsg[]>(INITIAL_MESSAGES);
  const [isLoading, setIsLoading] = useState(false);

  async function sendMessage(text: string) {
    const query = text.trim();
    if (!query || isLoading) return;

    // 1. Append user message immediately
    setMessages((prev) => [...prev, { role: "user", kind: "text", text: query }]);
    setIsLoading(true);

    try {
      // 2. Call backend AI search (Groq parses intent → MongoDB products)
      const res = await fetch(`${BACKEND_ORIGIN}/api/ai/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) throw new Error(`Search failed: ${res.status}`);

      const data = await res.json();

      if (!data.success) throw new Error("No results");

      const products: ChatProduct[] = data.products ?? [];

      if (products.length === 0) {
        setMessages((prev) => [
          ...prev,
          {
            role: "bot",
            kind: "text",
            text: "I couldn't find anything matching that. Try describing it differently — like 'elegant gift under ₹5000' 🌸",
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          { role: "bot", kind: "products", products },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "bot",
          kind: "text",
          text: "Oops, something went wrong. Please try again in a moment 🙏",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  return { messages, isLoading, sendMessage };
}