import React, { useState } from "react";
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sparkles,
  ArrowRight,
  Gauge,
  Navigation,
  Train,
  Truck,
  Building2,
  Anchor,
  Compass,
  Layers,
  ChevronRight,
  ShieldCheck,
  Zap,
  TrendingUp,
  RefreshCw,
  Info,
} from "lucide-react";
import { CargoShipment } from "@/types/cargo-portal";

interface ArrivalTrackingDashboardProps {
  shipments: CargoShipment[];
  activeShipment: CargoShipment;
  onSelectShipment: (shipment: CargoShipment) => void;
  onRefreshGps: () => void;
  isRefreshing?: boolean;
}

export function ArrivalTrackingDashboard({
  shipments,
  activeShipment,
  onSelectShipment,
  onRefreshGps,
  isRefreshing = false,
}: ArrivalTrackingDashboardProps) {
  const isDelivered = activeShipment.status === "DELIVERED";

  // Calculate arrival variance
  const delayMinutes = activeShipment.delayMinutes || 0;

  return (
    <div className="space-y-6">
      {/* Top Header & Shipment Switcher */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-500 text-white shadow-md">
            <Calendar className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Arrival Date & ETA Intelligence Dashboard
              </h2>
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-600 border border-blue-500/20 font-mono">
                Predictive FOIS Model: 99.1% Precision
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time Indian Railways FOIS satellite feed predicting exact arrival date, station
              gate-in time & siding readiness
            </p>
          </div>
        </div>

        {/* Consignment Selection Dropdown & Refresh */}
        <div className="flex items-center gap-2">
          <select
            value={activeShipment.id}
            onChange={(e) => {
              const found = shipments.find((s) => s.id === e.target.value);
              if (found) onSelectShipment(found);
            }}
            className="rounded-xl border border-border bg-surface-2/80 py-2 pl-3 pr-8 text-xs font-mono font-bold text-foreground focus:border-blue-500 focus:outline-hidden"
          >
            {shipments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.id} — ETA: {s.estimatedDeliveryDate} ({s.origin.city} → {s.destination.city})
              </option>
            ))}
          </select>

          <button
            onClick={onRefreshGps}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Recalculate ETA</span>
          </button>
        </div>
      </div>

      {/* Main Arrival Forecast Hero Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Arrival Forecast Card & Comparison Matrix */}
        <div className="lg:col-span-2 space-y-6">
          {/* HERO ARRIVAL DATE CARD */}
          <div className="rounded-2xl border border-blue-500/30 bg-gradient-to-br from-blue-900 via-indigo-900 to-slate-950 text-white p-6 sm:p-7 shadow-xl relative overflow-hidden space-y-6">
            <div className="absolute -right-20 -top-20 size-60 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 size-60 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

            {/* Top Bar */}
            <div className="relative z-10 flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex size-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-extrabold uppercase tracking-wider text-blue-300">
                  Confirmed Target Arrival Date
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-white border border-white/15 backdrop-blur-md">
                  {activeShipment.consignmentNumber}
                </span>
                {isDelivered ? (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30">
                    Delivered On-Time ✓
                  </span>
                ) : activeShipment.isDelayed ? (
                  <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-bold text-amber-300 border border-amber-400/30 flex items-center gap-1">
                    <AlertTriangle className="size-3.5 text-amber-300" />
                    Delayed (+{activeShipment.delayMinutes}m)
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-400/30 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5 text-emerald-300" />
                    On Schedule
                  </span>
                )}
              </div>
            </div>

            {/* Prominent Arrival Date & Time Display */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="space-y-1">
                <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="size-4 text-cyan-400" />
                  <span>Predicted Arrival Date</span>
                </div>
                <div className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  {activeShipment.estimatedDeliveryDate}
                </div>
                <div className="text-lg font-bold text-cyan-300 flex items-center gap-2">
                  <Clock className="size-4 text-cyan-400" />
                  <span>Target Time: {activeShipment.estimatedDeliveryTime}</span>
                </div>
              </div>

              <div className="rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur-md space-y-2">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>Live Countdown</span>
                  <span className="font-mono text-[10px] text-emerald-300">FOIS Synced</span>
                </div>
                <div className="text-2xl font-black text-white font-mono">
                  {activeShipment.estimatedTravelTime}
                </div>
                <div className="text-xs text-slate-300">
                  Remaining Distance:{" "}
                  <strong className="text-white font-mono">
                    {activeShipment.remainingDistanceKm} km
                  </strong>
                </div>
              </div>
            </div>

            {/* Current Position & Speed Footer */}
            <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block">Current Location</span>
                <strong className="text-white font-bold truncate block">
                  {activeShipment.currentLocationName}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Current Speed</span>
                <strong className="text-cyan-300 font-mono font-bold block">
                  {activeShipment.currentSpeedKmh} km/h
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Origin Hub</span>
                <strong className="text-white font-bold block">{activeShipment.origin.city}</strong>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">Destination Terminal</span>
                <strong className="text-white font-bold block">
                  {activeShipment.destination.city} ({activeShipment.destination.name})
                </strong>
              </div>
            </div>
          </div>

          {/* ARRIVAL DATE COMPARISON MATRIX */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="size-5 text-blue-600" />
                <h3 className="text-sm font-bold text-foreground">
                  Arrival Schedule Comparison Matrix
                </h3>
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                Contractual vs Predicted
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="rounded-xl border border-border bg-surface-2/50 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Contractual Schedule Date
                </span>
                <div className="text-base font-black text-foreground font-mono">
                  {activeShipment.destination.expectedDate}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  At {activeShipment.destination.expectedTime}
                </div>
              </div>

              <div className="rounded-xl border border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-blue-600">
                  AI Predicted Arrival Date
                </span>
                <div className="text-base font-black text-blue-600 font-mono">
                  {activeShipment.estimatedDeliveryDate}
                </div>
                <div className="text-[10px] text-blue-600 font-semibold">
                  At {activeShipment.estimatedDeliveryTime}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-surface-2/50 p-3.5 space-y-1">
                <span className="text-[10px] uppercase font-bold text-muted-foreground">
                  Variance / Buffer
                </span>
                <div
                  className={`text-base font-black font-mono ${delayMinutes > 0 ? "text-amber-600" : "text-emerald-600"}`}
                >
                  {delayMinutes > 0 ? `+${delayMinutes} mins delay` : "On Time (0 mins delay)"}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Absorbed by DFC Express Line
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Predictive Delay Risk Index & Terminal Offloading Readiness */}
        <div className="space-y-6">
          {/* PREDICTIVE DELAY RISK INDEX */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-amber-500" />
                <h3 className="text-sm font-bold text-foreground">Predictive Delay Risk Index</h3>
              </div>
              <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                LOW RISK
              </span>
            </div>

            <div className="space-y-3 text-xs">
              {/* Weather */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">Monsoon / Weather Impact:</span>
                  <span className="text-emerald-600 font-bold">Clear (0% Risk)</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[5%]" />
                </div>
              </div>

              {/* Track maintenance */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">Track Maintenance Block:</span>
                  <span className="text-emerald-600 font-bold">None Reported</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div className="bg-emerald-500 h-full rounded-full w-[10%]" />
                </div>
              </div>

              {/* Yard Congestion */}
              <div className="space-y-1">
                <div className="flex items-center justify-between font-semibold">
                  <span className="text-muted-foreground">Yard & Siding Congestion:</span>
                  <span className="text-blue-600 font-bold">Low (12% Load)</span>
                </div>
                <div className="w-full bg-border rounded-full h-1.5 overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full w-[12%]" />
                </div>
              </div>
            </div>
          </div>

          {/* DESTINATION TERMINAL READINESS */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
              <div className="flex items-center gap-2">
                <Building2 className="size-4 text-blue-600" />
                <h3 className="text-sm font-bold text-foreground">Destination Offloading Siding</h3>
              </div>
              <span className="font-mono text-[10px] text-blue-600 font-bold">RESERVED</span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="rounded-xl bg-surface-2 p-2.5 border border-border space-y-0.5">
                <span className="text-[10px] text-muted-foreground block">
                  Destination Terminal Hub
                </span>
                <strong className="text-foreground font-bold">
                  {activeShipment.destination.name}
                </strong>
              </div>

              <div className="grid grid-cols-2 gap-2 font-mono">
                <div className="rounded-xl bg-surface-2 p-2.5 border border-border">
                  <span className="text-[10px] text-muted-foreground block font-sans">
                    Track Berth
                  </span>
                  <strong className="text-blue-600 font-bold">Siding Berth #4</strong>
                </div>

                <div className="rounded-xl bg-surface-2 p-2.5 border border-border">
                  <span className="text-[10px] text-muted-foreground block font-sans">
                    Offloading Crane
                  </span>
                  <strong className="text-emerald-600 font-bold">RMG Crane #02</strong>
                </div>
              </div>

              <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-2.5 border border-blue-200 dark:border-blue-900 text-[11px] text-blue-900 dark:text-blue-300 font-semibold">
                ✓ Consignee Gate Pass Pre-Approved for Immediate Offloading upon Arrival.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arrival Dates Master Table across All Consignments */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Calendar className="size-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Fleet Master Arrival Date Schedule
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Compare predicted arrival dates, delay variances and remaining travel time for all
                consignments
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-2/60 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Cargo ID & Consignment</th>
                <th className="py-2.5 px-3">Origin → Destination</th>
                <th className="py-2.5 px-3">Predicted Arrival Date & Time</th>
                <th className="py-2.5 px-3">Remaining Distance & Time</th>
                <th className="py-2.5 px-3">Schedule Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {shipments.map((s) => {
                const isSelected = s.id === activeShipment.id;
                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-surface-2/80 transition ${
                      isSelected ? "bg-blue-50/50 dark:bg-blue-950/20 font-semibold" : ""
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-foreground">{s.id}</div>
                      <div className="text-[10px] text-muted-foreground">{s.consignmentNumber}</div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-foreground">
                        {s.origin.city} → {s.destination.city}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{s.train.trainName}</div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-blue-600">{s.estimatedDeliveryDate}</div>
                      <div className="text-[10px] text-muted-foreground">
                        Expected at {s.estimatedDeliveryTime}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-foreground">
                        {s.remainingDistanceKm > 0 ? `${s.remainingDistanceKm} km` : "Arrived"}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-semibold">
                        {s.estimatedTravelTime}
                      </div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      {s.status === "DELIVERED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          Delivered
                        </span>
                      ) : s.isDelayed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="size-3" />+{s.delayMinutes}m Delay
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          On Schedule
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => onSelectShipment(s)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "border border-border bg-surface text-foreground hover:bg-surface-2"
                        }`}
                      >
                        {isSelected ? "Viewing" : "Track Arrival"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
