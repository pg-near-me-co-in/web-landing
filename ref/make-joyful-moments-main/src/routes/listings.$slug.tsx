import { createFileRoute, Link, notFound, useRouter } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import {
  MapPin, Star, Phone, MessageCircle, Users, Utensils, ShieldCheck, Home,
  CheckCircle2, ArrowLeft, Info,
} from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { listingBySlugQuery, logLeadEvent } from "@/lib/queries";
import { galleryFor } from "@/lib/images";
import { formatPriceRange, GENDER_LABEL, FOOD_LABEL, RULES_LABEL } from "@/lib/format";

export const Route = createFileRoute("/listings/$slug")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(listingBySlugQuery(params.slug));
    if (!data) throw notFound();
    return data;
  },
  head: ({ loaderData, params }) => {
    if (!loaderData) {
      return {
        meta: [
          { title: "Listing not found — PG Near Me" },
          { name: "robots", content: "noindex" },
        ],
      };
    }
    const l = loaderData;
    const title = `${l.name} — ${l.locality}, ${l.city.name} PG | ${formatPriceRange(l.price_min, l.price_max)}`;
    const desc =
      l.description?.slice(0, 155) ??
      `${GENDER_LABEL[l.pg_gender]} PG in ${l.locality}, ${l.city.name}. ${formatPriceRange(l.price_min, l.price_max)}. ${FOOD_LABEL[l.food_type]}.`;
    return {
      meta: [
        { title },
        { name: "description", content: desc },
        { property: "og:title", content: `${l.name} — ${l.locality}` },
        { property: "og:description", content: desc },
        { property: "og:type", content: "article" },
        { property: "og:url", content: `/listings/${params.slug}` },
      ],
      links: [{ rel: "canonical", href: `/listings/${params.slug}` }],
      scripts: [
        {
          type: "application/ld+json",
          children: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LodgingBusiness",
            name: l.name,
            description: l.description,
            address: {
              "@type": "PostalAddress",
              streetAddress: l.address,
              addressLocality: l.locality,
              addressRegion: l.city.state,
              addressCountry: "IN",
            },
            geo: l.lat && l.lng ? { "@type": "GeoCoordinates", latitude: l.lat, longitude: l.lng } : undefined,
            priceRange: `₹${l.price_min}–₹${l.price_max}/month`,
            aggregateRating: l.trust_score > 0 ? {
              "@type": "AggregateRating",
              ratingValue: l.trust_score,
              bestRating: 5,
              ratingCount: 1,
            } : undefined,
          }),
        },
      ],
    };
  },
  component: ListingDetail,
  notFoundComponent: () => (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container-page py-24 text-center">
        <h1 className="font-display text-3xl font-semibold">Listing not found</h1>
        <p className="mt-2 text-muted-foreground">It may have been removed or the URL is wrong.</p>
        <Link to="/listings" search={{ city: "vadodara" }} className="mt-6 inline-block text-primary underline">
          Back to listings
        </Link>
      </div>
    </div>
  ),
});

