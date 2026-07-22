import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { z } from "zod";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { SiteNav, SiteFooter } from "@/components/site-nav";
import { supabase } from "@/integrations/supabase/client";
import { AMENITIES_ALL, SHARING_TYPES } from "@/lib/format";

const submitSchema = z.object({
  name: z.string().trim().min(2).max(120),
  locality: z.string().trim().min(2).max(80),
  address: z.string().trim().min(5).max(400),
  contact_phone: z.string().trim().regex(/^\+?[0-9\- ]{7,20}$/, "Enter a valid phone number"),
  contact_whatsapp: z.string().trim().regex(/^\+?[0-9\- ]{7,20}$/).optional().or(z.literal("")),
  pg_gender: z.enum(["male", "female", "unisex"]),
  price_min: z.coerce.number().int().min(500).max(200000),
  price_max: z.coerce.number().int().min(500).max(200000),
  food_type: z.enum(["veg_only", "non_veg_allowed", "no_food"]),
  house_rules: z.enum(["strict", "liberal"]),
  road_access: z.boolean(),
  sharing_types: z.array(z.string()).min(1, "Pick at least one sharing type"),
  amenities: z.array(z.string()),
  description: z.string().max(2000).optional(),
  submitted_by_name: z.string().trim().min(2).max(80),
  submitted_by_email: z.string().trim().email(),
});

