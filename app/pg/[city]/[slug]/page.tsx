import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { MapPin, Star, Users, Utensils, ShieldCheck, Home, CheckCircle2, Info } from "lucide-react";
import { getAllListings, getListingBySlug } from "@/lib/data/listings";
import { getCityBySlug } from "@/lib/data/cities";
import { BackButton } from "@/components/back-button";
import { ListingGallery } from "@/components/listing-gallery";
import { ContactReveal } from "@/components/contact-reveal";
import { GeneratedAvatar } from "@/components/generated-avatar";
import { formatPriceRange, foodLabel, genderLabel, placeName, rulesLabel } from "@/lib/format";
import { SITE } from "@/lib/content";

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
  const city = getCityBySlug(l.city_slug);
  const where = placeName(l.locality, city?.name ?? l.city_slug);
  const title = `${l.name} — ${where} PG | ${formatPriceRange(l.price_min, l.price_max)}`;
  const desc =
    l.description?.slice(0, 155) ??
    `${genderLabel(l.pg_gender)} PG in ${where}. ${formatPriceRange(l.price_min, l.price_max)}. ${foodLabel(l.food_type)}.`;
  return {
    title,
    description: desc,
    alternates: { canonical: `/pg/${l.city_slug}/${l.slug}` },
    openGraph: { title: `${l.name} — ${l.locality}`, description: desc, type: "article" },
  };
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-grey-50 bg-white p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-grey-500">
        {icon} {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}

export default async function ListingDetailPage({ params }: Props) {
  const { city, slug } = await params;
  const l = getListingBySlug(slug);
  if (!l || l.city_slug !== city) notFound();
  const cityObj = getCityBySlug(l.city_slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "LodgingBusiness",
    name: l.name,
    description: l.description,
    address: {
      "@type": "PostalAddress",
      streetAddress: l.address,
      addressLocality: l.locality,
      addressCountry: "IN",
    },
    ...(l.lat && l.lng ? { geo: { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng } } : {}),
    ...(l.price_min != null && l.price_max != null ? { priceRange: `₹${l.price_min}–₹${l.price_max}/month` } : {}),
    aggregateRating: { "@type": "AggregateRating", ratingValue: l.trust_score, bestRating: 5, ratingCount: 1 },
  };

  return (
    <main className="min-h-screen flex-1 bg-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="container-page pb-4 pt-6">
        <BackButton />
      </div>

      <section className="container-page">
        {l.images.length > 0 ? (
          <ListingGallery images={l.images.map((i) => i.storage_path)} listingName={l.name} />
        ) : (
          <div className="overflow-hidden rounded-2xl border border-grey-50 bg-grey-10">
            <div className="relative aspect-[16/10] w-full">
              <GeneratedAvatar id={l.slug} name={l.name} className="h-full w-full" />
            </div>
          </div>
        )}
      </section>

      <section className="container-page grid gap-8 pt-8 md:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip border-primary/20 bg-primary-tint text-primary">{genderLabel(l.pg_gender)}</span>
            <span className="chip">
              <Star className="h-3 w-3 fill-highlight text-highlight" /> Trust {l.trust_score.toFixed(1)}
            </span>
            {l.verified_at && (
              <span className="chip border-success-fg/20 bg-success-bg text-success-fg">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">{l.name}</h1>
          <p className="mt-2 flex items-center gap-1 text-grey-500">
            <MapPin className="h-4 w-4" /> {l.address}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Fact icon={<Users className="h-4 w-4" />} label="Sharing types" value={l.sharing_types.join(" · ") || "—"} />
            <Fact icon={<Utensils className="h-4 w-4" />} label="Food" value={foodLabel(l.food_type)} />
            <Fact icon={<ShieldCheck className="h-4 w-4" />} label="House rules" value={rulesLabel(l.house_rules)} />
            <Fact icon={<Home className="h-4 w-4" />} label="Road access" value={l.road_access ? "Vehicle-accessible" : "Behind narrow lane"} />
          </div>

          {l.description && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">About this PG</h2>
              <p className="mt-3 whitespace-pre-line text-grey-500">{l.description}</p>
            </div>
          )}

          {l.amenities.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {l.amenities.map((a) => (
                  <span key={a} className="chip">
                    <CheckCircle2 className="h-3 w-3 text-success-fg" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-grey-50 bg-grey-10 p-4 text-sm text-grey-500">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>PG Near Me is a discovery platform. We do not manage bookings or payments — please verify the property in person before making any deposit.</p>
          </div>
        </div>

        <aside className="h-max md:sticky md:top-24">
          <div className="rounded-2xl border border-grey-50 bg-white p-6 shadow-[var(--shadow-card)]">
            <div className="text-xs uppercase tracking-wider text-grey-500">Rent range</div>
            <div className="mt-1 font-display text-3xl font-semibold">{formatPriceRange(l.price_min, l.price_max)}</div>
            <div className="mt-1 text-xs text-grey-500">per bed / month · deposit varies</div>

            <div className="mt-6">
              <ContactReveal
                listingId={l.id}
                listingName={l.name}
                locality={l.locality}
                cityName={cityObj?.name ?? l.city_slug}
                pageUrl={`https://${SITE.domain}/pg/${l.city_slug}/${l.slug}`}
                phone={l.contact_phone}
                whatsapp={l.contact_whatsapp}
                priceMin={l.price_min}
                priceMax={l.price_max}
                sharingTypes={l.sharing_types}
                pgGender={l.pg_gender}
              />
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
