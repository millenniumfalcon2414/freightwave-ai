import React, { useState } from "react";
import { useQaStore, qaStore } from "@/lib/qa/qaStore";
import { InspectionRecord } from "@/types/qa";
import { QaInspectionWizardModal } from "./QaInspectionWizardModal";
import {
  ShieldCheck,
  Award,
  CheckCircle2,
  AlertTriangle,
  Plus,
  Search,
  Filter,
  FileCheck2,
  Train,
  Lock,
  Gauge,
  Printer,
  ChevronRight,
  Sparkles,
  QrCode,
  Layers,
  ArrowUpRight,
  Clock,
  RotateCcw,
} from "lucide-react";

interface QaWorkflowHubProps {
  onDispatchGreenCorridor?: (shipmentId: string) => void;
}

export function QaWorkflowHub({ onDispatchGreenCorridor }: QaWorkflowHubProps) {
  const inspections = useQaStore();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [activeModalInspection, setActiveModalInspection] = useState<InspectionRecord | null>(null);
  const [isWizardOpen, setIsWizardOpen] = useState<boolean>(false);

  // Quick Start Sample Consignments
  const quickStartTargets = [
    {
      id: "RAIL-IND-28491",
      consignmentNumber: "RR-CR-2026-994182",
      cargo: "Industrial Equipment & CNC Machinery",
      wagon: "WAG-9-41029 (BLCA-49)",
      corridor: "BLR-DEL (Bengaluru → Tughlakabad ICD)",
      station: "Bengaluru Whitefield Goods Terminal",
    },
    {
      id: "RAIL-IND-39104",
      consignmentNumber: "RR-WR-2026-773199",
      cargo: "Automotive Precision Sub-Assemblies",
      wagon: "BTPN-TANKER-884",
      corridor: "MUM-DEL (JNPT Port → Dadri ICD)",
      station: "JNPT Freight Yard, Nhava Sheva",
    },
    {
      id: "RAIL-IND-50128",
      consignmentNumber: "RR-NR-2026-551029",
      cargo: "Heavy Rolled Steel Coils & Slabs",
      wagon: "BOXNHL-RAKE-108",
      corridor: "KOL-DEL (Dankuni EDFC → Dadri)",
      station: "Dankuni EDFC Freight Siding",
    },
  ];

  const handleLaunchNewInspection = (target: (typeof quickStartTargets)[0]) => {
    const newRecord = qaStore.createNewInspection({
      shipmentId: target.id,
      consignmentNumber: target.consignmentNumber,
      wagonNumber: target.wagon,
      corridor: target.corridor,
      cargoDescription: target.cargo,
      locationName: target.station,
    });
    setActiveModalInspection(newRecord);
    setIsWizardOpen(true);
  };

  const handleOpenExisting = (rec: InspectionRecord) => {
    setActiveModalInspection(rec);
    setIsWizardOpen(true);
  };

  // Filtered list
  const filteredInspections = inspections.filter((rec) => {
    const matchesSearch =
      rec.consignmentNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.shipmentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.wagonNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.cargoDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      rec.locationName.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;
    if (filterStatus === "passed") return rec.status === "PASSED";
    if (filterStatus === "in_progress") return rec.status === "IN_PROGRESS";
    if (filterStatus === "flagged") return rec.defects.length > 0 || rec.status === "REJECTED";
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Primary Call-to-Action */}
      <div className="rounded-2xl border border-border bg-gradient-to-r from-blue-900/10 via-surface to-surface p-5 sm:p-6 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-blue-600 border border-blue-500/20">
                <ShieldCheck className="size-3.5" />
                RDSO G-95 & ISO 1496-1 Standard
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 font-mono text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                100% Audit Traceability
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-foreground tracking-tight">
              Quality Assurance & Multi-Step Rail Inspection Portal
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
              Transform informal yard checks into rigorous, certified 5-step digital audits:
              manifest verification, electronic RFID tamper seal scanning, IoT sensor calibration,
              pneumatic Brake Power Certification (BPC), and cryptographic digital sign-off.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => handleLaunchNewInspection(quickStartTargets[0])}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-98"
            >
              <Plus className="size-4 stroke-[2.5]" />
              <span>Start Guided QA Inspection</span>
            </button>
          </div>
        </div>
      </div>

      {/* QA KPI Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-border/80 bg-surface p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Award className="size-3.5 text-emerald-600" />
            QA Pass Rate (2026)
          </span>
          <div className="font-mono text-xl sm:text-2xl font-black text-foreground">99.4%</div>
          <div className="text-[11px] text-emerald-600 font-semibold">184 of 185 Rakes Cleared</div>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Gauge className="size-3.5 text-blue-600" />
            Avg Brake Power (BPC)
          </span>
          <div className="font-mono text-xl sm:text-2xl font-black text-foreground">98.2%</div>
          <div className="text-[11px] text-muted-foreground">RDSO Min: ≥ 90.0%</div>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Lock className="size-3.5 text-indigo-600" />
            RFID e-Seal Integrity
          </span>
          <div className="font-mono text-xl sm:text-2xl font-black text-emerald-600">100%</div>
          <div className="text-[11px] text-muted-foreground">Zero Tamper Breaches</div>
        </div>

        <div className="rounded-xl border border-border/80 bg-surface p-4 space-y-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Clock className="size-3.5 text-amber-600" />
            Avg Defect Turnaround
          </span>
          <div className="font-mono text-xl sm:text-2xl font-black text-foreground">11.8 min</div>
          <div className="text-[11px] text-emerald-600 font-semibold">100% Rectified On-Site</div>
        </div>
      </div>

      {/* Quick Launch on Pending Shipments */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Train className="size-4 text-primary" />
            Launch Inspection on Live Consignments
          </h4>
          <span className="text-[11px] text-muted-foreground">Select rake to audit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {quickStartTargets.map((target) => (
            <div
              key={target.id}
              className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5 space-y-2.5 flex flex-col justify-between hover:border-primary/40 transition"
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-foreground">{target.id}</span>
                  <span className="rounded bg-blue-500/10 px-1.5 py-0.5 font-mono text-[9px] font-bold text-blue-600">
                    {target.consignmentNumber}
                  </span>
                </div>
                <div className="text-xs font-bold text-foreground">{target.cargo}</div>
                <div className="text-[11px] text-muted-foreground truncate">{target.station}</div>
              </div>

              <button
                type="button"
                onClick={() => handleLaunchNewInspection(target)}
                className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-primary/40 bg-primary/10 py-2 text-xs font-bold text-primary hover:bg-primary hover:text-primary-foreground transition active:scale-98"
              >
                <Plus className="size-3.5" />
                <span>Launch 5-Step QA Wizard</span>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search audits by Consignment (e-RR), Wagon, Corridor, or Location..."
            className="w-full rounded-xl border border-border bg-surface py-2.5 pl-10 pr-4 text-xs sm:text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs">
          {[
            { id: "all", label: "All Audits" },
            { id: "passed", label: "✅ Passed & Certified" },
            { id: "in_progress", label: "⏳ In Progress" },
            { id: "flagged", label: "⚠️ Flagged" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id)}
              className={`rounded-lg px-3 py-2 font-medium transition ${
                filterStatus === tab.id
                  ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                  : "bg-surface border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* QA Inspection Records Dossier Table */}
      <div className="rounded-xl border border-border bg-surface overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-border bg-surface-2/80 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Audit Dossier & e-RR</th>
                <th className="px-4 py-3">Wagon & Siding</th>
                <th className="px-4 py-3">BPC & Sensors</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Inspector Sign-off</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filteredInspections.map((rec) => (
                <tr key={rec.id} className="hover:bg-surface-2/40 transition">
                  <td className="px-4 py-3.5 space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-foreground">{rec.id}</span>
                      <span className="rounded bg-surface-2 px-1.5 py-0.2 font-mono text-[9px] font-semibold text-muted-foreground">
                        {rec.consignmentNumber}
                      </span>
                    </div>
                    <div className="text-[11px] text-muted-foreground font-medium truncate max-w-[220px]">
                      {rec.cargoDescription}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 space-y-0.5">
                    <div className="font-mono font-bold text-foreground">{rec.wagonNumber}</div>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[180px]">
                      {rec.locationName}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-600">
                        BPC: {rec.bpcMetrics.brakePowerPercentage}%
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        ({rec.sensorData.currentTempReadingC}°C)
                      </span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      RFID e-Seal: <strong className="text-foreground">Intact</strong>
                    </div>
                  </td>

                  <td className="px-4 py-3.5">
                    {rec.status === "PASSED" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-[10px] font-bold font-mono text-emerald-600 border border-emerald-500/20">
                        <CheckCircle2 className="size-3" />
                        QA CERTIFIED (100%)
                      </span>
                    ) : rec.status === "IN_PROGRESS" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-1 text-[10px] font-bold font-mono text-blue-600 border border-blue-500/20">
                        <Clock className="size-3" />
                        STEP {rec.currentStepIndex + 1}/6 ACTIVE
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 px-2.5 py-1 text-[10px] font-bold font-mono text-amber-600 border border-amber-500/20">
                        <AlertTriangle className="size-3" />
                        CONDITIONAL
                      </span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 space-y-0.5">
                    <div className="font-bold text-foreground">
                      {rec.inspectorSignoff?.inspectorName || "Pending Sign-off"}
                    </div>
                    <div className="text-[10px] text-muted-foreground font-mono">
                      {rec.inspectorSignoff?.badgeNumber || rec.zonalStationCode}
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right space-x-2">
                    <button
                      type="button"
                      onClick={() => handleOpenExisting(rec)}
                      className="inline-flex items-center gap-1 rounded-xl bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground hover:bg-primary/90 transition shadow-xs"
                    >
                      <span>{rec.status === "PASSED" ? "View Certificate" : "Resume Wizard"}</span>
                      <ChevronRight className="size-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guided Inspection Wizard Modal */}
      <QaInspectionWizardModal
        isOpen={isWizardOpen}
        onClose={() => setIsWizardOpen(false)}
        inspection={activeModalInspection}
        onDispatchGreenCorridor={onDispatchGreenCorridor}
      />
    </div>
  );
}
