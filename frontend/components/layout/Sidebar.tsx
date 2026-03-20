"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  MapPin,
  Tags,
  Music,
  Star,
  Info,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/events", label: "All Events", icon: CalendarDays },
  { href: "/map", label: "Event Map", icon: MapPin },
  { href: "/categories", label: "Categories", icon: Tags },
  { href: "/music", label: "Music & Festivals", icon: Music },
  { href: "/featured", label: "Featured", icon: Star },
  { href: "/about", label: "About", icon: Info },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: collapsed ? "64px" : "240px",
        borderRight: "1px solid var(--border)",
        backgroundColor: "var(--sidebar-bg)",
        transition: "width 0.2s ease",
      }}
      className="relative flex flex-col h-full shrink-0"
    >
      {/* Logo area */}
      <div
        className="flex items-center h-16 px-4 gap-3"
        style={{ borderBottom: "1px solid var(--border)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0"
          style={{ backgroundColor: "var(--primary)" }}
        >
          🦘
        </div>
        {!collapsed && (
          <span
            className="font-bold text-lg tracking-tight"
            style={{ color: "var(--text)" }}
          >
            Oz<span style={{ color: "var(--primary)" }}>Fest</span>
          </span>
        )}
      </div>

      {/* Nav items */}
      <nav className="flex-1 py-4 overflow-hidden">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className="flex items-center gap-3 mx-2 px-3 py-2.5 rounded-lg mb-1 transition-colors"
              style={{
                backgroundColor: active ? "#FFF0EF" : "transparent",
                color: active ? "var(--primary)" : "var(--text-muted)",
                fontWeight: active ? 600 : 400,
              }}
            >
              <Icon
                size={18}
                strokeWidth={active ? 2.5 : 1.8}
                style={{ color: active ? "var(--primary)" : "var(--text-muted)", shrink: 0 }}
                className="shrink-0"
              />
              {!collapsed && (
                <span className="text-sm truncate">{label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full flex items-center justify-center shadow-md z-10"
        style={{
          backgroundColor: "var(--card-bg)",
          border: "1px solid var(--border)",
          color: "var(--text-muted)",
        }}
      >
        {collapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
      </button>
    </aside>
  );
}
