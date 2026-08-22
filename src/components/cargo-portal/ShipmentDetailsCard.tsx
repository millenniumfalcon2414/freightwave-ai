import React from "react";
import {
  Package,
  FileText,
  Weight,
  Train,
  Calendar,
  MapPin,
  Tag,
  ShieldCheck,
  Building2,
  Boxes,
  Hash,
} from "lucide-react";
import { CargoShipment } from "@/types/cargo-portal";

interface ShipmentDetailsCardProps {
  shipment: CargoShipment;
}

export function ShipmentDetailsCard({ shipment }: ShipmentDetailsCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
            <Package className="size-4" />
          </div>
          <h3 className="text-sm font-bold text-foreground">Shipment & Freight Details</h3>
        </div>
        <span className="rounded-full bg-surface-2 px-2.5 py-0.5 font-mono text-[10px] font-bold text-muted-foreground border border-border">
          {shipment.consignmentNumber}
        </span>
      </div>

      {/* Grid of Key Properties */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        {/* Cargo ID */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <Hash className="size-3 text-blue-600" />
            <span>Cargo ID</span>
          </div>
          <div className="font-mono font-black text-foreground text-sm">{shipment.id}</div>
        </div>

        {/* Consignment Number */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <FileText className="size-3 text-blue-600" />
            <span>Consignment (e-RR)</span>
          </div>
          <div className="font-mono font-bold text-foreground truncate">
            {shipment.consignmentNumber}
          </div>
        </div>

        {/* Freight Number & Name */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <Train className="size-3 text-blue-600" />
            <span>Freight Number</span>
          </div>
          <div className="font-bold text-foreground truncate">{shipment.train.trainNumber}</div>
          <div className="text-[10px] text-muted-foreground truncate">
            {shipment.train.trainName}
          </div>
        </div>

        {/* Wagon Number */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground">Wagon Number</div>
          <div className="font-mono font-black text-blue-600 text-sm">
            {shipment.train.wagonNumber}
          </div>
          <div className="text-[10px] text-muted-foreground truncate">
            {shipment.train.wagonType}
          </div>
        </div>

        {/* Cargo Type */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <Tag className="size-3 text-emerald-600" />
            <span>Cargo Type</span>
          </div>
          <div className="font-bold text-foreground truncate">{shipment.cargoType}</div>
          <div className="text-[10px] text-muted-foreground truncate">
            {shipment.cargoDescription}
          </div>
        </div>

        {/* Cargo Weight & Packages */}
        <div className="rounded-xl border border-border/80 bg-surface-2/40 p-3 space-y-0.5">
          <div className="text-[10px] uppercase font-bold text-muted-foreground flex items-center gap-1">
            <Weight className="size-3 text-indigo-600" />
            <span>Weight & Packages</span>
          </div>
          <div className="font-bold text-foreground font-mono">{shipment.weightTons} Tons</div>
          <div className="text-[10px] text-muted-foreground">
            {shipment.packagesCount} Units ({shipment.packageType})
          </div>
        </div>
      </div>

      {/* Origin, Destination & Dates */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
        {/* Origin */}
        <div className="rounded-xl border border-border/80 bg-emerald-50/50 dark:bg-emerald-950/20 p-3 border-l-4 border-l-emerald-500">
          <div className="text-[10px] uppercase font-bold text-emerald-700 dark:text-emerald-400">
            Origin & Booking Details
          </div>
          <div className="font-bold text-foreground text-sm mt-0.5">{shipment.origin.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            City:{" "}
            <strong>
              {shipment.origin.city}, {shipment.origin.state}
            </strong>
          </div>
          <div className="text-[10px] text-muted-foreground mt-1 flex items-center gap-1">
            <Calendar className="size-3" />
            <span>Booked: {shipment.origin.bookedDate}</span>
          </div>
        </div>

        {/* Destination */}
        <div className="rounded-xl border border-border/80 bg-blue-50/50 dark:bg-blue-950/20 p-3 border-l-4 border-l-blue-500">
          <div className="text-[10px] uppercase font-bold text-blue-700 dark:text-blue-400">
            Destination & Expected Arrival
          </div>
          <div className="font-bold text-foreground text-sm mt-0.5">
            {shipment.destination.name}
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            City:{" "}
            <strong>
              {shipment.destination.city}, {shipment.destination.state}
            </strong>
          </div>
          <div className="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
            <Calendar className="size-3" />
            <span>
              Expected: {shipment.estimatedDeliveryDate} ({shipment.estimatedDeliveryTime})
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
