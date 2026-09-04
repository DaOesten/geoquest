import type { Metadata } from "next";
import Link from "next/link";
import { AlertTriangle, ImageIcon, MapPin, PenTool } from "lucide-react";
import { InfoPageShell } from "@/components/info-page-shell";
import { PromptCopyBox } from "@/components/prompt-copy-box";
import { QUEST_AI_PROMPT } from "@/lib/quest-ai-prompt";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const metadata: Metadata = {
  title: "Quest mit KI erstellen",
  description:
    "Prompt kopieren, in ChatGPT oder Claude einfügen, fertige Quest importieren. Schritt-für-Schritt-Anleitung für Geo Quest.",
  openGraph: {
    title: "Quest mit KI erstellen — Geo Quest",
    description:
      "Prompt kopieren, in ChatGPT oder Claude einfügen, fertige Quest importieren. Schritt-für-Schritt-Anleitung für Geo Quest.",
    images: ["/assets/urbanquest.png"],
    type: "article",
  },
};

const STEPS = [
  {
    title: "Prompt kopieren",
    body: "Der komplette Text steht unten. Ein Klick auf „Kopieren“ reicht.",
  },
  {
    title: "In dein KI-Tool einfügen",
    body: "ChatGPT, Claude, Gemini — egal welches. Trag oben im Prompt Thema, Ort, Alter und Anzahl der Ziele ein.",
  },
  {
    title: "Antwort als Datei speichern",
    body: "Die KI gibt dir JSON aus. Speicher es als Datei mit der Endung .json — am einfachsten am Computer über einen Texteditor.",
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
    question: "Die KI schreibt Text um das JSON herum",
    answer:
      "Kopier nur den Teil, der mit { anfängt und mit } aufhört. Alles davor und danach gehört nicht in die Datei. Oder bitte die KI: „Gib nur das JSON aus, ohne Erklärung.“",
  },
  {
    question: "Es kommt eine Meldung über ungültige Werte",
    answer:
      "Die KI hat sich nicht an die Grenzen gehalten — etwa mehr als 20 Ziele, mehr als 5 Antwortmöglichkeiten oder einen Radius außerhalb von 10 bis 100 Metern. Gib die Fehlermeldung an die KI zurück und lass sie korrigieren.",
  },
  {
    question: "Eine Quest mit diesem Namen gibt es schon",
    answer:
      "Dann fragt Geo Quest, ob du sie überschreiben willst. Achtung: Die alte Version ist danach weg. Wenn du beide behalten willst, brich ab und lass die KI eine neue Kennnummer für die Quest vergeben.",
  },
  {
    question: "Die KI erfindet echte Adressen für Bilder",
    answer:
      "Prüf nach dem Import alle Medien-Bausteine im Creator. Adressen, die nicht mit „BITTE-ERSETZEN“ markiert sind, führen ins Leere und müssen ersetzt werden.",
  },
];

