import Link from "next/link";
import { MapPinOff } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-col items-center justify-center min-h-dvh px-5 gap-6 bg-gq-black text-center">
      <MapPinOff className="w-16 h-16 text-gq-grey" />
      <h1 className="text-display text-4xl text-gq-white">
        Ziel nicht gefunden.
      </h1>
      <p className="font-body text-sm text-gq-grey max-w-xs">
        Diese Seite existiert nicht. Vielleicht hast du dich verlaufen?
      </p>
      <Button
        asChild
        className="bg-gq-teal text-gq-black font-tech text-xs uppercase tracking-[0.08em] hover:bg-gq-teal-hover active:scale-[0.96] transition-all duration-fast ease-gq rounded-pill h-11 px-8"
      >
        <Link href="/">Zurück zum Start</Link>
      </Button>
    </main>
  );
}
