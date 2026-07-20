import Image from "next/image";
import Link from "next/link";

/** Brand app icon (public/brand/logo-icon.png) + wordmark lockup.
 *  Wordmark set in the display face (Space Grotesk) per the reference theme —
 *  the icon is the only asset carried over from the previous brand pass. */
export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="PG Near Me — home">
      <Image
        src="/brand/logo-icon.png"
        alt=""
        width={34}
        height={34}
        priority
        className="h-[34px] w-[34px] rounded-[10px]"
        aria-hidden
      />
      <span
        className={`font-display text-lg font-bold leading-none ${
          inverted ? "text-white" : "text-grey-900"
        }`}
      >
        PG Near Me
      </span>
    </Link>
  );
}
