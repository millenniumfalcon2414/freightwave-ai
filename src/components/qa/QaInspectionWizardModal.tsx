import React, { useState } from "react";
import {
  InspectionRecord,
  EvidencePhoto,
  SensorCalibrationData,
  BpcMetrics,
  DefectItem,
  InspectorSignoff,
} from "@/types/qa";
import { qaStore } from "@/lib/qa/qaStore";
import { Step1ManifestValidation } from "./steps/Step1ManifestValidation";
import { Step2WagonSealSecurity } from "./steps/Step2WagonSealSecurity";
import { Step3SensorCalibration } from "./steps/Step3SensorCalibration";
import { Step4BrakeMechanicalFitness } from "./steps/Step4BrakeMechanicalFitness";
import { Step5DefectSignoff } from "./steps/Step5DefectSignoff";
import { Step6CertificateView } from "./steps/Step6CertificateView";
import {
  X,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Award,
  Lock,
  Radio,
  Gauge,
  PenTool,
  FileCheck2,
  AlertTriangle,
} from "lucide-react";

interface WizardModalProps {
  isOpen: boolean;
  onClose: () => void;
  inspection: InspectionRecord | null;
  onDispatchGreenCorridor?: (shipmentId: string) => void;
}

const STEPS = [
  { id: 0, title: "Manifest & Weight", icon: FileCheck2 },
  { id: 1, title: "Wagon & e-Seal", icon: Lock },
  { id: 2, title: "IoT Sensors", icon: Radio },
  { id: 3, title: "BPC & Mechanical", icon: Gauge },
  { id: 4, title: "Sign-Off & Defect", icon: PenTool },
  { id: 5, title: "Certificate", icon: Award },
];

