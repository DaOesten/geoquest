import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModeCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
  accent?: "teal" | "lime";
}

export function ModeCard({
  title,
  description,
  href,
  icon,
  accent = "teal",
}: ModeCardProps) {
  const isTeal = accent === "teal";

  return (
    <Link
      href={href}
      className={cn(
        "group block min-w-0 overflow-hidden text-left p-4 rounded-[16px] bg-[#0F2429] outline-none",
        "border-2 border-[rgba(160,167,173,0.22)] shadow-[0_10px_24px_rgba(0,0,0,.45)]",
        "transition-all duration-[180ms] [transition-timing-function:cubic-bezier(.16,.84,.44,1)]",
        "hover:-translate-y-0.5 focus-visible:-translate-y-0.5",
        isTeal
          ? "hover:card-glow-teal focus-visible:card-glow-teal"
          : "hover:card-glow-lime focus-visible:card-glow-lime"
      )}
    >
      <span
        className={cn(
          "flex items-center justify-between",
          isTeal ? "text-gq-teal" : "text-gq-lime"
        )}
      >
        {icon}
        <ChevronRight className="w-5 h-5 transition-transform duration-[180ms] [transition-timing-function:cubic-bezier(.16,.84,.44,1)] group-hover:translate-x-1" />
      </span>
      <span className="block mt-2 text-display text-2xl leading-none text-gq-white">
        {title}
      </span>
      <span className="block mt-1.5 font-body text-[13px] leading-[1.45] text-[#A0A7AD]">
        {description}
      </span>
    </Link>
  );
}
