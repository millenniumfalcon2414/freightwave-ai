import React from "react";
import {
  Calendar,
  Clock,
  Navigation,
  Gauge,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Radio,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";
import { CargoShipment } from "@/types/cargo-portal";

interface EtaCardProps {
  shipment: CargoShipment;
}

export function EtaCard({ shipment }: EtaCardProps) {
  const isDelivered = shipment.status === "DELIVERED";

  return (
    <div className="rounded-2xl border border-blue-500/20 bg-gradient-to-br from-blue-900/90 via-indigo-900/95 to-slate-950 text-white p-5 sm:p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
      {/* Decorative ambient background curves */}
      <div className="absolute -right-16 -top-16 size-48 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />
      <div className="absolute -left-16 -bottom-16 size-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

      {/* Top Banner: Golden UX Priority Question 1 & 2 */}
      <div className="relative z-10 space-y-4">
        <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex size-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300">
              Live Delivery Forecast
            </span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md border border-white/15">
            {shipment.isDelayed ? (
              <span className="text-amber-300 font-bold flex items-center gap-1">
                <AlertTriangle className="size-3.5 text-amber-300" />
                Delayed (+{shipment.delayMinutes}m)
              </span>
            ) : isDelivered ? (
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3.5 text-emerald-300" />
                Delivered On-Time
              </span>
            ) : (
              <span className="text-emerald-300 font-bold flex items-center gap-1">
                <CheckCircle2 className="size-3.5 text-emerald-300" />
                Running on Schedule
              </span>
            )}
          </div>
        </div>

        {/* Priority 3: When will my cargo be delivered? */}
        <div className="space-y-1">
          <div className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
            <Calendar className="size-3.5 text-cyan-400" />
            <span>Estimated Delivery Date & Time</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {shipment.estimatedDeliveryDate}
          </div>
          <div className="flex items-center gap-2 text-base sm:text-lg font-bold text-cyan-300">
            <Clock className="size-4" />
            <span>Expected Arrival: {shipment.estimatedDeliveryTime}</span>
          </div>
        </div>

        {/* Priority 1: Where is my cargo right now? */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-md space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1">
            <MapPin className="size-3 text-red-400" />
            <span>Current Live Location</span>
          </div>
          <div className="text-sm font-bold text-white flex items-center justify-between gap-2">
            <span>{shipment.currentLocationName}</span>
            <span className="font-mono text-[11px] text-emerald-300 font-bold">
              {shipment.currentSpeedKmh} km/h
            </span>
          </div>
          <div className="text-[10px] text-slate-400">
            Last GPS ping: {shipment.lastUpdatedMinutesAgo} min ago (NavIC Constellation)
          </div>
        </div>
      </div>

      {/* Bottom Metrics Grid (Distance remaining, Travel time, Speed, Update) */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-4 border-t border-white/10 mt-4">
        {/* Metric 1: Distance Remaining */}
        <div className="rounded-lg bg-white/5 p-2.5 border border-white/10">
          <div className="text-[10px] font-medium text-slate-400">Distance Remaining</div>
          <div className="text-sm sm:text-base font-black text-white font-mono mt-0.5">
            {shipment.remainingDistanceKm > 0
              ? `${shipment.remainingDistanceKm} km`
              : "0 km (Arrived)"}
          </div>
          <div className="text-[9px] text-slate-400">to destination ICD</div>
        </div>

        {/* Metric 2: Estimated Travel Time */}
        <div className="rounded-lg bg-white/5 p-2.5 border border-white/10">
          <div className="text-[10px] font-medium text-slate-400">Travel Time Left</div>
          <div className="text-sm sm:text-base font-black text-cyan-300 font-mono mt-0.5">
            {shipment.estimatedTravelTime}
          </div>
          <div className="text-[9px] text-slate-400">based on speed graph</div>
        </div>

        {/* Metric 3: Current Speed */}
        <div className="col-span-2 sm:col-span-1 rounded-lg bg-white/5 p-2.5 border border-white/10">
          <div className="text-[10px] font-medium text-slate-400">Train Speed</div>
          <div className="text-sm sm:text-base font-black text-emerald-300 font-mono mt-0.5 flex items-center gap-1">
            <Gauge className="size-4 text-emerald-400" />
            <span>{shipment.currentSpeedKmh} km/h</span>
          </div>
          <div className="text-[9px] text-slate-400">Max permissible: 100 km/h</div>
        </div>
      </div>
    </div>
  );
}
