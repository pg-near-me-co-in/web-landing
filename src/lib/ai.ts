import "server-only";
import Anthropic from "@anthropic-ai/sdk";

// Phase 4 AI features — active only when ANTHROPIC_API_KEY is set.
// Everything here is suggest-only: output lands in admin-reviewed fields,
// nothing publishes without a human action (per docs/AI_FEATURES_SPEC.md).
const MODEL = "claude-opus-4-8";

export function isAiConfigured(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function getClient(): Anthropic {
  return new Anthropic();
}

function textOf(message: Anthropic.Message): string | null {
  if (message.stop_reason === "refusal") return null;
  const block = message.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text"
  );
  return block?.text.trim() || null;
}

export interface ListingFacts {
  name: string;
  city: string;
  area: string | null;
  pg_type: string | null;
  sharing_types: string[];
  price_min: number | null;
  price_max: number | null;
  food_preference: string | null;
  house_rules_strictness: string | null;
  description: string | null;
}

/**
 * Rewrite/expand a listing description from its structured facts.
 * Never invents amenities or prices — only phrases what is already known.
 */
export async function improveDescription(l: ListingFacts): Promise<string | null> {
  const client = getClient();
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 2048,
    system:
      "You write listing descriptions for PG Near Me, an Indian PG/hostel directory. " +
      "Write 2-4 plain, factual sentences in simple English for seekers (students and " +
      "working professionals). Use ONLY the facts provided — never invent amenities, " +
      "prices, distances, or claims that are not in the input. If a fact is missing, " +
      "omit it. No marketing superlatives, no emoji, no headings. Output only the " +
      "description text.",
    messages: [
      {
        role: "user",
        content: `Facts:\n${JSON.stringify(
          {
            name: l.name,
            city: l.city,
            area: l.area,
            pg_type: l.pg_type,
            sharing_types: l.sharing_types,
            monthly_price_min_inr: l.price_min,
            monthly_price_max_inr: l.price_max,
            food: l.food_preference,
            house_rules: l.house_rules_strictness,
          },
          null,
          2
        )}\n\nExisting description (may be empty or rough):\n${l.description ?? "(none)"}`,
      },
    ],
  });
  return textOf(message);
}

/**
 * Summarize approved reviews into 2-3 sentences for the detail page.
 * Shown under an explicit "AI summary of reviews" label.
 */
export async function summarizeReviews(
  listingName: string,
  reviews: { rating: number; review_text: string | null }[]
): Promise<string | null> {
  const client = getClient();
  const body = reviews
    .map((r, i) => `${i + 1}. (${r.rating}/5) ${r.review_text ?? "(no text)"}`)
    .join("\n");
  const message = await client.messages.create({
    model: MODEL,
    max_tokens: 1024,
    system:
      "You summarize guest reviews for a PG/hostel listing. Write 2-3 neutral " +
      "sentences capturing what reviewers consistently praise and criticise. " +
      "Reflect only what the reviews actually say; include negatives honestly. " +
      "No marketing tone, no emoji. Output only the summary text.",
    messages: [
      {
        role: "user",
        content: `Listing: ${listingName}\nApproved reviews:\n${body}`,
      },
    ],
  });
  return textOf(message);
}
