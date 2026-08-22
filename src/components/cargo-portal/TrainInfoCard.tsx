import React from "react";
import {
  Train,
  Gauge,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Zap,
  User,
  Shield,
  ArrowRight,
} from "lucide-react";
import { TrainCarrierDetails } from "@/types/cargo-portal";

interface TrainInfoCardProps {
  train: TrainCarrierDetails;
  expectedDeliveryTime: string;
  expectedDeliveryDate: string;
}

export function TrainInfoCard({
  train,
  expectedDeliveryTime,
  expectedDeliveryDate,
}: TrainInfoCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-600">
            <Train className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Train & Locomotive Rake Telemetry</h3>
            <p className="text-[10px] text-muted-foreground">
              Indian Railways Heavy Freight Network
            </p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/30">
          <CheckCircle2 className="size-3" />
          {train.trainStatus}
        </span>
      </div>

      {/* Train Main Details Banner */}
      <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Freight Train</div>
          <div className="text-base font-black text-foreground">{train.trainName}</div>
          <div className="text-xs font-mono text-blue-600 font-bold">
            Rake No: {train.trainNumber}
          </div>
        </div>

        <div className="flex items-center gap-3 border-t sm:border-t-0 sm:border-l border-border/70 pt-2 sm:pt-0 sm:pl-4">
          <div>
            <div className="text-[10px] font-medium text-muted-foreground">Locomotive Class</div>
            <div className="text-xs font-bold text-foreground">{train.locomotiveType}</div>
            <div className="text-[10px] font-mono text-muted-foreground">{train.locomotiveId}</div>
          </div>
        </div>
      </div>

      {/* Speed & Station Movement Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
        {/* Current Speed */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <Gauge className="size-3 text-blue-600" />
            <span>Current Speed</span>
          </div>
          <div className="text-xl font-black text-emerald-600 font-mono">
            {train.currentSpeedKmh} km/h
          </div>
          <div className="text-[10px] text-muted-foreground">{train.trackSection}</div>
        </div>

        {/* Current Station */}
        <div className="rounded-xl border border-border/80 bg-blue-50/40 dark:bg-blue-950/20 p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-300 flex items-center gap-1">
            <MapPin className="size-3 text-blue-600" />
            <span>Current Station / Yard</span>
          </div>
          <div className="text-sm font-bold text-foreground truncate">{train.currentStation}</div>
          <div className="text-[10px] text-muted-foreground">{train.operatingDivision}</div>
        </div>

        {/* Next Station */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <ArrowRight className="size-3 text-amber-600" />
            <span>Next Station Halt</span>
          </div>
          <div className="text-sm font-bold text-foreground truncate">{train.nextStation}</div>
          <div className="text-[10px] text-muted-foreground">Passed: {train.lastStationPassed}</div>
        </div>
      </div>

      {/* Train Composition & Crew Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
        <div className="rounded-lg bg-surface-2/50 p-2.5 border border-border/60">
          <div className="text-[10px] text-muted-foreground">Total Wagons in Rake</div>
          <div className="font-bold font-mono text-foreground">{train.totalWagons} Wagons</div>
        </div>

        <div className="rounded-lg bg-surface-2/50 p-2.5 border border-border/60">
          <div className="text-[10px] text-muted-foreground">Freight Corridor</div>
          <div className="font-bold text-foreground truncate">{train.corridorName}</div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-lg bg-surface-2/50 p-2.5 border border-border/60">
          <div className="text-[10px] text-muted-foreground">Assigned Loco Pilot</div>
          <div className="font-bold text-foreground truncate">{train.locoPilotName}</div>
        </div>
      </div>
    </div>
  );
}
