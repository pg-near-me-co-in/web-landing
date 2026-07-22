"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const LINKS: [string, string][] = [
  ["/#search", "Find a PG"],
  ["/cities", "Cities"],
  ["/about", "About"],
  ["/for-owners", "For owners"],
  ["/add-your-pg", "List your PG"],
];

/** Hamburger + right-side drawer, built on Radix Dialog via <Sheet> — gives
 *  a real focus trap / Escape-to-close / scroll-lock the previous
 *  hand-rolled overlay didn't have. */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button
          aria-label="Open menu"
          className="flex h-9 w-9 items-center justify-center rounded-md border border-grey-100 bg-white md:hidden"
        >
          <Menu className="h-4 w-4 text-grey-800" aria-hidden />
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-[78%] max-w-xs flex-col gap-1.5 bg-white">
        <SheetHeader>
          <SheetTitle className="font-display text-left">Menu</SheetTitle>
        </SheetHeader>
        {LINKS.map(([href, label]) => (
          <SheetClose asChild key={href}>
            <Link
              href={href}
              className="border-b border-grey-50 px-1 py-3 text-[15px] font-medium text-grey-800 last:border-b-0"
            >
              {label}
            </Link>
          </SheetClose>
        ))}
      </SheetContent>
    </Sheet>
  );
}
