
import { Suspense } from "react";
import ARView from "./ARView";

export default function ARPage() {
  return (
    <Suspense fallback={
      <div style={{
        position: "fixed", inset: 0, background: "#1a0d0f",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "rgba(255,255,255,0.60)", fontSize: "14px",
      }}>
        Loading AR…
      </div>
    }>
      <ARView />
    </Suspense>
  );
}