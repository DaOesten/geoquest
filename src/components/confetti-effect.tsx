"use client";

// Konfetti-Kanone: ein Schuss von unten mittig nach oben, danach Ruhe.
//
// Bis zum Refinement 2026-09-19 rieselten die Partikel endlos von oben herab.
// Rieseln ist Wetter, kein Jubel — und das `infinite` hielt 40 Elemente
// dauerhaft animiert, lange nachdem der Spieler den Screen gelesen hatte.
// Jetzt feuert die Kanone einmal pro Mount; danach gehoert die Aufmerksamkeit
// dem CTA. Deckt sich mit der Motion-Regel des Design Systems ("keine
// Ambient-Loops").
//
// Geteilt zwischen Ankunfts-Screen (PROJ-3) und Outro-Screen (PROJ-5) —
// bewusst dasselbe Verhalten an beiden Stellen.

const PARTICLE_COUNT = 70;

// Der Schuss faechert nach oben auf: 0deg ist senkrecht, der Streuwinkel
// oeffnet ihn nach links und rechts.
//
// Einheiten: Aufstieg UND seitlicher Versatz rechnen in `vh`. Gemischte
// Einheiten (vw waagerecht, vh senkrecht) haetten zur Folge, dass der
// tatsaechliche Abschusswinkel am Seitenverhaeltnis des Geraets haengt — auf
// 390x844 ist 1vh 8.4px gegen 3.9px bei 1vw, der Faecher faellt also je nach
// Geraet anders aus als berechnet. Eine gemeinsame Einheit haelt ihn ueberall
// so, wie er gemeint ist.
const SPREAD_DEG = 62;
const RISE_MIN = 46; // vh
const RISE_MAX = 92;

const PARTICLES = Array.from({ length: PARTICLE_COUNT }, (_, i) => {
  // Gleichmaessig ueber den Faecher verteilt, mit etwas Zufall gegen
  // sichtbare Reihenbildung.
  const t = (i + Math.random() * 0.8) / PARTICLE_COUNT;
  const angle = (t - 0.5) * 2 * SPREAD_DEG;
  const rad = (angle * Math.PI) / 180;

  const power = RISE_MIN + Math.random() * (RISE_MAX - RISE_MIN);

  return {
    // Gipfelpunkt aus dem Abschusswinkel — beide Achsen in vh.
    peakX: Math.sin(rad) * power,
    peakY: -Math.cos(rad) * power,
    // Danach faellt das Partikel seitlich streuend nach unten aus dem Bild.
    fallX: Math.sin(rad) * power * 1.5 + (Math.random() - 0.5) * 12,
    size: 6 + Math.random() * 7,
    // Kurze, gestaffelte Zuendung: der Schuss wirkt als ein Ereignis,
    // nicht als 70 einzelne Starts.
    delay: Math.random() * 0.18,
    dur: 1.7 + Math.random() * 1.0,
    spin: (Math.random() < 0.5 ? -1 : 1) * (420 + Math.random() * 540),
    color: i % 3 === 0 ? "#C6FF00" : "#00E0D1",
    round: i % 4 === 0,
  };
});

export function ConfettiEffect() {
  return (
    <>
      <style>{`
        @keyframes gq-cannon {
          0% {
            transform: translate3d(0, 0, 0) scale(0.4) rotate(0deg);
            opacity: 0;
          }
          8% { opacity: 1; }
          /* Gipfel: der Aufstieg ist verbraucht, das Partikel kippt. */
          45% {
            transform: translate3d(var(--peak-x), var(--peak-y), 0) scale(1) rotate(calc(var(--spin) * 0.45));
            opacity: 1;
          }
          80% { opacity: 0.85; }
          100% {
            transform: translate3d(var(--fall-x), 12vh, 0) scale(0.9) rotate(var(--spin));
            opacity: 0;
          }
        }
        /* Die Kanone ist reine Dekoration — bei reduzierter Bewegung entfaellt
           der Schuss, der Screen bleibt inhaltlich vollstaendig. */
        @media (prefers-reduced-motion: reduce) {
          .gq-confetti-particle { display: none; }
        }
      `}</style>
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        {PARTICLES.map((p, i) => (
          <div
            key={i}
            className="gq-confetti-particle absolute"
            style={
              {
                // Muendung: unten mittig.
                left: "50%",
                bottom: 0,
                width: p.size,
                height: p.size,
                marginLeft: -p.size / 2,
                backgroundColor: p.color,
                borderRadius: p.round ? "50%" : "1px",
                boxShadow: `0 0 ${p.size}px ${p.color}`,
                opacity: 0,
                "--peak-x": `${p.peakX}vh`,
                "--peak-y": `${p.peakY}vh`,
                "--fall-x": `${p.fallX}vh`,
                "--spin": `${p.spin}deg`,
                // `both` haelt den Endzustand (opacity 0) — kein `infinite`.
                animation: `gq-cannon ${p.dur}s cubic-bezier(.22,.61,.36,1) ${p.delay}s both`,
              } as React.CSSProperties
            }
          />
        ))}
      </div>
    </>
  );
}
