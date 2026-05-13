import { Suspense } from "react";
import type { CSSProperties } from "react";
import ARView from "./ARView";

const fallbackStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  zIndex: 9998,
  background: "#1a0d0f",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "rgba(255,255,255,0.70)",
  fontSize: "14px",
};

export default function ARPage() {
  return (
    <>
      <div style={fallbackStyle}>Loading AR...</div>
      <Suspense fallback={null}>
        <ARView />
      </Suspense>
    </>
  );
}
