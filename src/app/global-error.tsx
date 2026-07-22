"use client";

// Last-resort boundary for errors thrown by the root layout itself — must
// render its own <html>/<body> per Next.js convention, and can't rely on
// globals.css/Tailwind having loaded, so styles are inline.
export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          fontFamily:
            "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
          textAlign: "center",
          padding: "24px",
          color: "#16191C",
        }}
      >
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0 }}>
          Something went wrong.
        </h1>
        <p style={{ marginTop: "12px", color: "#616C78", maxWidth: "360px" }}>
          PG Near Me hit an unexpected error. Please try again.
        </p>
        <button
          onClick={() => reset()}
          style={{
            marginTop: "20px",
            borderRadius: "10px",
            background: "#534AB7",
            color: "#fff",
            border: "none",
            padding: "12px 24px",
            fontSize: "14px",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
