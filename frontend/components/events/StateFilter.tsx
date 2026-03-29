"use client";

import { useRouter, useSearchParams } from "next/navigation";

const STATES = [
  { code: "all", label: "All States" },
  { code: "NSW", label: "New South Wales" },
  { code: "VIC", label: "Victoria" },
  { code: "QLD", label: "Queensland" },
  { code: "WA",  label: "Western Australia" },
  { code: "SA",  label: "South Australia" },
  { code: "TAS", label: "Tasmania" },
  { code: "ACT", label: "ACT" },
  { code: "NT",  label: "Northern Territory" },
];

export default function StateFilter({ current }: { current: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value === "all") {
      params.delete("state");
    } else {
      params.set("state", e.target.value);
    }
    router.push(`/events?${params.toString()}`);
  }

  return (
    <select
      value={current}
      onChange={handleChange}
      className="px-3 py-1.5 rounded-lg text-sm font-medium border cursor-pointer"
      style={{
        borderColor: "var(--border)",
        color: "var(--text)",
        backgroundColor: "var(--card-bg)",
      }}
    >
      {STATES.map((s) => (
        <option key={s.code} value={s.code}>
          {s.label}
        </option>
      ))}
    </select>
  );
}
