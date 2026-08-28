"use client";

// Ambient background for the Creator (light-theme) screens, mirroring
// Creator_Quest_List.html from design-preparation/: a faint teal grid plus a
// single winding dashed route drawn across the whole screen, animated via a
// stroke-dashoffset loop (cq-dash). Unlike station-list.tsx's RouteLine (which
// measures and connects two station badges), this path is fixed/decorative —
// Creator list screens have no two fixed points to connect.
export function CreatorBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes cq-dash {
          to { stroke-dashoffset: -200; }
        }
      `}</style>

      {/* Faint teal grid, matches the mockup's 34px cell background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,134,126,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,134,126,.07) 1px,transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* Animated winding dashed route */}
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 390 844"
        preserveAspectRatio="none"
        className="absolute inset-0 overflow-visible"
        aria-hidden="true"
      >
        <path
          d="M-20,240 C 90,190 130,320 230,290 S 370,370 330,470 S 190,540 250,650 S 380,700 410,630"
          fill="none"
          stroke="#7FA800"
          strokeWidth={3}
          strokeLinecap="round"
          strokeDasharray="9 14"
          opacity={0.22}
          style={{ animation: "cq-dash 8s linear infinite" }}
        />
      </svg>
    </div>
  );
}
