import Image from "next/image";
import Link from "next/link";

/** Brand app icon (docs/assets/brand/app-icon-purple.png) + wordmark lockup. */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="PG Near Me — home">
      <Image
        src="/brand/logo-icon.png"
        alt=""
        width={36}
        height={36}
        priority
        className="h-9 w-9 rounded-xl shadow-sm"
        aria-hidden
      />
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
