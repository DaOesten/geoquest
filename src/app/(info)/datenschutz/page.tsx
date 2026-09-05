import type { Metadata } from "next";
import Link from "next/link";
import { InfoPageShell } from "@/components/info-page-shell";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Wie Geo Quest mit Daten umgeht — kurz gefasst: gar nicht.",
  robots: { index: false, follow: true },
};

/**
 * Datenschutzerklärung (PROJ-13).
 *
 * Beschreibt bewusst nur das, was die App tatsächlich tut: kein Backend, keine
 * Konten, keine Analyse-Werkzeuge. Wird später ein Analysedienst eingebunden,
 * muss dieser Text mitwachsen — sonst beschreibt er etwas anderes als die
 * Realität.
 */
export default function DatenschutzPage() {
  return (
    <InfoPageShell
      eyebrow="Rechtliches"
      title="Datenschutz"
      lead={
        <p>
          Geo Quest kommt ohne Konto, ohne Anmeldung und ohne eigenen Server für
          deine Inhalte aus. Alles, was du erstellst oder spielst, bleibt auf
          deinem Gerät.
        </p>
      }
    >
      <section className="mt-10 sm:mt-14 max-w-[62ch] space-y-8">
        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Verantwortlicher
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-[#E7EAEC]">
            Verantwortlich im Sinne der Datenschutz-Grundverordnung ist der im{" "}
            <Link
              href="/impressum"
              className="text-gq-teal underline underline-offset-4 transition-colors duration-base ease-gq hover:text-gq-teal-hover"
            >
              Impressum
            </Link>{" "}
            genannte Anbieter.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Quests und Spielfortschritt
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Quests, die du erstellst oder importierst, und dein Fortschritt beim
            Spielen werden ausschließlich im lokalen Speicher deines Browsers
            abgelegt. Diese Daten werden nicht an uns übertragen. Wir können
            nicht sehen, welche Quests es gibt oder wie du spielst.
          </p>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Umgekehrt bedeutet das: Löschst du die Browserdaten oder wechselst
            das Gerät, sind die Quests weg. Sichere dir wichtige Quests über die
            Export-Funktion als Datei.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Standortdaten
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Zum Spielen einer Quest braucht die App deinen Standort, um Richtung
            und Entfernung zum nächsten Ziel zu berechnen. Der Browser fragt dich
            vorher um Erlaubnis; ohne diese Erlaubnis lässt sich der Spielmodus
            nicht nutzen.
          </p>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Die Standortdaten werden ausschließlich auf deinem Gerät verarbeitet.
            Sie werden nicht an uns oder an Dritte gesendet, nicht gespeichert
            und nicht ausgewertet. Sobald du den Spielmodus verlässt, endet die
            Standortabfrage. Die Erlaubnis kannst du jederzeit in den
            Einstellungen deines Browsers widerrufen.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Hosting und Server-Protokolle
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Diese Seite wird bei der Vercel Inc. gehostet. Beim Aufruf der Seite
            verarbeitet Vercel technisch notwendige Verbindungsdaten wie
            IP-Adresse, Zeitpunkt der Anfrage, aufgerufene Adresse und
            Browserkennung. Rechtsgrundlage ist unser berechtigtes Interesse an
            einer sicheren und funktionsfähigen Bereitstellung nach Art. 6 Abs. 1
            lit. f DSGVO.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Karten
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Im Creator werden Kartenausschnitte von den Servern der OpenStreetMap
            Foundation geladen. Dabei überträgt dein Browser technisch bedingt
            seine IP-Adresse dorthin, damit die Kartenkacheln ausgeliefert werden
            können. Es werden dabei keine Standortdaten übermittelt — welchen
            Kartenausschnitt du betrachtest, ergibt sich allein aus deiner
            Eingabe.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Medien in Quests
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Quests können Bilder, Audio- oder Videodateien von fremden
            Internetadressen einbinden. Diese werden beim Abspielen direkt vom
            jeweiligen Anbieter geladen, der dabei die IP-Adresse deines Geräts
            erfährt. Welche Adressen das sind, bestimmt allein derjenige, der die
            Quest erstellt hat.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Keine Konten, keine Werbung, kein Tracking
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Es gibt keine Registrierung und keine E-Mail-Abfrage. Wir setzen
            keine Werbe- oder Analyse-Cookies, binden keine sozialen Netzwerke
            ein und geben keine Daten zu Werbezwecken weiter. Der lokale
            Speicher deines Browsers wird ausschließlich für deine eigenen Quests
            und deinen Spielfortschritt genutzt — dafür ist keine Einwilligung
            erforderlich, weil die Daten dein Gerät nicht verlassen.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Deine Rechte
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Dir stehen die Rechte auf Auskunft, Berichtigung, Löschung,
            Einschränkung der Verarbeitung, Datenübertragbarkeit und Widerspruch
            zu, sowie ein Beschwerderecht bei einer Datenschutz-Aufsichtsbehörde.
            Da wir keine personenbezogenen Daten über dich speichern, können wir
            dir zu deinen Quests allerdings keine Auskunft geben — sie liegen
            allein bei dir. Über deinen lokalen Speicher entscheidest du selbst:
            Ein Löschen der Browserdaten entfernt alles restlos.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Kinder und Jugendliche
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Geo Quest richtet sich an Kinder und Jugendliche. Genau deshalb
            verzichtet die App auf Konten, Profile und jede Form der Auswertung:
            Es entstehen keine Daten, die man einer Person zuordnen könnte.
          </p>
        </div>
      </section>
    </InfoPageShell>
  );
}
