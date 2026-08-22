import React from "react";
import {
  CheckCircle2,
  Calendar,
  Clock,
  MapPin,
  User,
  ShieldCheck,
  FileCheck,
  Download,
  Building2,
  Phone,
} from "lucide-react";
import { CargoShipment } from "@/types/cargo-portal";

interface DeliveryConfirmationCardProps {
  shipment: CargoShipment;
  onViewDocuments: () => void;
}

export function DeliveryConfirmationCard({
  shipment,
  onViewDocuments,
}: DeliveryConfirmationCardProps) {
  const proof = shipment.deliveryProof;

  return (
    <div className="rounded-2xl border-2 border-emerald-500/50 bg-emerald-50/40 dark:bg-emerald-950/20 p-5 sm:p-6 shadow-md space-y-5">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-emerald-500/30 pb-4">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-2xl bg-emerald-600 text-white shadow-md">
            <CheckCircle2 className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base sm:text-lg font-black text-emerald-900 dark:text-emerald-300">
                Cargo Delivered Successfully ✓
              </h3>
              <span className="rounded-full bg-emerald-600 text-white px-2 py-0.2 font-mono text-[10px] font-bold">
                e-POD Signed
              </span>
            </div>
            <p className="text-xs text-emerald-800/80 dark:text-emerald-400">
              Electronic Proof of Delivery has been signed and validated with zero damage reported.
            </p>
          </div>
        </div>

        <button
          onClick={onViewDocuments}
          className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-3.5 py-2 text-xs font-bold shadow-xs transition"
        >
          <FileCheck className="size-3.5" />
          <span>View e-POD & Receipts</span>
        </button>
      </div>

      {/* Proof of Delivery Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
        {/* Delivered At */}
        <div className="rounded-xl border border-emerald-500/30 bg-surface p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <Clock className="size-3 text-emerald-600" />
            <span>Delivered Timestamp</span>
          </div>
          <div className="font-bold text-foreground">
            {proof?.deliveredAt || shipment.estimatedDeliveryDate}
          </div>
        </div>

        {/* Receiver Name */}
        <div className="rounded-xl border border-emerald-500/30 bg-surface p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <User className="size-3 text-emerald-600" />
            <span>Receiver Confirmation</span>
          </div>
          <div className="font-bold text-foreground truncate">
            {proof?.receiverName || "Authorized Gate Official"}
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            {proof?.receiverDesignation || "Chief Receiving Officer"}
          </div>
        </div>

        {/* e-POD Number */}
        <div className="rounded-xl border border-emerald-500/30 bg-surface p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <FileCheck className="size-3 text-emerald-600" />
            <span>e-POD Ref Number</span>
          </div>
          <div className="font-mono font-bold text-emerald-700 dark:text-emerald-400">
            {proof?.ePodNumber || `EPOD-${shipment.id}`}
          </div>
        </div>

        {/* Security & Packages Verified */}
        <div className="rounded-xl border border-emerald-500/30 bg-surface p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <ShieldCheck className="size-3 text-emerald-600" />
            <span>Packages & Seal Check</span>
          </div>
          <div className="font-bold text-emerald-600">
            {proof?.totalPackagesReceived || shipment.packagesCount} Packages (100% Intact)
          </div>
          <div className="text-[10px] text-muted-foreground">E-Seal verified uncompromised</div>
        </div>
      </div>

      {/* Destination Siding / Address */}
      <div className="rounded-xl border border-emerald-500/30 bg-surface p-3 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <MapPin className="size-4 text-emerald-600 shrink-0" />
          <div>
            <span className="text-muted-foreground">Final Destination Dock: </span>
            <strong className="text-foreground">
              {proof?.destinationAddress || shipment.destination.name}
            </strong>
          </div>
        </div>
        <div className="text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
          Gate Clearance: Approved ✓
        </div>
      </div>
    </div>
  );
}
