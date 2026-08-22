import React, { useState, useRef, useEffect } from "react";
import { InspectionRecord, DefectItem, InspectorSignoff } from "@/types/qa";
import {
  PenTool,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Plus,
  Trash2,
  Wrench,
  UserCheck,
  Building,
  RotateCcw,
  Sparkles,
} from "lucide-react";

interface StepProps {
  inspection: InspectionRecord;
  onAddDefect: (defect: Omit<DefectItem, "id" | "reportedTimestamp">) => void;
  onResolveDefect: (defectId: string, remedy: string) => void;
  onSubmitSignoff: (signoff: InspectorSignoff) => void;
}

export function Step5DefectSignoff({
  inspection,
  onAddDefect,
  onResolveDefect,
  onSubmitSignoff,
}: StepProps) {
  // Defect modal / form state
  const [showAddDefect, setShowAddDefect] = useState<boolean>(false);
  const [newDefectTitle, setNewDefectTitle] = useState<string>("");
  const [newDefectCategory, setNewDefectCategory] = useState<DefectItem["category"]>("STRUCTURAL");
  const [newDefectSeverity, setNewDefectSeverity] = useState<DefectItem["severity"]>("MINOR");
  const [newDefectRemarks, setNewDefectRemarks] = useState<string>("");

  // Inspector credentials state
  const [inspectorName, setInspectorName] = useState<string>(
    inspection.inspectorSignoff?.inspectorName || "Virender Kumar Sharma",
  );
  const [inspectorId, setInspectorId] = useState<string>(
    inspection.inspectorSignoff?.inspectorId || "IR-QA-77291",
  );
  const [badgeNumber, setBadgeNumber] = useState<string>(
    inspection.inspectorSignoff?.badgeNumber || "SWR-SENIOR-SE-44",
  );
  const [designation, setDesignation] = useState<string>(
    inspection.inspectorSignoff?.designation ||
      "Senior Section Engineer (C&W) / Chief Freight Inspector",
  );
  const [zonalRailway, setZonalRailway] = useState<string>(
    inspection.inspectorSignoff?.zonalRailway || "South Western Railway (SWR)",
  );
  const [yardStationCode, setYardStationCode] = useState<string>(
    inspection.inspectorSignoff?.yardStationCode || "WFD Goods Yard",
  );
  const [witnessName, setWitnessName] = useState<string>(
    inspection.inspectorSignoff?.witnessName || "Rajeev Nambiar (Loco Pilot 1st Class)",
  );
  const [witnessRole, setWitnessRole] = useState<string>(
    inspection.inspectorSignoff?.witnessRole || "Loco Operations",
  );
  const [remarks, setRemarks] = useState<string>(
    inspection.inspectorSignoff?.remarks ||
      "All physical, electronic, sensor, and pneumatic tests completed in accordance with RDSO G-95 norms. Certified fit for high-speed freight run.",
  );

  // Digital Signature Canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState<boolean>(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#1e40af"; // dark blue ink
  }, []);

  const handleStartDrawing = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
  };

  const handleDraw = (
    e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>,
  ) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;
    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const handleStopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const handlePresetSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.font = "italic 24px 'Brush Script MT', cursive, sans-serif";
    ctx.fillStyle = "#1e40af";
    ctx.fillText("V. K. Sharma (IR-QA)", 40, 50);
    ctx.beginPath();
    ctx.moveTo(35, 60);
    ctx.bezierCurveTo(120, 70, 180, 45, 260, 65);
    ctx.strokeStyle = "#1e40af";
    ctx.stroke();
    setHasDrawnSignature(true);
  };

  const handleCreateDefect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDefectTitle.trim()) return;

    onAddDefect({
      title: newDefectTitle.trim(),
      category: newDefectCategory,
      severity: newDefectSeverity,
      rectificationStatus: "OPEN",
      inspectorRemarks: newDefectRemarks.trim() || "Observed during pre-dispatch audit.",
    });

    setNewDefectTitle("");
    setNewDefectRemarks("");
    setShowAddDefect(false);
  };

  const handleSubmit = () => {
    let signatureUrl = "";
    if (canvasRef.current && hasDrawnSignature) {
      signatureUrl = canvasRef.current.toDataURL("image/png");
    }

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, ${now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;

    onSubmitSignoff({
      inspectorName,
      inspectorId,
      badgeNumber,
      designation,
      zonalRailway,
      yardStationCode,
      signatureDataUrl: signatureUrl,
      signedTimestamp: formattedDate,
      witnessName,
      witnessRole,
      remarks,
    });
  };

  return (
    <div className="space-y-6">
      {/* Step Header Banner */}
      <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
            <PenTool className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Step 5: Defect Log, Corrective Rectification & Inspector Sign-Off
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Log any observed anomalies, record on-site corrective actions, provide inspector
              credentials, and complete digital sign-off to issue the official QA Clearance
              Certificate.
            </p>
          </div>
        </div>
      </div>

      {/* Defect Management Section */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="size-4.5 text-amber-500" />
            <div>
              <h5 className="text-xs font-bold text-foreground">
                Defect Log & Rectification Tracker
              </h5>
              <div className="text-[11px] text-muted-foreground">
                {inspection.defects.length} Defect(s) Recorded (
                {inspection.defects.filter((d) => d.rectificationStatus === "OPEN").length} Open)
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setShowAddDefect(!showAddDefect)}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface-2/80 transition"
          >
            <Plus className="size-3.5" />
            <span>Log New Anomaly</span>
          </button>
        </div>

        {/* Add defect inline form */}
        {showAddDefect && (
          <form
            onSubmit={handleCreateDefect}
            className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3.5 space-y-3"
          >
            <div className="text-xs font-bold text-foreground">Record Anomaly / Defect</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <input
                  type="text"
                  value={newDefectTitle}
                  onChange={(e) => setNewDefectTitle(e.target.value)}
                  placeholder="e.g. Loose container corner twist-lock or surface rust"
                  required
                  className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:border-amber-500 focus:outline-none"
                />
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={newDefectSeverity}
                  onChange={(e) => setNewDefectSeverity(e.target.value as DefectItem["severity"])}
                  className="w-full rounded-xl border border-border bg-surface px-3 py-1.5 text-xs text-foreground focus:outline-none"
                >
                  <option value="MINOR">Minor Observation</option>
                  <option value="MAJOR">Major Concern</option>
                  <option value="CRITICAL">Critical Blocker</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowAddDefect(false)}
                className="rounded-xl border border-border px-3 py-1 text-xs text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-amber-600 px-3.5 py-1 text-xs font-bold text-white hover:bg-amber-700 transition shadow-xs"
              >
                Save Defect
              </button>
            </div>
          </form>
        )}

        {/* Existing Defects List */}
        {inspection.defects.length === 0 ? (
          <div className="rounded-xl border border-dashed border-emerald-500/30 bg-emerald-500/5 p-4 text-center">
            <CheckCircle2 className="size-6 text-emerald-600 mx-auto" />
            <div className="text-xs font-bold text-foreground mt-1">Zero Defects Logged</div>
            <div className="text-[11px] text-muted-foreground">
              All physical, structural, and mechanical checks passed cleanly.
            </div>
          </div>
        ) : (
          <div className="space-y-2.5">
            {inspection.defects.map((defect) => (
              <div
                key={defect.id}
                className={`rounded-xl border p-3.5 space-y-2 ${
                  defect.rectificationStatus === "RECTIFIED_ON_SITE"
                    ? "border-emerald-500/30 bg-emerald-500/5"
                    : "border-amber-500/30 bg-amber-500/5"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded px-1.5 py-0.5 text-[9px] font-bold ${
                        defect.severity === "CRITICAL"
                          ? "bg-red-600 text-white"
                          : defect.severity === "MAJOR"
                            ? "bg-amber-600 text-white"
                            : "bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {defect.severity}
                    </span>
                    <span className="text-xs font-bold text-foreground">{defect.title}</span>
                  </div>

                  {defect.rectificationStatus === "RECTIFIED_ON_SITE" ? (
                    <span className="flex items-center gap-1 rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600">
                      <CheckCircle2 className="size-3" />
                      Rectified On-Site
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() =>
                        onResolveDefect(
                          defect.id,
                          "Twist-lock re-torqued and tightened to 45 Nm per RDSO specs.",
                        )
                      }
                      className="flex items-center gap-1 rounded-lg bg-emerald-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-emerald-700 transition"
                    >
                      <Wrench className="size-3" />
                      <span>Apply On-Site Fix</span>
                    </button>
                  )}
                </div>

                <div className="text-[11px] text-muted-foreground">
                  {defect.inspectorRemarks}
                  {defect.remedyApplied && (
                    <div className="text-emerald-700 dark:text-emerald-400 font-medium mt-0.5">
                      ✓ Remedy: {defect.remedyApplied}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Inspector Identification Credentials */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
        <div className="flex items-center gap-2">
          <UserCheck className="size-4.5 text-blue-600" />
          <h5 className="text-xs font-bold text-foreground">
            Official Indian Railways Inspector Credentials
          </h5>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">
              Inspector Full Name
            </label>
            <input
              type="text"
              value={inspectorName}
              onChange={(e) => setInspectorName(e.target.value)}
              className="w-full mt-1 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">
              Inspector ID / Badge
            </label>
            <input
              type="text"
              value={inspectorId}
              onChange={(e) => setInspectorId(e.target.value)}
              className="w-full mt-1 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-mono font-bold text-foreground focus:outline-none"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">
              Zonal Railway & Yard
            </label>
            <input
              type="text"
              value={`${zonalRailway} - ${yardStationCode}`}
              onChange={(e) => setZonalRailway(e.target.value)}
              className="w-full mt-1 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>

        {/* Co-Signatory Witness Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-border/60">
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">
              Co-Signatory / Loco Pilot Witness
            </label>
            <input
              type="text"
              value={witnessName}
              onChange={(e) => setWitnessName(e.target.value)}
              className="w-full mt-1 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
          </div>
          <div>
            <label className="text-[10px] font-bold uppercase text-muted-foreground">
              Inspector Remarks / Clearance Statement
            </label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full mt-1 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs text-foreground focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Digital Signature Pad */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenTool className="size-4.5 text-blue-600" />
            <h5 className="text-xs font-bold text-foreground">
              Digital Signature & Tamper-Proof Cryptographic Lock
            </h5>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePresetSignature}
              className="flex items-center gap-1 text-[11px] font-bold text-blue-600 hover:text-blue-700"
            >
              <Sparkles className="size-3" />
              <span>Use Certified Badge Signature</span>
            </button>
            <button
              type="button"
              onClick={handleClearSignature}
              className="flex items-center gap-1 text-[11px] font-bold text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="size-3" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Canvas box */}
        <div className="relative rounded-xl border-2 border-dashed border-border bg-white dark:bg-slate-950 p-1 flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={500}
            height={90}
            onMouseDown={handleStartDrawing}
            onMouseMove={handleDraw}
            onMouseUp={handleStopDrawing}
            onMouseLeave={handleStopDrawing}
            onTouchStart={handleStartDrawing}
            onTouchMove={handleDraw}
            onTouchEnd={handleStopDrawing}
            className="w-full h-[90px] cursor-crosshair touch-none"
          />
          {!hasDrawnSignature && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-xs text-slate-400 font-medium select-none">
              Sign with mouse, stylus or tap "Use Certified Badge Signature"
            </div>
          )}
        </div>

        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span>
            Signatory: {inspectorName} ({inspectorId})
          </span>
          <span className="font-mono text-[10px] text-emerald-600 font-semibold">
            SHA-256 Signature Armed
          </span>
        </div>
      </div>

      {/* Primary Final Sign-Off Action */}
      <div className="pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 py-3.5 text-sm font-bold text-white shadow-lg transition hover:brightness-110 active:scale-98"
        >
          <CheckCircle2 className="size-5 stroke-[2.5]" />
          <span>Complete Inspection & Issue Digital QA Clearance Certificate</span>
        </button>
      </div>
    </div>
  );
}
