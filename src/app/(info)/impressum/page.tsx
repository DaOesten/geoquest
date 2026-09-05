import type { Metadata } from "next";
import { InfoPageShell } from "@/components/info-page-shell";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung für Geo Quest.",
  // Legal boilerplate has no search value and would dilute the indexed pages.
  robots: { index: false, follow: true },
};

/**
 * Anbieterkennzeichnung nach § 5 DDG (PROJ-13).
 *
 * TODO vor dem Deploy: Die Platzhalter unten durch die echten Angaben des
 * Betreibers ersetzen. Ein Impressum mit Platzhaltern ist schlechter als keins.
 */
const PROVIDER = {
  name: "[Vor- und Nachname]",
  street: "[Straße und Hausnummer]",
  city: "[PLZ und Ort]",
  country: "Deutschland",
  email: "[E-Mail-Adresse]",
};

export default function ImpressumPage() {
  return (
    <InfoPageShell
      eyebrow="Rechtliches"
      title="Impressum"
      lead={
        <p>
          Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG) sowie § 18 Abs. 2
          Medienstaatsvertrag.
        </p>
      }
    >
      <section className="mt-10 sm:mt-14 max-w-[62ch] space-y-8">
        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Anbieter
          </h2>
          <address className="mt-3 font-body text-sm lg:text-base not-italic leading-relaxed text-[#E7EAEC]">
            {PROVIDER.name}
            <br />
            {PROVIDER.street}
            <br />
            {PROVIDER.city}
            <br />
            {PROVIDER.country}
          </address>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Kontakt
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-[#E7EAEC]">
            E-Mail: {PROVIDER.email}
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Verantwortlich für den Inhalt
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-[#E7EAEC]">
            {PROVIDER.name}, Anschrift wie oben.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Haftung für Inhalte
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Wir sind allerdings
            nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf
            eine rechtswidrige Tätigkeit hinweisen.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Inhalte von Quests
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Quests werden von den Nutzern selbst erstellt und ausschließlich auf
            deren eigenem Gerät gespeichert. Sie werden nicht an uns übertragen
            und von uns weder gespeichert noch geprüft. Für die in einer Quest
            verwendeten Texte, Bilder, Audio- und Videodateien sowie die
            eingebundenen externen Adressen ist allein derjenige verantwortlich,
            der die Quest erstellt und weitergegeben hat.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Haftung für Links
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Quests können Medien von fremden Internetadressen einbinden. Auf
            deren Inhalte haben wir keinen Einfluss und übernehmen dafür keine
            Gewähr. Für die Inhalte der verlinkten Seiten ist stets der
            jeweilige Anbieter verantwortlich.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-gq-teal">
            Sicherheit im Freien
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-gq-grey">
            Geo Quest führt Spieler zu Orten im Freien. Wer eine Quest erstellt,
            wählt die Ziele aus und trägt die Verantwortung dafür, dass die
            Route für die vorgesehene Altersgruppe gefahrlos begehbar ist. Wir
            prüfen weder Routen noch Ziele. Achtet unterwegs auf den Verkehr und
            schaut nicht nur aufs Display.
          </p>
        </div>
      </section>
    </InfoPageShell>
  );
}
