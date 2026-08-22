import React from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Train,
  Truck,
  Building2,
  Sparkles,
  Radio,
  ArrowDown,
} from "lucide-react";
import { TimelineEvent } from "@/types/cargo-portal";

interface JourneyTimelineProps {
  timeline: TimelineEvent[];
  currentSpeedKmh: number;
}

export function JourneyTimeline({ timeline, currentSpeedKmh }: JourneyTimelineProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
            <Clock className="size-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">
            Journey Route & Live Station Timeline
          </h3>
        </div>
        <span className="text-[11px] font-mono text-muted-foreground">
          {timeline.length} Milestones Tracked
        </span>
      </div>

      {/* Vertical Timeline List */}
      <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
        {timeline.map((event, idx) => {
          const isCompleted = event.status === "COMPLETED";
          const isActive = event.status === "ACTIVE";
          const isUpcoming = event.status === "UPCOMING";

          return (
            <div key={event.id} className="relative group">
              {/* Timeline Marker Node */}
              <div
                className={`absolute -left-6 top-0 flex size-5.5 items-center justify-center rounded-full border-2 transition-all ${
                  isCompleted
                    ? "bg-blue-600 border-blue-600 text-white shadow-xs"
                    : isActive
                      ? "bg-white dark:bg-slate-900 border-blue-600 text-blue-600 ring-4 ring-blue-500/25 shadow-md scale-125"
                      : "bg-surface-2 border-border text-muted-foreground"
                }`}
              >
                {isCompleted ? (
                  <Check className="size-3 stroke-[3]" />
                ) : isActive ? (
                  <div className="relative flex items-center justify-center">
                    <span className="size-2 rounded-full bg-blue-600 animate-ping absolute opacity-75" />
                    <span className="size-2 rounded-full bg-blue-600" />
                  </div>
                ) : (
                  <span className="size-1.5 rounded-full bg-muted-foreground/50" />
                )}
              </div>

              {/* Event Content Box */}
              <div
                className={`rounded-xl p-3.5 transition ${
                  isActive
                    ? "border-2 border-blue-500/80 bg-blue-50/50 dark:bg-blue-950/30 shadow-md"
                    : isCompleted
                      ? "border border-border/60 bg-surface-2/30 hover:bg-surface-2/60"
                      : "border border-dashed border-border/70 bg-surface-2/10 opacity-75"
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isActive
                          ? "text-blue-700 dark:text-blue-300 font-black"
                          : isCompleted
                            ? "text-foreground"
                            : "text-muted-foreground"
                      }`}
                    >
                      {isCompleted && "✓ "}
                      {isActive && "● "}
                      {isUpcoming && "○ "}
                      {event.title}
                    </span>

                    {event.tag && (
                      <span
                        className={`rounded-md px-1.5 py-0.2 font-mono text-[9px] font-bold ${
                          isActive
                            ? "bg-blue-600 text-white"
                            : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                        }`}
                      >
                        {event.tag}
                      </span>
                    )}
                  </div>

                  {/* Timestamp */}
                  <span
                    className={`font-mono text-[11px] ${
                      isActive
                        ? "text-blue-600 font-bold"
                        : isCompleted
                          ? "text-muted-foreground"
                          : "text-muted-foreground/80 italic"
                    }`}
                  >
                    {event.timestamp}
                  </span>
                </div>

                {/* Location & Mode */}
                <div className="mt-1 flex items-center gap-2 text-[11px] text-muted-foreground">
                  <MapPin className="size-3 text-red-500 shrink-0" />
                  <span className="font-medium text-foreground">{event.location}</span>
                  {event.speedKmh !== undefined && (
                    <span className="rounded bg-surface px-1.5 py-0.2 font-mono text-[10px] font-bold text-emerald-600 border border-border">
                      {event.speedKmh} km/h
                    </span>
                  )}
                </div>

                {/* Description */}
                <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
