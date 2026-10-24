import type { Metadata } from "next";
import Link from "next/link";
import {
  AlertTriangle,
  BookOpen,
  FileJson,
  ImageIcon,
  MapPin,
  PenTool,
  Puzzle,
} from "lucide-react";
import { InfoPageShell } from "@/components/info-page-shell";
import { ANLEITUNG_VERFUEGBAR } from "@/lib/app-nav";
import { PromptGenerator } from "@/components/prompt-generator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

/**
 * Metadaten folgen dem Schalter (PROJ-14): Solange die Anleitung nur
 * angekündigt ist, darf weder Suchergebnis noch geteilte Vorschau eine
 * fertige Schritt-für-Schritt-Anleitung versprechen. Sonst bliebe die
 * Diskrepanz bis zum nächsten Crawl bestehen (Edge Case 2).
 */
const META_VERFUEGBAR = {
  title: "Quest mit KI erstellen",
  description:
    "Angaben eintragen, Prompt erzeugen, mit ChatGPT oder Claude die Geschichte abstimmen und die fertige Quest importieren. Schritt-für-Schritt-Anleitung für Geo Quest.",
};

const META_ANGEKUENDIGT = {
  title: "Quest mit KI erstellen — bald verfügbar",
  description:
    "Bald lässt du dir deine Quest von ChatGPT oder Claude bauen — mit Story, Zielen und Rätseln. Quests erstellst du schon heute selbst im Creator.",
};

const META = ANLEITUNG_VERFUEGBAR ? META_VERFUEGBAR : META_ANGEKUENDIGT;

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
  openGraph: {
    title: `${META.title} — Geo Quest`,
    description: META.description,
    images: ["/assets/urbanquest.png"],
    type: "article",
  },
};

const OUTCOME = [
  { icon: BookOpen, label: "Story mit Einstieg und Abschluss" },
  { icon: MapPin, label: "Ziele mit Namen und Reihenfolge" },
  { icon: Puzzle, label: "Rätsel und Aufgaben pro Ziel" },
  { icon: FileJson, label: "Fertige Datei zum Importieren" },
];

// Neuer Ablauf seit PROJ-14, Refinement 2026-10-23: Der Prompt entsteht aus
// dem Formular, und die KI stimmt die Geschichte erst mit dir ab, bevor sie
// die Datei ausgibt.
const STEPS = [
  {
    title: "Angaben eintragen",
    body: "Thema, Alter, Anzahl der Stationen, Spielort und Wünsche eintragen, auf „Prompt erzeugen“ tippen und kopieren.",
  },
  {
    title: "In dein KI-Tool einfügen",
    body: "ChatGPT, Claude, Gemini — egal welches. Die KI schlägt dir zuerst eine Geschichte vor. Du sagst, was bleiben und was anders werden soll.",
  },
  {
    title: "Datei ausgeben lassen",
    body: "Bist du zufrieden, fragt die KI, ob sie die Quest als Datei ausgeben soll. Sag ja und speicher die Antwort mit der Endung .json — am einfachsten am Computer über einen Texteditor.",
  },
  {
    title: "In Geo Quest importieren",
    body: "Im Creator die Datei hochladen — über „Quest importieren“ oder das Plus-Symbol unten rechts.",
  },
];

