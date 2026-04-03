"use client";

import { StarredProvider } from "@/contexts/StarredContext";
import type { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return <StarredProvider>{children}</StarredProvider>;
}