export default function AnleitungPage() {
  return (
    <InfoPageShell
      eyebrow="Anleitung"
      title={
        <>
          Quest bauen
          <br />
          <span className="text-gq-teal">mit KI.</span>
        </>
      }
      meta="4 Schritte · ca. 15 Min"
      backHref="/about"
    >
      <p className="mt-5 font-body text-[15px] leading-relaxed text-[#E7EAEC]">
        Du kopierst einen fertigen Text, fügst ihn in ChatGPT oder Claude ein und
        bekommst eine komplette Quest zurück — mit Story, Zielen und Rätseln. Die
        Orte auf der Karte setzt du danach selbst.
      </p>

      {/* Schritte */}
      <section className="mt-8">
        <h2 className="text-tech text-[10px] tracking-[0.12em] text-gq-teal">
          So geht es
        </h2>
        <ol className="mt-3 flex flex-col gap-3">
          {STEPS.map((step, i) => (
            <li
              key={step.title}
              className="flex gap-4 rounded-card border border-border bg-gq-dark-teal/70 p-4 shadow-card"
            >
              <span className="flex-shrink-0 grid place-items-center w-8 h-8 rounded-full border border-gq-teal text-tech text-xs text-gq-teal">
                {i + 1}
              </span>
              <div>
                <h3 className="text-tech text-xs tracking-[0.08em] text-gq-white">
                  {step.title}
                </h3>
                <p className="mt-1.5 font-body text-sm leading-relaxed text-gq-grey">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Prompt */}
      <section className="mt-10">
        <h2 className="text-tech text-[10px] tracking-[0.12em] text-gq-teal">
          Schritt 1
        </h2>
        <h3 className="mt-1 font-display italic text-[clamp(1.4rem,6vw,1.8rem)] uppercase leading-[1] text-gq-white">
          Der Prompt
        </h3>
        <PromptCopyBox prompt={QUEST_AI_PROMPT} />
      </section>

      {/* Nach dem Import */}
      <section className="mt-10">
        <h2 className="text-tech text-[10px] tracking-[0.12em] text-gq-lime">
          Danach — nicht vergessen
        </h2>
        <h3 className="mt-1 font-display italic text-[clamp(1.4rem,6vw,1.8rem)] uppercase leading-[1] text-gq-white">
          Zwei Pflichtschritte
        </h3>

        <div className="mt-4 flex flex-col gap-3">
          <div className="rounded-card border border-gq-lime/40 bg-gq-dark-teal/70 p-4 shadow-card">
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gq-lime" />
              <h4 className="text-tech text-xs tracking-[0.08em] text-gq-white">
                Ziele auf die Karte setzen
              </h4>
            </div>
            <p className="mt-2 font-body text-sm leading-relaxed text-[#E7EAEC]">
              Eine KI kennt keine echten GPS-Koordinaten. Alle Ziele liegen nach
              dem Import auf einem Platzhalter. Öffne die Quest im Creator, geh
              in jedes Ziel und zieh den Punkt auf der Karte an die richtige
              Stelle.
            </p>
            <p className="mt-2 font-body text-sm leading-relaxed text-gq-lime">
              Ohne diesen Schritt führt die Quest draußen ins Nichts.
            </p>
          </div>

          <div className="rounded-card border border-border bg-gq-dark-teal/70 p-4 shadow-card">
            <div className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-gq-teal" />
              <h4 className="text-tech text-xs tracking-[0.08em] text-gq-white">
                Medien-Adressen ersetzen
              </h4>
            </div>
            <p className="mt-2 font-body text-sm leading-relaxed text-[#E7EAEC]">
              Bilder, Audio und Video hat die KI nur vorgeschlagen — die
              Adressen sind Platzhalter und mit „BITTE-ERSETZEN“ markiert. Trag
              im Creator deine eigenen ein oder lösch die Bausteine.
            </p>
          </div>
        </div>
      </section>

      {/* Medienquellen */}
      <section className="mt-10">
        <h2 className="text-tech text-[10px] tracking-[0.12em] text-gq-teal">
          Woher Medien nehmen
        </h2>
        <div className="mt-3 rounded-card border border-border bg-gq-dark-teal/70 p-4 shadow-card">
          <p className="font-body text-sm leading-relaxed text-[#E7EAEC]">
            Am besten eigene Fotos und Sprachaufnahmen — die passen zur Quest und
            gehören dir. Lad sie irgendwo hoch, wo du eine direkte Adresse
            bekommst.
          </p>
          <p className="mt-3 font-body text-sm leading-relaxed text-[#E7EAEC]">
            Frei nutzbares Material findest du bei Wikimedia Commons, Pixabay
            oder Unsplash. Achte auf die Lizenz, wenn du die Quest weitergibst.
          </p>
          <div className="mt-3 rounded-[12px] border border-gq-teal/30 bg-gq-teal/5 p-3">
            <p className="font-body text-sm leading-relaxed text-gq-white">
              <span className="text-gq-teal">Wichtig:</span> Geo Quest braucht die
              Adresse der Datei selbst — sie endet auf .jpg, .png, .mp3 oder
              .mp4. Der Link zur Webseite reicht nicht. Auf dem Bild rechtsklicken
              und „Bildadresse kopieren“ wählen.
            </p>
          </div>
        </div>
      </section>

      {/* Troubleshooting */}
      <section className="mt-10">
        <h2 className="text-tech text-[10px] tracking-[0.12em] text-gq-teal">
          Wenn etwas klemmt
        </h2>
        <h3 className="mt-1 flex items-center gap-2 font-display italic text-[clamp(1.4rem,6vw,1.8rem)] uppercase leading-[1] text-gq-white">
          <AlertTriangle className="w-5 h-5 text-gq-lime" />
          Hilfe
        </h3>
        <Accordion type="single" collapsible className="mt-3">
          {TROUBLESHOOTING.map(({ question, answer }) => (
            <AccordionItem
              key={question}
              value={question}
              className="border-border"
            >
              <AccordionTrigger className="text-left font-body text-sm text-gq-white hover:text-gq-teal hover:no-underline">
                {question}
              </AccordionTrigger>
              <AccordionContent className="font-body text-sm leading-relaxed text-gq-grey">
                {answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      {/* Abschluss-CTA */}
      <section className="mt-10 rounded-card border border-gq-teal/40 bg-gq-dark-teal/70 p-5 text-center shadow-card">
        <h2 className="font-display italic text-[clamp(1.4rem,6vw,1.8rem)] uppercase leading-[1] text-gq-white">
          Prompt kopiert?
        </h2>
        <p className="mt-2 font-body text-sm leading-relaxed text-gq-grey">
          Dann rein in den Creator und die fertige Quest importieren.
        </p>
        <Link
          href="/create"
          className="mt-4 flex items-center justify-center gap-2 h-12 rounded-pill bg-gq-teal text-gq-black text-tech text-xs tracking-[0.08em] transition-all duration-base ease-gq hover:bg-gq-teal-hover active:scale-[0.96]"
        >
          <PenTool className="w-4 h-4" />
          Zum Creator
        </Link>
      </section>
    </InfoPageShell>
  );
}
