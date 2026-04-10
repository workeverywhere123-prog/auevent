"use client";

import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { Search, Bell, Menu, X } from "lucide-react";
import Sidebar from "./Sidebar";
import type { Event } from "@/lib/types";
import SearchDropdown from "@/components/search/SearchDropdown";
import EventModal from "@/components/search/EventModal";

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search state
  const [query, setQuery] = useState("");
  const [events, setEvents] = useState<Event[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  const hasFetched = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounced query — inline, no external lib
  // isPending is true from first keystroke until debounce fires, suppressing "No results" flash
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    if (query) setIsPending(true);
    const t = setTimeout(() => {
      setDebouncedQuery(query);
      setIsPending(false);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  // Filtered results derived from debounced query
  const filteredEvents = useMemo(() => {
    if (!debouncedQuery) return [];
    const q = debouncedQuery.toLowerCase();
    return events
      .filter((e) => e.title.toLowerCase().includes(q))
      .slice(0, 8);
  }, [events, debouncedQuery]);

  // Reset activeIndex whenever the query changes.
  // Promise.resolve().then() wrapper required by react-hooks/set-state-in-effect lint rule —
  // same pattern used in StarredContext.tsx. Synchronous setState in an effect body is banned.
  useEffect(() => {
    Promise.resolve().then(() => setActiveIndex(-1));
  }, [debouncedQuery]);

  // Click-outside handler
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target as Node) &&
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, []);

  // Fetch all events on first focus
  function handleFocus() {
    setIsOpen(true);
    if (!hasFetched.current) {
      hasFetched.current = true;
      setIsFetching(true);
      fetch("/api/search")
        .then((r) => r.json())
        .then((data) => setEvents(Array.isArray(data) ? data : []))
        .catch(() => setEvents([]))
        .finally(() => setIsFetching(false));
    }
  }

  // Keyboard navigation
  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filteredEvents.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, -1));
    } else if (e.key === "Enter") {
      if (activeIndex >= 0 && filteredEvents[activeIndex]) {
        handleSelect(filteredEvents[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
      setQuery("");
      inputRef.current?.blur();
    }
  }

  function handleSelect(event: Event) {
    setSelectedEvent(event);
    setIsOpen(false);
    setQuery("");
  }

  const handleModalClose = useCallback(() => {
    setSelectedEvent(null);
  }, []);

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

        {/* Live search */}
        <div className="hidden sm:flex relative" ref={dropdownRef}>
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
            style={{
              backgroundColor: "#FFF5F4",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              minWidth: "480px",
            }}
            suppressHydrationWarning
          >
            <Search size={15} style={{ flexShrink: 0 }} />
            <input
              ref={inputRef}
              type="text"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
              placeholder="Search events..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setIsOpen(true);
              }}
              onFocus={handleFocus}
              onKeyDown={handleKeyDown}
              role="combobox"
              aria-expanded={isOpen && query.length > 0}
              aria-autocomplete="list"
              aria-controls="search-listbox"
              aria-activedescendant={
                activeIndex >= 0 ? `search-option-${activeIndex}` : undefined
              }
              className="bg-transparent outline-none w-full text-sm"
              style={{ color: "var(--text)", caretColor: "var(--primary)" }}
              suppressHydrationWarning
            />
          </div>

          {isOpen && query.length > 0 && (
            <div className="absolute top-full left-0 mt-1 w-full z-50">
              <SearchDropdown
                results={filteredEvents}
                isLoading={isFetching || isPending}
                query={query}
                activeIndex={activeIndex}
                onSelect={handleSelect}
                onMouseEnterItem={setActiveIndex}
              />
            </div>
          )}
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
          <div
            className="relative z-10 h-full"
            style={{ backgroundColor: "var(--sidebar-bg)" }}
          >
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

      {/* Event detail modal */}
      <EventModal event={selectedEvent} onClose={handleModalClose} />
    </>
  );
}