const TROUBLESHOOTING = [
  {
    question: "Die Datei wird nicht angenommen",
    answer:
      "Meistens liegt es an den Kennnummern. Gib der KI die Fehlermeldung zurück und schreib dazu: „Bitte korrigiere das und gib das vollständige JSON erneut aus.“ Das klappt fast immer beim ersten Versuch.",
  },
  {
    question: "Die KI gibt keine Datei aus",
    answer:
      "Der Prompt lässt die KI erst die Geschichte mit dir abstimmen. Danach fragt sie, ob sie die Datei ausgeben soll. Hat sie das vergessen, schreib ihr: „Gib die Schnitzeljagd jetzt als Geo-Quest-Datei (JSON) aus.“",
  },
  {
    question: "Die KI schreibt Text um das JSON herum",
    answer:
      "Kopier nur den Teil, der mit { anfängt und mit } aufhört. Alles davor und danach gehört nicht in die Datei. Oder bitte die KI: „Gib nur das JSON aus, ohne Erklärung.“",
  },
  {
    question: "Es kommt eine Meldung über ungültige Werte",
    answer:
      "Die KI hat sich nicht an die Grenzen gehalten — etwa mehr als 20 Stationen oder mehr als 5 Antwortmöglichkeiten. Gib die Fehlermeldung an die KI zurück und lass sie korrigieren.",
  },
  {
    question: "Eine Quest mit diesem Namen gibt es schon",
    answer:
      "Dann fragt Geo Quest, ob du sie überschreiben willst. Achtung: Die alte Version ist danach weg. Wenn du beide behalten willst, brich ab und lass die KI eine neue Kennnummer für die Quest vergeben.",
  },
];

export default function AnleitungPage() {
  // Zwei Zustände, ein Schalter (PROJ-14). Die volle Anleitung unten bleibt
  // vollständig im Code — sie wird nur nicht gerendert. Beim Freischalten
  // genügt `ANLEITUNG_VERFUEGBAR = true` in `src/lib/app-nav.ts`.
  //
  // Bei `false` steht weder der Prompt noch eine der Schritt-Beschreibungen im
  // ausgelieferten HTML: Der Wert ist zur Bauzeit bekannt, der Zweig wird gar
  // nicht erst gerendert. Das ist der Unterschied zwischen "nicht ausgeliefert"
  // und "nur versteckt".
  if (!ANLEITUNG_VERFUEGBAR) {
    return <AnleitungAngekuendigt />;
  }

  return <AnleitungVollstaendig />;
}

/**
 * Der angekündigte Zustand — was zum Launch ausgeliefert wird (PROJ-14).
 *
 * Zeigt bewusst NICHT: Prompt, Kopieren-Button, die vier Schritte,
 * Troubleshooting. Wer das sähe, hätte die Funktion faktisch — und die
 * Entscheidung gegen den Launch wäre ausgehebelt.
 *
 * Zeigt dafür: was kommen wird (damit der Besucher weiß, worauf er wartet)
 * und einen Weg zum manuellen Erstellen (denn wer hier landet, will eine
 * Quest bauen — und das geht heute schon vollständig).
 */
