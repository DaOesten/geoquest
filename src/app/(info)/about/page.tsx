import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  Check,
  Footprints,
  GraduationCap,
  Puzzle,
  ShieldCheck,
  Smartphone,
  Sparkles,
  Tent,
  Users,
} from "lucide-react";
import { AboutHeroPhone } from "@/components/about-hero-phone";
import { AboutSimulationPhone } from "@/components/about-simulation-phone";
import { AboutVideo } from "@/components/about-video";
import { InfoPageShell } from "@/components/info-page-shell";
import { ANLEITUNG_VERFUEGBAR, KOFI_URL } from "@/lib/app-nav";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Refinement 12 (2026-10-15): nennt Eltern und Lehrkraefte ihre Anlaesse statt
// des Spielerlebnisses. „Schnitzeljagd" bleibt — das ist die Suchsprache.
const DESCRIPTION =
  "GPS-Schnitzeljagd und Lernpfade selbst erstellen — für Kindergeburtstag, Schulklasse und Familienausflug. Kostenlos, werbefrei, ohne Anmeldung.";

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

/**
 * Vorteile-Leiste direkt unter dem Hero (Refinement 12). Beantwortet, was
 * Eltern und Lehrkraefte zuerst pruefen. Jede Aussage ist von der App gedeckt:
 * „Standort bleibt auf dem Geraet" statt „kein Tracking" — die Seite zaehlt
 * Besuche (cookiefrei), und das waere sonst eine falsche Behauptung.
 */
const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Datenschutz eingebaut",
    body: "Keine Anmeldung, keine Werbung. Standort und Quests bleiben auf dem Gerät.",
  },
  {
    icon: Footprints,
    title: "Bewegung statt Sofa",
    // Wortlaut des Betreibers (Refinement 14, 2026-10-17).
    body: "Bildschirmzeit, die nach draußen führt: Eine Quest führt von Station zu Station in der echten Welt.",
  },
  {
    icon: Puzzle,
    title: "Einfacher Baukasten",
    // Wortlaut des Betreibers (Refinement 14, 2026-10-17).
    body: "Jede Station kann flexibel mit Texten, Bildern, Videos und Aufgaben aufgebaut werden. Kein Programmierwissen nötig.",
  },
  {
    icon: Smartphone,
    title: "Läuft im Browser",
    body: "Auf jedem aktuellen Smartphone, ohne App-Store und ohne Installation.",
  },
];

/**
 * Die drei Schritte als Kapitel unter dem Erklärvideo (Refinement 14,
 * 2026-10-17). Bis dahin eine eigene Sektion mit Karten — sie sagte dasselbe
 * wie das Video, das selbst die Kapitel „Erstellen, Teilen, Spielen" zeigt.
 * Jetzt kompakt: Nummer, Titel, ein Satz.
 */
const CHAPTERS = [
  { no: "01", title: "Erstellen", body: "Stationen auf der Karte setzen, Aufgaben dazu." },
  // Bewusst nicht „Link" oder „QR-Code": Weitergabe laeuft ueber den
  // JSON-Export (PROJ-9), einen Teilen-Link gibt es nicht.
  { no: "02", title: "Weitergeben", body: "Als Datei auf die Handys der Spieler." },
  { no: "03", title: "Spielen", body: "Der GPS-Pfeil führt von Station zu Station." },
];

/**
 * Drei Zielgruppen statt vier (Refinement 12): „Kinder & Jugendliche" entfaellt,
 * die Seite spricht nur noch die Erwachsenen an, die eine Quest erstellen.
 * Die Game-Designer-Idee lebt als Nutzen fuer Lehrkraefte weiter.
 *
 * Karten statt Reiter wie im Betreiber-Entwurf: Bei Reitern waeren zwei von
 * drei Inhalten versteckt, und auf dem Handy liefen sie aus dem Bild.
 */
