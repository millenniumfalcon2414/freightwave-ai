import React from "react";
import { InspectionRecord, BpcMetrics } from "@/types/qa";
import { Gauge, Train, CheckCircle2, ShieldCheck, Flame, Zap, Sliders } from "lucide-react";

interface StepProps {
  inspection: InspectionRecord;
  onToggleCheck: (itemId: string, passed?: boolean) => void;
  onUpdateBpc: (updates: Partial<BpcMetrics>) => void;
}

export function Step4BrakeMechanicalFitness({ inspection, onToggleCheck, onUpdateBpc }: StepProps) {
  const bpc = inspection.bpcMetrics;
  const bpcChecks = inspection.checklist.filter(
    (c) =>
      c.category === "BRAKE" ||
      c.category === "SAFETY" ||
      c.id.includes("bpc") ||
      c.id.includes("axle") ||
      c.id.includes("brake"),
  );

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-xs">
            <Gauge className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Step 4: RDSO Railway Brake Power Certificate (BPC) & Mechanical Fitness
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Verify dual-pipe pneumatic air brake pressure, train continuity test, wheelset flange
              tolerances, and infrared axle-box pyrometer readings per RDSO G-95 freight code.
            </p>
          </div>
        </div>
      </div>

      {/* Brake Power Percentage Calculator Hero Card */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/60 pb-3">
          <div className="flex items-center gap-2">
            <Train className="size-4.5 text-emerald-600" />
            <div>
              <h5 className="text-xs font-bold text-foreground">
                Rake Brake Power Efficiency: {bpc.brakePowerPercentage}%
              </h5>
              <div className="text-[11px] text-muted-foreground">
                Locomotive: <strong>{bpc.locomotiveNumber}</strong> ({bpc.locoClass}) · Rake Length:{" "}
                <strong>{bpc.rakeLengthWagons} Wagons</strong>
              </div>
            </div>
          </div>
          <span className="self-start sm:self-auto rounded-md bg-emerald-500/10 px-2.5 py-1 font-mono text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
            RDSO REQUIREMENT: ≥ 90.0% (PASSED)
          </span>
        </div>

        {/* Pneumatic Gauges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3 text-center space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">
              Engine Air Pipe
            </div>
            <div className="font-mono text-base font-black text-foreground">
              {bpc.brakePipePressureEngineKg} <span className="text-xs font-normal">kg/cm²</span>
            </div>
            <div className="text-[9px] text-emerald-600 font-semibold">Normal (5.0 ± 0.1)</div>
          </div>

          <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3 text-center space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">
              Brake Van Pipe
            </div>
            <div className="font-mono text-base font-black text-foreground">
              {bpc.brakePipePressureBrakeVanKg} <span className="text-xs font-normal">kg/cm²</span>
            </div>
            <div className="text-[9px] text-emerald-600 font-semibold">Drop &lt; 0.2 kg/cm²</div>
          </div>

          <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3 text-center space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase">
              Piston Stroke
            </div>
            <div className="font-mono text-base font-black text-foreground">
              {bpc.pistonStrokeMm} <span className="text-xs font-normal">mm</span>
            </div>
            <div className="text-[9px] text-emerald-600 font-semibold">Range: 100-130mm</div>
          </div>

          <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3 text-center space-y-1">
            <div className="text-[10px] font-bold text-muted-foreground uppercase flex items-center justify-center gap-1">
              <Flame className="size-3 text-amber-500" />
              Hot-Box Pyrometer
            </div>
            <div className="font-mono text-base font-black text-foreground">
              {bpc.hotAxleBoxTempC}°C
            </div>
            <div className="text-[9px] text-emerald-600 font-semibold">Limit: &lt; 65.0°C</div>
          </div>
        </div>

        {/* Interactive Tune Slider */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1 border-t border-border/60">
          <div className="text-xs text-muted-foreground">
            Brake Power Fine-Tuning: <strong>{bpc.brakePowerPercentage}%</strong>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-64">
            <input
              type="range"
              min="85"
              max="100"
              step="0.2"
              value={bpc.brakePowerPercentage}
              onChange={(e) => onUpdateBpc({ brakePowerPercentage: parseFloat(e.target.value) })}
              className="w-full accent-emerald-600"
            />
          </div>
        </div>
      </div>

      {/* Mechanical Safety & Brake Checkpoints */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" />
            Mandatory RDSO Mechanical Gates
          </h5>
          <span className="text-[11px] text-muted-foreground">
            {bpcChecks.filter((c) => c.passed).length} of {bpcChecks.length} Passed
          </span>
        </div>

        <div className="space-y-2.5">
          {bpcChecks.map((item) => (
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