function ListingDetail() {
  const l = Route.useLoaderData();
  const router = useRouter();
  const [revealed, setRevealed] = useState(false);
  const gallery = galleryFor(l.slug, l.images);
  const [active, setActive] = useState(0);

  useEffect(() => {
    // reset when navigating between listings
    setRevealed(false);
    setActive(0);
  }, [l.id]);

  const reveal = () => {
    setRevealed(true);
    void logLeadEvent(l.id, "reveal_phone");
  };
  const clickWhatsApp = () => {
    void logLeadEvent(l.id, "click_whatsapp");
  };
  const clickCall = () => {
    void logLeadEvent(l.id, "click_call");
  };

  const waNumber = (l.contact_whatsapp ?? l.contact_phone).replace(/[^0-9]/g, "");

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />

      <div className="container-page pb-4 pt-6">
        <button
          onClick={() => router.history.back()}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </button>
      </div>

      {/* Gallery */}
      <section className="container-page">
        <div className="grid gap-3 md:grid-cols-[3fr_1fr]">
          <div className="overflow-hidden rounded-2xl border border-border bg-muted">
            <img
              src={gallery[active]}
              alt={`${l.name} — photo ${active + 1}`}
              width={1600}
              height={1000}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
          <div className="grid grid-cols-3 gap-3 md:grid-cols-1">
            {gallery.slice(0, 3).map((src, i) => (
              <button
                key={src + i}
                onClick={() => setActive(i)}
                className={`overflow-hidden rounded-xl border-2 transition ${
                  active === i ? "border-primary" : "border-transparent hover:border-border"
                }`}
              >
                <img src={src} alt="" width={512} height={384} loading="lazy" className="aspect-[4/3] w-full object-cover" />
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Head */}
      <section className="container-page grid gap-8 pt-8 md:grid-cols-[1fr_360px]">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="chip border-primary/20 bg-primary-soft text-primary">
              {GENDER_LABEL[l.pg_gender]}
            </span>
            <span className="chip">
              <Star className="h-3 w-3 fill-accent text-accent" /> Trust {l.trust_score.toFixed(1)}
            </span>
            {l.last_verified_at && (
              <span className="chip border-success/20 bg-success-soft text-success">
                <CheckCircle2 className="h-3 w-3" /> Verified
              </span>
            )}
          </div>
          <h1 className="mt-3 font-display text-3xl font-semibold tracking-tight md:text-4xl">{l.name}</h1>
          <p className="mt-2 flex items-center gap-1 text-muted-foreground">
            <MapPin className="h-4 w-4" /> {l.address}
          </p>

          <div className="mt-8 grid gap-6 sm:grid-cols-2">
            <Fact icon={<Users className="h-4 w-4" />} label="Sharing types" value={l.sharing_types.join(" · ") || "—"} />
            <Fact icon={<Utensils className="h-4 w-4" />} label="Food" value={FOOD_LABEL[l.food_type]} />
            <Fact icon={<ShieldCheck className="h-4 w-4" />} label="House rules" value={RULES_LABEL[l.house_rules]} />
            <Fact icon={<Home className="h-4 w-4" />} label="Road access" value={l.road_access ? "Vehicle-accessible" : "Behind narrow lane"} />
          </div>

          {l.description && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">About this PG</h2>
              <p className="mt-3 whitespace-pre-line text-muted-foreground">{l.description}</p>
            </div>
          )}

          {l.amenities.length > 0 && (
            <div className="mt-10">
              <h2 className="font-display text-xl font-semibold">Amenities</h2>
              <div className="mt-3 flex flex-wrap gap-2">
                {l.amenities.map((a: string) => (
                  <span key={a} className="chip">
                    <CheckCircle2 className="h-3 w-3 text-success" /> {a}
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mt-10 flex items-start gap-3 rounded-2xl border border-border bg-surface-muted p-4 text-sm text-muted-foreground">
            <Info className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              PG Near Me is a discovery platform. We do not manage bookings or payments — please verify the property in
              person before making any deposit.
            </p>
          </div>
        </div>

        {/* Sidebar contact card */}
        <aside className="h-max md:sticky md:top-24">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Rent range</div>
            <div className="mt-1 font-display text-3xl font-semibold">
              {formatPriceRange(l.price_min, l.price_max)}
            </div>
            <div className="mt-1 text-xs text-muted-foreground">per bed / month · deposit varies</div>

            <div className="mt-6 space-y-3">
              {!revealed ? (
                <button
                  onClick={reveal}
                  className="w-full rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground shadow-sm transition hover:bg-primary/90"
                >
                  Reveal owner number
                </button>
              ) : (
                <a
                  href={`tel:${l.contact_phone}`}
                  onClick={clickCall}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  <Phone className="h-4 w-4" /> {l.contact_phone}
                </a>
              )}
              {(l.contact_whatsapp || revealed) && (
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(
                    `Hi, I'm interested in ${l.name} (${l.locality}) listed on PG Near Me.`,
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={clickWhatsApp}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border border-border bg-background py-3 text-sm font-medium transition hover:bg-surface-muted"
                >
                  <MessageCircle className="h-4 w-4 text-success" /> Message on WhatsApp
                </a>
              )}
            </div>

            <div className="mt-6 rounded-xl bg-surface-muted p-3 text-xs text-muted-foreground">
              We track contact-reveal events (not your identity) so owners see qualified interest and we can improve
              matches for seekers.
            </div>
          </div>
        </aside>
      </section>

      <SiteFooter />
    </div>
  );
}

function Fact({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </div>
      <div className="mt-1 font-medium">{value}</div>
    </div>
  );
}
