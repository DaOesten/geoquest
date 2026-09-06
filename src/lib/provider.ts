/**
 * Anbieterangaben nach § 5 DDG (PROJ-13).
 *
 * Eine Quelle für beide Verwendungen: die Impressum-Seite zeigt alles, der
 * Footer nur Name und E-Mail. Lägen die Daten an zwei Stellen, liefen sie beim
 * nächsten Umzug auseinander — und ein Impressum, das der Footer widerlegt,
 * ist schlechter als keins.
 *
 * Die Angaben sind öffentlich sichtbar; das ist der Zweck der Vorschrift.
 * Die Postanschrift steht bewusst NUR im Impressum und nicht im Footer, damit
 * sie nicht auf jeder Seite wiederholt wird.
 */
export const PROVIDER = {
  name: "Daniela Oesten",
  street: "Kerbelweg 5b",
  city: "22337 Hamburg",
  country: "Deutschland",
  email: "hi@technolomagie.de",
} as const;
