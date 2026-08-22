import React from "react";
import { InspectionRecord } from "@/types/qa";
import {
  FileCheck2,
  AlertTriangle,
  Scale,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  Hash,
  Train,
  Building,
} from "lucide-react";

interface StepProps {
  inspection: InspectionRecord;
  onToggleCheck: (itemId: string, passed?: boolean) => void;
  onUpdateField: (updates: Partial<InspectionRecord>) => void;
}

export function Step1ManifestValidation({ inspection, onToggleCheck, onUpdateField }: StepProps) {
  const manifestChecks = inspection.checklist.filter(
    (c) => c.category === "MANIFEST" || c.id.startsWith("chk-manifest"),
  );

  return (
    <div className="space-y-6">
      {/* Step Header Banner */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <FileCheck2 className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Step 1: Manifest & Consignment Integrity Audit
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Verify freight manifest against FOIS (Freight Operations Information System), e-Way
              bills, gross tare weight bridge calibration, and hazardous cargo classification.
            </p>
          </div>
        </div>
      </div>

      {/* Consignment Quick Metadata Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Hash className="size-3 text-primary" />
            Consignment (e-RR)
          </span>
          <div className="font-mono text-xs font-bold text-foreground">
            {inspection.consignmentNumber}
          </div>
          <div className="text-[10px] text-muted-foreground">
            ID: <strong className="text-foreground">{inspection.shipmentId}</strong>
          </div>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Train className="size-3 text-primary" />
            Carrier & Wagon Siding
          </span>
          <div className="font-mono text-xs font-bold text-foreground">
            {inspection.wagonNumber}
          </div>
          <div className="text-[10px] text-muted-foreground">{inspection.trainName}</div>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
            <Building className="size-3 text-primary" />
            Freight Corridor
          </span>
          <div className="text-xs font-bold text-foreground truncate">{inspection.corridor}</div>
          <div className="text-[10px] text-muted-foreground truncate">
            {inspection.consignorName}
          </div>
        </div>
      </div>

      {/* Weight Bridge & Axle Load Balancing Calibration Box */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="size-4.5 text-blue-600" />
            <h5 className="text-xs font-bold text-foreground">
              Electronic Weighbridge & Axle Load Distribution Check
            </h5>
          </div>
          <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold font-mono text-emerald-600 border border-emerald-500/20">
            Variance: +0.4% (Nominal Safe)
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="rounded-lg bg-surface-2/70 p-2.5">
            <div className="text-[10px] text-muted-foreground font-medium">Manifest Declared</div>
            <div className="font-mono text-xs font-black text-foreground mt-0.5">42.50 MT</div>
          </div>
          <div className="rounded-lg bg-surface-2/70 p-2.5">
            <div className="text-[10px] text-muted-foreground font-medium">Actual Gross Bridge</div>
            <div className="font-mono text-xs font-black text-blue-600 mt-0.5">42.67 MT</div>
          </div>
          <div className="rounded-lg bg-surface-2/70 p-2.5">
            <div className="text-[10px] text-muted-foreground font-medium">Axle 1-2 Balance</div>
            <div className="font-mono text-xs font-black text-emerald-600 mt-0.5">
              50.2% / 49.8%
            </div>
          </div>
          <div className="rounded-lg bg-surface-2/70 p-2.5">
            <div className="text-[10px] text-muted-foreground font-medium">Axle Load Limit</div>
            <div className="font-mono text-xs font-black text-foreground mt-0.5">25.0 MT/Axle</div>
          </div>
        </div>
      </div>

      {/* Mandatory Verification Gates Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" />
            Mandatory Manifest Checkpoints
          </h5>
          <span className="text-[11px] text-muted-foreground">
            {manifestChecks.filter((c) => c.passed).length} of {manifestChecks.length} Passed
          </span>
        </div>

        <div className="space-y-2.5">
          {manifestChecks.map((item) => (
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

      {/* Hazardous / Hazmat Class Box */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-2">
        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-xs">
          <AlertTriangle className="size-4 shrink-0" />
          <span>Hazmat & Dangerous Goods Compliance (IRCA Red Tariff)</span>
        </div>
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Standard non-flammable dry machinery cargo. If handling chemicals, fuels or explosives,
          attach Material Safety Data Sheet (MSDS) and verify Emergency Response Guide (ERG) route.
        </p>
      </div>
    </div>
  );
}
