import Image from "next/image";
import Link from "next/link";
import { SITE } from "@/lib/content";

export function Logo({ inverted = false }: { inverted?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label={`${SITE.name} — home`}>
      <Image
        src="/icons/icon-512.png"
        alt=""
        width={34}
        height={34}
        priority
        className="h-[34px] w-[34px] rounded-[10px]"
        aria-hidden
      />
      <span className={`font-display text-lg font-bold leading-none ${inverted ? "text-white" : "text-grey-900"}`}>
        {SITE.name}
      </span>
    </Link>
  );
}
