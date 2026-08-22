import React from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  MapPin,
  Train,
  Truck,
  ArrowRight,
  Copy,
  Share2,
  AlertTriangle,
  FileText,
  BadgeCheck,
  Sparkles,
} from "lucide-react";
import { CargoShipment, TrackingStage } from "@/types/cargo-portal";

interface ShipmentTrackerHeaderProps {
  shipment: CargoShipment;
  onCopyCargoId: () => void;
  copied: boolean;
  onViewDocuments: () => void;
}

const STAGES: TrackingStage[] = [
  "Cargo Booked",
  "Loaded",
  "Departed",
  "In Transit",
  "Destination Station",
  "Out for Delivery",
  "Delivered",
];

export function ShipmentTrackerHeader({
  shipment,
  onCopyCargoId,
  copied,
  onViewDocuments,
}: ShipmentTrackerHeaderProps) {
  const currentStageIndex = shipment.currentStageIndex;

  const getStatusBadge = () => {
    switch (shipment.status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-xs font-bold text-emerald-600 border border-emerald-500/30">
            <CheckCircle2 className="size-3.5" />
            Delivered ✓
          </span>
        );
      case "DELAYED":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30 animate-pulse">
            <AlertTriangle className="size-3.5" />
            {shipment.statusLabel}
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/15 px-3 py-1 text-xs font-bold text-cyan-600 border border-cyan-500/30">
            <Truck className="size-3.5" />
            Out for Delivery
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/15 px-3 py-1 text-xs font-bold text-blue-600 border border-blue-500/30">
            <span className="size-2 rounded-full bg-blue-600 animate-ping" />
            {shipment.statusLabel}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-md space-y-6">
      {/* Top Header Row: Active Shipment Info & Status */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-border/70 pb-5">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
              Cargo ID: <span className="text-blue-600 font-mono">{shipment.id}</span>
            </h1>
            <button
              onClick={onCopyCargoId}
              className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 px-2 py-1 text-[11px] font-mono font-semibold text-muted-foreground hover:text-foreground transition"
              title="Copy Cargo Consignment ID"
            >
              <Copy className="size-3" />
              <span>{copied ? "Copied!" : "Copy ID"}</span>
            </button>
            {getStatusBadge()}
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
            {shipment.transportMode === "ROAD" || (shipment.road && !shipment.train) ? (
              <>
                <span className="flex items-center gap-1">
                  <strong className="text-foreground">Fleet Vehicle:</strong>{" "}
                  {shipment.road?.vehicleNumber || "Highway Fleet Vehicle"}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <strong className="text-foreground">Transporter:</strong>{" "}
                  {shipment.road?.transporterName || "Express Road Freight"}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <strong className="text-foreground">LR / Docket No:</strong>{" "}
                  {shipment.consignmentNumber}
                </span>
                {shipment.road?.eWayBillNumber && (
                  <>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1">
                      <strong className="text-foreground">e-Way Bill:</strong>{" "}
                      {shipment.road.eWayBillNumber}
                    </span>
                  </>
                )}
              </>
            ) : (
              <>
                <span className="flex items-center gap-1">
                  <strong className="text-foreground">Train / Freight:</strong>{" "}
                  {shipment.train?.trainName || "Indian Railways Freight Rake"}{" "}
                  {shipment.train?.trainNumber ? `(${shipment.train.trainNumber})` : ""}
                </span>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <strong className="text-foreground">Consignment RR:</strong>{" "}
                  {shipment.consignmentNumber}
                </span>
                {shipment.train?.wagonNumber && (
                  <>
                    <span className="text-border">|</span>
                    <span className="flex items-center gap-1">
                      <strong className="text-foreground">Wagon:</strong>{" "}
                      {shipment.train.wagonNumber}
                    </span>
                  </>
                )}
              </>
            )}
          </div>
        </div>

        {/* Origin to Destination Route Bar */}
        <div className="flex items-center gap-3 rounded-xl border border-border/80 bg-surface-2/60 px-4 py-2.5">
          <div className="text-left">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Origin</div>
            <div className="text-sm font-bold text-foreground">{shipment.origin.city}</div>
            <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {shipment.origin.hub}
            </div>
          </div>

          <div className="flex flex-col items-center px-2">
            <div className="text-[10px] font-mono font-semibold text-blue-600">
              {shipment.remainingDistanceKm > 0
                ? `${shipment.remainingDistanceKm} km left`
                : "Arrived"}
            </div>
            <div className="flex items-center text-blue-600">
              <span className="h-0.5 w-6 bg-blue-500"></span>
              <ArrowRight className="size-4" />
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-muted-foreground">Destination</div>
            <div className="text-sm font-bold text-foreground">{shipment.destination.city}</div>
            <div className="text-[10px] text-muted-foreground truncate max-w-[120px]">
              {shipment.destination.hub}
            </div>
          </div>
        </div>
      </div>

      {/* Large 7-Stage Interactive Progress Tracker */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-foreground">
          <span>Freight Journey Milestone Progress</span>
          <span className="text-blue-600 font-mono">
            Stage {Math.min(currentStageIndex + 1, 7)} of 7 Completed
          </span>
        </div>

        {/* Progress Bar with 7 Nodes */}
        <div className="relative pt-2 pb-1">
          {/* Background Track Line */}
          <div className="absolute top-6 left-6 right-6 h-1.5 -translate-y-1/2 bg-surface-2 rounded-full border border-border" />

          {/* Filled Active Line */}
          <div
            className="absolute top-6 left-6 h-1.5 -translate-y-1/2 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 rounded-full transition-all duration-700"
            style={{
              width: `calc(${(currentStageIndex / (STAGES.length - 1)) * 100}% - 12px)`,
            }}
          />

          {/* Stage Step Nodes */}
          <div className="relative flex justify-between">
            {STAGES.map((stage, idx) => {
              const isCompleted = idx < currentStageIndex;
              const isCurrent = idx === currentStageIndex;
              const isUpcoming = idx > currentStageIndex;

              return (
                <div
                  key={stage}
                  className="flex flex-col items-center group cursor-pointer max-w-[85px] sm:max-w-[110px] text-center"
                >
                  {/* Node Circle */}
                  <div
                    className={`relative z-10 flex size-9 sm:size-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${
                      isCompleted
                        ? "bg-blue-600 border-blue-600 text-white shadow-md"
                        : isCurrent
                          ? "bg-white dark:bg-slate-900 border-blue-600 text-blue-600 ring-4 ring-blue-500/25 shadow-lg scale-110"
                          : "bg-surface-2 border-border text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="size-4.5 stroke-[3]" />
                    ) : isCurrent ? (
                      <div className="relative flex items-center justify-center">
                        <span className="size-3 rounded-full bg-blue-600 animate-ping absolute opacity-75" />
                        <span className="size-3 rounded-full bg-blue-600" />
                      </div>
                    ) : (
                      <span className="text-xs font-bold font-mono">{idx + 1}</span>
                    )}
                  </div>

                  {/* Stage Label */}
                  <span
                    className={`mt-2 text-[10px] sm:text-xs font-bold leading-tight ${
                      isCurrent
                        ? "text-blue-600 font-black"
                        : isCompleted
                          ? "text-foreground"
                          : "text-muted-foreground"
                    }`}
                  >
                    {stage}
                  </span>

                  {/* Context Subtext for Completed/Active */}
                  {isCurrent && (
                    <span className="hidden sm:inline-block mt-0.5 rounded-full bg-blue-500/10 px-1.5 py-0.2 font-mono text-[9px] font-bold text-blue-600">
                      Active
                    </span>
                  )}
                  {isCompleted && (
                    <span className="hidden sm:inline-block mt-0.5 text-[9px] font-mono text-emerald-600">
                      ✓ Done
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
