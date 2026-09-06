import type { Metadata } from "next";
import { InfoPageShell } from "@/components/info-page-shell";
import { PROVIDER } from "@/lib/provider";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Anbieterkennzeichnung für Geo Quest.",
  // Legal boilerplate has no search value and would dilute the indexed pages.
  robots: { index: false, follow: true },
};

export default function ImpressumPage() {
  return (
    <InfoPageShell
      theme="light"
      backHref="/about"
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
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-primary">
            Anbieter
          </h2>
          <address className="mt-3 font-body text-sm lg:text-base not-italic leading-relaxed text-foreground/90">
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
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-primary">
            Kontakt
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-foreground/90">
            E-Mail:{" "}
            <a
              href={`mailto:${PROVIDER.email}`}
              className="text-primary underline underline-offset-4 transition-colors duration-base ease-gq hover:text-primary/80"
            >
              {PROVIDER.email}
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-primary">
            Verantwortlich für den Inhalt
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-foreground/90">
            {PROVIDER.name}, Anschrift wie oben.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-primary">
            Haftung für Inhalte
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-muted-foreground">
            Als Diensteanbieter sind wir für eigene Inhalte auf diesen Seiten
            nach den allgemeinen Gesetzen verantwortlich. Wir sind allerdings
            nicht verpflichtet, übermittelte oder gespeicherte fremde
            Informationen zu überwachen oder nach Umständen zu forschen, die auf
            eine rechtswidrige Tätigkeit hinweisen.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-primary">
            Inhalte von Quests
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-muted-foreground">
            Quests werden von den Nutzern selbst erstellt und ausschließlich auf
            deren eigenem Gerät gespeichert. Sie werden nicht an uns übertragen
            und von uns weder gespeichert noch geprüft. Für die in einer Quest
            verwendeten Texte, Bilder, Audio- und Videodateien sowie die
            eingebundenen externen Adressen ist allein derjenige verantwortlich,
            der die Quest erstellt und weitergegeben hat.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-primary">
            Haftung für Links
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-muted-foreground">
            Quests können Medien von fremden Internetadressen einbinden. Auf
            deren Inhalte haben wir keinen Einfluss und übernehmen dafür keine
            Gewähr. Für die Inhalte der verlinkten Seiten ist stets der
            jeweilige Anbieter verantwortlich.
          </p>
        </div>

        <div>
          <h2 className="text-tech text-[10px] sm:text-[11px] tracking-[0.12em] text-primary">
            Sicherheit im Freien
          </h2>
          <p className="mt-3 font-body text-sm lg:text-base leading-relaxed text-muted-foreground">
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
