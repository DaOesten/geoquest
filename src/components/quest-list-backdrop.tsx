"use client";

const DOT_COUNT = 46;
const DOTS = Array.from({ length: DOT_COUNT }, (_, i) => {
  const size = 1.5 + Math.random() * 3.5;
  const isLime = i % 11 === 0;
  const color = isLime ? "198,255,0" : "0,224,209";
  return {
    size,
    color,
    left: Math.random() * 100,
    top: 8 + Math.random() * 92,
    opacity: 0.5 + Math.random() * 0.5,
    dur: 7 + Math.random() * 9,
    delay: -Math.random() * 14,
  };
});

export function QuestListBackdrop() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <style>{`
        @keyframes gq-float {
          0% { transform: translate3d(0,10px,0) scale(.7); opacity: 0; }
          12% { opacity: 1; }
          55% { transform: translate3d(6px,-46px,0) scale(1.25); }
          88% { opacity: .55; }
          100% { transform: translate3d(-4px,-104px,0) scale(.6); opacity: 0; }
        }
      `}</style>

      {/* Faint teal grid */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0,224,209,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(0,224,209,.07) 1px,transparent 1px)",
          backgroundSize: "34px 34px",
        }}
      />

      {/* Soft teal glow, top-right */}
      <div
        className="absolute -right-28 -top-16 w-[300px] h-[300px] rounded-full"
        style={{
          background: "radial-gradient(circle, rgba(0,224,209,.15), transparent 70%)",
        }}
      />

      {/* Floating particles */}
      {DOTS.map((d, i) => (
        <div
          key={i}
          className="absolute rounded-full"
          style={{
            left: `${d.left}%`,
            top: `${d.top}%`,
            width: d.size,
            height: d.size,
            background: `rgba(${d.color},${d.opacity})`,
            boxShadow: `0 0 ${4 + d.size * 2.5}px rgba(${d.color},.75)`,
            animation: `gq-float ${d.dur}s linear ${d.delay}s infinite`,
          }}
        />
      ))}
    </div>
  );
}
