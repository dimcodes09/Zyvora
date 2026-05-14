"use client";

// components/GiftMessageBox.tsx
// Self-contained gift message section for the hamper right panel.
// Calls the existing POST /api/gift endpoint we already built.

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

import api from "@/lib/axios";

const stripTrailingSlash = (value: string) => value.replace(/\/+$/, "");

const getGiftBaseUrl = () => {
  const configured =
    process.env.NEXT_PUBLIC_GIFT_BASE_URL ||
    process.env.NEXT_PUBLIC_BASE_URL;
  if (configured) return stripTrailingSlash(configured);

  if (typeof window !== "undefined") {
    const localIp = process.env.NEXT_PUBLIC_LOCAL_IP;
    const isLocalhost =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (localIp && isLocalhost) {
      const port = process.env.NEXT_PUBLIC_PORT || window.location.port || "3000";
      return `${window.location.protocol}//${localIp}${port ? `:${port}` : ""}`;
    }

    return window.location.origin;
  }

  return "";
};

const buildGiftUrl = (giftId: string) => `${getGiftBaseUrl()}/gift/${giftId}`;

type GiftType = "text" | "audio";
type Status   = "idle" | "saving" | "saved" | "error";

interface Props {
  /** Passed through to checkout URL so the order carries the gift */
  onGiftSaved?: (giftId: string) => void;
}

