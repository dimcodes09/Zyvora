import type { Request, Response } from "express";

export const getSuggestions = (req: Request, res: Response) => {
  const q = (req.query.q as string)?.toLowerCase() || "";

  if (!q) {
    return res.json([]);
  }

  // simple static suggestions (you can improve later)
  const suggestions = [
    "luxury watches",
    "minimal watches",
    "watches under 5000",
    "gift for her",
    "birthday gifts",
    "premium handbags",
    "perfumes for men",
  ];

  const filtered = suggestions.filter((s) =>
    s.toLowerCase().includes(q)
  );

  res.json(filtered.slice(0, 6));
};