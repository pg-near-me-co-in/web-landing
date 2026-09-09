"use client";

import { useId } from "react";
import { avatarSpec } from "@/lib/generated-avatar";

/** React counterpart to `lib/generated-avatar.ts`'s SVG-string generator, for
 *  listing cards and the detail page — same deterministic look per listing,
 *  used whenever a listing has no real photo instead of a stock-photo fallback. */
export function GeneratedAvatar({ id, name, className }: { id: string; name: string; className?: string }) {
  const gradId = useId();
  const { from, to, initials } = avatarSpec(id, name);
  return (
    <svg viewBox="0 0 100 100" className={className} role="img" aria-label={`${name} — no photo yet`}>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={from} />
          <stop offset="1" stopColor={to} />
        </linearGradient>
      </defs>
      <rect width="100" height="100" fill={`url(#${gradId})`} />
      <text x="50" y="50" textAnchor="middle" dominantBaseline="central" fill="#fff" fontFamily="var(--font-sans, system-ui)" fontWeight={700} fontSize={36}>
        {initials}
      </text>
    </svg>
  );
}
