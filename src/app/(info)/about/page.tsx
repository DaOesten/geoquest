import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  Layers,
  Puzzle,
  Sparkles,
  UserX,
  Wallet,
} from "lucide-react";
import { InfoPageShell } from "@/components/info-page-shell";

export const metadata: Metadata = {
  title: "Was ist Geo Quest?",
  description:
    "GPS-Schnitzeljagden zum Selberbauen — für Kindergeburtstag, Schulausflug oder Ferienprogramm. Kostenlos, ohne Account, ohne Abo.",
  openGraph: {
    title: "Geo Quest — Schnitzeljagden zum Selberbauen",
    description:
      "GPS-Schnitzeljagden zum Selberbauen — für Kindergeburtstag, Schulausflug oder Ferienprogramm. Kostenlos, ohne Account, ohne Abo.",
    images: ["/assets/urbanquest.png"],
    type: "website",
  },
};

const FEATURES = [
  {
    icon: Compass,
    title: "Navigation zu echten Orten",
    body: "Spieler laufen mit GPS von Ziel zu Ziel. Ein Pfeil zeigt die Richtung, die Entfernung zählt runter.",
  },
  {
    icon: Layers,
    title: "Fünf Bausteine pro Ziel",
    body: "Text, Bild, Audio, Video und Aufgaben — kombinierbar, wie du willst.",
  },
  {
    icon: Puzzle,
    title: "Drei Aufgabentypen",
    body: "Code eintippen, Multiple Choice oder Sortieren. Weiter geht es erst, wenn gelöst ist.",
  },
];

const OCCASIONS = [
  "Kindergeburtstag",
  "Schulausflug",
  "Ferienprogramm",
  "Jugendgruppe",
];

export default function AboutPage() {
  return (
    <InfoPageShell
      eyebrow="Über Geo Quest"
      title={
        <>
          Draußen ist
          <br />
          <span className="text-gq-teal">das Spielfeld.</span>
        </>
      }
      meta="Für Ersteller · ca. 2 Min Lesezeit"
    >
      {/* Hero */}
      <div className="mt-6 overflow-hidden rounded-card border border-border shadow-card">
        <Image
          src="/assets/urbanquest.png"
          alt="Nächtliche Straße mit leuchtender Route und dem Schriftzug Explore. Solve. Discover."
          width={1536}
          height={1024}
          priority
          className="w-full h-auto"
        />
      </div>

      <p className="mt-5 font-body text-[15px] leading-relaxed text-[#E7EAEC]">
        Geo Quest ist eine Schnitzeljagd-App für Kinder und Jugendliche von 10
        bis 15. Du baust die Route, schreibst die Rätsel — die Gruppe läuft
        los und löst sie draußen.
      </p>

      <div className="mt-6 flex flex-col gap-3">
        <Link
          href="/anleitung"
          className="flex items-center justify-center gap-2 h-12 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
        >
          <Sparkles className="w-4 h-4" />
          Quest mit KI bauen
        </Link>
        <Link
          href="/"
          className="flex items-center justify-center h-12 rounded-pill border border-gq-teal text-gq-teal text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
        >
          Zur App
        </Link>
      </div>

      {/* Features */}
      <section className="mt-10">
        <h2 className="text-tech text-[10px] tracking-[0.12em] text-gq-teal">
          Was drin steckt
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-card border border-border bg-gq-dark-teal/70 p-4 shadow-card"
            >
              <Icon className="w-6 h-6 text-gq-teal" />
              <h3 className="mt-3 font-display italic text-lg uppercase leading-tight text-gq-white">
                {title}
              </h3>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-gq-grey">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Anlässe */}
      <section className="mt-10">
        <h2 className="text-tech text-[10px] tracking-[0.12em] text-gq-teal">
          Für wen
        </h2>
        <h3 className="mt-1 font-display italic text-[clamp(1.4rem,6vw,1.8rem)] uppercase leading-[1] text-gq-white">
          Eltern, Lehrer,
          <br />
          Jugendleiter.
        </h3>
        <p className="mt-3 font-body text-sm leading-relaxed text-[#E7EAEC]">
          Du brauchst kein technisches Vorwissen. Wer eine Route kennt und sich
          Rätsel ausdenken kann, baut in einer halben Stunde eine Quest.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2">
          {OCCASIONS.map((occasion) => (
            <li
              key={occasion}
              className="rounded-badge border border-border bg-gq-dark-teal px-3 py-2 text-tech text-[10px] tracking-[0.1em] text-gq-grey"
            >
              {occasion}
            </li>
          ))}
        </ul>
      </section>

      {/* Abgrenzung */}
      <section className="mt-10">
        <h2 className="text-tech text-[10px] tracking-[0.12em] text-gq-lime">
          Der Unterschied
        </h2>
        <div className="mt-3 flex flex-col gap-3">
          <div className="flex gap-3 rounded-card border border-border bg-gq-dark-teal/70 p-4 shadow-card">
            <Wallet className="w-5 h-5 flex-shrink-0 text-gq-lime" />
            <div>
              <h3 className="text-tech text-xs tracking-[0.08em] text-gq-white">
                Kostenlos, kein Abo
              </h3>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-gq-grey">
                Keine Bezahlschranke, keine Testphase, keine Begrenzung auf eine
                Quest.
              </p>
            </div>
          </div>
          <div className="flex gap-3 rounded-card border border-border bg-gq-dark-teal/70 p-4 shadow-card">
            <UserX className="w-5 h-5 flex-shrink-0 text-gq-lime" />
            <div>
              <h3 className="text-tech text-xs tracking-[0.08em] text-gq-white">
                Kein Account
              </h3>
              <p className="mt-1.5 font-body text-sm leading-relaxed text-gq-grey">
                Keine Anmeldung, keine E-Mail. Deine Quests bleiben auf deinem
                Gerät — teilen kannst du sie als Datei.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Abschluss-CTA */}
      <section className="mt-10 rounded-card border border-gq-teal/40 bg-gq-dark-teal/70 p-5 text-center shadow-card">
        <h2 className="font-display italic text-[clamp(1.4rem,6vw,1.8rem)] uppercase leading-[1] text-gq-white">
          Bereit für
          <br />
          <span className="text-gq-teal">deine Quest?</span>
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-gq-grey">
          Lass dir von einer KI den ersten Entwurf bauen — in wenigen Minuten.
        </p>
        <Link
          href="/anleitung"
          className="mt-4 flex items-center justify-center gap-2 h-12 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
        >
          Zur Anleitung
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </InfoPageShell>
  );
}
