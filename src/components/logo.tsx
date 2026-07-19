import Link from "next/link";

/** Roofline + wordmark lockup per docs/DESIGN_SYSTEM.md (Cherry Bomb display face). */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="PG Near Me — home">
      <svg
        viewBox="0 0 24 24"
        className={`h-7 w-7 ${inverted ? "text-white" : "text-primary"}`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M3 11.5 12 4l9 7.5" />
        <path d="M6.5 10.5V19h11v-8.5" />
      </svg>
      <span
        className={`font-display text-xl leading-none tracking-wide ${
          inverted ? "text-white" : "text-grey-900"
        }`}
      >
        PG NEAR ME
      </span>
    </Link>
  );
}
