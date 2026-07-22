import { describe, expect, it, vi } from "vitest";
import { resolveImageUrl } from "@/lib/images";

describe("resolveImageUrl", () => {
  it("passes through http(s):// URLs untouched", () => {
    expect(resolveImageUrl("https://upload.wikimedia.org/foo.jpg")).toBe(
      "https://upload.wikimedia.org/foo.jpg"
    );
    expect(resolveImageUrl("http://example.com/bar.png")).toBe("http://example.com/bar.png");
  });

  it("builds a Supabase Storage public URL for a plain storage path", () => {
    vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://project.supabase.co");
    expect(resolveImageUrl("submissions/abc123.jpg")).toBe(
      "https://project.supabase.co/storage/v1/object/public/listing-images/submissions/abc123.jpg"
    );
    vi.unstubAllEnvs();
  });
});
