"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import type { Event } from "@/lib/types";
import EventCard from "@/components/events/EventCard";

type EventModalProps = {
  event: Event | null;
  onClose: () => void;
};

export default function EventModal({ event, onClose }: EventModalProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<Element | null>(null);

  useEffect(() => {
    if (!event) return;

    // Save previous focus and lock scroll
    previousFocusRef.current = document.activeElement;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        onClose();
      }
    }

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", handleKeyDown);
      // Restore focus to the previously focused element
      if (
        previousFocusRef.current &&
        typeof (previousFocusRef.current as HTMLElement).focus === "function"
      ) {
        (previousFocusRef.current as HTMLElement).focus();
      }
    };
  }, [event, onClose]);

  if (!event) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Panel wrapper — centers the card */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Inner card — this IS the dialog */}
        <div
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label={event.title}
          tabIndex={-1}
          className="relative rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto outline-none"
          style={{ backgroundColor: "var(--card-bg)" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            aria-label="Close modal"
            onClick={onClose}
            className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-opacity hover:opacity-70"
            style={{
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
              backgroundColor: "var(--card-bg)",
            }}
          >
            <X size={14} />
          </button>

          <EventCard event={event} />
        </div>
      </div>
    </>,
    document.body
  );
}