const AUDIENCES = [
  {
    icon: Users,
    title: "Familien",
    body: "Mach aus Spaziergang, Ausflug oder Kindergeburtstag eine Schatzsuche.",
    points: [
      "Kindergeburtstag im Park oder Garten",
      "Wandern ohne Nörgeln",
      "Eigene Orte, eigenes Tempo",
    ],
  },
  {
    icon: GraduationCap,
    title: "Schule & Pädagogik",
    body: "Bring den Unterricht nach draußen und verbinde Wissen mit echten Orten.",
    points: [
      "Wandertag und Exkursion mit Aufgaben",
      "Keine Konten für Schülerinnen und Schüler",
      "Lass deine Klasse selbst eine Quest bauen",
    ],
  },
  {
    icon: Tent,
    title: "Jugendarbeit & Ferienprogramm",
    body: "Für Gruppen, Ferienspiele und Freizeiten — eine Quest, die zu eurem Ort passt.",
    points: [
      "Ferienspiele und Zeltlager",
      "Stadtrallye für Jugendgruppen",
      "Mehrere Gruppen mit derselben Quest",
    ],
  },
];

type FaqEntry = {
  question: string;
  answer: string;
  /**
   * Optional: ein Wort aus `answer`, das auf der Seite als externer Link
   * erscheint. Das JSON-LD bekommt `answer` unverändert als reinen Text —
   * so bleibt es bei einer Quelle (Refinement 15).
   */
  link?: { text: string; href: string };
};

/** Rendered on the page AND fed into the JSON-LD below — one source, so the two can't drift apart. */
const FAQ: FaqEntry[] = [
  {
    // Refinement 15: Ko-fi als Textlink, kein Button — die Regel aus
    // Refinement 12 („keine zusaetzlichen Ko-fi-Buttons") gilt weiter.
    question: "Was kostet Geo Quest?",
    answer:
      "Geo Quest ist vollständig kostenlos und werbefrei. Es gibt kein Abo, keine Testphase und keine Begrenzung der Quests. Wenn dir die App gefällt und du meine Arbeit unterstützen möchtest, freue ich mich über eine freiwillige Spende in meine digitale Kaffeekasse unter Ko-fi.",
    link: { text: "Ko-fi", href: KOFI_URL },
  },
  {
    question: "Brauchen die Kinder ein Konto oder eine App?",
    answer:
      "Nein. Geo Quest läuft im Browser jedes aktuellen Smartphones, eine Installation aus dem App Store ist nicht nötig. Wer möchte, legt die App auf den Homescreen. Niemand muss sich anmelden oder eine E-Mail-Adresse angeben.",
  },
  {
    // Ehrlich statt „kein Tracking" (Refinement 12): Die Seite zaehlt Besuche
    // ueber Vercel Analytics, cookiefrei. Der Standort verlaesst das Geraet nie.
    question: "Was passiert mit den Standortdaten?",
    answer:
      "Der Standort wird nur auf dem Handy verarbeitet, um die Entfernung zur nächsten Station zu berechnen, und nicht an einen Server geschickt. Quests und Spielstand liegen im Browser des Geräts. Die Seite zählt Besuche anonym und ohne Cookies.",
  },
  {
    question: "Braucht jedes Kind ein eigenes Handy?",
    answer:
      "Nein. Eine Gruppe kann sich ein Handy teilen. Spielen mehrere Gruppen, lädt jede die Quest-Datei auf ihr Gerät — jedes Handy führt seinen eigenen Spielstand.",
  },
  {
    // Kein Offline-Versprechen: PRD-Non-Goal, und Medien brauchen Internet.
    question: "Braucht man unterwegs Internet?",
    answer:
      "Ja, die Handys brauchen eine mobile Datenverbindung, vor allem für Bilder, Audio und Videos in den Stationen. Für ein gutes GPS-Signal hilft freier Himmel; zwischen hohen Häusern oder unter dichtem Laub wird die Ortung ungenauer.",
  },
  {
    question: "Für welches Alter ist das gedacht?",
    answer:
      "Die Quests richten sich vor allem an Kinder und Jugendliche von etwa 8 bis 16 Jahren, aber niemand ist zu alt um eine Quest zu spielen. Erstellt werden sie meist von Eltern, Lehrkräften oder Jugendleitern.",
  },
  {
    // Keine Zeitangabe (PROJ-14, Betreiber-Entscheidung): Die Dauer haengt
    // stark vom Umfang ab, eine erfundene Zahl enttaeuscht beim ersten Versuch.
    question: "Wie erstelle ich eine Quest?",
    answer:
      "Im Creator: Quest anlegen, Ziele auf der Karte setzen und zu jedem Ziel Rätsel, Aufgaben oder Medien hinzufügen. Danach exportierst du sie als Datei und teilst sie.",
  },
  {
    // Refinement 15: Quellen exakt nach PROJ-15 — Google Drive nur mit
    // Bildern, weil Google Audio und Video beim Einbetten sperrt.
    question: "Was kann ich in eine Quest einbauen?",
    answer:
      "Jede Station kann Texte, Bilder, Audio, Videos und Aufgaben (einen Code eintippen, Multiple Choice oder Elemente sortieren) beliebig kombinieren. Weiter zur nächsten Station geht es erst, wenn alle Aufgaben der Station gelöst sind. Bilder, Audio und Videos bindest du per Link ein, hochgeladen wird nichts. Das klappt mit YouTube und Vimeo, mit Teilen-Links aus Dropbox, mit Bildern aus Google Drive, mit Dateien von Wikimedia Commons und Wikipedia. Ebenso geht jeder Link, der im Browser nur das Bild, den Ton oder das Video selbst öffnet, zum Beispiel eine Adresse, die auf .jpg oder .mp3 endet.",
  },
];

