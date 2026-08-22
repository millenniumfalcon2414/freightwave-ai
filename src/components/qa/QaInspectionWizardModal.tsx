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

  // Validation rules to enable "Next Step"
  const canProceed = () => {
    if (currentStep === 0) {
      // Manifest checks
      return currentInspection.checklist
        .filter((c) => c.category === "MANIFEST" || c.id.startsWith("chk-manifest"))
        .every((c) => !c.required || c.passed);
    }
    if (currentStep === 1) {
      // Seal & structural checks
      return currentInspection.checklist
        .filter((c) => c.category === "STRUCTURAL" || c.category === "SEAL")
        .every((c) => !c.required || c.passed);
    }
    if (currentStep === 2) {
      // Sensor checks
      return currentInspection.checklist
        .filter((c) => c.category === "ENVIRONMENTAL")
        .every((c) => !c.required || c.passed);
    }
    if (currentStep === 3) {
      // BPC checks
      return currentInspection.checklist
        .filter((c) => c.category === "BRAKE" || c.category === "SAFETY")
        .every((c) => !c.required || c.passed);
    }
    return true;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl rounded-2xl border border-border bg-background shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Top Header Bar */}
        <div className="flex items-center justify-between border-b border-border bg-surface-2/80 px-5 py-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-xs">
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
              </div>
              <p className="text-xs text-muted-foreground">
                Consignment: <strong>{currentInspection.consignmentNumber}</strong> · Wagon:{" "}
                <strong>{currentInspection.wagonNumber}</strong> ({currentInspection.corridor})
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="flex size-8 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground hover:text-foreground hover:bg-surface-2 transition"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Step Progress Stepper Bar */}
        <div className="border-b border-border/80 bg-surface/80 px-4 py-2.5 overflow-x-auto no-scrollbar">
          <div className="flex items-center justify-between min-w-[550px] gap-2">
            {STEPS.map((step, idx) => {
              const Icon = step.icon;
              const isCompleted = currentStep > step.id;
              const isCurrent = currentStep === step.id;

              return (
                <button
                  key={step.id}
                  onClick={() => {
                    // Allow navigating to any previously visited step or current
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
                  <span>{step.title}</span>
                  {idx < STEPS.length - 1 && (
                    <ChevronRight className="size-3.5 text-muted-foreground/50 ml-1" />
                  )}
                </button>
              );
            })}
          </div>
        </div>

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
          <div className="flex items-center justify-between border-t border-border bg-surface-2/90 px-5 py-3.5 backdrop-blur-md">
            <button
              type="button"
              onClick={() => handleStepChange(Math.max(0, currentStep - 1))}
              disabled={currentStep === 0}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 text-xs font-bold text-foreground hover:bg-surface-2 transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="size-4" />
              <span>Previous Step</span>
            </button>

            <div className="text-xs text-muted-foreground font-medium hidden sm:block">
              Step {currentStep + 1} of {STEPS.length}: <strong>{STEPS[currentStep].title}</strong>
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
                Complete digital signature above to generate certificate
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
