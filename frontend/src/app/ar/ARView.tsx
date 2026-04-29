"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// ─── TYPES ────────────────────────────────────────────────────────────────────
interface DragOrigin {
  mx: number;
  my: number;
  px: number;
  py: number;
}

// ─── PRODUCT RESOLVER ─────────────────────────────────────────────────────────
// Replace this with a real API/DB fetch in production.
const PRODUCT_MAP: Record<string, { name: string; image: string; price: string }> = {
  demo: { name: "Mauve Bag",    image: "/mauve-bag.png",   price: "₹5,500" },
  "1":  { name: "Product One",  image: "/products/product-1.png",   price: "₹3,200" },
  "2":  { name: "Product Two",  image: "/products/product-2.png",   price: "₹4,800" },
};

function resolveProduct(id: string) {
  return PRODUCT_MAP[id] ?? PRODUCT_MAP["demo"];
}

// ─── COMPONENT ────────────────────────────────────────────────────────────────
export default function ARView() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const productId    = searchParams.get("productId") ?? "demo";
  const product      = resolveProduct(productId);

  const [camState, setCamState]    = useState("idle"); // idle|starting|active|denied|error
  const [scale, setScale]          = useState(180);
  const [showControls, setShowControls] = useState(true);
  const [position, setPosition]    = useState({ x: 0, y: 0 });
  const [dragging, setDragging]    = useState(false);
  const [dragOrigin, setDragOrigin] = useState<DragOrigin | null>(null);

  const videoRef       = useRef<HTMLVideoElement | null>(null);
  const streamRef      = useRef<MediaStream | null>(null);
