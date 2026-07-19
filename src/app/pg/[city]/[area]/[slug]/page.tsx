import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllPublishedSlugs, getListingBySlug } from "@/lib/queries";
import { ContactReveal } from "@/components/contact-reveal";
import { ReviewForm } from "@/components/review-form";
import { PgTypeBadge, RatingStars } from "@/components/badges";
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
  const price = formatPriceRange(l.price_min, l.price_max);
  const traits = [
    l.pg_type ? `${PG_TYPE_LABEL[l.pg_type]} PG` : "PG/hostel",
    l.sharing_types.length ? `${l.sharing_types.join("/")} sharing` : null,
    price ? `${price}/month` : null,
  ]
    .filter(Boolean)
    .join(", ");
  return {
    title: `${l.name} — ${l.area_name ?? l.city_name}, ${l.city_name}`,
    description: `${l.name} in ${l.area_name ?? l.city_name}, ${l.city_name}: ${traits}. Photos, amenities, reviews and direct owner contact on PG Near Me.`,
    alternates: {
      canonical: `/pg/${l.city_slug}/${l.area_slug ?? "all"}/${l.slug}`,
    },
    openGraph: l.cover_image ? { images: [l.cover_image] } : undefined,
  };
}

function FactRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-grey-50 py-2.5 last:border-0">
      <dt className="text-sm text-grey-400">{label}</dt>
      <dd className="text-sm font-semibold text-grey-700">{value}</dd>
    </div>
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
      ? { image: l.images.map((i) => i.storage_path) }
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

  return (
    <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <nav className="text-sm text-grey-400" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>{" "}
        /{" "}
        <Link href={`/pg/${l.city_slug}`} className="hover:text-primary">
          {l.city_name}
        </Link>{" "}
        / <span className="text-grey-600">{l.name}</span>
      </nav>

      {/* Gallery */}
      {l.images.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {l.images.slice(0, 3).map((img, i) => (
            <div
              key={img.storage_path + i}
              className={`relative overflow-hidden rounded-2xl bg-grey-10 ${
                i === 0 ? "aspect-[4/3] sm:col-span-2 sm:row-span-2" : "aspect-[4/3]"
              }`}
            >
              <Image
                src={resolveImageUrl(img.storage_path)}
                alt={img.alt_text}
                fill
                sizes={i === 0 ? "(max-width: 640px) 100vw, 66vw" : "33vw"}
                className="object-cover"
                priority={i === 0}
              />
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-display text-3xl text-grey-900">{l.name}</h1>
            <PgTypeBadge type={l.pg_type} />
          </div>
          <p className="mt-1 flex items-center gap-1.5 text-grey-500">
            <svg
              viewBox="0 0 24 24"
              className="h-4 w-4 text-primary"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            {[l.address_line, l.area_name, l.city_name].filter(Boolean).join(", ")}
            {l.lat && l.lng && (
              <a
                href={`https://www.openstreetmap.org/?mlat=${l.lat}&mlon=${l.lng}#map=16/${l.lat}/${l.lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="ml-1 text-sm font-semibold text-primary hover:underline"
              >
                View on map
              </a>
            )}
          </p>
          <div className="mt-2">
            <RatingStars rating={l.rating_avg} count={l.rating_count} />
          </div>

          {/* AEO factual summary block */}
          <p className="mt-5 rounded-2xl bg-grey-10 p-4 text-[15px] leading-relaxed text-grey-600">
            {l.name} is a {l.pg_type ? `${PG_TYPE_LABEL[l.pg_type].toLowerCase()} ` : ""}
            PG/hostel in {l.area_name ?? l.city_name}, {l.city_name}
            {l.sharing_types.length > 0 &&
              ` offering ${l.sharing_types.join(", ").toLowerCase()} sharing rooms`}
            {genderText && l.sharing_types.length > 0 ? ` for ${genderText}` : ""}
            {price ? `, priced ${price} per month` : ""}.{" "}
            {l.food_preference && l.food_preference !== "not_provided"
              ? `Food: ${FOOD_LABEL[l.food_preference].toLowerCase()}.`
              : l.food_preference === "not_provided"
                ? "Food is not provided."
                : ""}
          </p>

          {l.description && (
            <section className="mt-6">
              <h2 className="text-lg font-bold text-grey-900">About this PG</h2>
              <p className="mt-2 leading-relaxed text-grey-600">{l.description}</p>
            </section>
          )}

          {/* Amenities */}
          {l.amenities.length > 0 && (
            <section className="mt-8">
              <h2 className="text-lg font-bold text-grey-900">Amenities</h2>
              <ul className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {l.amenities.map((a) => (
                  <li
                    key={a.slug}
                    className="flex items-center gap-2 rounded-xl bg-white px-3 py-2 text-sm text-grey-600 shadow-sm"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-teal" aria-hidden />
                    {a.name}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* Reviews */}
          <section className="mt-8">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-bold text-grey-900">Reviews</h2>
            </div>
            <div className="mt-3">
              <ReviewForm listingId={l.id} />
            </div>
            {l.reviews.length > 0 ? (
              <ul className="mt-3 space-y-3">
                {l.reviews.map((r, i) => (
                  <li
                    key={i}
                    className="rounded-2xl border border-grey-50 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <p className="font-semibold text-grey-800">{r.reviewer_name}</p>
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
          </section>
        </div>

        {/* Sidebar: price + facts + contact */}
        <aside className="h-fit space-y-4 lg:sticky lg:top-24">
          <div className="rounded-2xl border border-grey-50 bg-white p-5 shadow-sm">
            {price && (
              <p className="text-2xl font-bold text-grey-900">
                {price}
                <span className="text-sm font-normal text-grey-400"> /month approx</span>
              </p>
            )}
            <dl className="mt-4">
              {l.pg_type && <FactRow label="PG type" value={PG_TYPE_LABEL[l.pg_type]} />}
              {l.sharing_types.length > 0 && (
                <FactRow label="Sharing" value={l.sharing_types.join(", ")} />
              )}
              {l.food_preference && (
                <FactRow label="Food" value={FOOD_LABEL[l.food_preference]} />
              )}
              {l.house_rules_strictness && (
                <FactRow
                  label="House rules"
                  value={STRICTNESS_LABEL[l.house_rules_strictness]}
                />
              )}
              {l.curfew_time && (
                <FactRow label="Curfew" value={l.curfew_time.slice(0, 5)} />
              )}
              {l.road_access && (
                <FactRow
                  label="Road access"
                  value={l.road_access === "with_road" ? "On main road" : "Interior lane"}
                />
              )}
              {l.religion_preference && (
                <FactRow label="Preference" value={l.religion_preference} />
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
          </div>
          <ContactReveal listingId={l.id} />
        </aside>
      </div>
    </main>
  );
}
