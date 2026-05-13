"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

interface GiftData {
  _id: string;
  type: "text" | "audio";
  content: string;
  createdAt: string;
}

function getApiOrigin() {
  if (typeof window !== "undefined" && window.location.hostname === "localhost") {
    return "http://localhost:5000";
  }

  return (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(
    /\/api\/?$/,
    ""
  );
}

export default function GiftPage() {
  const { id } = useParams<{ id: string }>();
  const [gift, setGift] = useState<GiftData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    fetch(`${getApiOrigin()}/api/gift/${id}`)
      .then(async (res) => {
        const json = await res.json().catch(() => null);
        if (!json) throw new Error("Invalid gift response");
        return json;
      })
      .then((json) => {
        if (json.success) {
          setGift(json.data);
        } else {
          setError(json.message || "Gift not found");
        }
      })
      .catch(() => setError("Could not load gift"))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div style={styles.center}>
        <p>Opening your gift…</p>
      </div>
    );
  }

  if (error || !gift) {
    return (
      <div style={styles.center}>
        <p style={{ color: "#e74c3c" }}>{error ?? "Something went wrong"}</p>
      </div>
    );
  }

  return (
    <div style={styles.wrapper}>
      <div style={styles.card}>
        <h1 style={styles.title}>🎁 You received a gift!</h1>

        {gift.type === "text" && (
          <p style={styles.message}>{gift.content}</p>
        )}

        {gift.type === "audio" && (
          <div style={styles.audioWrapper}>
            <p style={styles.label}>🎵 A voice message for you</p>
            <audio controls src={gift.content} style={{ width: "100%" }} />
          </div>
        )}

        <p style={styles.date}>
          Sent on {new Date(gift.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  center: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    fontFamily: "sans-serif",
  },
  wrapper: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    minHeight: "100vh",
    background: "#fdf6f0",
    padding: "1rem",
    fontFamily: "sans-serif",
  },
  card: {
    background: "#fff",
    borderRadius: "16px",
    padding: "2rem",
    maxWidth: "480px",
    width: "100%",
    boxShadow: "0 4px 24px rgba(0,0,0,0.10)",
    textAlign: "center",
  },
  title: {
    fontSize: "1.6rem",
    marginBottom: "1.5rem",
    color: "#2d2d2d",
  },
  message: {
    fontSize: "1.15rem",
    lineHeight: 1.7,
    color: "#444",
    whiteSpace: "pre-wrap",
  },
  audioWrapper: {
    display: "flex",
    flexDirection: "column",
    gap: "0.75rem",
  },
  label: {
    fontSize: "1rem",
    color: "#666",
    margin: 0,
  },
  date: {
    marginTop: "1.5rem",
    fontSize: "0.8rem",
    color: "#aaa",
  },
};
