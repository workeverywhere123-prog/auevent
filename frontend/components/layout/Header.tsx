"use client";

import { useState } from "react";
import { Search, Bell, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <header
        className="h-16 flex items-center px-6 gap-4 sticky top-0 z-20"
        style={{
          backgroundColor: "var(--header-bg)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        {/* Mobile menu toggle */}
        <button
          className="lg:hidden p-1.5 rounded-lg"
          style={{ color: "var(--text-muted)" }}
          onClick={() => setMobileMenuOpen(true)}
        >
          <Menu size={20} />
        </button>

        {/* Page title area — left */}
        <div className="flex items-center gap-2 flex-1">
          <span
            className="hidden lg:block text-sm font-medium"
            style={{ color: "var(--text-muted)" }}
          >
            Discover events happening around Australia 🌏
          </span>
        </div>

        {/* Search */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
          style={{
            backgroundColor: "#FFF5F4",
            border: "1px solid var(--border)",
            color: "var(--text-muted)",
            minWidth: "200px",
          }}
        >
          <Search size={15} />
          <span>Search events...</span>
        </div>

        {/* Actions */}
        <button
          className="relative p-2 rounded-lg transition-colors"
          style={{ color: "var(--text-muted)" }}
        >
          <Bell size={18} />
          <span
            className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full"
            style={{ backgroundColor: "var(--primary)" }}
          />
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: "var(--secondary)" }}
        >
          AU
        </div>
      </header>

      {/* Mobile drawer overlay */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 h-full" style={{ backgroundColor: "var(--sidebar-bg)" }}>
            <button
              className="absolute top-4 right-4 p-1"
              style={{ color: "var(--text-muted)" }}
              onClick={() => setMobileMenuOpen(false)}
            >
              <X size={18} />
            </button>
            <Sidebar />
          </div>
        </div>
      )}
    </>
  );
}
