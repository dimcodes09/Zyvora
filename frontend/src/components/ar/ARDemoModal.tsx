"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { QRCodeSVG } from "qrcode.react";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface Product {
  id?: string;
  name?: string;
  price?: string;
  image?: string;
}

interface ARDemoModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
}

interface DragOrigin {
  mx: number;
  my: number;
  px: number;
  py: number;
}

// ─── CONFIG ───────────────────────────────────────────────────────────────────
// Set your machine's local IP here (or via .env.local → NEXT_PUBLIC_LOCAL_IP)
const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

// ─── HELPERS ──────────────────────────────────────────────────────────────────
function buildArUrl(productId: string) {
  if (!baseUrl) {
    console.error("BASE URL missing");
    return "";
  }
  return `${baseUrl}/ar?productId=${productId}`;
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ARDemoModal({ isOpen, onClose, product }: ARDemoModalProps) {
  const [tab, setTab]             = useState<"camera" | "qr">("camera");
  const [camState, setCamState]   = useState<"idle" | "starting" | "active" | "denied" | "error">("idle");
  const [scale, setScale]         = useState(200);               // product overlay width in px
  const [position, setPosition]   = useState({ x: 0, y: 0 });
  const [dragging, setDragging]   = useState(false);
  const [dragOrigin, setDragOrigin] = useState<DragOrigin | null>(null);

  const videoRef  = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // ── camera lifecycle ────────────────────────────────────────────────────────
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(t => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setCamState("idle");
  }, []);

  const startCamera = useCallback(async () => {
    setCamState("starting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCamState("active");
    } catch (err) {
      stopCamera();
      const error = err as { name?: string };
      setCamState(
        error.name === "NotAllowedError" || error.name === "PermissionDeniedError"
          ? "denied"
          : "error"
      );
    }
  }, [stopCamera]);

  // cleanup on close / unmount
  useEffect(() => {
    if (!isOpen) stopCamera();
    return () => stopCamera();
  }, [isOpen, stopCamera]);

  // reset overlay position when product changes
  useEffect(() => { setPosition({ x: 0, y: 0 }); }, [product?.id]);

  // ── drag ───────────────────────────────────────────────────────────────────
  const onDragStart = useCallback((clientX: number, clientY: number) => {
    setDragging(true);
    setDragOrigin({ mx: clientX, my: clientY, px: position.x, py: position.y });
  }, [position]);

  useEffect(() => {
    if (!dragging || !dragOrigin) return;
    const move = (e: Event) => {
      const evt = e as MouseEvent | TouchEvent;
      const { clientX, clientY } =
        "touches" in evt ? evt.touches[0] : (evt as MouseEvent);
      setPosition({
        x: dragOrigin.px + clientX - dragOrigin.mx,
        y: dragOrigin.py + clientY - dragOrigin.my,
      });
    };
    const up = () => setDragging(false);
    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
    window.addEventListener("touchmove", move, { passive: true });
    window.addEventListener("touchend", up);
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
      window.removeEventListener("touchmove", move);
      window.removeEventListener("touchend", up);
    };
  }, [dragging, dragOrigin]);

  if (!isOpen) return null;

  const arUrl = buildArUrl(product?.id ?? "demo");

  return (
    <>
      {/* ── backdrop ───────────────────────────────────────────────────────── */}
      <div
        onClick={(e) => { if (e.target === e.currentTarget) { stopCamera(); onClose(); } }}
        style={{
          position: "fixed", inset: 0, zIndex: 999,
          background: "rgba(26,13,15,0.70)",
          backdropFilter: "blur(6px)",
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "16px",
        }}
      >
        {/* ── modal shell ─────────────────────────────────────────────────── */}
        <div style={{
          width: "min(94vw, 800px)",
          maxHeight: "92vh",
          background: "var(--cream, #FDF8F5)",
          borderRadius: "24px",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 32px 80px rgba(61,42,45,0.30)",
          border: "1px solid rgba(201,123,132,0.15)",
        }}>

          {/* header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "20px 28px 18px",
            borderBottom: "1px solid rgba(201,123,132,0.15)",
          }}>
            <div>
              <div style={{
                display: "inline-flex", alignItems: "center", gap: "6px",
                fontSize: "10px", letterSpacing: "0.15em", textTransform: "uppercase",
                color: "var(--rose, #C97B84)", marginBottom: "4px",
              }}>
                <span style={{ width: "18px", height: "1px", background: "var(--rose, #C97B84)", display: "inline-block" }} />
                AR Experience
              </div>
              <h2 style={{
                margin: 0, fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: "20px", fontWeight: 700,
                color: "var(--text-dark, #2D1B1E)",
              }}>
                {product?.name ?? "Product"} — Live Preview
              </h2>
            </div>
            <button
              onClick={() => { stopCamera(); onClose(); }}
              aria-label="Close"
              style={{
                width: "36px", height: "36px", borderRadius: "50%",
                background: "rgba(201,123,132,0.10)",
                border: "none", cursor: "pointer",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "var(--rose, #C97B84)", fontSize: "16px",
                transition: "background 0.2s",
              }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(201,123,132,0.20)"}
              onMouseLeave={e => e.currentTarget.style.background = "rgba(201,123,132,0.10)"}
            >
              ✕
            </button>
          </div>

          {/* tab bar */}
          <div style={{
            display: "flex", gap: 0,
            padding: "0 28px",
            borderBottom: "1px solid rgba(201,123,132,0.12)",
          }}>
            {([
              { key: "camera", label: "📷  Webcam AR" },
              { key: "qr",     label: "📱  Use on Phone" },
            ] as const).map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                style={{
                  padding: "13px 20px",
                  border: "none", background: "none", cursor: "pointer",
                  fontSize: "13px", fontWeight: tab === key ? 600 : 400,
                  color: tab === key ? "var(--rose, #C97B84)" : "#9C7A7E",
                  borderBottom: tab === key
                    ? "2px solid var(--rose, #C97B84)"
                    : "2px solid transparent",
                  marginBottom: "-1px",
                  transition: "all 0.15s",
                  letterSpacing: "0.02em",
                }}
              >
                {label}
              </button>
            ))}
          </div>

          {/* body */}
          <div style={{ padding: "24px 28px 28px", overflowY: "auto", flex: 1 }}>

            {/* ═══ CAMERA TAB ═══════════════════════════════════════════════ */}
            {tab === "camera" && (
              <>
                {/* viewport */}
                <div style={{
                  position: "relative",
                  width: "100%", aspectRatio: "16/9",
                  borderRadius: "16px", overflow: "hidden",
                  background: "var(--text-dark, #1a0d0f)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: "0 8px 32px rgba(61,42,45,0.20)",
                }}>
                  {/* video element — always in DOM so ref is stable */}
                  <video
                    ref={videoRef}
                    playsInline muted autoPlay
                    style={{
                      width: "100%", height: "100%", objectFit: "cover",
                      display: camState === "active" ? "block" : "none",
                      transform: "scaleX(-1)", // mirror for selfie cam
                    }}
                  />

                  {/* product overlay */}
                  {camState === "active" && product?.image && (
                    <img
                      src={product.image}
                      alt={product.name}
                      draggable={false}
                      onMouseDown={e => { onDragStart(e.clientX, e.clientY); e.preventDefault(); }}
                      onTouchStart={e => { const t = e.touches[0]; onDragStart(t.clientX, t.clientY); }}
                      style={{
                        position: "absolute",
                        top: "50%", left: "50%",
                        width: `${scale}px`,
                        transform: `translate(calc(-50% + ${position.x}px), calc(-50% + ${position.y}px))`,
                        cursor: dragging ? "grabbing" : "grab",
                        userSelect: "none",
                        pointerEvents: "auto",
                        filter: "drop-shadow(0 12px 28px rgba(0,0,0,0.55))",
                        transition: dragging ? "none" : "filter 0.2s",
                      }}
                    />
                  )}

                  {/* ── state overlays ── */}
                  {camState !== "active" && (
                    <div style={{
                      display: "flex", flexDirection: "column",
                      alignItems: "center", justifyContent: "center",
                      gap: "14px", padding: "32px", textAlign: "center",
                      color: "rgba(255,255,255,0.80)",
                    }}>
                      {camState === "idle" && (
                        <>
                          <div style={{ fontSize: "40px", lineHeight: 1 }}>📷</div>
                          <p style={{ margin: 0, fontSize: "14px", color: "rgba(255,255,255,0.60)" }}>
                            Allow camera access to see the product in your space
                          </p>
                          <button
                            onClick={startCamera}
                            style={{
                              padding: "10px 28px",
                              background: "var(--rose, #C97B84)",
                              color: "#fff", border: "none",
                              borderRadius: "30px", fontSize: "13px",
                              fontWeight: 600, cursor: "pointer",
                              letterSpacing: "0.04em",
                              transition: "opacity 0.2s",
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
                            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
                          >
                            ✦ Start Camera
                          </button>
                        </>
                      )}

                      {camState === "starting" && (
                        <>
                          <div style={{ fontSize: "32px" }}>⏳</div>
                          <p style={{ margin: 0, fontSize: "14px" }}>Starting camera…</p>
                        </>
                      )}

                      {camState === "denied" && (
                        <>
                          <div style={{ fontSize: "36px" }}>🚫</div>
                          <p style={{ margin: 0, fontSize: "14px", maxWidth: "280px", color: "rgba(255,255,255,0.75)" }}>
                            Camera access was denied. Please allow camera permission in your browser settings, then try again.
                          </p>
                          <button
                            onClick={startCamera}
                            style={{
                              padding: "9px 24px", borderRadius: "30px",
                              background: "rgba(201,123,132,0.25)",
                              border: "1px solid rgba(201,123,132,0.50)",
                              color: "#f5cdd1", fontSize: "13px",
                              fontWeight: 600, cursor: "pointer",
                            }}
                          >
                            Retry
                          </button>
                        </>
                      )}

                      {camState === "error" && (
                        <>
                          <div style={{ fontSize: "36px" }}>⚠️</div>
                          <p style={{ margin: 0, fontSize: "14px", maxWidth: "280px", color: "rgba(255,255,255,0.75)" }}>
                            Could not start camera. Make sure no other app is using it.
                          </p>
                          <button
                            onClick={startCamera}
                            style={{
                              padding: "9px 24px", borderRadius: "30px",
                              background: "rgba(201,123,132,0.25)",
                              border: "1px solid rgba(201,123,132,0.50)",
                              color: "#f5cdd1", fontSize: "13px",
                              fontWeight: 600, cursor: "pointer",
                            }}
                          >
                            Retry
                          </button>
                        </>
                      )}
                    </div>
                  )}

                  {/* AR badge — shown when active */}
                  {camState === "active" && (
                    <div style={{
                      position: "absolute", top: "12px", left: "12px",
                      padding: "4px 10px",
                      background: "rgba(201,123,132,0.90)",
                      borderRadius: "30px",
                      fontSize: "10px", fontWeight: 700,
                      letterSpacing: "0.12em", color: "#fff",
                    }}>
                      AR LIVE
                    </div>
                  )}
                </div>

                {/* controls row — only when camera active */}
                {camState === "active" && (
                  <div style={{
                    display: "flex", alignItems: "center", gap: "14px",
                    marginTop: "16px",
                  }}>
                    <span style={{ fontSize: "12px", color: "#9C7A7E", whiteSpace: "nowrap" }}>
                      Size
                    </span>
                    <input
                      type="range" min={80} max={500} value={scale}
                      onChange={e => setScale(Number(e.target.value))}
                      style={{ flex: 1, accentColor: "var(--rose, #C97B84)", cursor: "pointer" }}
                    />
                    <button
                      onClick={() => setPosition({ x: 0, y: 0 })}
                      title="Reset position"
                      style={{
                        padding: "6px 12px", borderRadius: "20px",
                        background: "rgba(201,123,132,0.10)",
                        border: "1px solid rgba(201,123,132,0.25)",
                        color: "var(--rose, #C97B84)", fontSize: "11px",
                        fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      ↺ Reset
                    </button>
                    <button
                      onClick={stopCamera}
                      style={{
                        padding: "7px 16px", borderRadius: "20px",
                        background: "rgba(180,50,50,0.08)",
                        border: "1px solid rgba(180,50,50,0.20)",
                        color: "#c0392b", fontSize: "11px",
                        fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
                      }}
                    >
                      Stop
                    </button>
                  </div>
                )}

                {camState === "active" && (
                  <p style={{ margin: "10px 0 0", fontSize: "11px", color: "#B89BA0" }}>
                    Drag the product to reposition · Slider to resize
                  </p>
                )}
              </>
            )}

            {/* ═══ QR TAB ═══════════════════════════════════════════════════ */}
            {tab === "qr" && (
              <div style={{
                display: "flex", flexDirection: "column",
                alignItems: "center", gap: "24px",
                padding: "12px 0",
              }}>
                {/* QR box */}
                <div style={{
                  background: "#fff",
                  borderRadius: "20px",
                  padding: "24px",
                  border: "1px solid rgba(201,123,132,0.15)",
                  boxShadow: "0 4px 20px rgba(61,42,45,0.08)",
                  display: "inline-flex",
                }}>
                  <QRCodeSVG
                    value={arUrl}
                    size={184}
                    level="M"
                    fgColor="#2D1B1E"
                    bgColor="#ffffff"
                  />
                </div>

                {/* URL pill */}
                <div style={{
                  padding: "8px 16px",
                  background: "rgba(201,123,132,0.07)",
                  borderRadius: "30px",
                  border: "1px solid rgba(201,123,132,0.15)",
                  fontSize: "11px", fontFamily: "monospace",
                  color: "#9C7A7E", maxWidth: "360px",
                  textAlign: "center", wordBreak: "break-all",
                }}>
                  {arUrl}
                </div>

                {/* steps */}
                <ol style={{
                  listStyle: "none", margin: 0, padding: 0,
                  display: "flex", flexDirection: "column", gap: "12px",
                  alignSelf: "stretch", maxWidth: "380px",
                }}>
                  {[
                    "Make sure your phone is on the same Wi-Fi network.",
                    "Open your phone's camera and point it at the QR code.",
                    "Tap the link that appears to open the AR preview.",
                    "Allow camera access and see the product in your space.",
                  ].map((step, i) => (
                    <li key={i} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                      <span style={{
                        width: "22px", height: "22px", borderRadius: "50%",
                        background: "var(--rose, #C97B84)",
                        color: "#fff", display: "flex",
                        alignItems: "center", justifyContent: "center",
                        fontSize: "11px", fontWeight: 700, flexShrink: 0,
                        marginTop: "1px",
                      }}>
                        {i + 1}
                      </span>
                      <span style={{ fontSize: "13px", color: "var(--text-mid, #6B4A50)", lineHeight: "1.6" }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>

                {/* tip */}
                <p style={{
                  margin: 0, fontSize: "11px", color: "#B89BA0",
                  textAlign: "center", maxWidth: "340px", lineHeight: "1.6",
                }}>
                  💡 To change the local IP, set <code style={{ background: "rgba(201,123,132,0.08)", padding: "1px 5px", borderRadius: "4px" }}>NEXT_PUBLIC_LOCAL_IP</code> in your <code style={{ background: "rgba(201,123,132,0.08)", padding: "1px 5px", borderRadius: "4px" }}>.env.local</code>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}