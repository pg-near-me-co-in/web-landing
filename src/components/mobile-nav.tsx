"use client";

import Link from "next/link";
import { useState } from "react";

const LINKS: [string, string][] = [
  ["/#search", "Find a PG"],
  ["/#cities", "Cities"],
  ["/#types", "Property types"],
  ["/add-your-pg", "List your PG"],
];

/** Hamburger + right-side drawer (ref .mobile-drawer pattern). */
export function MobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="flex h-9 w-9 items-center justify-center rounded-[10px] border border-grey-100 bg-white md:hidden"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-4 w-4 text-grey-800"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          aria-hidden
        >
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <div className="fixed inset-0 z-[200]">
          <button
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-grey-900/40"
          />
          <div className="absolute right-0 top-0 flex h-full w-[78%] max-w-xs flex-col gap-1.5 bg-white p-6 shadow-2xl">
            <button
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              className="mb-2 flex h-9 w-9 items-center justify-center self-end rounded-lg border border-grey-100 bg-grey-5 text-grey-600"
            >
              ✕
            </button>
            {LINKS.map(([href, label]) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="border-b border-grey-50 px-1 py-3 text-[15px] font-medium text-grey-800 last:border-b-0"
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
