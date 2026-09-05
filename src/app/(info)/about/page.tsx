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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DESCRIPTION =
  "Digitale Schnitzeljagd selbst erstellen — kostenlos, ohne Anmeldung. Geo Quest ist eine GPS-Rallye-App für Kindergeburtstag, Schulausflug und Ferienprogramm, für Kinder von 10 bis 15 Jahren.";

export const metadata: Metadata = {
  title: "Digitale Schnitzeljagd selbst erstellen — kostenlos & ohne Anmeldung",
  description: DESCRIPTION,
  keywords: [
    "digitale Schnitzeljagd",
    "Schnitzeljagd App",
    "GPS Schnitzeljagd",
    "Schnitzeljagd selbst erstellen",
    "Stadtrallye App",
    "Kindergeburtstag Schnitzeljagd",
    "Schulausflug",
    "kostenlose Actionbound Alternative",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Geo Quest — digitale Schnitzeljagd selbst erstellen",
    description: DESCRIPTION,
    images: ["/assets/urbanquest.png"],
    type: "website",
    locale: "de_DE",
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
  { title: "Kindergeburtstag", body: "Route durch die Nachbarschaft" },
  { title: "Schulausflug", body: "Stationen zur Stadtgeschichte" },
  { title: "Ferienprogramm", body: "Rallye über das Gelände" },
  { title: "Jugendgruppe & Verein", body: "Kennenlern-Tour im Zeltlager" },
];

const DIFFERENCES = [
  {
    icon: Wallet,
    title: "Kostenlos, kein Abo",
    body: "Keine Bezahlschranke, keine Testphase, keine Begrenzung auf eine Quest.",
  },
  {
    icon: UserX,
    title: "Kein Account",
    body: "Keine Anmeldung, keine E-Mail. Deine Quests bleiben auf deinem Gerät — teilen kannst du sie als Datei.",
  },
];

/** Rendered on the page AND fed into the JSON-LD below — one source, so the two can't drift apart. */
const FAQ = [
  {
    question: "Was kostet Geo Quest?",
    answer:
      "Geo Quest ist vollständig kostenlos. Es gibt kein Abo, keine Testphase und keine Begrenzung auf eine bestimmte Anzahl von Quests.",
  },
  {
    question: "Brauche ich ein Benutzerkonto?",
    answer:
      "Nein. Es gibt keine Anmeldung und keine E-Mail-Abfrage. Die Quests werden lokal im Browser gespeichert und lassen sich als Datei weitergeben.",
  },
  {
    question: "Für welches Alter ist das gedacht?",
    answer:
      "Die Quests richten sich an Kinder und Jugendliche von etwa 10 bis 15 Jahren. Erstellt werden sie meist von Eltern, Lehrkräften oder Jugendleitern.",
  },
  {
    question: "Wie lange dauert das Erstellen?",
    answer:
      "Mit der KI-Anleitung entsteht ein erster Entwurf in wenigen Minuten. Danach setzt man die Ziele auf der Karte — insgesamt etwa eine halbe Stunde.",
  },
];

/**
 * Structured data so search engines and AI assistants can state plainly what
 * Geo Quest is, who it is for and that it costs nothing — the three things
 * people actually ask when looking for a scavenger hunt app.
 */
const JSON_LD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      name: "Geo Quest",
      applicationCategory: "GameApplication",
      operatingSystem: "Web (PWA)",
      inLanguage: "de",
      description: DESCRIPTION,
      audience: {
        "@type": "PeopleAudience",
        suggestedMinAge: 10,
        suggestedMaxAge: 15,
      },
      offers: { "@type": "Offer", price: "0", priceCurrency: "EUR" },
      featureList: [
        "GPS-Navigation zu echten Orten",
        "Text-, Bild-, Audio- und Video-Bausteine",
        "Aufgaben: Code-Eingabe, Multiple Choice, Sortieren",
        "Quests als Datei teilen",
        "Ohne Benutzerkonto nutzbar",
      ],
    },
    {
      "@type": "FAQPage",
      mainEntity: FAQ.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

export default function AboutPage() {
  return (
    <InfoPageShell
      showLogo
      eyebrow="Über Geo Quest"
      title={
        <>
          Draußen ist
          <br />
          <span className="text-gq-teal">das Spielfeld.</span>
        </>
      }
      lead={
        <>
          <p>
            Geo Quest ist eine Schnitzeljagd-App für Kinder und Jugendliche von
            10 bis 15. Du baust die Route, schreibst die Rätsel — die Gruppe
            läuft los und löst sie draußen.
          </p>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/anleitung"
              className="flex items-center justify-center gap-2 h-12 px-7 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
            >
              <Sparkles className="w-4 h-4" />
              Quest mit KI bauen
            </Link>
            <Link
              href="/"
              className="flex items-center justify-center h-12 px-7 rounded-pill border border-gq-teal text-gq-teal text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
            >
              Zur App
            </Link>
          </div>
        </>
      }
      aside={
        <div className="overflow-hidden rounded-card border border-border shadow-card">
          <Image
            src="/assets/urbanquest.png"
            alt="Nächtliche Straße mit leuchtender Route und dem Schriftzug Explore. Solve. Discover."
            width={1536}
            height={1024}
            priority
            sizes="(min-width: 1024px) 520px, 100vw"
            className="w-full h-auto"
          />
        </div>
      }
    >
      {/* Features */}
      <section className="mt-12 sm:mt-16">
        <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
          Was drin steckt
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-card border border-border bg-gq-dark-teal/70 p-5 shadow-card transition-all duration-base ease-gq hover:-translate-y-0.5 hover:card-glow-teal"
            >
              <Icon className="w-7 h-7 text-gq-teal" />
              <h3 className="mt-4 font-display italic text-lg lg:text-xl uppercase leading-tight text-gq-white">
                {title}
              </h3>
              <p className="mt-2 font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Für wen */}
      <section className="mt-12 sm:mt-20">
        <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
          Für wen
        </h2>
        <h3 className="mt-2 font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white">
          Eltern, Lehrer, Jugendleiter.
        </h3>
        <p className="mt-3 max-w-[52ch] font-body text-sm lg:text-base leading-relaxed text-[#E7EAEC]">
          Kein technisches Vorwissen nötig — wer eine Runde durch den Park kennt,
          hat in einer halben Stunde eine fertige Schnitzeljagd.
        </p>

        {/* Single column below 400px: "Kindergeburtstag" doesn't fit a half-width
            card at a readable size. Two-up from there, four across on desktop. */}
        <dl className="mt-6 grid grid-cols-1 gap-3 min-[400px]:grid-cols-2 sm:gap-4 lg:grid-cols-4">
          {OCCASIONS.map(({ title, body }) => (
            <div
              key={title}
              className="rounded-card border border-border bg-gq-dark-teal/70 p-4 shadow-card"
            >
              <dt className="text-tech text-[11px] tracking-[0.04em] sm:text-xs sm:tracking-[0.08em] text-gq-white">
                {title}
              </dt>
              <dd className="mt-1.5 font-body text-[13px] sm:text-sm leading-relaxed text-gq-grey">
                {body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* Abgrenzung */}
      <section className="mt-12 sm:mt-20">
        <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-lime">
          Der Unterschied
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {DIFFERENCES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="flex gap-4 rounded-card border border-border bg-gq-dark-teal/70 p-5 shadow-card"
            >
              <Icon className="w-6 h-6 flex-shrink-0 text-gq-lime" />
              <div>
                <h3 className="text-tech text-xs lg:text-[13px] tracking-[0.08em] text-gq-white">
                  {title}
                </h3>
                <p className="mt-2 font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ — mirrors the JSON-LD below so structured data matches visible content.
          Collapsed by default: Radix keeps the answers in the DOM (hidden only via
          attribute), so crawlers and AI systems still read them in full. */}
      <section className="mt-12 sm:mt-20">
        <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
          Häufige Fragen
        </h2>
        <Accordion type="single" collapsible className="mt-4 max-w-[70ch]">
          {FAQ.map(({ question, answer }) => (
            <AccordionItem
              key={question}
              value={question}
              className="border-border"
            >
              <AccordionTrigger className="text-left font-display italic text-lg uppercase leading-tight text-gq-white hover:text-gq-teal hover:no-underline">
                {question}
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          // `</script>` inside a value would otherwise close this tag early.
          __html: JSON.stringify(JSON_LD).replace(/</g, "\\u003c"),
        }}
      />

      {/* Abschluss-CTA */}
      <section className="mt-12 sm:mt-20 rounded-card border border-gq-teal/40 bg-gq-dark-teal/70 p-6 sm:p-10 text-center shadow-card">
        <h2 className="font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white">
          Bereit für <span className="text-gq-teal">deine Quest?</span>
        </h2>
        <p className="mx-auto mt-3 max-w-[46ch] font-body text-sm lg:text-base leading-relaxed text-gq-grey">
          Lass dir von einer KI den ersten Entwurf bauen — in wenigen Minuten.
        </p>
        <Link
          href="/anleitung"
          className="mx-auto mt-6 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
        >
          Zur Anleitung
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </InfoPageShell>
  );
}