/**
 * Rendert eine FAQ-Antwort; traegt sie einen Link, wird genau dieses Wort
 * verlinkt. Der Textinhalt bleibt identisch mit `answer` (ein Test vergleicht
 * ihn woertlich mit dem JSON-LD) — der Hinweis auf den neuen Tab steht deshalb
 * im `aria-label`, nicht in einem `sr-only`-Span.
 */
function FaqAnswer({ answer, link }: FaqEntry) {
  const at = link ? answer.lastIndexOf(link.text) : -1;
  if (!link || at === -1) return <>{answer}</>;
  return (
    <>
      {answer.slice(0, at)}
      <a
        href={link.href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`${link.text} (öffnet neuen Tab)`}
        className="text-primary underline underline-offset-4 transition-colors duration-base ease-gq hover:text-primary/80"
      >
        {link.text}
      </a>
      {answer.slice(at + link.text.length)}
    </>
  );
}

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
        // Deckt sich mit dem sichtbaren FAQ-Text ("etwa 8 bis 16 Jahren,
        // aber niemand ist zu alt"). Die Felder nehmen nur Zahlen — das
        // "niemand ist zu alt" lässt sich hier nicht ausdrücken, 16 ist das
        // Ehrlichste, was das Format hergibt. Anders als die FAQ (geteilte
        // FAQ-Konstante) hat diese Spanne keine gemeinsame Quelle mit der
        // Copy: bei der nächsten Textänderung mitziehen.
        suggestedMinAge: 8,
        suggestedMaxAge: 16,
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

