import Image from "next/image";
import Link from "next/link";

/** Brand app icon (public/brand/logo-icon.png, an icon-only mark generated
 *  by scripts/make-app-icons.js — see docs/DESIGN_SYSTEM.md#logo) + live
 *  wordmark set in the display face (Sora, bento theme). */
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
