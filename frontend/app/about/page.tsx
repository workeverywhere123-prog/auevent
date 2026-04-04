export default function AboutPage() {
  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight" style={{ color: "var(--text)" }}>
          About <span style={{ color: "var(--primary)" }}>OzFest</span>
        </h1>
        <p className="text-sm mt-2" style={{ color: "var(--text-muted)" }}>
          Your guide to events happening across Australia
        </p>
      </div>

      <div
        className="rounded-2xl p-6 mb-5"
        style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>
          What is OzFest?
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          OzFest is a community-driven event discovery platform built to help you find
          festivals, concerts, markets, sports, arts, and cultural events happening all
          around Australia — from the heart of Sydney to the outback of the Northern Territory.
        </p>
      </div>

      <div
        className="rounded-2xl p-6 mb-5"
        style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>
          Features
        </h2>
        <ul className="flex flex-col gap-2.5 text-sm" style={{ color: "var(--text-muted)" }}>
          {[
            "Browse events by category, state, or date",
            "Interactive map view to explore events geographically",
            "Calendar view to plan your schedule",
            "Save favourite events with the star button",
            "Filter by state or territory across all views",
          ].map((item) => (
            <li key={item} className="flex items-start gap-2">
              <span
                className="mt-0.5 w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: "var(--primary)" }}
              />
              {item}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="rounded-2xl p-6"
        style={{ backgroundColor: "var(--card-bg)", border: "1px solid var(--border)" }}
      >
        <h2 className="text-lg font-bold mb-3" style={{ color: "var(--text)" }}>
          Contact
        </h2>
        <p className="text-sm leading-relaxed" style={{ color: "var(--text-muted)" }}>
          Have a suggestion or want to list your event?{" "}
          <a
            href="mailto:hello@ozfest.com.au"
            className="font-medium underline underline-offset-2"
            style={{ color: "var(--primary)" }}
          >
            hello@ozfest.com.au
          </a>
        </p>
      </div>
    </div>
  );
}
