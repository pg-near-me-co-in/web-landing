import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllListings, getListingBySlug, getListingsForCity } from "@/lib/data/listings";
import { ContactReveal } from "@/components/contact-reveal";
import { PgTypeBadge, RatingStars, VerifiedBadge } from "@/components/badges";
import { ListingCard } from "@/components/listing-card";
import { placeholderPhotoFor } from "@/lib/placeholder-images";
import { FOOD_LABEL, PG_TYPE_LABEL, STRICTNESS_LABEL, formatPriceRange } from "@/lib/format";
import { resolveSeo } from "@/lib/seo";
import amenitiesJson from "@/data/amenities.json";
import type { Amenity } from "@/lib/types";

const AMENITIES = amenitiesJson as Amenity[];
const AMENITY_BY_SLUG = new Map(AMENITIES.map((a) => [a.slug, a]));

interface Props {
  params: Promise<{ city: string; slug: string }>;
}

export function generateStaticParams() {
  return getAllListings().map((l) => ({ city: l.city_slug, slug: l.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const l = getListingBySlug(slug);
  if (!l) return {};
  const price = formatPriceRange(l.price_min, l.price_max);
  const traits = [
    l.pg_type ? `${PG_TYPE_LABEL[l.pg_type]} PG` : "PG/hostel",
    l.sharing_types.length ? `${l.sharing_types.join("/")} sharing` : null,
    price ? `${price}/month` : null,
  ]
    .filter(Boolean)
    .join(", ");
  const { title, description, ogTitle, ogDescription } = resolveSeo(null, {
    title: `${l.name} — ${l.area_name ?? l.city_slug}`,
    description: `${l.name} in ${l.area_name ?? l.city_slug}: ${traits}. Photos, amenities and direct owner contact on PG Near Me.`,
  });
  return {
    title,
    description,
    alternates: { canonical: `/pg/${l.city_slug}/${l.slug}` },
    openGraph: { title: ogTitle, description: ogDescription, images: l.images[0] ? [l.images[0].storage_path] : undefined },
  };
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-grey-50 py-2.5 last:border-0">
      <dt className="text-sm text-grey-500">{label}</dt>
      <dd className="text-sm font-semibold text-grey-700">{value}</dd>
    </div>
  );
}

function SectionHead({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3.5 font-display text-lg font-semibold text-grey-900">{children}</h2>;
}

export default async function ListingPage({ params }: Props) {
  const { city, slug } = await params;
  const l = getListingBySlug(slug);
  if (!l || l.city_slug !== city) notFound();

  const price = formatPriceRange(l.price_min, l.price_max);
  const genderText = !l.pg_type ? null : l.pg_type === "unisex" ? "men and women" : l.pg_type === "male" ? "men" : "women";

  let similar = getListingsForCity(l.city_slug, { pgType: l.pg_type ?? undefined }).filter((s) => s.id !== l.id);
  if (similar.length === 0) similar = getListingsForCity(l.city_slug, {}).filter((s) => s.id !== l.id);
  similar = similar.slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: l.name,
    url: `https://pgnearme.co.in/pg/${l.city_slug}/${l.slug}`,
    address: {
      "@type": "PostalAddress",
      streetAddress: l.address_line ?? undefined,
      addressLocality: l.area_name ?? l.city_slug,
      addressCountry: "IN",
    },
    ...(l.lat && l.lng ? { geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng } } : {}),
    ...(l.images.length ? { image: l.images.map((i) => i.storage_path) } : {}),
    ...(l.price_min ? { priceRange: `₹${l.price_min}–₹${l.price_max ?? l.price_min} per month` } : {}),
    ...(l.rating_avg
      ? {
          aggregateRating: { "@type": "AggregateRating", ratingValue: l.rating_avg, reviewCount: l.rating_count },
          review: l.reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.reviewer_name },
            reviewRating: { "@type": "Rating", ratingValue: r.rating },
            reviewBody: r.review_text,
          })),
        }
      : {}),
  };

  const gallery = l.images;
  const extraCount = Math.max(0, gallery.length - 3);

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 pb-14 pt-6 sm:px-6">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="mb-4 text-sm text-grey-500" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">Home</Link> /{" "}
        <Link href={`/pg/${l.city_slug}`} className="hover:text-primary capitalize">{l.city_slug}</Link> /{" "}
        <span className="text-grey-600">{l.name}</span>
      </nav>

      <div className="grid items-start gap-9 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {/* Mobile: swipeable scroll-snap strip. Desktop: hero-tile grid. */}
          {gallery.length > 0 ? (
            <>
              <div className="flex gap-2 overflow-x-auto rounded-xl snap-x snap-mandatory sm:hidden" style={{ scrollbarWidth: "none" }}>
                {gallery.map((img, i) => (
                  <div key={img.storage_path + i} className="relative h-[220px] w-full flex-none snap-center overflow-hidden rounded-xl">
                    <Image src={img.storage_path} alt={img.alt_text} fill sizes="100vw" className="object-cover" priority={i === 0} />
                  </div>
                ))}
              </div>

              <div className={`hidden h-[340px] gap-2 overflow-hidden rounded-xl sm:grid ${gallery.length > 1 ? "grid-cols-[2fr_1fr]" : ""}`}>
                <div className="relative bg-gradient-to-br from-primary to-purple">
                  <Image src={gallery[0].storage_path} alt={gallery[0].alt_text} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" priority />
                </div>
                {gallery.length > 1 && (
                  <div className="grid grid-rows-2 gap-2">
                    {gallery.slice(1, 3).map((img, i) => (
                      <div key={img.storage_path + i} className="relative bg-gradient-to-br from-accent to-teal">
                        <Image src={img.storage_path} alt={img.alt_text} fill sizes="28vw" className="object-cover" />
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
            </>
          ) : (
            <div className="relative h-[220px] overflow-hidden rounded-xl sm:h-[340px]">
              <Image src={placeholderPhotoFor(l.id)} alt={`${l.name} — photo coming soon`} fill sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" priority />
            </div>
          )}

          <div className="mt-5">
            <h1 className="font-display text-[26px] font-bold text-grey-900">{l.name}</h1>
            <p className="mt-1.5 text-[14.5px] text-grey-500">
              {[l.address_line, l.area_name, l.city_slug].filter(Boolean).join(", ")}
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
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-tint px-2.5 py-1 font-mono text-[11.5px] font-semibold text-primary">
                Trust {l.trust_score}/100
              </span>
              <RatingStars rating={l.rating_avg} count={l.rating_count} />
            </div>
          </div>

          <div className="mt-6 border-t border-grey-50 py-6">
            <SectionHead>Overview</SectionHead>
            <p className="text-[14.5px] leading-[1.7] text-grey-600">
              {l.name} is a {l.pg_type ? `${PG_TYPE_LABEL[l.pg_type].toLowerCase()} ` : ""}
              PG/hostel in {l.area_name ?? l.city_slug}
              {l.sharing_types.length > 0 && ` offering ${l.sharing_types.join(", ").toLowerCase()} sharing rooms`}
              {genderText && l.sharing_types.length > 0 ? ` for ${genderText}` : ""}
              {price ? `, priced ${price} per month` : ""}.{" "}
              {l.food_preference !== "not_provided" ? `Food: ${FOOD_LABEL[l.food_preference].toLowerCase()}.` : "Food is not provided."}
            </p>
            {l.description && <p className="mt-3 text-[14.5px] leading-[1.7] text-grey-600">{l.description}</p>}
          </div>

          {l.amenities.length > 0 && (
            <div className="border-t border-grey-50 py-6">
              <SectionHead>Amenities</SectionHead>
              <ul className="grid grid-cols-2 gap-3.5 sm:grid-cols-3">
                {l.amenities.map((slug) => {
                  const a = AMENITY_BY_SLUG.get(slug);
                  if (!a) return null;
                  return (
                    <li key={slug} className="flex items-center gap-2.5 text-[13.5px] text-grey-700">
                      <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-primary-tint text-[15px]" aria-hidden>
                        ✓
                      </span>
                      {a.name}
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <div className="border-t border-grey-50 py-6">
            <SectionHead>House rules</SectionHead>
            <div className="space-y-2.5 text-sm text-grey-600">
              <div>• {STRICTNESS_LABEL[l.house_rules_strictness]} house rules</div>
              <div>• {l.road_access === "with_road" ? "Direct road access" : "No direct road access"}</div>
            </div>
          </div>

          <div className="border-t border-grey-50 py-6">
            <SectionHead>Location</SectionHead>
            {l.lat && l.lng ? (
              <iframe
                title={`Map — ${l.name}`}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${l.lng - 0.01},${l.lat - 0.006},${l.lng + 0.01},${l.lat + 0.006}&layer=mapnik&marker=${l.lat},${l.lng}`}
                className="h-[260px] w-full rounded-xl border border-grey-50"
              />
            ) : (
              <p className="text-sm text-grey-500">Map location not available for this listing yet.</p>
            )}
          </div>

          {l.reviews.length > 0 && (
            <div className="border-t border-grey-50 py-6">
              <SectionHead>Reviews</SectionHead>
              <div className="space-y-4">
                {l.reviews.map((r, i) => (
                  <div key={i} className="surface-card p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-grey-800">{r.reviewer_name}</span>
                      <RatingStars rating={r.rating} />
                    </div>
                    <p className="mt-1.5 text-sm text-grey-600">{r.review_text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="lg:sticky lg:top-24">
          <div className="surface-card p-5">
            <dl>
              <FactRow label="Price" value={price ?? "Ask for price"} />
              <FactRow label="PG type" value={l.pg_type ? PG_TYPE_LABEL[l.pg_type] : "Unspecified"} />
              <FactRow label="Sharing" value={l.sharing_types.join(", ") || "—"} />
              <FactRow label="Food" value={FOOD_LABEL[l.food_preference]} />
            </dl>
            <div className="mt-5">
              <ContactReveal listingId={l.id} phone={l.contact_phone} whatsapp={l.contact_whatsapp} />
            </div>
          </div>

          {similar.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 font-display text-base font-semibold text-grey-900">Similar PGs nearby</h3>
              <div className="grid gap-3">
                {similar.map((s) => (
                  <ListingCard key={s.id} listing={s} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
