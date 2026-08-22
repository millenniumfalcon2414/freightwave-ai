import React from "react";
import { InspectionRecord, SensorCalibrationData } from "@/types/qa";
import {
  Thermometer,
  Activity,
  Radio,
  BatteryCharging,
  ShieldCheck,
  CheckCircle2,
  Sliders,
  Sparkles,
  Zap,
} from "lucide-react";

interface StepProps {
  inspection: InspectionRecord;
  onToggleCheck: (itemId: string, passed?: boolean) => void;
  onUpdateSensor: (updates: Partial<SensorCalibrationData>) => void;
}

export function Step3SensorCalibration({ inspection, onToggleCheck, onUpdateSensor }: StepProps) {
  const sensor = inspection.sensorData;
  const sensorChecks = inspection.checklist.filter(
    (c) =>
      c.category === "ENVIRONMENTAL" ||
      c.id.includes("sensor") ||
      c.id.includes("shock") ||
      c.id.includes("iot"),
  );

  return (
    <div className="space-y-6">
      {/* Step Header Banner */}
      <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-cyan-600 text-white shadow-xs">
            <Radio className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Step 3: IoT Sensor Array & Environmental Calibration
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Calibrate multi-channel wireless sensors, zero accelerometer impact thresholds, tune
              temperature envelopes for sensitive cargo, and lock NavIC/GPS satellite telemetry.
            </p>
          </div>
        </div>
      </div>

      {/* Sensor Calibration Sliders & Target Tuning */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Temperature Envelope Calibration */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="size-4.5 text-cyan-600" />
              <h5 className="text-xs font-bold text-foreground">Temperature Target Range (°C)</h5>
            </div>
            <span className="rounded bg-cyan-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-cyan-700 dark:text-cyan-400">
              Current: {sensor.currentTempReadingC}°C
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Min Limit: {sensor.tempTargetMinC}°C</span>
              <span>Max Limit: {sensor.tempTargetMaxC}°C</span>
            </div>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min="0"
                max="15"
                step="1"
                value={sensor.tempTargetMinC}
                onChange={(e) => onUpdateSensor({ tempTargetMinC: parseFloat(e.target.value) })}
                className="w-full accent-cyan-600"
              />
              <input
                type="range"
                min="20"
                max="45"
                step="1"
                value={sensor.tempTargetMaxC}
                onChange={(e) => onUpdateSensor({ tempTargetMaxC: parseFloat(e.target.value) })}
                className="w-full accent-cyan-600"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-muted-foreground">Calibration Standard: NABL PT100</span>
            <button
              type="button"
              onClick={() => onUpdateSensor({ tempProbeZeroed: true })}
              className="flex items-center gap-1 text-[11px] font-bold text-cyan-600 hover:text-cyan-700"
            >
              <Sparkles className="size-3" />
              <span>{sensor.tempProbeZeroed ? "Probe Zeroed ✓" : "Zero Sensor Offset"}</span>
            </button>
          </div>
        </div>

        {/* 3-Axis Shock & Vibration Threshold */}
        <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="size-4.5 text-amber-600" />
              <h5 className="text-xs font-bold text-foreground">
                3-Axis Shock Threshold (G-Force)
              </h5>
            </div>
            <span className="rounded bg-amber-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-amber-700 dark:text-amber-400">
              Max Limit: {sensor.shockMaxGForceAllowed}G
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Resting G: {sensor.currentShockReadingG}G</span>
              <span>Buffer Limit: {sensor.shockMaxGForceAllowed}G</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="3.0"
              step="0.1"
              value={sensor.shockMaxGForceAllowed}
              onChange={(e) =>
                onUpdateSensor({ shockMaxGForceAllowed: parseFloat(e.target.value) })
              }
              className="w-full accent-amber-600"
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-muted-foreground">Standard: ASTM D4169 Profile</span>
            <button
              type="button"
              onClick={() => onUpdateSensor({ accelerometerCalibrated: true })}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700"
            >
              <Zap className="size-3" />
              <span>{sensor.accelerometerCalibrated ? "Calibrated ✓" : "Zero Accelerometer"}</span>
            </button>
          </div>
        </div>
      </div>

      {/* NavIC & Battery Connectivity Health Card */}
      <div className="rounded-xl border border-border bg-surface-2/60 p-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-xl border border-border/60 bg-surface p-2.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              NavIC GNSS Lock
            </span>
            <div className="flex items-center justify-center gap-1.5 font-bold text-xs text-emerald-600 mt-1">
              <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>14 Satellites</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-surface p-2.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Signal Strength
            </span>
            <div className="font-mono text-xs font-bold text-foreground mt-1">
              {sensor.signalStrengthDbm} dBm (Good)
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-surface p-2.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Sensor Battery
            </span>
            <div className="flex items-center justify-center gap-1 font-mono text-xs font-bold text-emerald-600 mt-1">
              <BatteryCharging className="size-3.5 text-emerald-600" />
              <span>{sensor.batteryLevelPercent}% (Lithium)</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 bg-surface p-2.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase">
              Tamper Sensor
            </span>
            <div className="font-bold text-xs text-indigo-600 mt-1">ARMED & ACTIVE</div>
          </div>
        </div>
      </div>

      {/* Environmental & IoT Checkpoints */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" />
            Sensor & IoT Verification Checkpoints
          </h5>
          <span className="text-[11px] text-muted-foreground">
            {sensorChecks.filter((c) => c.passed).length} of {sensorChecks.length} Passed
          </span>
        </div>

        <div className="space-y-2.5">
          {sensorChecks.map((item) => (
            <div
              key={item.id}
              onClick={() => onToggleCheck(item.id)}
              className={`flex items-start gap-3 rounded-xl border p-3.5 transition cursor-pointer select-none ${
                item.passed
                  ? "border-emerald-500/30 bg-emerald-500/5 dark:bg-emerald-950/10"
                  : "border-border bg-surface hover:border-border/80 hover:bg-surface-2/40"
              }`}
            >
              <div
                className={`mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-md border transition ${
                  item.passed
                    ? "border-emerald-600 bg-emerald-600 text-white shadow-xs"
                    : "border-muted-foreground/40 bg-surface"
                }`}
              >
                {item.passed && <CheckCircle2 className="size-4 stroke-[2.5]" />}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`text-xs font-bold ${
                      item.passed ? "text-foreground" : "text-muted-foreground"
                    }`}
                  >
                    {item.label}
                  </span>
                  {item.standardReference && (
                    <span className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[9px] font-semibold text-muted-foreground">
                      {item.standardReference}
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">
                  {item.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