export const Route = createFileRoute("/submit")({
  head: () => ({
    meta: [
      { title: "List your PG for free — PG Near Me" },
      { name: "description", content: "Submit your PG, hostel or shared flat to PG Near Me. No commission, no dashboard to learn. Approved listings appear across search." },
      { property: "og:title", content: "List your PG for free" },
      { property: "og:description", content: "Submit your PG in under 3 minutes. Reach seekers directly." },
      { property: "og:url", content: "/submit" },
    ],
    links: [{ rel: "canonical", href: "/submit" }],
  }),
  component: SubmitPage,
});

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function SubmitPage() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errors, setErrors] = useState<string[]>([]);
  const [sharing, setSharing] = useState<string[]>([]);
  const [amenities, setAmenities] = useState<string[]>([]);
  const [roadAccess, setRoadAccess] = useState(true);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErrors([]);
    setStatus("submitting");
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: fd.get("name"),
      locality: fd.get("locality"),
      address: fd.get("address"),
      contact_phone: fd.get("contact_phone"),
      contact_whatsapp: fd.get("contact_whatsapp") || "",
      pg_gender: fd.get("pg_gender"),
      price_min: fd.get("price_min"),
      price_max: fd.get("price_max"),
      food_type: fd.get("food_type"),
      house_rules: fd.get("house_rules"),
      road_access: roadAccess,
      sharing_types: sharing,
      amenities,
      description: fd.get("description") || "",
      submitted_by_name: fd.get("submitted_by_name"),
      submitted_by_email: fd.get("submitted_by_email"),
    };
    const parsed = submitSchema.safeParse(raw);
    if (!parsed.success) {
      setErrors(parsed.error.issues.map((i) => `${i.path.join(".")}: ${i.message}`));
      setStatus("error");
      return;
    }
    const v = parsed.data;
    if (v.price_min > v.price_max) {
      setErrors(["Min price cannot exceed max price"]);
      setStatus("error");
      return;
    }

    // Get Vadodara city id
    const { data: city } = await supabase.from("cities").select("id").eq("slug", "vadodara").maybeSingle();
    if (!city) {
      setErrors(["Vadodara city not configured"]);
      setStatus("error");
      return;
    }

    const baseSlug = slugify(`${v.name}-${v.locality}`);
    const slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`;

    const { error } = await supabase.from("listings").insert({
      slug,
      name: v.name,
      city_id: city.id,
      locality: v.locality,
      address: v.address,
      contact_phone: v.contact_phone,
      contact_whatsapp: v.contact_whatsapp || null,
      pg_gender: v.pg_gender,
      price_min: v.price_min,
      price_max: v.price_max,
      sharing_types: v.sharing_types,
      food_type: v.food_type,
      house_rules: v.house_rules,
      road_access: v.road_access,
      amenities: v.amenities,
      description: v.description,
      submitted_by_email: v.submitted_by_email,
      submitted_by_name: v.submitted_by_name,
      status: "pending",
    });

    if (error) {
      setErrors([error.message]);
      setStatus("error");
      return;
    }
    setStatus("success");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (status === "success") {
    return (
      <div className="min-h-screen bg-background">
        <SiteNav />
        <div className="container-page py-20">
          <div className="mx-auto max-w-lg rounded-2xl border border-success/30 bg-success-soft p-8 text-center">
            <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
            <h1 className="mt-4 font-display text-2xl font-semibold">Thanks — we've got it.</h1>
            <p className="mt-2 text-muted-foreground">
              Your listing is in the moderation queue. We manually verify every submission before publishing — typically
              within 24–48 hours. You'll hear back on the email you provided.
            </p>
            <Link to="/" className="mt-6 inline-block text-primary underline">
              Back to home
            </Link>
          </div>
        </div>
        <SiteFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <SiteNav />
      <div className="container-page grid gap-10 py-12 lg:grid-cols-[1fr_320px]">
        <div>
          <div className="text-xs font-semibold uppercase tracking-widest text-primary">For owners</div>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight md:text-4xl">
            List your PG on PG Near Me
          </h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">
            No commission, no monthly fee. Fill in the fields below — we manually review before publishing.
          </p>

          {errors.length > 0 && (
            <div className="mt-6 rounded-xl border border-destructive/30 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-destructive">
                <AlertCircle className="h-4 w-4" /> Please fix the following
              </div>
              <ul className="mt-2 list-disc pl-6 text-sm text-destructive">
                {errors.map((e) => <li key={e}>{e}</li>)}
              </ul>
            </div>
          )}

          <form onSubmit={onSubmit} className="mt-8 grid gap-6">
            <Section title="Property">
              <Field label="PG name" name="name" required maxLength={120} placeholder="Shreeji PG" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Locality" name="locality" required placeholder="Alkapuri" />
                <SelectField label="Gender policy" name="pg_gender" required options={[
                  ["male", "Male only"], ["female", "Female only"], ["unisex", "Unisex / Co-living"],
                ]} />
              </div>
              <Field label="Full address" name="address" required placeholder="Street, locality, landmark, city — 6 digit PIN" />
            </Section>

            <Section title="Pricing & rooms">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Rent min (₹/mo per bed)" name="price_min" type="number" required min={500} />
                <Field label="Rent max (₹/mo per bed)" name="price_max" type="number" required min={500} />
              </div>
              <ChipGroup label="Sharing types offered" options={[...SHARING_TYPES]} value={sharing} onChange={setSharing} />
            </Section>

            <Section title="Food, rules & access">
              <div className="grid gap-4 sm:grid-cols-2">
                <SelectField label="Food" name="food_type" required options={[
                  ["veg_only", "Veg only"], ["non_veg_allowed", "Non-veg allowed"], ["no_food", "No food provided"],
                ]} />
                <SelectField label="House rules" name="house_rules" required options={[
                  ["liberal", "Liberal"], ["strict", "Strict (curfew / restrictions)"],
                ]} />
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={roadAccess} onChange={(e) => setRoadAccess(e.target.checked)} />
                Vehicle-accessible (not behind a narrow lane)
              </label>
              <ChipGroup label="Amenities" options={[...AMENITIES_ALL]} value={amenities} onChange={setAmenities} />
            </Section>

            <Section title="Description (optional)">
              <textarea
                name="description"
                rows={4}
                maxLength={2000}
                placeholder="What makes your PG a good fit? Curfew, food style, warden, neighborhood, best-suited residents…"
                className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
              />
            </Section>

            <Section title="Contact">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Phone (owner)" name="contact_phone" required placeholder="+91 98240 12345" />
                <Field label="WhatsApp (optional)" name="contact_whatsapp" placeholder="+91 98240 12345" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Your name" name="submitted_by_name" required placeholder="Kirti Patel" />
                <Field label="Your email" name="submitted_by_email" type="email" required placeholder="you@example.com" />
              </div>
            </Section>

            <button
              type="submit"
              disabled={status === "submitting"}
              className="inline-flex h-12 items-center justify-center rounded-xl bg-primary px-8 text-sm font-medium text-primary-foreground shadow-[var(--shadow-elevated)] transition hover:bg-primary/90 disabled:opacity-60"
            >
              {status === "submitting" ? "Submitting…" : "Submit for review"}
            </button>
          </form>
        </div>

        <aside className="h-max lg:sticky lg:top-24">
          <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
            <div className="text-xs font-semibold uppercase tracking-widest text-primary">What happens next</div>
            <ol className="mt-3 space-y-3 text-sm">
              <li><span className="font-semibold">1.</span> We verify the phone number and basic details.</li>
              <li><span className="font-semibold">2.</span> Approved within 24–48 hours.</li>
              <li><span className="font-semibold">3.</span> Live on Vadodara search, with your number one tap away.</li>
            </ol>
            <div className="mt-6 rounded-xl bg-primary-soft p-4 text-xs text-primary">
              Free during Phase 1. We don't take commission on any lead.
            </div>
          </div>
        </aside>
      </div>
      <SiteFooter />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 shadow-[var(--shadow-card)]">
      <div className="mb-4 font-display text-sm font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field(props: {
  label: string;
  name: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  min?: number;
  maxLength?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {props.label}
        {props.required && <span className="text-destructive"> *</span>}
      </span>
      <input
        name={props.name}
        type={props.type ?? "text"}
        required={props.required}
        placeholder={props.placeholder}
        min={props.min}
        maxLength={props.maxLength}
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
      />
    </label>
  );
}

function SelectField(props: {
  label: string;
  name: string;
  required?: boolean;
  options: [string, string][];
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium">
        {props.label}
        {props.required && <span className="text-destructive"> *</span>}
      </span>
      <select
        name={props.name}
        required={props.required}
        defaultValue=""
        className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary focus:ring-2 focus:ring-ring/30"
      >
        <option value="" disabled>Select…</option>
        {props.options.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
      </select>
    </label>
  );
}

function ChipGroup({
  label, options, value, onChange,
}: {
  label: string;
  options: string[];
  value: string[];
  onChange: (next: string[]) => void;
}) {
  return (
    <div>
      <div className="mb-2 text-sm font-medium">{label}</div>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const active = value.includes(opt);
          return (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(active ? value.filter((v) => v !== opt) : [...value, opt])}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background hover:bg-surface-muted"
              }`}
            >
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
