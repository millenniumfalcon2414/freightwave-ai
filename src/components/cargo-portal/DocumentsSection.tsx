import React, { useState } from "react";
import {
  FileText,
  Download,
  Eye,
  CheckCircle2,
  ShieldCheck,
  Calendar,
  Building2,
  ExternalLink,
  X,
  FileCheck,
  Sparkles,
} from "lucide-react";
import { CargoDocument, CargoShipment } from "@/types/cargo-portal";

interface DocumentsSectionProps {
  shipment: CargoShipment;
}

export function DocumentsSection({ shipment }: DocumentsSectionProps) {
  const [selectedDoc, setSelectedDoc] = useState<CargoDocument | null>(null);
  const [downloadToast, setDownloadToast] = useState<string | null>(null);

  const handleDownload = (doc: CargoDocument) => {
    setDownloadToast(`Downloading ${doc.title} (${doc.fileSize})...`);
    setTimeout(() => {
      setDownloadToast(`✓ Downloaded ${doc.title}`);
      setTimeout(() => setDownloadToast(null), 3000);
    }, 1200);
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-md space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
            <FileText className="size-4.5" />
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-foreground">
              Official Consignment & Railway Documents
            </h2>
            <p className="text-xs text-muted-foreground">
              Digitally verified Railway Receipts (e-RR), Tax Invoices, Challans & Gate Passes.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-emerald-500/15 px-3 py-1 font-mono text-xs font-bold text-emerald-600 border border-emerald-500/30">
            ✓ Indian Railways GST & FOIS Compliant
          </span>
        </div>
      </div>

      {/* Download Alert Toast */}
      {downloadToast && (
        <div className="rounded-xl border border-blue-500/30 bg-blue-500/10 p-3 text-xs font-bold text-blue-600 flex items-center justify-between animate-in fade-in">
          <span>{downloadToast}</span>
          <CheckCircle2 className="size-4 text-blue-600" />
        </div>
      )}

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {shipment.documents.map((doc) => (
          <div
            key={doc.id}
            className="rounded-xl border border-border bg-surface-2/40 p-4 transition hover:border-blue-500/50 hover:bg-surface-2/80 flex flex-col justify-between gap-3"
          >
            <div className="space-y-1">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded bg-blue-600/10 px-2 py-0.5 font-mono text-[10px] font-bold text-blue-600 border border-blue-500/20">
                  {doc.category}
                </span>
                <span className="text-[10px] text-muted-foreground font-mono">{doc.fileSize}</span>
              </div>

              <h4 className="font-bold text-foreground text-sm leading-tight pt-1">{doc.title}</h4>
              <div className="font-mono text-xs text-muted-foreground">
                Doc Ref: {doc.docNumber}
              </div>
              <div className="text-[10px] text-muted-foreground flex items-center gap-1 pt-0.5">
                <Calendar className="size-3" />
                <span>Issued: {doc.issuedDate}</span>
                <span>·</span>
                <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                  <ShieldCheck className="size-3" />
                  FOIS Signed
                </span>
              </div>
            </div>

            {/* View & Download Buttons */}
            <div className="flex items-center gap-2 pt-2 border-t border-border/60">
              <button
                onClick={() => setSelectedDoc(doc)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface-2 transition shadow-xs"
              >
                <Eye className="size-3.5 text-blue-600" />
                <span>View</span>
              </button>

              <button
                onClick={() => handleDownload(doc)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
              >
                <Download className="size-3.5" />
                <span>Download</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Preview Modal */}
      {selectedDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <FileCheck className="size-5 text-blue-600" />
                <div>
                  <h3 className="font-bold text-foreground text-base">{selectedDoc.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    Document Number: {selectedDoc.docNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedDoc(null)}
                className="rounded-lg p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Simulated Official Document Sheet */}
            <div className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-6 font-sans text-slate-800 dark:text-slate-100 shadow-inner space-y-4">
              {/* Document Letterhead */}
              <div className="border-b-2 border-slate-900 dark:border-slate-100 pb-3 flex justify-between items-start">
                <div>
                  <div className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                    INDIAN RAILWAYS FREIGHT OPERATIONS SYSTEM (FOIS)
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Multimodal Rail-Road Bill of Lading & Electronic Freight Consignment
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono text-xs font-bold text-blue-600">
                    {selectedDoc.docNumber}
                  </div>
                  <div className="text-[10px] text-slate-500">Date: {selectedDoc.issuedDate}</div>
                </div>
              </div>

              {/* Consignor & Consignee Summary */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-500">
                    Consignor / Sender
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    {shipment.customerName}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Origin: {shipment.origin.name}
                  </div>
                  <div className="text-[10px] text-slate-500">State: {shipment.origin.state}</div>
                </div>

                <div className="rounded-lg bg-slate-50 dark:bg-slate-800 p-3">
                  <div className="text-[10px] font-bold uppercase text-slate-500">
                    Consignee / Destination
                  </div>
                  <div className="font-bold text-slate-900 dark:text-white">
                    Authorized Consignee Hub
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    Terminal: {shipment.destination.name}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    State: {shipment.destination.state}
                  </div>
                </div>
              </div>

              {/* Goods Table */}
              <table className="w-full text-left text-xs border border-slate-200 dark:border-slate-700">
                <thead className="bg-slate-100 dark:bg-slate-800 text-[10px] uppercase font-bold text-slate-600 dark:text-slate-300">
                  <tr>
                    <th className="p-2 border-b">Cargo Description</th>
                    <th className="p-2 border-b">Wagon / Container</th>
                    <th className="p-2 border-b">Units</th>
                    <th className="p-2 border-b">Net Weight</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border-b font-medium">{shipment.cargoDescription}</td>
                    <td className="p-2 border-b font-mono">{shipment.train.wagonNumber}</td>
                    <td className="p-2 border-b font-mono">{shipment.packagesCount}</td>
                    <td className="p-2 border-b font-mono font-bold">{shipment.weightTons} Tons</td>
                  </tr>
                </tbody>
              </table>

              {/* Digital Watermark & QR Code Info */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 text-[10px] text-slate-500">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>
                    Digitally certified through CRIS (Centre for Railway Information Systems)
                  </span>
                </div>
                <div className="font-mono font-bold text-slate-700 dark:text-slate-300">
                  E-SEAL: {shipment.condition.eSealId}
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-border">
              <button
                onClick={() => setSelectedDoc(null)}
                className="rounded-xl border border-border px-4 py-2 text-xs font-semibold text-foreground hover:bg-surface-2"
              >
                Close Preview
              </button>
              <button
                onClick={() => {
                  handleDownload(selectedDoc);
                  setSelectedDoc(null);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow"
              >
                <Download className="size-3.5" />
                <span>Download Official PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
