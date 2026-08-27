"use client";

const PARTICLE_COUNT = 40;
const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  return {
    left: Math.random() * 100,
    size: 4 + Math.random() * 6,
    dur: 2.5 + Math.random() * 2,
    delay: Math.random() * 3,
    drift: (Math.random() - 0.5) * 60,
    color: i % 3 === 0 ? "#C6FF00" : "#00E0D1",
  };
});

export function ConfettiEffect() {
  return (
    <>
      <style>{`
        @keyframes gq-fall {
          0% { transform: translateY(-20px) translateX(0) rotate(0deg); opacity: 0; }
          10% { opacity: 1; }
          90% { opacity: 0.7; }
          100% { transform: translateY(calc(100dvh + 20px)) translateX(var(--drift)) rotate(360deg); opacity: 0; }
        }
      `}</style>
      {PARTICLES.map((p, i) => (
        <div
          key={i}
          className="absolute pointer-events-none"
          style={{
            top: -20,
            left: `${p.left}%`,
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: i % 4 === 0 ? "1px" : "50%",
            boxShadow: `0 0 ${p.size}px ${p.color}`,
            opacity: 0,
            "--drift": `${p.drift}px`,
            animation: `gq-fall ${p.dur}s linear ${p.delay}s infinite`,
          } as React.CSSProperties}
        />
      ))}
    </>
  );
}
