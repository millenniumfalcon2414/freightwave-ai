import React, { useState } from "react";
import { InspectionRecord, EvidencePhoto } from "@/types/qa";
import {
  Lock,
  Camera,
  QrCode,
  ShieldCheck,
  CheckCircle2,
  Upload,
  Sparkles,
  Layers,
  Image as ImageIcon,
} from "lucide-react";

interface StepProps {
  inspection: InspectionRecord;
  onToggleCheck: (itemId: string, passed?: boolean) => void;
  onAddPhoto: (photo: EvidencePhoto) => void;
  onUpdateField: (updates: Partial<InspectionRecord>) => void;
}

export function Step2WagonSealSecurity({ inspection, onToggleCheck, onAddPhoto }: StepProps) {
  const sealChecks = inspection.checklist.filter(
    (c) =>
      c.category === "STRUCTURAL" ||
      c.category === "SEAL" ||
      c.id.includes("seal") ||
      c.id.includes("wagon") ||
      c.id.includes("lashing") ||
      c.id.includes("door"),
  );

  const [sealCodeInput, setSealCodeInput] = useState<string>("IN-RFID-994182-SEC");
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [sealVerified, setSealVerified] = useState<boolean>(true);

  // Sample photo attachments presets
  const samplePhotos: EvidencePhoto[] = [
    {
      id: `ev-seal-${Date.now()}`,
      category: "SEAL_BARCODE",
      title: "ISO 17712 High-Security RFID Bolt Seal",
      timestamp: "Just now",
      locationName: inspection.locationName,
      gpsCoords: [12.9698, 77.7499],
      dataUrl:
        "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
      notes: "Tamper-evident barcode scanned with valid cryptographic checksum.",
    },
    {
      id: `ev-lash-${Date.now()}`,
      category: "LASHING_CHAINS",
      title: "Grade 80 High-Tensile Lashing Chains",
      timestamp: "Just now",
      locationName: inspection.locationName,
      gpsCoords: [12.9698, 77.7499],
      dataUrl:
        "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
      notes: "Chain tension gauges torqued to 28 kN across all anchor points.",
    },
  ];

  const handleSimulateScan = () => {
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
      setSealVerified(true);
      setSealCodeInput(`IN-RFID-${Math.floor(100000 + Math.random() * 900000)}-VERIFIED`);
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Step Header */}
      <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-xs">
            <Lock className="size-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">
              Step 2: Physical Wagon, Container Structural & Electronic Seal Audit
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
              Examine container body grade, watertight door seals, lashing chain tension, and verify
              ISO 17712:2013 electronic RFID tamper seals against the central freight ledger.
            </p>
          </div>
        </div>
      </div>

      {/* Interactive RFID Seal Scanner & Barcode Validation */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="size-4.5 text-indigo-600" />
            <h5 className="text-xs font-bold text-foreground">
              Electronic High-Security e-Seal (RFID) Scanner
            </h5>
          </div>
          {sealVerified && (
            <span className="flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold font-mono text-emerald-600 border border-emerald-500/20">
              <CheckCircle2 className="size-3" />
              Cryptographic Match Confirmed
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <input
              type="text"
              value={sealCodeInput}
              onChange={(e) => setSealCodeInput(e.target.value)}
              placeholder="Enter or scan RFID Barcode..."
              className="w-full rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs font-mono font-bold text-foreground focus:border-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleSimulateScan}
            disabled={isScanning}
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition active:scale-98 disabled:opacity-50"
          >
            <Sparkles className={`size-3.5 ${isScanning ? "animate-spin" : ""}`} />
            <span>{isScanning ? "Scanning RFID Tag..." : "Scan e-Seal Barcode"}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] text-muted-foreground pt-1">
          <div className="rounded-lg bg-surface-2/60 p-2">
            Seal Standard: <strong className="text-foreground">ISO 17712 Grade 'H'</strong>
          </div>
          <div className="rounded-lg bg-surface-2/60 p-2">
            Frequency: <strong className="text-foreground">UHF 865-867 MHz (EPC Gen 2)</strong>
          </div>
          <div className="rounded-lg bg-surface-2/60 p-2">
            Tamper Loop: <strong className="text-emerald-600">Intact / Armed</strong>
          </div>
        </div>
      </div>

      {/* Structural & Seal Verification Checkpoints */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h5 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <ShieldCheck className="size-4 text-primary" />
            Wagon & Seal Integrity Gates
          </h5>
          <span className="text-[11px] text-muted-foreground">
            {sealChecks.filter((c) => c.passed).length} of {sealChecks.length} Passed
          </span>
        </div>

        <div className="space-y-2.5">
          {sealChecks.map((item) => (
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

      {/* Photographic Evidence Attachment */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="size-4.5 text-indigo-600" />
            <h5 className="text-xs font-bold text-foreground">
              Photographic Evidence & Geo-Tagged Proof
            </h5>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground">
            {inspection.evidencePhotos.length} Photos Captured
          </span>
        </div>

        {/* Existing photos preview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {inspection.evidencePhotos.map((photo) => (
            <div
              key={photo.id}
              className="group relative overflow-hidden rounded-xl border border-border bg-surface-2/60 p-2.5 space-y-2"
            >
              <div className="relative h-32 w-full overflow-hidden rounded-lg bg-slate-900">
                <img
                  src={photo.dataUrl}
                  alt={photo.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute bottom-2 left-2 rounded bg-black/80 px-1.5 py-0.5 font-mono text-[9px] font-bold text-emerald-400 backdrop-blur-xs">
                  {photo.category} · {photo.timestamp}
                </span>
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">{photo.title}</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">{photo.notes}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Add Sample Photo Button */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              const photoToAdd =
                samplePhotos[inspection.evidencePhotos.length % samplePhotos.length];
              onAddPhoto({ ...photoToAdd, id: `ev-${Date.now()}` });
            }}
            className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface-2/80 transition"
          >
            <Camera className="size-3.5 text-indigo-600" />
            <span>Attach High-Res Seal Photo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
