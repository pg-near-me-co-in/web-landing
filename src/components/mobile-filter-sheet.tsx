"use client";

import { SlidersHorizontal } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

/** Mobile filter drawer wrapping the page's own GET-based <form> (server-
 *  rendered, JS-optional) — only the presentation is a client Sheet, the
 *  filter form itself is passed in as children and keeps working with JS
 *  disabled (it just won't be reachable via this trigger in that case). */
export function MobileFilterSheet({
  hasActiveFilters,
  children,
}: {
  hasActiveFilters: boolean;
  children: React.ReactNode;
}) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <button className="inline-flex cursor-pointer list-none items-center gap-2 rounded-md border border-grey-100 bg-white px-4 py-2 text-[13px] font-semibold text-grey-800">
          <SlidersHorizontal className="h-3.5 w-3.5" aria-hidden />
          Filters
          {hasActiveFilters && (
            <span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
          )}
        </button>
      </SheetTrigger>
      <SheetContent side="left" className="w-[86%] max-w-sm overflow-y-auto bg-grey-10">
        <SheetHeader>
          <SheetTitle className="text-left font-display">Filters</SheetTitle>
        </SheetHeader>
        <div className="mt-4">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