export default function GiftMessageBox({ onGiftSaved }: Props) {
  const [open,        setOpen]        = useState(false);
  const [giftType,    setGiftType]    = useState<GiftType>("text");
  const [content,     setContent]     = useState("");
  const [audioUrl,    setAudioUrl]    = useState("");
  const [status,      setStatus]      = useState<Status>("idle");
  const [savedGiftId, setSavedGiftId] = useState<string | null>(null);

  const handleSave = async () => {
    const value = giftType === "text" ? content.trim() : audioUrl.trim();
    if (!value) return;

    setStatus("saving");
    try {
      const res = await api.post("/gift", { type: giftType, content: value });
      const data = res.data;
      if (!data.success) throw new Error(data.message);

      setSavedGiftId(data.giftId);
      setStatus("saved");
      onGiftSaved?.(data.giftId);
    } catch {
      setStatus("error");
    }
  };

  const handleReset = () => {
    setStatus("idle");
    setSavedGiftId(null);
    setContent("");
    setAudioUrl("");
    setOpen(false);
  };

  const savedGiftUrl = savedGiftId ? buildGiftUrl(savedGiftId) : "";

  return (
    <div style={s.wrapper}>

      {/* Toggle row */}
      <button style={s.toggle} onClick={() => setOpen((p) => !p)}>
        <span style={s.toggleIcon}>🎀</span>
        <span style={s.toggleLabel}>
          {savedGiftId ? "Gift message added ✓" : "Add a gift message"}
        </span>
        <span style={{ ...s.toggleChevron, transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
          ▾
        </span>
      </button>

      {/* Expandable body */}
      {open && (
        <div style={s.body}>

          {/* Saved state */}
          {status === "saved" && savedGiftId ? (
            <div style={s.savedBox}>
              <p style={s.savedText}>🎉 Gift message saved!</p>
              <p style={s.savedSub}>
                Your receiver will see this when they scan the QR on their hamper.
              </p>
              <div style={s.qrWrapper}>
                <QRCodeSVG
                  value={savedGiftUrl}
                  size={180}
                />
              </div>
              <a
                href={savedGiftUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={s.savedCode}
              >
                {savedGiftUrl}
              </a>
              <button style={s.resetBtn} onClick={handleReset}>
                Change message
              </button>
            </div>
          ) : (
            <>
              {/* Type tabs */}
              <div style={s.tabs}>
                {(["text", "audio"] as GiftType[]).map((t) => (
                  <button
                    key={t}
                    style={{ ...s.tab, ...(giftType === t ? s.tabActive : {}) }}
                    onClick={() => { setGiftType(t); setStatus("idle"); }}
                  >
                    {t === "text" ? "✍️ Text" : "🎙️ Voice URL"}
                  </button>
                ))}
              </div>

              {/* Input */}
              {giftType === "text" ? (
                <textarea
                  style={s.textarea}
                  placeholder="Write a heartfelt message…"
                  value={content}
                  rows={3}
                  onChange={(e) => { setContent(e.target.value); setStatus("idle"); }}
                />
              ) : (
                <>
                  <input
                    style={s.input}
                    type="url"
                    placeholder="Paste hosted audio URL (mp3, m4a…)"
                    value={audioUrl}
                    onChange={(e) => { setAudioUrl(e.target.value); setStatus("idle"); }}
                  />
                  {audioUrl && (
                    <audio controls src={audioUrl} style={{ width: "100%", marginTop: "6px" }} />
                  )}
                </>
              )}

              {status === "error" && (
                <p style={s.errorText}>⚠ Failed to save. Please try again.</p>
              )}

              {/* Save button */}
              <button
                style={{
                  ...s.saveBtn,
                  opacity: status === "saving" ? 0.6 : 1,
                  cursor:  status === "saving" ? "not-allowed" : "pointer",
                }}
                disabled={status === "saving"}
                onClick={handleSave}
              >
                {status === "saving" ? "Saving…" : "Save Gift Message 🎁"}
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const s: Record<string, React.CSSProperties> = {
  wrapper: {
    borderRadius: "12px",
    border:       "1px dashed rgba(139,26,47,0.25)",
    overflow:     "visible",
    marginBottom: "12px",
    background:   "#fffafb",
  },
  toggle: {
    width:          "100%",
    display:        "flex",
    alignItems:     "center",
    gap:            "8px",
    padding:        "12px 14px",
    background:     "transparent",
    border:         "none",
    cursor:         "pointer",
    fontFamily:     "'Georgia', serif",
  },
  toggleIcon:    { fontSize: "16px" },
  toggleLabel:   { flex: 1, fontSize: "12px", color: "#8B1A2F", letterSpacing: "0.06em", textAlign: "left" },
  toggleChevron: { fontSize: "11px", color: "#c09090", transition: "transform 0.2s ease" },

  body: {
    padding:    "0 14px 14px",
    display:    "flex",
    flexDirection: "column",
    gap:        "8px",
    overflow:   "visible",
  },
  tabs: { display: "flex", gap: "6px" },
  tab: {
    flex:          1,
    padding:       "6px",
    fontSize:      "11px",
    borderRadius:  "8px",
    border:        "1px solid #e8c8c8",
    background:    "transparent",
    color:         "#a07070",
    cursor:        "pointer",
    fontFamily:    "'Georgia', serif",
    letterSpacing: "0.04em",
    transition:    "all 0.15s",
  },
  tabActive: {
    background: "#8B1A2F",
    color:      "#fff",
    border:     "1px solid #8B1A2F",
  },
  textarea: {
    width:        "100%",
    borderRadius: "8px",
    border:       "1px solid #e8c8c8",
    padding:      "10px",
    fontSize:     "13px",
    color:        "#3d1010",
    fontFamily:   "'Georgia', serif",
    resize:       "vertical",
    outline:      "none",
    background:   "#fff",
    boxSizing:    "border-box",
  },
  input: {
    width:        "100%",
    borderRadius: "8px",
    border:       "1px solid #e8c8c8",
    padding:      "9px 10px",
    fontSize:     "12px",
    color:        "#3d1010",
    fontFamily:   "'Georgia', serif",
    outline:      "none",
    background:   "#fff",
    boxSizing:    "border-box",
  },
  saveBtn: {
    width:         "100%",
    padding:       "10px",
    borderRadius:  "8px",
    border:        "none",
    background:    "#8B1A2F",
    color:         "#fff",
    fontSize:      "11px",
    letterSpacing: "0.1em",
    fontFamily:    "'Georgia', serif",
    transition:    "background 0.2s",
  },
  errorText: { fontSize: "11px", color: "#c0504d", margin: 0 },

  savedBox: {
    display:       "flex",
    flexDirection: "column",
    gap:           "8px",
    padding:       "4px 0 2px",
    overflow:      "visible",
  },
  savedText:  { fontSize: "13px", color: "#3d1010", fontWeight: 600, margin: 0 },
  savedSub:   { fontSize: "11px", color: "#a07070", margin: 0, lineHeight: 1.5 },
  savedLink: {
    background:   "#fdf4f4",
    borderRadius: "6px",
    padding:      "7px 10px",
    fontSize:     "11px",
    color:        "#8B1A2F",
    wordBreak:    "break-all",
  },
  qrWrapper: {
    display:        "flex",
    justifyContent: "center",
    alignItems:     "center",
    padding:        "12px 0 10px",
    minHeight:      "200px",
    overflow:       "visible",
  },
  savedCode: {
    fontFamily:  "monospace",
    fontSize:    "10px",
    color:       "#8B1A2F",
    wordBreak:   "break-all",
    textAlign:   "center" as const,
  },
  resetBtn: {
    alignSelf:     "flex-start",
    background:    "transparent",
    border:        "none",
    color:         "#c09090",
    fontSize:      "11px",
    cursor:        "pointer",
    padding:       0,
    textDecoration: "underline",
    fontFamily:    "'Georgia', serif",
  },
};
