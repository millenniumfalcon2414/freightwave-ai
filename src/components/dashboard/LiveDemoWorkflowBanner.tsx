import { useState } from "react";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  Train,
  Truck,
  ShieldAlert,
  Zap,
  Activity,
  ChevronRight,
  Clock,
} from "lucide-react";
import { db } from "@/lib/db/database";
import { useDb } from "@/lib/db/useDb";

interface LiveDemoWorkflowBannerProps {
  onShipmentSelect?: (shipmentId: string) => void;
  onOpenCopilot?: () => void;
}

export function LiveDemoWorkflowBanner({
  onShipmentSelect,
  onOpenCopilot,
}: LiveDemoWorkflowBannerProps) {
  const [currentStep, setCurrentStep] = useState<number>(1);
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [stepMessage, setStepMessage] = useState<string | null>(null);

  const shipment = useDb((s) => s.shipments.find((item) => item.shipmentId === "FW-1042"));
  const criticalAlert = useDb((s) =>
    s.alerts.find((a) => a.shipmentId === "FW-1042" && a.status === "ACTIVE"),
  );

  const handleRunStep = (stepNumber: number) => {
    setIsExecuting(true);
    setCurrentStep(stepNumber);

    const result = db.runDemoStep(stepNumber, "Hackathon Demo Operator");
    setStepMessage(result.description);

    if (onShipmentSelect) {
      onShipmentSelect("FW-1042");
    }

    setTimeout(() => {
      setIsExecuting(false);
    }, 400);
  };

  const handleReset = () => {
    db.resetDatabase();
    setCurrentStep(1);
    setStepMessage("Demo state reset to initial baseline.");
  };

  return (
    <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-br from-surface via-surface-2 to-primary/10 p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-24 -right-24 size-64 rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border/70 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/15 border border-primary/30 px-3 py-1 text-xs font-bold text-primary tracking-wide uppercase">
              <Sparkles className="size-3.5" />
              Interactive Hackathon Demo Mode
            </span>
            <span className="rounded-md bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-500">
              Target: FW-1042
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold text-foreground tracking-tight">
            End-to-End Predictive Risk & AI Rerouting Lifecycle
          </h2>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Experience the complete closed-loop AI: Normal Transit → Route Deviation → Predictive
            Risk Spike → Explainable AI Alert → 1-Click Multimodal Reroute → Risk Recovery.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleReset}
            className="flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-surface-2 transition active:scale-95"
            title="Reset to clean initial database state"
          >
            <RotateCcw className="size-3.5" />
            Reset State
          </button>
        </div>
      </div>

      {/* Interactive Step Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-5">
        {/* Step 1 */}
        <div
          onClick={() => handleRunStep(1)}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            currentStep === 1
              ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/20"
              : "border-border/70 bg-surface hover:border-primary/40 hover:bg-surface-2"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Step 1
            </span>
            <span className="grid size-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold">
              1
            </span>
          </div>
          <div className="font-bold text-xs sm:text-sm text-foreground mb-1">Normal Transit</div>
          <div className="text-[11px] text-muted-foreground line-clamp-2">
            FW-1042 on schedule on NH-48. Speed: 65 km/h, Risk: 14% (LOW).
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-surface-2 py-1.5 text-[11px] font-bold text-foreground hover:bg-primary/20 transition">
            <Play className="size-3 text-emerald-500 fill-emerald-500" />
            Set Normal
          </button>
        </div>

        {/* Step 2 */}
        <div
          onClick={() => handleRunStep(2)}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            currentStep === 2
              ? "border-rose-500 bg-rose-500/10 shadow-md ring-2 ring-rose-500/20"
              : "border-border/70 bg-surface hover:border-rose-500/40 hover:bg-surface-2"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-500">
              Step 2
            </span>
            <span className="grid size-6 place-items-center rounded-full bg-rose-500/15 text-rose-600 text-xs font-bold">
              2
            </span>
          </div>
          <div className="font-bold text-xs sm:text-sm text-rose-500 mb-1">
            Trigger Deviation & Congestion
          </div>
          <div className="text-[11px] text-muted-foreground line-clamp-2">
            8.4 km route detour, speed drops to 24 km/h, ETA delayed +114m.
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-rose-500/15 py-1.5 text-[11px] font-bold text-rose-600 hover:bg-rose-500/25 transition">
            <AlertTriangle className="size-3 text-rose-500" />
            Simulate Disruption
          </button>
        </div>

        {/* Step 3 */}
        <div
          onClick={() => handleRunStep(3)}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            currentStep === 3
              ? "border-amber-500 bg-amber-500/10 shadow-md ring-2 ring-amber-500/20"
              : "border-border/70 bg-surface hover:border-amber-500/40 hover:bg-surface-2"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-500">
              Step 3
            </span>
            <span className="grid size-6 place-items-center rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold">
              3
            </span>
          </div>
          <div className="font-bold text-xs sm:text-sm text-amber-500 mb-1">
            Explainable AI Diagnosis
          </div>
          <div className="text-[11px] text-muted-foreground line-clamp-2">
            Risk surges to 87% (CRITICAL). AI generates 4-pillar root cause explanation.
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-amber-500/15 py-1.5 text-[11px] font-bold text-amber-600 hover:bg-amber-500/25 transition">
            <Sparkles className="size-3 text-amber-500" />
            Inspect AI Reason
          </button>
        </div>

        {/* Step 4 */}
        <div
          onClick={() => handleRunStep(4)}
          className={`cursor-pointer rounded-xl border p-4 transition-all ${
            currentStep === 4
              ? "border-emerald-500 bg-emerald-500/10 shadow-md ring-2 ring-emerald-500/20"
              : "border-border/70 bg-surface hover:border-emerald-500/40 hover:bg-surface-2"
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
              Step 4
            </span>
            <span className="grid size-6 place-items-center rounded-full bg-emerald-500/15 text-emerald-600 text-xs font-bold">
              4
            </span>
          </div>
          <div className="font-bold text-xs sm:text-sm text-emerald-600 mb-1">
            Execute AI Reroute
          </div>
          <div className="text-[11px] text-muted-foreground line-clamp-2">
            Transfer to Western DFC Rail Slot #402. Risk drops to 14%, saves 58% CO2.
          </div>
          <button className="mt-3 w-full flex items-center justify-center gap-1.5 rounded-lg bg-emerald-600 text-white py-1.5 text-[11px] font-bold hover:bg-emerald-700 transition shadow-sm">
            <Zap className="size-3" />
            Accept AI Reroute
          </button>
        </div>
      </div>

      {/* Live State Feedback Strip */}
      {shipment && (
        <div className="mt-5 rounded-xl border border-border/80 bg-surface p-4 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 sm:gap-6 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Consignment
              </span>
              <span className="font-bold text-foreground text-sm font-mono">
                {shipment.shipmentId}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Active Route
              </span>
              <span className="font-semibold text-foreground flex items-center gap-1">
                {shipment.mode === "rail" ? (
                  <Train className="size-3.5 text-primary" />
                ) : (
                  <Truck className="size-3.5 text-amber-500" />
                )}
                {shipment.activeRouteName}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Predictive Risk Score
              </span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-xs ${
                  shipment.riskScore >= 75
                    ? "bg-rose-500/15 text-rose-600 border border-rose-500/30 animate-pulse"
                    : shipment.riskScore >= 40
                      ? "bg-amber-500/15 text-amber-600 border border-amber-500/30"
                      : "bg-emerald-500/15 text-emerald-600 border border-emerald-500/30"
                }`}
              >
                {shipment.riskScore} / 100 ({shipment.riskLevel})
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Route Deviation
              </span>
              <span
                className={`font-bold ${
                  shipment.routeDeviationKm > 5 ? "text-rose-500" : "text-emerald-600"
                }`}
              >
                {shipment.routeDeviationKm.toFixed(1)} km
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-bold">
                Predicted Arrival
              </span>
              <span className="font-medium text-foreground flex items-center gap-1">
                <Clock className="size-3 text-muted-foreground" />
                {shipment.predictedEta}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {currentStep === 2 || shipment.riskScore >= 75 ? (
              <button
                onClick={() => handleRunStep(4)}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:scale-105 active:scale-95 animate-pulse"
              >
                <Zap className="size-4" />
                <span>1-Click Reroute to Western DFC</span>
              </button>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
                <CheckCircle2 className="size-4" />
                Optimized on Electrified DFC Corridor
              </span>
            )}
          </div>
        </div>
      )}

      {/* Realtime Notification Log */}
      {stepMessage && (
        <div className="mt-3 text-xs text-foreground/80 bg-surface-2/60 border border-border/60 rounded-lg px-3.5 py-2 flex items-center gap-2">
          <Activity className="size-3.5 text-primary shrink-0" />
          <span>{stepMessage}</span>
        </div>
      )}
    </div>
  );
}
