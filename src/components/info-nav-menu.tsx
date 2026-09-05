"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { INFO_NAV_LINKS } from "@/lib/info-nav";

/**
 * Mobile navigation for the info pages (PROJ-13). Hidden from `sm` up, where
 * the links sit in the header row instead.
 *
 * With four destinations a 360px header row can no longer hold them — before
 * this, the links were simply hidden on mobile, which made the pages
 * unreachable from a phone.
 *
 * Radix (via shadcn Sheet) supplies the focus trap, Escape handling and
 * `aria-expanded` on the trigger; the only state here is open/closed, needed to
 * close the sheet when a link is tapped.
 */
export function InfoNavMenu() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        className="sm:hidden flex items-center justify-center w-11 h-11 rounded-full text-gq-teal transition-colors duration-base ease-gq hover:bg-gq-teal/10 active:scale-[0.96]"
        aria-label="Menü öffnen"
      >
        <Menu className="w-6 h-6" />
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-[264px] border-l border-border bg-gq-black p-6"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="text-tech text-[11px] tracking-[0.12em] text-gq-teal">
            Navigation
          </SheetTitle>
        </SheetHeader>

        <nav className="mt-6 flex flex-col">
          {INFO_NAV_LINKS.map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center h-12 border-b border-border/60 font-display italic text-xl uppercase text-gq-white transition-colors duration-base ease-gq hover:text-gq-teal active:text-gq-teal"
            >
              {label}
            </Link>
          ))}
        </nav>
      </SheetContent>
    </Sheet>
  );
}
