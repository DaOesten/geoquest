import Link from "next/link";
import { ChevronRight } from "lucide-react";

interface BrushStrokeButtonProps {
  href: string;
  children: React.ReactNode;
}

export function BrushStrokeButton({ href, children }: BrushStrokeButtonProps) {
  return (
    <Link
      href={href}
      className="group relative flex items-center justify-center h-14 px-8 transition-transform duration-fast ease-gq active:scale-[0.96]"
    >
      <img
        src="/assets/brushstroke-button.svg"
        alt=""
        aria-hidden
        className="absolute inset-0 w-full h-full object-fill transition-opacity duration-base group-hover:opacity-100 opacity-90"
      />
      <span className="relative z-10 text-tech text-sm tracking-[0.08em] text-gq-black flex items-center gap-2">
        {children}
        <ChevronRight className="w-4 h-4 transition-transform duration-base ease-gq group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
