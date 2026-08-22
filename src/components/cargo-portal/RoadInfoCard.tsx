import React from "react";
import {
  Truck,
  Gauge,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  CreditCard,
  UserCheck,
  ShieldCheck,
  ArrowRight,
  Fuel,
  Activity,
  FileText,
} from "lucide-react";
import { RoadCarrierDetails } from "@/types/cargo-portal";

interface RoadInfoCardProps {
  road: RoadCarrierDetails;
  expectedDeliveryTime: string;
  expectedDeliveryDate: string;
}

export function RoadInfoCard({
  road,
  expectedDeliveryTime,
  expectedDeliveryDate,
}: RoadInfoCardProps) {
  return (
    <div
      id="road-carrier-telemetry-card"
      className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600">
            <Truck className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Commercial Heavy Haul Truck Telemetry
            </h3>
            <p className="text-[10px] text-muted-foreground">
              National Highways & FASTag Telematics Network
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/30">
          <CheckCircle2 className="size-3" />
          {road.roadStatus}
        </span>
      </div>

      {/* Road Vehicle & Transporter Banner */}
      <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground">
            Transporter & Fleet
          </div>
          <div className="text-base font-black text-foreground">{road.transporterName}</div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-xs font-mono text-emerald-600 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              {road.vehicleNumber}
            </span>
            <span className="text-[11px] text-muted-foreground font-medium">
              {road.vehicleModel}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-border/70 pt-2 sm:pt-0 sm:pl-4">
          <div>
            <div className="text-[10px] font-medium text-muted-foreground">Trailer Spec</div>
            <div className="text-xs font-bold text-foreground">{road.trailerType}</div>
            <div className="text-[10px] font-mono text-emerald-600 font-semibold">
              {road.nationalPermitNumber}
            </div>
          </div>
        </div>
      </div>

      {/* Speed, Toll Plaza & Highway Corridor Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
        {/* Live Highway Speed */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <Gauge className="size-3 text-emerald-600" />
            <span>Highway Speed</span>
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono">
            {road.currentSpeedKmh} km/h
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            {road.currentHighwayCorridor}
          </div>
        </div>

        {/* Toll Plaza Telematics */}
        <div className="rounded-xl border border-border/80 bg-emerald-50/30 dark:bg-emerald-950/20 p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
            <CreditCard className="size-3 text-emerald-600" />
            <span>FASTag Toll Status</span>
          </div>
          <div className="text-sm font-bold text-foreground truncate">
            {road.lastTollPlazaPassed}
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            Next: {road.nextTollPlaza}
          </div>
        </div>

        {/* Driver & Safety Audit */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <UserCheck className="size-3 text-blue-600" />
            <span>Sarathi Driver DL</span>
          </div>
          <div className="text-sm font-bold text-foreground truncate">{road.driverName}</div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="size-3" />
            Vigilance Score: {road.driverVigilanceScorePct}%
          </div>
        </div>
      </div>

      {/* Vehicle Diagnostics Bar: Fuel, AdBlue, TPMS, E-Way Bill */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 text-xs">
        <div className="rounded-lg bg-surface-2/50 p-2.5 border border-border/60">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Fuel className="size-3 text-amber-600" />
            <span>Diesel Fuel</span>
          </div>
          <div className="font-bold font-mono text-foreground">{road.fuelLevelPct}% Level</div>
        </div>

        <div className="rounded-lg bg-surface-2/50 p-2.5 border border-border/60">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Activity className="size-3 text-blue-600" />
            <span>AdBlue (DEF)</span>
          </div>
          <div className="font-bold font-mono text-foreground">
            {road.adBlueLevelPct}% (BS-VI OK)
          </div>
        </div>

        <div className="rounded-lg bg-surface-2/50 p-2.5 border border-border/60">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Gauge className="size-3 text-emerald-600" />
            <span>Tyre Pressure</span>
          </div>
          <div className="font-bold font-mono text-foreground">
            {road.tyrePressurePsi} PSI (TPMS Nominal)
          </div>
        </div>

        <div className="rounded-lg bg-surface-2/50 p-2.5 border border-border/60">
          <div className="text-[10px] text-muted-foreground flex items-center gap-1">
            <FileText className="size-3 text-indigo-600" />
            <span>E-Way Bill</span>
          </div>
          <div className="font-bold font-mono text-xs text-foreground truncate">
            {road.eWayBillNumber}
          </div>
        </div>
      </div>
    </div>
  );
}
