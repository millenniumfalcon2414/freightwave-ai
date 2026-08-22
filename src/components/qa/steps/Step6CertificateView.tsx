import React from "react";
import { InspectionRecord } from "@/types/qa";
import {
  Award,
  CheckCircle2,
  Download,
  Share2,
  ShieldCheck,
  Train,
  QrCode,
  Printer,
  Calendar,
  Lock,
  ArrowRight,
  Sparkles,
} from "lucide-react";

interface StepProps {
  inspection: InspectionRecord;
  onClose: () => void;
  onDispatchGreenCorridor?: () => void;
}

export function Step6CertificateView({ inspection, onClose, onDispatchGreenCorridor }: StepProps) {
  const cert = inspection.certificate;
  const signoff = inspection.inspectorSignoff;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadDossier = () => {
    const jsonContent = JSON.stringify(inspection, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `RailFlow_QA_Certificate_${inspection.consignmentNumber}_${cert?.certificateNumber || "CERT"}.json`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Success Celebration Banner */}
      <div className="rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-5 text-center space-y-2">
        <div className="inline-flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white shadow-xl shadow-emerald-500/20">
          <Award className="size-8" />
        </div>
        <h3 className="text-base sm:text-lg font-black text-foreground">
          Official QA Clearance & RDSO BPC Issued!
        </h3>
        <p className="text-xs text-muted-foreground max-w-lg mx-auto leading-relaxed">
          Consignment <strong>{inspection.consignmentNumber}</strong> has successfully completed all
          multi-step mechanical, pneumatic, electrical, and electronic seal safety audits with a{" "}
          <strong className="text-emerald-600">{cert?.overallScorePercentage || 99.4}%</strong>{" "}
          compliance score.
        </p>
      </div>

      {/* Official Certificate Card (Printable) */}
      <div className="relative overflow-hidden rounded-2xl border-2 border-border bg-white text-slate-900 shadow-xl p-6 sm:p-8 space-y-6 font-sans">
        {/* Certificate Header Watermark & Brand */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b-2 border-slate-200 pb-5">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="size-8 rounded-lg bg-blue-900 text-white flex items-center justify-center font-black text-sm">
                IR
              </div>
              <div>
                <div className="text-xs font-black tracking-widest uppercase text-blue-900">
                  INDIAN RAILWAYS · FREIGHT QA DIRECTORATE
                </div>
                <div className="text-[10px] text-slate-500 font-medium">
                  RDSO G-95 Standard & Multimodal Cargo Safety Directorate
                </div>
              </div>
            </div>
            <h2 className="text-base sm:text-xl font-black text-slate-900 pt-2 tracking-tight">
              DIGITAL QA CLEARANCE CERTIFICATE (BPC)
            </h2>
          </div>

          <div className="sm:text-right font-mono space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-500">Certificate No.</div>
            <div className="text-xs font-black text-blue-700 bg-blue-50 px-2.5 py-1 rounded-md border border-blue-200 inline-block">
              {cert?.certificateNumber || "RDSO-BPC-2026-99418"}
            </div>
            <div className="text-[10px] text-slate-500">
              Issued: {cert?.issueTimestamp || inspection.initiatedTimestamp}
            </div>
          </div>
        </div>

        {/* Certificate Core Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Consignment (e-RR)
            </span>
            <div className="font-mono font-black text-slate-800">
              {inspection.consignmentNumber}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Wagon & Siding</span>
            <div className="font-mono font-black text-slate-800">{inspection.wagonNumber}</div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">Locomotive Rake</span>
            <div className="font-mono font-black text-slate-800">
              {inspection.bpcMetrics.locomotiveNumber}
            </div>
          </div>
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Brake Power (BPC)
            </span>
            <div className="font-mono font-black text-emerald-700">
              {inspection.bpcMetrics.brakePowerPercentage}% EFFICIENCY
            </div>
          </div>
        </div>

        {/* Inspection Summary Matrix Strip */}
        <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs">
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Weight Balance</div>
            <div className="font-bold text-slate-900 mt-0.5">42.67 MT (Balanced)</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">RFID e-Seal</div>
            <div className="font-bold text-emerald-700 mt-0.5">ISO 17712 'H' Intact</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">NavIC GNSS Lock</div>
            <div className="font-bold text-slate-900 mt-0.5">14 Satellites (-68 dBm)</div>
          </div>
          <div>
            <div className="text-[10px] text-slate-500 font-bold uppercase">Hot Axle-Box</div>
            <div className="font-bold text-emerald-700 mt-0.5">42.1°C (&lt;65°C Limit)</div>
          </div>
        </div>

        {/* Signatures & QR Code Section */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-4 border-t border-slate-200">
          {/* QR Code Payload Simulation */}
          <div className="flex items-center gap-3">
            <div className="flex size-20 items-center justify-center rounded-xl bg-slate-900 text-white p-2 shrink-0">
              <QrCode className="size-16" />
            </div>
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-900">
                Cryptographic Verification QR
              </div>
              <div className="text-[9px] text-slate-500 font-mono break-all max-w-[200px]">
                {cert?.digitalSignatureHash || "SHA256:7c9e9b28a410efd910b832104fa2810ce8891048b"}
              </div>
              <div className="text-[9px] font-bold text-emerald-700 flex items-center gap-1">
                <CheckCircle2 className="size-3" />
                FOIS Central Registry Synced
              </div>
            </div>
          </div>

          {/* Inspector Signature Box */}
          <div className="text-right space-y-1">
            <div className="text-[10px] font-bold uppercase text-slate-400">Certified Sign-off</div>
            {signoff?.signatureDataUrl ? (
              <img
                src={signoff.signatureDataUrl}
                alt="Signature"
                className="h-10 ml-auto object-contain"
              />
            ) : (
              <div className="font-serif italic text-base font-bold text-blue-900">
                {signoff?.inspectorName || "V. K. Sharma"}
              </div>
            )}
            <div className="text-xs font-bold text-slate-900">
              {signoff?.inspectorName || "Virender Kumar Sharma"}
            </div>
            <div className="text-[10px] text-slate-500 font-mono">
              Badge: {signoff?.badgeNumber || "SWR-SENIOR-SE-44"} · {inspection.zonalStationCode}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons Footer */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-foreground hover:bg-surface-2 transition"
          >
            <Printer className="size-4" />
            <span>Print Certificate</span>
          </button>
          <button
            type="button"
            onClick={handleDownloadDossier}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-foreground hover:bg-surface-2 transition"
          >
            <Download className="size-4" />
            <span>Export Full JSON Dossier</span>
          </button>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 sm:flex-initial rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-muted-foreground hover:text-foreground transition"
          >
            Close Wizard
          </button>
          <button
            type="button"
            onClick={() => {
              if (onDispatchGreenCorridor) onDispatchGreenCorridor();
              onClose();
            }}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-emerald-700 transition active:scale-98"
          >
            <Train className="size-4" />
            <span>Dispatch to Green Corridor</span>
          </button>
        </div>
      </div>
    </div>
  );
}
