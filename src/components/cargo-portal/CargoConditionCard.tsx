import React from "react";
import {
  ShieldCheck,
  Thermometer,
  Droplets,
  Activity,
  Lock,
  Radio,
  BatteryCharging,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
} from "lucide-react";
import { CargoConditionTelemetry } from "@/types/cargo-portal";

interface CargoConditionCardProps {
  condition: CargoConditionTelemetry;
}

export function CargoConditionCard({ condition }: CargoConditionCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-emerald-600/10 text-emerald-600">
            <ShieldCheck className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">
              Cargo Condition & IoT Sensor Matrix
            </h3>
            <p className="text-[10px] text-muted-foreground">ISRO NavIC + BLE Container Gateway</p>
          </div>
        </div>
        <span className="flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/30">
          <CheckCircle2 className="size-3" />
          All Sensors Normal
        </span>
      </div>

      {/* Sensor Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 text-xs">
        {/* 1. Temperature */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Thermometer className="size-3 text-blue-500" />
              Temperature
            </span>
            <span className="text-emerald-600 font-semibold">✓ Normal</span>
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {condition.temperatureC.toFixed(1)}°C
          </div>
          <div className="text-[10px] text-muted-foreground">
            Target: {condition.temperatureTargetC}°C
          </div>
        </div>

        {/* 2. Humidity */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Droplets className="size-3 text-cyan-500" />
              Humidity
            </span>
            <span className="text-emerald-600 font-semibold">✓ Normal</span>
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {condition.humidityPct}%
          </div>
          <div className="text-[10px] text-muted-foreground">Threshold: &lt;65% RH</div>
        </div>

        {/* 3. Shock / Vibration */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Activity className="size-3 text-emerald-500" />
              Vibration / Shock
            </span>
            <span className="text-emerald-600 font-semibold">✓ Normal</span>
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {condition.vibrationG.toFixed(2)}g
          </div>
          <div className="text-[10px] text-muted-foreground">Max limit: 1.50g</div>
        </div>

        {/* 4. Electronic Seal / Door Status */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Lock className="size-3 text-amber-500" />
              Container E-Seal
            </span>
            <span className="text-emerald-600 font-semibold">✓ Secure</span>
          </div>
          <div className="text-sm font-bold text-foreground truncate">{condition.doorStatus}</div>
          <div className="text-[9px] font-mono text-muted-foreground truncate">
            ID: {condition.eSealId}
          </div>
        </div>

        {/* 5. GPS & Satellite Link */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Radio className="size-3 text-indigo-500" />
              Satellite GPS
            </span>
            <span className="text-emerald-600 font-semibold">✓ Locked</span>
          </div>
          <div className="text-sm font-bold text-foreground">{condition.gpsSignal}</div>
          <div className="text-[9px] text-muted-foreground truncate">
            {condition.gpsConstellation}
          </div>
        </div>

        {/* 6. Tracker Battery */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1">
              <BatteryCharging className="size-3 text-emerald-500" />
              Tracker Battery
            </span>
            <span className="text-emerald-600 font-semibold">86%</span>
          </div>
          <div className="text-xl font-black text-foreground font-mono">
            {condition.batteryPct}%
          </div>
          <div className="text-[10px] text-muted-foreground">{condition.batteryLifeRemaining}</div>
        </div>

        {/* 7. Tilt & Incline */}
        <div className="col-span-2 rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-1">
          <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground">
            <span className="flex items-center gap-1">
              <Compass className="size-3 text-purple-500" />
              Cargo Level & Tilt
            </span>
            <span className="text-emerald-600 font-semibold">✓ Balanced (1.2°)</span>
          </div>
          <div className="text-sm font-bold text-foreground">
            Level on Wagon Bed (No shifting detected)
          </div>
          <div className="text-[10px] text-muted-foreground">
            Last Telemetry: {condition.lastSyncTime}
          </div>
        </div>
      </div>
    </div>
  );
}
