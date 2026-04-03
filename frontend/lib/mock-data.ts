export const CATEGORY_META: Record<
  string,
  { label: string; color: string; bg: string }
> = {
  music:    { label: "Music",    color: "#E84040", bg: "#FDE8E8" },
  food:     { label: "Food",     color: "#FF7F00", bg: "#FFF3E0" },
  sports:   { label: "Sports",   color: "#00B894", bg: "#E0F8F3" },
  arts:     { label: "Arts",     color: "#E07A5F", bg: "#FCF0ED" },
  cultural: { label: "Cultural", color: "#F9CA24", bg: "#FFFDE0" },
  markets:  { label: "Markets",  color: "#0984E3", bg: "#E0F0FD" },
  comedy:   { label: "Comedy",   color: "#E91E8C", bg: "#FCE4F3" },
  film:     { label: "Film",     color: "#2D3436", bg: "#EAECEC" },
  all:      { label: "All",      color: "#8898AA", bg: "#F4F6F8" },
};

export const STATE_META: Record<string, { label: string; color: string }> = {
  NSW: { label: "NSW", color: "#9333EA" },
  VIC: { label: "VIC", color: "#EC4899" },
  QLD: { label: "QLD", color: "#B45309" },
  WA:  { label: "WA",  color: "#92400E" },
  SA:  { label: "SA",  color: "#0891B2" },
  TAS: { label: "TAS", color: "#34D399" },
  ACT: { label: "ACT", color: "#E8956D" },
  NT:  { label: "NT",  color: "#C4A882" },
};
