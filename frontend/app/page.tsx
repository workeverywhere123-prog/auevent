import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center">
      <div className="text-6xl">🦘</div>
      <h1
        className="text-4xl font-bold tracking-tight"
        style={{ color: "var(--text)" }}
      >
        Welcome to{" "}
        <span style={{ color: "var(--primary)" }}>OzFest</span>
      </h1>
      <p className="text-lg" style={{ color: "var(--text-muted)" }}>
        Discover events happening around Australia
      </p>
      <Link
        href="/events"
        className="mt-4 px-6 py-3 rounded-full text-white font-semibold text-sm"
        style={{ backgroundColor: "var(--primary)" }}
      >
        Explore Events
      </Link>
    </div>
  );
}
