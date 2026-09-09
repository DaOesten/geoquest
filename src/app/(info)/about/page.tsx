import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Compass,
  GraduationCap,
  PartyPopper,
  Sparkles,
  Users,
} from "lucide-react";
import { InfoPageShell } from "@/components/info-page-shell";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const DESCRIPTION =
  "Die reale Welt wird zum Spielfeld: Erstelle deine eigene GPS-Rallye und mach aus jedem Ort ein Abenteuer. Digitale Schnitzeljagd für Kindergeburtstag, Schulausflug und Ferienprogramm — kostenlos, ohne Abo, ohne Account.";

export const metadata: Metadata = {
  title: "Digitale Schnitzeljagd selbst erstellen — kostenlos & ohne Anmeldung",
  description: DESCRIPTION,
  keywords: [
    "digitale Schnitzeljagd",
    "Schnitzeljagd App",
    "GPS Schnitzeljagd",
    "GPS-Rallye",
    "Rallye erstellen",
    "Schnitzeljagd selbst erstellen",
    "Lernpfad draußen",
    "Stadtrallye App",
    "Kindergeburtstag Schnitzeljagd",
    "Schulausflug",
    "kostenlose Actionbound Alternative",
  ],
  alternates: { canonical: "/about" },
  openGraph: {
    title: "Geo Quest — die reale Welt wird zum Spielfeld",
    description: DESCRIPTION,
    images: ["/assets/urbanquest.png"],
    type: "website",
    locale: "de_DE",
  },
};

/** Sektion 2 — der Beleg für „überall". Als Fließtext-Aufzählung überliest man ihn. */
const PLACES = [
  "Ein Park",
  "Eine Stadt",
  "Der Schulhof",
  "Ein Wanderweg",
  "Dein Viertel",
];

const STEPS = [
  {
    no: "01",
    title: "Ort auswählen",
    body: "Entscheide, wo dein Abenteuer stattfinden soll.",
  },
  {
    no: "02",
    title: "Quest gestalten",
    body: "Füge Stationen und Aufgaben hinzu und verbinde alles zu einem Abenteuer.",
  },
  {
    no: "03",
    title: "Losspielen",
    // Bewusst nicht „teilen": Weitergabe läuft über den JSON-Export (PROJ-9),
    // einen Teilen-Link gibt es nicht. Die Vorlage hätte eine Funktion
    // versprochen, die die App nicht einlöst.
    body: "Gib deine Quest als Datei weiter — oder spielt sie direkt auf deinem Gerät. GPS führt euch von Station zu Station.",
  },
];

/**
 * Lucide statt der Emoji aus der Spec-Vorlage: Das Design System schließt
 * Emojis aus („Energie kommt aus Type, Neon und Brush Marks"), und die
 * gesamte App zeichnet mit Lucide-Outlines.
 */
