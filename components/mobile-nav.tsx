"use client";

import Link from "next/link";
import { useState } from "react";
import { Menu } from "lucide-react";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

const LINKS: { href: string; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/pg/vadodara", label: "Find a PG" },
  { href: "/cities", label: "Cities" },
  { href: "/about", label: "About" },
  { href: "/for-owners", label: "For owners" },
];

export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button aria-label="Open menu" className="grid h-10 w-10 place-items-center rounded-full border border-grey-100 text-grey-900 md:hidden">
          <Menu className="h-4 w-4" />
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-[78%] max-w-xs flex-col gap-1.5 bg-white">
        <SheetHeader>
          <SheetTitle className="font-display text-left">Menu</SheetTitle>
        </SheetHeader>
        {LINKS.map(({ href, label }) => (
          <SheetClose asChild key={href}>
            <Link href={href} className="border-b border-grey-50 px-1 py-3 text-[15px] font-medium text-grey-800 last:border-b-0">
              {label}
            </Link>
          </SheetClose>
        ))}
        <SheetClose asChild>
          <Link href="/add-your-pg" className="mt-2 inline-flex h-11 items-center justify-center rounded-full bg-primary px-4 text-sm font-semibold text-white">
            List your PG
          </Link>
        </SheetClose>
      </SheetContent>
    </Sheet>
  );
}
