import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllPublishedSlugs,
  getListingBySlug,
  getListingsForCity,
  getSeoOverride,
} from "@/lib/queries";
import { ContactReveal } from "@/components/contact-reveal";
import { ReviewForm } from "@/components/review-form";
import { PgTypeBadge, RatingStars, VerifiedBadge } from "@/components/badges";
import { ListingCard } from "@/components/listing-card";
import {
  FOOD_LABEL,
  PG_TYPE_LABEL,
  STRICTNESS_LABEL,
  formatPriceRange,
} from "@/lib/format";
import { resolveImageUrl } from "@/lib/images";

export const revalidate = 3600;

interface Props {
  params: Promise<{ city: string; area: string; slug: string }>;
}

export async function generateStaticParams() {
  const rows = await getAllPublishedSlugs();
  return rows.map((r) => ({
    city: r.city_slug,
    area: r.area_slug ?? "all",
    slug: r.slug,
  }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = await getListingBySlug(slug);
  if (!l) return {};
  // fallback precedence: page_seo_meta override -> computed entity default
  const seo = await getSeoOverride("listing", l.id);
  const price = formatPriceRange(l.price_min, l.price_max);
  const traits = [
    l.pg_type ? `${PG_TYPE_LABEL[l.pg_type]} PG` : "PG/hostel",
    l.sharing_types.length ? `${l.sharing_types.join("/")} sharing` : null,
    price ? `${price}/month` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const title =
    seo?.meta_title ?? `${l.name} — ${l.area_name ?? l.city_name}, ${l.city_name}`;
  const description =
    seo?.meta_description ??
    `${l.name} in ${l.area_name ?? l.city_name}, ${l.city_name}: ${traits}. Photos, amenities, reviews and direct owner contact on PG Near Me.`;
  return {
    title,
    description,
    alternates: {
      canonical: `/pg/${l.city_slug}/${l.area_slug ?? "all"}/${l.slug}`,
    },
    openGraph: {
      title: seo?.og_title ?? title,
      description: seo?.og_description ?? description,
      ...(l.cover_image ? { images: [resolveImageUrl(l.cover_image)] } : {}),
    },
  };
}

/* Icon-first amenities (ref .amenity): match on icon_key or slug, fall back
   to a neutral check. */
const AMENITY_EMOJI: [string, string][] = [
  ["wifi", "📶"],
  ["internet", "📶"],
  ["food", "🍱"],
  ["meal", "🍱"],
  ["mess", "🍱"],
  ["kitchen", "🍳"],
  ["laundry", "🧺"],
  ["washing", "🧺"],
  ["ac", "❄️"],
  ["air", "❄️"],
  ["parking", "🛵"],
  ["cctv", "📹"],
  ["security", "🛡️"],
  ["guard", "🛡️"],
  ["power", "⚡"],
  ["backup", "⚡"],
  ["electric", "⚡"],
  ["housekeeping", "🧹"],
  ["clean", "🧹"],
  ["gym", "🏋️"],
  ["tv", "📺"],
  ["fridge", "🧊"],
  ["water", "🚰"],
  ["geyser", "🚿"],
  ["hot", "🚿"],
  ["bed", "🛏️"],
  ["furnish", "🛏️"],
  ["lift", "🛗"],
  ["study", "📚"],
];

function amenityEmoji(a: { slug: string; icon_key: string | null }): string {
  const key = `${a.icon_key ?? ""} ${a.slug}`.toLowerCase();
  return AMENITY_EMOJI.find(([k]) => key.includes(k))?.[1] ?? "✓";
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-grey-50 py-2.5 last:border-0">
      <dt className="text-sm text-grey-400">{label}</dt>
      <dd className="text-sm font-semibold text-grey-700">{value}</dd>
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-3.5 font-display text-lg font-semibold text-grey-900">
      {children}
    </h2>
  );
}

export default async function ListingPage({ params }: Props) {
  const { city, slug } = await params;
  const l = await getListingBySlug(slug);
  if (!l || l.city_slug !== city) notFound();

  const price = formatPriceRange(l.price_min, l.price_max);
  const genderText = !l.pg_type
    ? null
    : l.pg_type === "unisex"
      ? "men and women"
      : l.pg_type === "male"
        ? "men"
        : "women";

  // "Similar PGs nearby" (ref .similar-strip): same city, current excluded
  let similar: Awaited<ReturnType<typeof getListingsForCity>> = [];
  try {
    similar = (await getListingsForCity(l.city_slug, { pgType: l.pg_type ?? undefined }))
      .filter((s) => s.id !== l.id)
      .slice(0, 3);
    if (similar.length === 0) {
      similar = (await getListingsForCity(l.city_slug, {}))
        .filter((s) => s.id !== l.id)
        .slice(0, 3);
    }
  } catch {
    // strip is optional — never break the page for it
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: l.name,
    url: `https://pgnearme.co.in/pg/${l.city_slug}/${l.area_slug ?? "all"}/${l.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: l.address_line ?? undefined,
      addressLocality: l.area_name ?? l.city_name,
      addressRegion: l.city_name,
      addressCountry: "IN",
    },
    ...(l.lat && l.lng
      ? { geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng } }
      : {}),
    ...(l.images.length
      ? { image: l.images.map((i) => resolveImageUrl(i.storage_path)) }
      : {}),
    ...(l.price_min
      ? {
          priceRange: `₹${l.price_min}–₹${l.price_max ?? l.price_min} per month`,
        }
      : {}),
    ...(l.rating_avg
      ? {
          aggregateRating: {
            "@type": "AggregateRating",
            ratingValue: Number(l.rating_avg),
            reviewCount: l.rating_count,
          },
          review: l.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.reviewer_name },
            reviewRating: { "@type": "Rating", ratingValue: r.rating },
            reviewBody: r.review_text ?? undefined,
          })),
        }
      : {}),
  };

  const gallery = l.images;
  const extraCount = Math.max(0, gallery.length - 3);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-14 pt-6 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="mb-4 text-sm text-grey-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/pg/${l.city_slug}`} className="hover:text-primary">
          {l.city_name}
        </Link>{" "}
        / <span className="text-grey-600">{l.name}</span>
      </nav>

      <div className="grid items-start gap-9 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {/* Gallery (ref .gallery): main + two side tiles, +N overlay */}
          {gallery.length > 0 && (
            <div
              className={`grid h-[220px] gap-2 overflow-hidden rounded-[14px] sm:h-[340px] ${
                gallery.length > 1 ? "grid-cols-[2fr_1fr]" : ""
              }`}
            >
              <div className="relative bg-gradient-to-br from-primary to-purple">
                <Image
                  src={resolveImageUrl(gallery[0].storage_path)}
                  alt={gallery[0].alt_text || l.name}
                  fill
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover"
                  priority
                />
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-rows-2 gap-2">
                  {gallery.slice(1, 3).map((img, i) => (
                    <div
                      key={img.storage_path + i}
                      className="relative bg-gradient-to-br from-accent to-teal"
                    >
                      <Image
                        src={resolveImageUrl(img.storage_path)}
                        alt={img.alt_text || `${l.name} photo ${i + 2}`}
                        fill
                        sizes="28vw"
                        className="object-cover"
                      />
                      {i === 1 && extraCount > 0 && (
                        <span className="absolute bottom-2 right-2 rounded-full bg-grey-900/80 px-2.5 py-1 font-mono text-[11.5px] font-semibold text-white">
                          +{extraCount} photos
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Remaining photos: horizontal thumb strip (multi-image support) */}
          {extraCount > 0 && (
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1.5">
              {gallery.slice(3).map((img, i) => (
                <div
                  key={img.storage_path + i}
                  className="relative h-20 w-28 flex-none overflow-hidden rounded-[10px] bg-grey-10"
                >
                  <Image
                    src={resolveImageUrl(img.storage_path)}
                    alt={img.alt_text || `${l.name} photo ${i + 4}`}
                    fill
                    sizes="112px"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Header (ref .pd-header) */}
          <div className="mt-5">
            <h1 className="font-display text-[26px] font-bold text-grey-900">
              {l.name}
            </h1>
            <p className="mt-1.5 text-[14.5px] text-grey-500">
              {[l.address_line, l.area_name, l.city_name]
                .filter(Boolean)
                .join(", ")}
              {l.lat && l.lng && (
                <a
                  href={`https://www.openstreetmap.org/?mlat=${l.lat}&mlon=${l.lng}#map=16/${l.lat}/${l.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-2 text-sm font-semibold text-primary hover:underline"
                >
                  View on map
                </a>
              )}
            </p>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {l.verified_at && <VerifiedBadge />}
              <PgTypeBadge type={l.pg_type} />
              {l.trust_score != null && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-2.5 py-1 font-mono text-[11.5px] font-semibold text-primary">
                  Trust {l.trust_score}/100
                </span>
              )}
              <RatingStars rating={l.rating_avg} count={l.rating_count} />
            </div>
          </div>

          {/* Overview (AEO factual summary + description) */}
          <div className="mt-6 border-t border-grey-50 py-6">
            <SectionHead>Overview</SectionHead>
            <p className="text-[14.5px] leading-[1.7] text-grey-600">
              {l.name} is a{" "}
              {l.pg_type ? `${PG_TYPE_LABEL[l.pg_type].toLowerCase()} ` : ""}
              PG/hostel in {l.area_name ?? l.city_name}, {l.city_name}
              {l.sharing_types.length > 0 &&
                ` offering ${l.sharing_types.join(", ").toLowerCase()} sharing rooms`}
              {genderText && l.sharing_types.length > 0
                ? ` for ${genderText}`
                : ""}
              {price ? `, priced ${price} per month` : ""}.{" "}
              {l.food_preference && l.food_preference !== "not_provided"
                ? `Food: ${FOOD_LABEL[l.food_preference].toLowerCase()}.`
                : l.food_preference === "not_provided"
                  ? "Food is not provided."
                  : ""}
            </p>
            {l.description && (
              <p className="mt-3 text-[14.5px] leading-[1.7] text-grey-600">
                {l.description}
              </p>
            )}
          </div>

          {/* Amenities (ref .amenity-grid) */}
          {l.amenities.length > 0 && (
            <div className="border-t border-grey-50 py-6">
              <SectionHead>Amenities</SectionHead>
              <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {l.amenities.map((a) => (
                  <li
                    key={a.slug}
                    className="flex items-center gap-2.5 text-[13.5px] text-grey-700"
                  >
                    <span
                      className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary-tint text-[15px]"
                      aria-hidden
                    >
                      {amenityEmoji(a)}
                    </span>
                    {a.name}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* House rules (ref .rules-list) */}
          {(l.house_rules_strictness || l.curfew_time || l.religion_preference) && (
            <div className="border-t border-grey-50 py-6">
              <SectionHead>House rules</SectionHead>
              <div className="space-y-2.5 text-sm text-grey-600">
                {l.house_rules_strictness && (
                  <div>
                    • {STRICTNESS_LABEL[l.house_rules_strictness]} house rules
                  </div>
                )}
                {l.curfew_time && (
                  <div>• Entry gate closes at {l.curfew_time.slice(0, 5)}</div>
                )}
                {l.religion_preference && (
                  <div>• Preference: {l.religion_preference}</div>
                )}
              </div>
            </div>
          )}

          {/* Location (ref .map-block) */}
          <div className="border-t border-grey-50 py-6">
            <SectionHead>Location</SectionHead>
            {l.lat && l.lng ? (
              <iframe
                title={`Map — ${l.name}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(l.lng) - 0.01},${Number(l.lat) - 0.006},${Number(l.lng) + 0.01},${Number(l.lat) + 0.006}&layer=mapnik&marker=${l.lat},${l.lng}`}
                className="h-[200px] w-full rounded-[14px] border border-grey-50"
                loading="lazy"
              />
            ) : (
              <div className="flex h-[200px] items-center justify-center rounded-[14px] bg-grey-10 text-[13px] text-grey-400">
                Exact location shared by the owner after contact
              </div>
            )}
          </div>

          {/* Reviews */}
          <div className="border-t border-grey-50 py-6">
            <SectionHead>Reviews</SectionHead>
            {l.ai_review_summary && (
              <div className="mb-3 rounded-[14px] border border-accent/40 bg-primary-tint p-4">
                <p className="font-mono text-[11px] font-semibold uppercase tracking-wider text-primary">
                  AI summary of reviews
                </p>
                <p className="mt-1 text-sm leading-relaxed text-grey-600">
                  {l.ai_review_summary}
                </p>
              </div>
            )}
            <ReviewForm listingId={l.id} />
            {l.reviews.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {l.reviews.map((r, i) => (
                  <li key={i} className="surface-card p-4">
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-grey-800">
                        {r.reviewer_name}
                      </p>
                      <RatingStars rating={r.rating} />
                    </div>
                    {r.review_text && (
                      <p className="mt-1.5 text-sm leading-relaxed text-grey-500">
                        {r.review_text}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-grey-400">No reviews yet.</p>
            )}
          </div>

          {/* Similar PGs nearby (ref .similar-strip) */}
          {similar.length > 0 && (
            <div className="border-t border-grey-50 py-6">
              <SectionHead>Similar PGs nearby</SectionHead>
              <div className="grid gap-4 sm:grid-cols-3">
                {similar.map((s) => (
                  <ListingCard key={s.id} listing={s} />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Contact card (ref .contact-card, sticky) */}
        <aside
          id="contact"
          className="h-fit scroll-mt-24 space-y-4 lg:sticky lg:top-20"
        >
          <div className="surface-card p-6">
            {price ? (
              <p className="font-mono text-2xl font-bold text-primary">
                {price}{" "}
                <span className="text-[13px] font-normal text-grey-400">
                  / month
                </span>
              </p>
            ) : (
              <p className="text-lg font-bold text-grey-700">Price on request</p>
            )}
            <dl className="mt-4">
              {l.pg_type && (
                <FactRow label="PG type" value={PG_TYPE_LABEL[l.pg_type]} />
              )}
              {l.sharing_types.length > 0 && (
                <FactRow label="Sharing" value={l.sharing_types.join(", ")} />
              )}
              {l.food_preference && (
                <FactRow label="Food" value={FOOD_LABEL[l.food_preference]} />
              )}
              {l.road_access && (
                <FactRow
                  label="Road access"
                  value={
                    l.road_access === "with_road" ? "On main road" : "Interior lane"
                  }
                />
              )}
              {l.verified_at && (
                <FactRow
                  label="Verified"
                  value={new Date(l.verified_at).toLocaleDateString("en-IN", {
                    month: "short",
                    year: "numeric",
                  })}
                />
              )}
            </dl>
            <div className="mt-4">
              <ContactReveal listingId={l.id} />
            </div>
            <p className="mt-3.5 text-center text-[11.5px] text-grey-400">
              No brokerage. Ever.
            </p>
          </div>
        </aside>
      </div>

      {/* Mobile sticky contact bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-grey-50 bg-white/95 p-3 backdrop-blur-md lg:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-1">
          <div className="min-w-0">
            <p className="truncate font-mono text-sm font-bold text-grey-900">
              {price ?? "Price on request"}
              {price && (
                <span className="text-xs font-normal text-grey-400"> /mo</span>
              )}
            </p>
            <p className="truncate text-xs text-grey-400">{l.name}</p>
          </div>
          <a
            href="#contact"
            className="shrink-0 rounded-[10px] bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-dark"
          >
            Contact owner
          </a>
        </div>
      </div>
      {/* keeps the sticky bar from covering the page tail on mobile */}
      <div className="h-16 lg:hidden" aria-hidden />
    </main>
  );
}