const AUDIENCES = [
  {
    icon: Users,
    title: "Für Familien",
    body: "Mach aus einem Spaziergang, Ausflug oder Urlaub ein gemeinsames Abenteuer.",
  },
  {
    icon: GraduationCap,
    title: "Für Schule & Pädagogik",
    // Am 2026-09-09 auf zwei Sätze gekürzt: Die Fachbeispiele sind
    // entfallen, damit alle vier Zielgruppen-Karten gleich lang sind.
    body: "Gestalte interaktive Lernpfade und bringe den Unterricht nach draußen. Verbessere das Lernen durch Bewegung.",
  },
  {
    icon: Compass,
    title: "Für Kinder & Jugendliche",
    body: "Erstelle deine eigene Quest, überrasche deine Freunde und werde selbst zum Game-Designer.",
  },
  {
    icon: PartyPopper,
    title: "Für Gruppen & Events",
    body: "Geburtstag, Ferienprogramm, Jugendgruppe oder einfach ein Nachmittag mit Freunden — erstelle eine Quest, die zu deinem Anlass passt.",
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
  {
    // Fängt auf, was mit der gestrichenen Sektion „Was drin steckt" wegfällt:
    // Der Inhalt der drei Feature-Karten bleibt so im HTML und im JSON-LD,
    // unterbricht aber den Lesefluss der Seite nicht mehr.
    question: "Was kann ich in eine Quest einbauen?",
    answer:
      "Jede Station kann fünf Bausteine kombinieren: Text, Bild, Audio, Video und Aufgaben. Als Aufgaben gibt es drei Typen — einen Code eintippen, Multiple Choice oder Elemente in die richtige Reihenfolge bringen. Weiter geht es erst, wenn die Aufgabe gelöst ist. Die Navigation zwischen den Stationen läuft über GPS: Ein Pfeil zeigt die Richtung, die Entfernung zählt herunter.",
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

/** Kicker über jeder Sektion — eine Klasse statt sechsmal derselbe Wust. */
const SECTION_LABEL =
  "text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal";
/** Sektions-Überschrift im Display-Schnitt. */
const SECTION_TITLE =
  "mt-2 font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white";
/** Abschließende Merkzeile einer Sektion — der Beat am Ende des Blocks. */
const PUNCHLINE =
  "mt-5 font-display italic text-[clamp(1.15rem,3vw,1.6rem)] uppercase leading-[1.05] text-gq-teal";

export default function AboutPage() {
  return (
    <InfoPageShell
      showLogo
      /* Kein Eyebrow (2026-09-09): „Über Geo Quest" beschrieb die Seite,
         statt den Besucher anzusprechen — auf einer Landingpage eine
         verschenkte Zeile über der Headline. Die Shell lässt die Zeile
         seitdem weg, statt ein leeres <p> zu rendern. */
      title={
        <>
          Die reale Welt
          <br />
          wird <span className="text-gq-teal">zum Spielfeld.</span>
        </>
      }
      lead={
        <>
          <p className="font-body text-base sm:text-lg lg:text-xl leading-snug text-gq-white">
            Erstelle deine eigene GPS-Rallye und mach aus jedem Ort ein
            Abenteuer.
          </p>
          {/* Zweite Zeile in gleicher Größe (2026-09-09): Die erste spricht
              den Ersteller an, diese den Spieler — beide Rollen stehen so
              gleichwertig im Hero. */}
          <p className="mt-3 font-body text-base sm:text-lg lg:text-xl leading-snug text-gq-white">
            Nimm die Herausforderung an, spiele eine Quest und entdecke Orte
            auf eine neue Art.
          </p>
          {/* Der Hero trug bis 2026-09-09 zwei weitere Absätze: eine
              Zielgruppen-Aufzählung und die Spielmechanik. Beide sind
              entfallen — die Zielgruppen stehen als vier eigene Karten
              weiter unten, die Mechanik in den drei Schritten und in der
              FAQ. Zusammen kosteten sie 168px an der teuersten Stelle der
              Seite, ohne dort etwas zu sagen, das nicht später käme. */}

          {/* Das stärkste Einzelargument der Seite — als eigene Zeile über den
              Buttons, damit es nicht im Fließtext untergeht. Teal, nicht Lime:
              Das Design System erlaubt ein Lime-Element pro Screen, und das
              ist die Game-Designer-Karte weiter unten. */}
          <p className="mt-5 text-tech text-xs sm:text-[13px] tracking-[0.1em] text-gq-teal">
            Kostenlos. Ohne Abo. Ohne Account.
          </p>

          <div className="mt-5 lg:mt-4 flex flex-col gap-3 sm:flex-row">
            {/* Direkt in den Creator statt über den Mode-Switch `/`: wer von
                einer Landingpage kommt, hat sich für „erstellen" entschieden. */}
            <Link
              href="/create"
              className="flex items-center justify-center gap-2 h-12 px-7 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
            >
              Quest erstellen
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/anleitung"
              className="flex items-center justify-center gap-2 h-12 px-7 rounded-pill border border-gq-teal text-gq-teal text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
            >
              <Sparkles className="w-4 h-4" />
              Mit KI erstellen
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
      {/* 2 — Orte als Chip-Reihe, in einer Karte wie Sektion 3. Ab hier heißt
          es „Quest": Der Hero oben hat den Besucher mit „GPS-Rallye" in seiner
          Suchsprache abgeholt, von jetzt an gilt die Sprache der App.

          Teal statt Lime: Die beiden Karten sollen sich unterscheiden, und das
          Design System lässt nur ein Lime-Element pro Screen zu — das bleibt
          die Game-Designer-Karte darunter. */}
      <section className="mt-12 sm:mt-16">
        <div className="rounded-card border border-gq-teal/40 bg-gq-dark-teal/70 p-6 sm:p-8 lg:p-10 shadow-card">
          <h2 className={SECTION_LABEL}>Wo gespielt wird</h2>
          <h3 className={SECTION_TITLE}>Jeder Ort kann ein Level sein.</h3>

          <ul className="mt-5 flex flex-wrap gap-2 sm:gap-3">
            {PLACES.map((place) => (
              <li
                key={place}
                className="rounded-pill border border-gq-teal/40 bg-gq-black/40 px-4 py-2 text-tech text-[11px] sm:text-xs tracking-[0.08em] text-gq-white"
              >
                {place}
              </li>
            ))}
          </ul>

          <p className="mt-6 max-w-[58ch] font-body text-sm sm:text-base lg:text-[17px] leading-relaxed text-gq-grey">
            Lege Stationen fest, füge Aufgaben hinzu und verbinde sie zu einer
            eigenen Quest. Die Teilnehmenden bewegen sich durch die echte Welt
            und entdecken dabei die nächste Herausforderung.
          </p>
          <p className={PUNCHLINE}>Draußen ist das Game.</p>
        </div>
      </section>

      {/* 3 — Die zweite Karte, in Lime: das eine Hervorhebungs-Element der
          Seite laut Design System. */}
      <section className="mt-12 sm:mt-20">
        <div className="rounded-card border border-gq-lime/40 bg-gq-dark-teal/70 p-6 sm:p-8 lg:p-10 shadow-card">
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-lime">
            Deine Rolle
          </h2>
          <h3 className={SECTION_TITLE}>Nicht nur spielen. Selber machen.</h3>
          <div className="mt-4 max-w-[58ch] font-body text-sm sm:text-base lg:text-[17px] leading-relaxed text-gq-grey">
            <p>
              Mit Geo Quest bist du nicht nur Spieler.{" "}
              <span className="text-gq-white">Du bist der Game-Designer.</span>
            </p>
            <p className="mt-3">
              Du brauchst kein Programmierwissen und keine besonderen
              Vorkenntnisse. Erstelle eine Quest für deinen nächsten Ausflug,
              eine Geburtstagsfeier, eine Schulstunde oder einfach für deine
              Freunde.
            </p>
          </div>
          <p className="mt-5 font-display italic text-[clamp(1.15rem,3vw,1.6rem)] uppercase leading-[1.05] text-gq-lime">
            Deine Welt. Deine Regeln. Deine Herausforderungen.
          </p>
        </div>
      </section>

      {/* 4 — Drei Schritte. */}
      <section className="mt-12 sm:mt-20">
        <h2 className={SECTION_LABEL}>So geht es</h2>
        <h3 className={SECTION_TITLE}>Eine Quest erstellen? Ganz einfach.</h3>

        <ol className="mt-6 grid gap-4 sm:grid-cols-3">
          {STEPS.map(({ no, title, body }) => (
            <li
              key={no}
              className="rounded-card border border-border bg-gq-dark-teal/70 p-5 shadow-card"
            >
              <span
                aria-hidden
                className="grid place-items-center w-9 h-9 rounded-full border border-gq-teal text-tech text-xs text-gq-teal"
              >
                {no}
              </span>
              <h4 className="mt-4 text-tech text-xs lg:text-[13px] tracking-[0.08em] text-gq-white">
                {title}
              </h4>
              <p className="mt-2 font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 5 — Zielgruppen. */}
      <section className="mt-12 sm:mt-20">
        <h2 className={SECTION_LABEL}>Für wen</h2>
        <h3 className={SECTION_TITLE}>Für wen ist Geo Quest?</h3>

        <dl className="mt-6 grid gap-4 sm:grid-cols-2">
          {AUDIENCES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="rounded-card border border-border bg-gq-dark-teal/70 p-5 shadow-card transition-all duration-base ease-gq hover:-translate-y-0.5 hover:card-glow-teal"
            >
              <Icon className="w-7 h-7 text-gq-teal" />
              <dt className="mt-4 font-display italic text-lg lg:text-xl uppercase leading-tight text-gq-white">
                {title}
              </dt>
              <dd className="mt-2 font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                {body}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 6 — FAQ. Mirrors the JSON-LD below so structured data matches visible
          content. Collapsed by default: Radix keeps the answers in the DOM
          (hidden only via attribute), so crawlers and AI systems still read
          them in full. */}
      <section className="mt-12 sm:mt-20">
        <h2 className={SECTION_LABEL}>Häufige Fragen</h2>
        {/* Volle Containerbreite wie die übrigen Sektionen — eine auf 70ch
            beschnittene Accordion-Spalte wirkt neben den Karten unfertig.
            Die Antworten selbst bleiben unten auf Lesebreite begrenzt. */}
        <Accordion type="single" collapsible className="mt-4">
          {FAQ.map(({ question, answer }) => (
            <AccordionItem
              key={question}
              value={question}
              className="border-border"
            >
              <AccordionTrigger className="text-left font-display italic text-lg uppercase leading-tight text-gq-white hover:text-gq-teal hover:no-underline">
                {question}
              </AccordionTrigger>
              <AccordionContent className="max-w-[70ch] font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
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

      {/* 7 — Abschluss-CTA */}
      <section className="mt-12 sm:mt-20 rounded-card border border-gq-teal/40 bg-gq-dark-teal/70 p-6 sm:p-10 text-center shadow-card">
        <h2 className="font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white">
          Deine Umgebung. <span className="text-gq-teal">Dein Abenteuer.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] font-body text-sm lg:text-base leading-relaxed text-gq-white">
          Erstelle jetzt kostenlos deine erste Quest.
        </p>
        <p className="mx-auto mt-2 max-w-[46ch] font-body text-sm lg:text-base leading-relaxed text-gq-grey">
          Kein Abo. Kein Account. Einfach draußen spielen.
        </p>
        <Link
          href="/create"
          className="mx-auto mt-6 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
        >
          Quest erstellen
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </InfoPageShell>
  );
}
