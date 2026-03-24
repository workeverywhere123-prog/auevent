import { CATEGORY_META } from "@/lib/mock-data";
import type { EventCategory } from "@/lib/types";

type Props = {
  category: EventCategory | "all";
  size?: "sm" | "md";
};

export default function CategoryBadge({ category, size = "sm" }: Props) {
  const meta = CATEGORY_META[category] ?? CATEGORY_META.all;
  const padding = size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm";

  return (
    <span
      className={`inline-block rounded-full font-medium ${padding}`}
      style={{ color: meta.color, backgroundColor: meta.bg }}
    >
      {meta.label}
    </span>
  );
}