function AnleitungAngekuendigt() {
  return (
    <InfoPageShell
      showSupport
      eyebrow="Bald verfügbar"
      title={
        <>
          Quest bauen
          <br />
          <span className="text-gq-teal">mit KI.</span>
        </>
      }
      backHref="/about"
      lead={
        <>
          <p>
            Bald lässt du dir deine Quest von ChatGPT oder Claude bauen — mit
            Story, Zielen und Rätseln. Du gibst Thema, Ort und Alter vor, die KI
            schreibt den Rest.
          </p>
          <p className="mt-4">
            Wir arbeiten noch daran. Bis dahin baust du deine Quest im Creator
            selbst zusammen — das geht schon heute vollständig.
          </p>
        </>
      }
      aside={
        <div className="rounded-card border border-border bg-gq-dark-teal/70 p-6 shadow-card">
          <p className="text-tech text-[10px] tracking-[0.12em] text-gq-teal">
            Was dabei herauskommen wird
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {OUTCOME.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 text-gq-teal" />
                <span className="font-body text-sm lg:text-[15px] leading-relaxed text-[#E7EAEC]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-border pt-4 font-body text-sm leading-relaxed text-gq-grey">
            Die Ziele auf der Karte setzt du auch dann selbst — echte
            GPS-Koordinaten kennt keine KI.
          </p>
        </div>
      }
    >
      {/* Weg zum manuellen Erstellen. Wer die Anleitung sucht, will eine Quest
          bauen — ihn mit "geht noch nicht" allein zu lassen, verschenkt genau
          den Besucher, der am ehesten Ersteller wird. */}
      <section className="mt-12 sm:mt-20 rounded-card border border-gq-teal/40 bg-gq-dark-teal/70 p-6 sm:p-10 text-center shadow-card">
        <h2 className="font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white">
          Nicht warten?
        </h2>
        <p className="mx-auto mt-3 max-w-[46ch] font-body text-sm lg:text-base leading-relaxed text-gq-grey">
          Im Creator baust du deine Quest schon heute — Ziele auf der Karte,
          Rätsel und Aufgaben, Bilder und Ton.
        </p>
        <Link
          href="/create"
          className="mx-auto mt-6 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
        >
          <PenTool className="w-4 h-4" />
          Zum Creator
        </Link>
      </section>
    </InfoPageShell>
  );
}

/**
 * Die vollständige Anleitung (PROJ-13), seit PROJ-14 Refinement 2026-10-23
 * mit Prompt-Formular und freigeschaltet. Die Ankündigung oben bleibt als
 * Weg zurück im Code.
 */
function AnleitungVollstaendig() {
  return (
    <InfoPageShell
      showSupport
      eyebrow="Anleitung"
      title={
        <>
          Quest bauen
          <br />
          <span className="text-gq-teal">mit KI.</span>
        </>
      }
      meta="4 Schritte"
      backHref="/about"
      lead={
        <p>
          Du hast eine Idee, die du mit Hilfe eines KI-Tools wie duck.ai,
          ChatGPT, Gemini oder Claude in eine spielbare Geschichte verwandelst
          und in die App importierst. Dann wählst du aus, wo gespielt wird,
          verteilst die Quest an die Spieler:innen und los geht&apos;s!
        </p>
      }
      aside={
        <div className="rounded-card border border-border bg-gq-dark-teal/70 p-6 shadow-card">
          <p className="text-tech text-[10px] tracking-[0.12em] text-gq-teal">
            Was dabei herauskommt
          </p>
          <ul className="mt-4 flex flex-col gap-3">
            {OUTCOME.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-3">
                <Icon className="w-5 h-5 flex-shrink-0 text-gq-teal" />
                <span className="font-body text-sm lg:text-[15px] leading-relaxed text-[#E7EAEC]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-5 border-t border-border pt-4 font-body text-sm leading-relaxed text-gq-grey">
            Eins machst du danach selbst: Ziele auf die Karte setzen.
          </p>
        </div>
      }
    >
      {/* Schritte */}
      <section className="mt-12 sm:mt-16">
        <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
          So geht es
        </h2>
        <ol className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="rounded-card border border-border bg-gq-dark-teal/70 p-5 shadow-card"
            >
              <span className="grid place-items-center w-9 h-9 rounded-full border border-gq-teal text-tech text-xs text-gq-teal">
                {i + 1}
              </span>
              <h3 className="mt-4 text-tech text-xs lg:text-[13px] tracking-[0.08em] text-gq-white">
                {step.title}
              </h3>
              <p className="mt-2 font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                {step.body}
              </p>
            </li>
          ))}
        </ol>
      </section>

      {/* Angaben → Prompt (PROJ-14, Refinement 2026-10-23) */}
      <section className="mt-12 sm:mt-20">
        <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
          Schritt 1
        </h2>
        <h3 className="mt-2 font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white">
          Deine Angaben
        </h3>
        <PromptGenerator />
      </section>

      {/* Nach dem Import */}
      <section className="mt-12 sm:mt-20">
        <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-lime">
          Danach — nicht vergessen
        </h2>
        <h3 className="mt-2 font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white">
          Nach dem Import
        </h3>

        <div className="mt-5 grid gap-4 lg:grid-cols-2">
          <div className="rounded-card border border-gq-lime/40 bg-gq-dark-teal/70 p-5 shadow-card">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gq-lime" />
              <h4 className="text-tech text-xs lg:text-[13px] tracking-[0.08em] text-gq-white">
                Ziele auf die Karte setzen
              </h4>
            </div>
            <p className="mt-3 font-body text-sm lg:text-[15px] leading-relaxed text-[#E7EAEC]">
              Eine KI kennt keine echten GPS-Koordinaten. Alle Ziele liegen nach
              dem Import auf einem Platzhalter. Öffne die Quest im Creator, geh
              in jedes Ziel und zieh den Punkt auf der Karte an die richtige
              Stelle.
            </p>
            <p className="mt-3 font-body text-sm lg:text-[15px] leading-relaxed text-gq-lime">
              Ohne diesen Schritt führt die Quest draußen ins Nichts.
            </p>
          </div>

          {/* Seit dem neuen Prompt (2026-10-23) erzeugt die KI keine Medien
              mehr — kein Pflichtschritt, nur ein Tipp. */}
          <div className="rounded-card border border-border bg-gq-dark-teal/70 p-5 shadow-card">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gq-teal" />
              <h4 className="text-tech text-xs lg:text-[13px] tracking-[0.08em] text-gq-white">
                Tipp: Bilder, Ton oder Video ergänzen
              </h4>
            </div>
            <p className="mt-3 font-body text-sm lg:text-[15px] leading-relaxed text-[#E7EAEC]">
              Die KI schreibt Geschichte und Aufgaben. Wenn du magst, ergänzt du
              im Creator an jeder Station Bilder, Ton oder Video.
            </p>
          </div>
        </div>
      </section>

      <div className="mt-12 sm:mt-20 grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Medienquellen */}
        <section>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Woher Medien nehmen
          </h2>
          <div className="mt-4 rounded-card border border-border bg-gq-dark-teal/70 p-5 shadow-card">
            {/* Stand PROJ-15: Medien per Link, gleiche Quellen wie die FAQ
                auf /about. */}
            <p className="font-body text-sm lg:text-[15px] leading-relaxed text-[#E7EAEC]">
              Am besten eigene Fotos und Sprachaufnahmen — die passen zur Quest
              und gehören dir. Frei nutzbares Material findest du bei Wikimedia
              Commons, Pixabay oder Unsplash. Achte auf die Lizenz, wenn du die
              Quest weitergibst.
            </p>
            <div className="mt-4 rounded-[12px] border border-gq-teal/30 bg-gq-teal/5 p-4">
              <p className="font-body text-sm lg:text-[15px] leading-relaxed text-gq-white">
                <span className="text-gq-teal">Per Link:</span> Hochgeladen wird
                nichts. Es klappt mit YouTube und Vimeo, mit Teilen-Links aus
                Dropbox, mit Bildern aus Google Drive und mit Dateien von
                Wikimedia Commons und Wikipedia. Ebenso geht jeder Link, der im
                Browser nur das Bild, den Ton oder das Video selbst öffnet.
              </p>
            </div>
          </div>
        </section>

        {/* Troubleshooting */}
        <section>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Wenn etwas klemmt
          </h2>
          <h3 className="mt-2 flex items-center gap-2 font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white">
            <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-gq-lime" />
            Hilfe
          </h3>
          <Accordion type="single" collapsible className="mt-4">
            {TROUBLESHOOTING.map(({ question, answer }) => (
              <AccordionItem
                key={question}
                value={question}
                className="border-border"
              >
                <AccordionTrigger className="text-left font-body text-sm lg:text-[15px] text-gq-white hover:text-gq-teal hover:no-underline">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="font-body text-sm lg:text-[15px] leading-relaxed text-gq-grey">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </div>

      {/* Abschluss-CTA */}
      <section className="mt-12 sm:mt-20 rounded-card border border-gq-teal/40 bg-gq-dark-teal/70 p-6 sm:p-10 text-center shadow-card">
        <h2 className="font-display italic text-[clamp(1.5rem,4vw,2.4rem)] uppercase leading-[1] text-gq-white">
          Prompt kopiert?
        </h2>
        <p className="mx-auto mt-3 max-w-[46ch] font-body text-sm lg:text-base leading-relaxed text-gq-grey">
          Dann rein in den Creator und die fertige Quest importieren.
        </p>
        <Link
          href="/create"
          className="mx-auto mt-6 inline-flex items-center justify-center gap-2 h-12 px-8 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
        >
          <PenTool className="w-4 h-4" />
          Zum Creator
        </Link>
      </section>
    </InfoPageShell>
  );
}
