"use client";

/**
 * Fires only when the root layout itself throws (Header/Footer/providers) —
 * must render its own <html>/<body> since it replaces the whole layout.
 * Kept dependency-free (inline styles, no Tailwind classes assumed) since
 * the app shell that loads global.css may be exactly what failed.
 */
export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ display: "flex", minHeight: "100vh", alignItems: "center", justifyContent: "center", fontFamily: "system-ui, sans-serif", padding: "24px", textAlign: "center" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: 700, marginBottom: "12px" }}>Something went wrong</h1>
          <p style={{ color: "#6b7280", marginBottom: "20px", maxWidth: "420px" }}>
            That&apos;s on us, not you. Please try again in a moment.
          </p>
          <button
            onClick={reset}
            style={{ background: "#534AB7", color: "white", border: "none", borderRadius: "8px", padding: "10px 20px", fontWeight: 600, cursor: "pointer" }}
          >
            Try again
          </button>
        </div>
      </body>
    </html>
  );
}