export default function AboutPage() {
  return (
    <InfoPageShell
      showLogo
      showSupport
      /* Kein Eyebrow (2026-09-09): „Über Geo Quest" beschrieb die Seite,
         statt den Besucher anzusprechen. */
      title={
        <>
          Die reale Welt
          <br />
          wird <span className="text-gq-teal">zum Spielfeld.</span>
        </>
      }
      lead={
        <>
          {/* Ein Absatz fuer Ersteller statt zwei Saetzen fuer Ersteller und
              Spieler (Refinement 12, 2026-10-15): Die Seite spricht Eltern und
              Lehrkraefte an — der Anlass steht vorn, weil sie danach suchen.
              Laenge mit Blick auf BUG-7: 320x568 hatte nur 39px Luft. */}
          <p className="font-body text-base sm:text-lg lg:text-xl leading-snug text-gq-white">
            Erstelle GPS-Schnitzeljagden und Lernpfade für Kindergeburtstag,
            Schulklasse oder Familienausflug. Die Kinder laufen draußen von
            Station zu Station und lösen dabei Rätsel.
          </p>

          {/* „Werbung" statt „Abo" (Refinement 12): fuer Eltern das staerkere
              Wort. Teal, nicht Lime — das eine Lime-Element der Seite ist die
              Entfernungsanzeige im App-Screenshot daneben. */}
          <p className="mt-5 text-tech text-xs sm:text-[13px] tracking-[0.1em] text-gq-teal">
            Kostenlos. Ohne Werbung. Ohne Anmeldung.
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
            {/* Entfällt, solange die KI-Anleitung nur angekündigt ist
                (PROJ-14) — ein CTA auf „gibt's noch nicht" wäre eine
                Sackgasse an der teuersten Stelle der Seite. */}
            {ANLEITUNG_VERFUEGBAR && (
              <Link
                href="/anleitung"
                className="flex items-center justify-center gap-2 h-12 px-7 rounded-pill border border-gq-teal text-gq-teal text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
              >
                <Sparkles className="w-4 h-4" />
                Mit KI erstellen
              </Link>
            )}
          </div>
        </>
      }
      /* Handy mit drei echten App-Screens (Refinement 13): Stationsübersicht
         → Kompass → „Ziel erreicht!", einmal durch, dann Kompass. Unter `lg`
         unter den Buttons, der CTA bleibt damit oben. */
      aside={
        <div className="flex justify-center lg:justify-end">
          <AboutHeroPhone />
        </div>
      }
    >
      {/* 2 — Vier Vorteile (Refinement 12). Direkt nach dem Hero, weil sie
          beantworten, was Eltern und Lehrkräfte zuerst prüfen. */}
      <section className="mt-12 sm:mt-20">
        <h2 className={SECTION_LABEL}>Warum Geo Quest</h2>
        <h3 className={SECTION_TITLE}>Gemacht für draußen.</h3>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {BENEFITS.map(({ icon: Icon, title, body }) => (
            <li
              key={title}
              className="rounded-card border border-border bg-gq-dark-teal/70 p-5 shadow-card"
            >
              <Icon className="w-7 h-7 text-gq-teal" aria-hidden />
              <h4 className="mt-4 font-display italic text-lg lg:text-xl uppercase leading-tight text-gq-white">
                {title}
              </h4>
              <p className="mt-2 font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                {body}
              </p>
            </li>
          ))}
        </ul>
      </section>

      {/* 3 — Erklärvideo (Refinement 10). Hochformat bleibt Hochformat — ab
          `sm` in einer Kinoformat-Karte mit unscharfem Rand. */}
      <section className="mt-12 sm:mt-20">
        {/* Ohne Einleitungssatz (Refinement 14, 2026-10-17): Er sagte dasselbe
            wie die Kapitel unter dem Video. Der Abstand zum Video sitzt jetzt
            am Titelblock. */}
        <div className="mb-6">
          <h2 className={SECTION_LABEL}>In 50 Sekunden</h2>
          <h3 className={SECTION_TITLE}>So funktioniert Geo Quest.</h3>
        </div>
        <AboutVideo
          src="/assets/video-geoquest-4x5-game-web.mp4"
          poster="/assets/video-geoquest-4x5-game-poster.jpg"
          playLabel="Video ansehen: So funktioniert Geo Quest (52 Sekunden)"
          durationLabel="0:52"
        />

        {/* Kapitel unter dem Video (Refinement 14): immer sichtbar, ohne
            Kästen und nicht antippbar — antippbare Kapitel bräuchten
            Zeitmarken, die bei einem Video-Tausch still falsch würden. */}
        <ol className="mt-6 grid gap-5 sm:grid-cols-3 sm:gap-8">
          {CHAPTERS.map(({ no, title, body }) => (
            <li key={no}>
              <h4 className="text-tech text-xs lg:text-[13px] tracking-[0.08em] text-gq-white">
                <span className="text-gq-teal">{no}</span> {title}
              </h4>
              <p className="mt-1.5 font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                {body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* 4 — Zielgruppen, drei Karten mit je drei Stichpunkten. */}
      <section className="mt-12 sm:mt-20">
        <h2 className={SECTION_LABEL}>Für wen</h2>
        <h3 className={SECTION_TITLE}>Für wen ist Geo Quest?</h3>

        <dl className="mt-6 grid gap-4 lg:grid-cols-3">
          {AUDIENCES.map(({ icon: Icon, title, body, points }) => (
            <div
              key={title}
              className="rounded-card border border-border bg-gq-dark-teal/70 p-5 sm:p-6 shadow-card transition-all duration-base ease-gq hover:-translate-y-0.5 hover:card-glow-teal"
            >
              <Icon className="w-7 h-7 text-gq-teal" aria-hidden />
              <dt className="mt-4 font-display italic text-lg lg:text-xl uppercase leading-tight text-gq-white">
                {title}
              </dt>
              <dd className="mt-2 font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                <p>{body}</p>
                <ul className="mt-4 space-y-2.5">
                  {points.map((point) => (
                    <li key={point} className="flex items-start gap-2.5 text-gq-white">
                      <Check className="mt-0.5 w-4 h-4 shrink-0 text-gq-teal" aria-hidden />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {/* 5 — Quest-Simulation im Handy (Refinement 13). Ersetzt die drei
          Aufgaben-Reiter aus Refinement 12: Statt einzelner Aufgaben ist der
          ganze Ablauf spielbar — Start, Liste, Hinlaufen, Ankunft, Station,
          Ende. Ohne Karte darum: Das Handy braucht auf 375px die volle Breite. */}
      <section className="mt-12 sm:mt-20">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-14">
          <div>
            <h2 className={SECTION_LABEL}>Selbst ausprobieren</h2>
            <h3 className={SECTION_TITLE}>So fühlt sich eine Quest an.</h3>
            <p className="mt-4 max-w-[52ch] font-body text-sm sm:text-base lg:text-[17px] leading-relaxed text-gq-grey">
              Spiel eine kleine Quest mit drei Stationen durch — so, wie die
              Kinder sie draußen erleben. Statt zu laufen, tippst du auf
              „Hinlaufen“. Gespeichert wird nichts.
            </p>
          </div>
          <div className="flex justify-center">
            <AboutSimulationPhone />
          </div>
        </div>
      </section>

      {/* 6 — FAQ. Mirrors the JSON-LD below so structured data matches visible
          content. Collapsed by default: Radix keeps the answers in the DOM
          (hidden only via attribute), so crawlers and AI systems still read
          them in full. */}
      <section className="mt-12 sm:mt-20">
        <h2 className={SECTION_LABEL}>Häufige Fragen</h2>
        <h3 className={SECTION_TITLE}>Antworten für Eltern und Lehrkräfte</h3>
        <Accordion type="single" collapsible className="mt-4">
          {FAQ.map((entry) => (
            <AccordionItem
              key={entry.question}
              value={entry.question}
              className="border-border"
            >
              <AccordionTrigger className="text-left font-display italic text-lg uppercase leading-tight text-gq-white hover:text-gq-teal hover:no-underline">
                {entry.question}
              </AccordionTrigger>
              <AccordionContent className="max-w-[70ch] font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                <FaqAnswer {...entry} />
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

      {/* 7 — Abschluss-CTA. Traegt seit Refinement 12 die Illustration, die
          vorher hinter dem Hero lag — sie geht nicht verloren, sondern
          rahmt jetzt den letzten Aufruf. Zwei Ebenen (Bild, Abdunklung)
          statt eines Filters auf dem Bild: Ein Filter traefe im selben
          Stapelkontext auch den Text. */}
      <section className="relative isolate mt-12 sm:mt-20 overflow-hidden rounded-card border border-gq-teal/40 p-6 sm:p-10 text-center shadow-card">
        <Image
          src="/assets/hero_new.png"
          alt=""
          aria-hidden
          fill
          sizes="(min-width: 1100px) 1036px, 100vw"
          className="-z-10 object-cover object-right"
        />
        <div className="absolute inset-0 -z-10 bg-background/70" />
        <h2 className="font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white">
          Deine Umgebung. <span className="text-gq-teal">Dein Abenteuer.</span>
        </h2>
        <p className="mx-auto mt-4 max-w-[46ch] font-body text-sm lg:text-base leading-relaxed text-gq-white">
          Erstelle jetzt kostenlos deine erste Quest.
        </p>
        <p className="mx-auto mt-2 max-w-[46ch] font-body text-sm lg:text-base leading-relaxed text-gq-white/85">
          Keine Werbung. Keine Anmeldung. Einfach draußen spielen.
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