export function QaInspectionWizardModal({
  isOpen,
  onClose,
  inspection: initialInspection,
  onDispatchGreenCorridor,
}: WizardModalProps) {
  const [currentInspection, setCurrentInspection] = useState<InspectionRecord | null>(
    initialInspection,
  );
  const [showGuidance, setShowGuidance] = useState<boolean>(false);

  React.useEffect(() => {
    if (initialInspection) {
      setCurrentInspection(initialInspection);
    }
  }, [initialInspection]);

  if (!isOpen || !currentInspection) return null;

  const currentStep = currentInspection.currentStepIndex;

  const handleStepChange = (newStep: number) => {
    qaStore.updateStepIndex(currentInspection.id, newStep);
    setCurrentInspection((prev) => ({ ...prev, currentStepIndex: newStep }));
  };

  const handleToggleCheck = (itemId: string, passed?: boolean) => {
    qaStore.toggleChecklistItem(currentInspection.id, itemId, passed);
    const updated = qaStore.getInspectionById(currentInspection.id);
    if (updated) setCurrentInspection(updated);
  };

  const handleAddPhoto = (photo: EvidencePhoto) => {
    qaStore.addEvidencePhoto(currentInspection.id, photo);
    const updated = qaStore.getInspectionById(currentInspection.id);
    if (updated) setCurrentInspection(updated);
  };

  const handleUpdateSensor = (updates: Partial<SensorCalibrationData>) => {
    qaStore.updateSensorData(currentInspection.id, updates);
    const updated = qaStore.getInspectionById(currentInspection.id);
    if (updated) setCurrentInspection(updated);
  };

  const handleUpdateBpc = (updates: Partial<BpcMetrics>) => {
    qaStore.updateBpcMetrics(currentInspection.id, updates);
    const updated = qaStore.getInspectionById(currentInspection.id);
    if (updated) setCurrentInspection(updated);
  };

  const handleAddDefect = (defect: Omit<DefectItem, "id" | "reportedTimestamp">) => {
    qaStore.addDefect(currentInspection.id, defect);
    const updated = qaStore.getInspectionById(currentInspection.id);
    if (updated) setCurrentInspection(updated);
  };

  const handleResolveDefect = (defectId: string, remedy: string) => {
    qaStore.resolveDefect(currentInspection.id, defectId, remedy);
    const updated = qaStore.getInspectionById(currentInspection.id);
    if (updated) setCurrentInspection(updated);
  };

  const handleSubmitSignoff = (signoff: InspectorSignoff) => {
    const completed = qaStore.signAndCompleteInspection(currentInspection.id, signoff);
    if (completed) {
      setCurrentInspection(completed);
    }
  };

  // Validation rules to check current step completion
  const getStepValidationState = (stepIndex: number) => {
    let items: ChecklistItem[] = [];
    if (stepIndex === 0) {
      items = currentInspection.checklist.filter(
        (c) => c.category === "MANIFEST" || c.id.startsWith("chk-manifest"),
      );
    } else if (stepIndex === 1) {
      items = currentInspection.checklist.filter(
        (c) => c.category === "STRUCTURAL" || c.category === "SEAL",
      );
    } else if (stepIndex === 2) {
      items = currentInspection.checklist.filter((c) => c.category === "ENVIRONMENTAL");
    } else if (stepIndex === 3) {
      items = currentInspection.checklist.filter(
        (c) => c.category === "BRAKE" || c.category === "SAFETY",
      );
    }

    const total = items.length;
    const passed = items.filter((c) => c.passed).length;
    const allRequiredPassed = items.every((c) => !c.required || c.passed);

    return { total, passed, allRequiredPassed, pendingCount: total - passed };
  };

  const currentStepValidation = getStepValidationState(currentStep);

  // Overall audit progress
  const totalAuditChecks = currentInspection.checklist.length;
  const passedAuditChecks = currentInspection.checklist.filter((c) => c.passed).length;
  const overallCompliancePercent = Math.round(
    (passedAuditChecks / Math.max(1, totalAuditChecks)) * 100,
  );

  // Auto-verify helper for quick testing & demo
  const handleAutoVerifyCurrentStep = () => {
    currentInspection.checklist.forEach((item) => {
      let shouldPass = false;
      if (
        currentStep === 0 &&
        (item.category === "MANIFEST" || item.id.startsWith("chk-manifest"))
      ) {
        shouldPass = true;
      } else if (
        currentStep === 1 &&
        (item.category === "STRUCTURAL" || item.category === "SEAL")
      ) {
        shouldPass = true;
      } else if (currentStep === 2 && item.category === "ENVIRONMENTAL") {
        shouldPass = true;
      } else if (currentStep === 3 && (item.category === "BRAKE" || item.category === "SAFETY")) {
        shouldPass = true;
      }

      if (shouldPass && !item.passed) {
        qaStore.toggleChecklistItem(currentInspection.id, item.id, true);
      }
    });

    if (currentStep === 2) {
      qaStore.updateSensorData(currentInspection.id, {
        tempProbeZeroed: true,
        humiditySensorZeroed: true,
        accelerometerCalibrated: true,
        navicGpsLock: true,
      });
    }

    if (currentStep === 3) {
      qaStore.updateBpcMetrics(currentInspection.id, {
        airContinuityTestPassed: true,
        handbrakeReleaseConfirmed: true,
        brakePowerPercentage: 98.4,
      });
    }

    const updated = qaStore.getInspectionById(currentInspection.id);
    if (updated) setCurrentInspection(updated);
  };

  const handleAutoFillEntireAudit = () => {
    currentInspection.checklist.forEach((item) => {
      qaStore.toggleChecklistItem(currentInspection.id, item.id, true);
    });

    qaStore.updateSensorData(currentInspection.id, {
      tempProbeZeroed: true,
      humiditySensorZeroed: true,
      accelerometerCalibrated: true,
      navicGpsLock: true,
    });

    qaStore.updateBpcMetrics(currentInspection.id, {
      airContinuityTestPassed: true,
      handbrakeReleaseConfirmed: true,
      brakePowerPercentage: 98.4,
    });

    const updated = qaStore.getInspectionById(currentInspection.id);
    if (updated) setCurrentInspection(updated);
  };

  const STEP_GUIDELINES = [
    {
      title: "Step 1: Manifest & Consignment Validation",
      standard: "FOIS Freight Operating Manual / GSTN e-Way Bill Standard",
      rules: [
        "Cross-verify e-RR consignment number with central FOIS database.",
        "Calibrate static electronic weighbridge axle load: variance must be < 2.0%.",
        "Inspect IMDG / Red Tariff hazard diamond placards for hazardous goods (Hazmat).",
      ],
    },
    {
      title: "Step 2: Structural Integrity & RFID e-Seal Audit",
      standard: "ISO 17712:2013 High Security Grade 'H' & RDSO Lashing Manual",
      rules: [
        "Scan tamper-evident RFID bolt seal and verify cryptographic hash against central ledger.",
        "Inspect container roof, floor, corner castings, and watertight door rubber gaskets.",
        "Ensure high-tensile lashing chains are torqued to minimum 28 kN tension.",
      ],
    },
    {
      title: "Step 3: IoT Sensor Array & Environmental Telemetry",
      standard: "NABL PT100 Temperature Standards & ASTM D4169 Rail Shock Profile",
      rules: [
        "Calibrate dual PT100 temperature probes within target window (+2°C to +8°C for pharma).",
        "Zero 3-axis accelerometer and calibrate rail buffer shock alert threshold (< 1.2G).",
        "Lock NavIC / GPS constellation with minimum 10 satellites and signal > -75 dBm.",
      ],
    },
    {
      title: "Step 4: Air Brake Power Certificate (BPC) & Mechanical Fitness",
      standard: "RDSO G-95 Air Brake Manual & Mechanical Directive 142",
      rules: [
        "Verify Engine air pipe pressure at 5.0 kg/cm² and Brake Van at 4.8 kg/cm² (drop < 0.2 kg/cm²).",
        "Check piston stroke within safe limits (100 - 130 mm) and brake power percentage ≥ 90.0%.",
        "Scan all journal bearings using infrared hot-box pyrometer (Limit: < 65°C).",
      ],
    },
    {
      title: "Step 5: Defect Logging, On-Site Rectification & Sign-Off",
      standard: "Indian Railways C&W Senior Section Engineer Certification Code",
      rules: [
        "Log all physical or mechanical defects with classification (Minor, Major, Critical).",
        "Critical defects MUST be rectified on site before Green Corridor clearance is granted.",
        "Enter inspector credentials, badge ID, witness notes, and draw digital signature.",
      ],
    },
    {
      title: "Step 6: Green Corridor QA Certificate Issuance",
      standard: "Digital India Freight Tokenization & RDSO e-BPC Standard",
      rules: [
        "Cryptographically sealed QA Certificate generated with verifiable QR code.",
        "Printable formal dossier available for yard masters, loco pilots, and freight forwarders.",
        "Direct 1-click dispatch to Western / Eastern DFC Green Corridor.",
      ],
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-background shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface-2/80 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
              <ShieldCheck className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-bold text-foreground">
                  Guided Freight QA & RDSO Inspection Workflow
                </h3>
                <span className="rounded-full bg-blue-500/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 border border-blue-500/20">
                  {currentInspection.id}
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 font-mono text-[10px] font-bold border ${
                    overallCompliancePercent >= 90
                      ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                      : "bg-amber-500/10 text-amber-600 border-amber-500/20"
                  }`}
                >
                  Score: {overallCompliancePercent}%
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Consignment: <strong>{currentInspection.consignmentNumber}</strong> · Wagon:{" "}
                <strong>{currentInspection.wagonNumber}</strong> ({currentInspection.corridor})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 5 && (
              <button
                type="button"
                onClick={handleAutoFillEntireAudit}
                className="hidden sm:flex items-center gap-1 rounded-lg border border-blue-500/30 bg-blue-500/10 px-2.5 py-1.5 text-[11px] font-bold text-blue-600 hover:bg-blue-500/20 transition"
                title="Auto-validate all checks to RDSO standard for quick demo"
              >
                <Sparkles className="size-3" />
                <span>Auto-Fill All</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="flex size-8 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-2 transition"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Step Progress Stepper Bar */}
        <div className="border-b border-border/80 bg-surface/80 px-4 py-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[550px] gap-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;
              const stepVal = getStepValidationState(step.id);

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    if (step.id <= currentStep || isCompleted) {
                      handleStepChange(step.id);
                    }
                  }}
                  className={`flex items-center gap-2 rounded-xl px-3 py-1.5 text-xs font-bold transition ${
                    isCurrent
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : isCompleted
                        ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20"
                        : "text-muted-foreground opacity-60 hover:opacity-100"
                  }`}
                >
                  <div className="flex items-center justify-center">
                    {isCompleted ? (
                      <CheckCircle2 className="size-4 text-emerald-600 stroke-[2.5]" />
                    ) : (
                      <Icon className="size-4" />
                    )}
                  </div>
                  <div className="flex flex-col text-left">
                    <span>{step.title}</span>
                    {step.id < 4 && (
                      <span
                        className={`text-[9px] font-normal ${
                          isCurrent
                            ? "text-primary-foreground/80"
                            : isCompleted
                              ? "text-emerald-600"
                              : "text-muted-foreground"
                        }`}
                      >
                        {stepVal.passed}/{stepVal.total} Checks
                      </span>
                    )}
                  </div>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="size-3.5 text-muted-foreground/50 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Regulatory Guidance Accordion Bar */}
        <div className="border-b border-border bg-surface-2/40 px-5 py-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-foreground">Standard:</span>
            <span className="text-muted-foreground font-mono text-[11px]">
              {STEP_GUIDELINES[currentStep]?.standard}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setShowGuidance(!showGuidance)}
            className="flex items-center gap-1 font-bold text-primary hover:underline text-[11px]"
          >
            <span>{showGuidance ? "Hide Compliance Notes" : "View Compliance Guidance"}</span>
          </button>
        </div>

        {showGuidance && (
          <div className="border-b border-blue-500/20 bg-blue-500/5 px-5 py-3 text-xs space-y-1.5 animate-in fade-in duration-150">
            <div className="font-bold text-foreground flex items-center gap-1.5">
              <FileCheck2 className="size-3.5 text-blue-600" />
              <span>{STEP_GUIDELINES[currentStep]?.title} — Mandatory Requirements:</span>
            </div>
            <ul className="list-disc list-inside text-muted-foreground space-y-0.5 pl-1 text-[11px]">
              {STEP_GUIDELINES[currentStep]?.rules.map((rule, rIdx) => (
                <li key={rIdx}>{rule}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {currentStep === 0 && (
            <Step1ManifestValidation
              inspection={currentInspection}
              onToggleCheck={handleToggleCheck}
              onUpdateField={(updates) => setCurrentInspection((prev) => ({ ...prev, ...updates }))}
            />
          )}

          {currentStep === 1 && (
            <Step2WagonSealSecurity
              inspection={currentInspection}
              onToggleCheck={handleToggleCheck}
              onAddPhoto={handleAddPhoto}
              onUpdateField={(updates) => setCurrentInspection((prev) => ({ ...prev, ...updates }))}
            />
          )}

          {currentStep === 2 && (
            <Step3SensorCalibration
              inspection={currentInspection}
              onToggleCheck={handleToggleCheck}
              onUpdateSensor={handleUpdateSensor}
            />
          )}

          {currentStep === 3 && (
            <Step4BrakeMechanicalFitness
              inspection={currentInspection}
              onToggleCheck={handleToggleCheck}
              onUpdateBpc={handleUpdateBpc}
            />
          )}

          {currentStep === 4 && (
            <Step5DefectSignoff
              inspection={currentInspection}
              onAddDefect={handleAddDefect}
              onResolveDefect={handleResolveDefect}
              onSubmitSignoff={handleSubmitSignoff}
            />
          )}

          {currentStep === 5 && (
            <Step6CertificateView
              inspection={currentInspection}
              onClose={onClose}
              onDispatchGreenCorridor={() => {
                if (onDispatchGreenCorridor) {
                  onDispatchGreenCorridor(currentInspection.shipmentId);
                }
              }}
            />
          )}
        </div>

        {/* Modal Sticky Bottom Navigation Controls (Steps 0 - 4) */}
        {currentStep < 5 && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-border bg-surface-2/90 px-5 py-3.5 backdrop-blur-md">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
                disabled={currentStep === 0}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="size-4" />
                <span>Previous Step</span>
              </button>

              {currentStep < 4 && (
                <button
                  type="button"
                  onClick={handleAutoVerifyCurrentStep}
                  className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface transition"
                >
                  <Sparkles className="size-3.5 text-blue-600" />
                  <span>Verify Step {currentStep + 1} Checks</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <div className="text-xs text-muted-foreground font-medium hidden md:block">
                Step {currentStep + 1} of {STEPS.length}:{" "}
                <strong>{STEPS[currentStep].title}</strong>
              </div>

              {currentStep < 4 ? (
                <button
                  type="button"
                  onClick={() => handleStepChange(currentStep + 1)}
                  className="flex items-center gap-1.5 rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-xs hover:bg-primary/90 transition active:scale-98"
                >
                  <span>Continue to Step {currentStep + 2}</span>
                  <ChevronRight className="size-4" />
                </button>
              ) : (
                <div className="text-xs text-muted-foreground italic">
                  Sign signature pad to complete and generate certificate
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