// ✅ FIXED
const hideTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

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
        video: {
          facingMode: { ideal: "environment" }, // rear camera on phones
          width:  { ideal: 1920 },
          height: { ideal: 1080 },
        },
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

  // auto-start on mount
  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, [startCamera, stopCamera]);

  // ── auto-hide controls ─────────────────────────────────────────────────────
  const resetHideTimer = useCallback(() => {
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    setShowControls(true);
    hideTimerRef.current = setTimeout(() => setShowControls(false), 3500);
  }, []);

  useEffect(() => {
    if (camState === "active") resetHideTimer();
    return () => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current); };
  }, [camState, resetHideTimer]);

  // ── drag ───────────────────────────────────────────────────────────────────
  const onDragStart = useCallback((clientX: number, clientY: number) => {
    setDragging(true);
    setDragOrigin({ mx: clientX, my: clientY, px: position.x, py: position.y });
    resetHideTimer();
  }, [position, resetHideTimer]);

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

  // ── render ─────────────────────────────────────────────────────────────────
  return (
    <div
      style={{
        position: "fixed", inset: 0,
        background: "#1a0d0f",
        overflow: "hidden",
        touchAction: "none",
      }}
      onClick={resetHideTimer}
    >
      {/* video feed */}
      <video
        ref={videoRef}
        playsInline muted autoPlay
        style={{
          position: "absolute", inset: 0,
          width: "100%", height: "100%",
          objectFit: "cover",
          display: camState === "active" ? "block" : "none",
        }}
      />

      {/* product overlay */}
      {camState === "active" && product.image && (
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
            filter: "drop-shadow(0 16px 32px rgba(0,0,0,0.60))",
            touchAction: "none",
          }}
        />
      )}

      {/* ── non-active states ─────────────────────────────────────────────── */}
      {camState !== "active" && (
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          gap: "18px", padding: "32px", textAlign: "center",
          color: "rgba(255,255,255,0.85)",
        }}>
          {camState === "idle" || camState === "starting" ? (
            <>
              <div style={{ fontSize: "48px" }}>📷</div>
              <p style={{ margin: 0, fontSize: "15px", color: "rgba(255,255,255,0.65)" }}>
                {camState === "starting" ? "Starting camera…" : "Preparing AR…"}
              </p>
            </>
          ) : camState === "denied" ? (
            <>
              <div style={{ fontSize: "44px" }}>🚫</div>
              <p style={{ margin: 0, fontSize: "15px", maxWidth: "280px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                Camera access denied. Please allow camera access in your browser settings.
              </p>
              <button onClick={startCamera} style={btnStyle}>Retry</button>
            </>
          ) : (
            <>
              <div style={{ fontSize: "44px" }}>⚠️</div>
              <p style={{ margin: 0, fontSize: "15px", maxWidth: "280px", color: "rgba(255,255,255,0.75)", lineHeight: 1.6 }}>
                Could not start camera. Check that no other app is using it.
              </p>
              <button onClick={startCamera} style={btnStyle}>Retry</button>
            </>
          )}
        </div>
      )}

      {/* ── top bar (AR badge + back button) ─────────────────────────────── */}
      <div style={{
        position: "absolute", top: 0, left: 0, right: 0,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "env(safe-area-inset-top, 16px) 16px 16px",
        paddingTop: "max(env(safe-area-inset-top), 16px)",
        background: "linear-gradient(to bottom, rgba(26,13,15,0.70) 0%, transparent 100%)",
        opacity: showControls ? 1 : 0,
        transition: "opacity 0.4s",
        pointerEvents: showControls ? "auto" : "none",
      }}>
        <span style={{
          padding: "5px 12px",
          background: "rgba(201,123,132,0.90)",
          borderRadius: "30px",
          fontSize: "10px", fontWeight: 700,
          letterSpacing: "0.12em", color: "#fff",
        }}>
          AR MODE
        </span>

        <button
          onClick={() => { stopCamera(); router.back(); }}
          style={{
            width: "34px", height: "34px",
            borderRadius: "50%",
            background: "rgba(255,255,255,0.18)",
            border: "none", cursor: "pointer",
            color: "#fff", fontSize: "16px",
            display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
          }}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* ── bottom bar (product info + scale slider) ──────────────────────── */}
      {camState === "active" && (
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          padding: "20px 20px max(env(safe-area-inset-bottom), 20px)",
          background: "linear-gradient(to top, rgba(26,13,15,0.85) 0%, transparent 100%)",
          opacity: showControls ? 1 : 0,
          transition: "opacity 0.4s",
          pointerEvents: showControls ? "auto" : "none",
        }}>
          {/* product name + price */}
          <div style={{ marginBottom: "14px" }}>
            <p style={{
              margin: 0,
              fontFamily: "'Playfair Display', Georgia, serif",
              fontSize: "16px", fontWeight: 600,
              color: "#fff", lineHeight: 1.2,
            }}>
              {product.name}
            </p>
            {product.price && (
              <p style={{ margin: "3px 0 0", fontSize: "13px", color: "rgba(201,123,132,0.90)", fontWeight: 600 }}>
                {product.price}
              </p>
            )}
          </div>

          {/* scale row */}
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.55)", whiteSpace: "nowrap" }}>
              Size
            </span>
            <input
              type="range" min={60} max={480} value={scale}
              onChange={e => { setScale(Number(e.target.value)); resetHideTimer(); }}
              style={{ flex: 1, accentColor: "#C97B84", cursor: "pointer" }}
            />
            <button
              onClick={() => { setPosition({ x: 0, y: 0 }); resetHideTimer(); }}
              style={{
                padding: "5px 12px", borderRadius: "20px",
                background: "rgba(255,255,255,0.12)",
                border: "1px solid rgba(255,255,255,0.20)",
                color: "rgba(255,255,255,0.80)", fontSize: "11px",
                fontWeight: 600, cursor: "pointer",
              }}
            >
              ↺
            </button>
          </div>

          <p style={{ margin: "10px 0 0", fontSize: "11px", color: "rgba(255,255,255,0.35)", textAlign: "center" }}>
            Tap screen to show controls · Drag to reposition
          </p>
        </div>
      )}
    </div>
  );
}

const btnStyle = {
  padding: "10px 28px",
  background: "rgba(201,123,132,0.25)",
  border: "1px solid rgba(201,123,132,0.50)",
  borderRadius: "30px",
  color: "#f5cdd1",
  fontSize: "13px",
  fontWeight: 600,
  cursor: "pointer",
};