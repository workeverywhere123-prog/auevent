"use client";

import { Star } from "lucide-react";
import { useStarred } from "@/hooks/useStarred";

export default function StarButton({ eventId }: { eventId: string }) {
  const { isStarred, toggle, ready } = useStarred();
  if (!ready) return null;

  const active = isStarred(eventId);

  return (
    <button
      onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggle(eventId); }}
      className="shrink-0 transition-transform hover:scale-110 active:scale-95"
      style={{
        padding: 4,
        borderRadius: "50%",
        backgroundColor: active ? "#FFF8E1" : "transparent",
        border: `1px solid ${active ? "#FFD700" : "var(--border)"}`,
        color: active ? "#FFD700" : "#C0C0C0",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      title={active ? "즐겨찾기 해제" : "즐겨찾기 추가"}
    >
      <Star size={13} fill={active ? "#FFD700" : "none"} strokeWidth={2} />
    </button>
  );
}
