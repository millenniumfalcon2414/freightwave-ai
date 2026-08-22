import React, { useState } from "react";
import {
  Package,
  Search,
  Filter,
  ArrowRight,
  MapPin,
  Clock,
  Train,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Eye,
  Truck,
} from "lucide-react";
import { CargoShipment, ShipmentStatus } from "@/types/cargo-portal";

interface MyShipmentsViewProps {
  shipments: CargoShipment[];
  activeShipmentId: string;
  onSelectShipment: (shipment: CargoShipment) => void;
  onTrackShipment: (shipment: CargoShipment) => void;
}

export function MyShipmentsView({
  shipments,
  activeShipmentId,
  onSelectShipment,
  onTrackShipment,
}: MyShipmentsViewProps) {
  const [filter, setFilter] = useState<"ALL" | "IN_TRANSIT" | "DELIVERED" | "DELAYED" | "PENDING">(
    "ALL",
  );
  const [search, setSearch] = useState("");

  const filteredShipments = shipments.filter((s) => {
    // Status filter
    if (filter === "IN_TRANSIT" && s.status !== "IN_TRANSIT" && s.status !== "OUT_FOR_DELIVERY")
      return false;
    if (filter === "DELIVERED" && s.status !== "DELIVERED") return false;
    if (filter === "DELAYED" && s.status !== "DELAYED") return false;
    if (
      filter === "PENDING" &&
      s.status !== "BOOKED" &&
      s.status !== "LOADED" &&
      s.status !== "PENDING"
    )
      return false;

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        s.id.toLowerCase().includes(q) ||
        s.consignmentNumber.toLowerCase().includes(q) ||
        s.cargoType.toLowerCase().includes(q) ||
        s.origin.city.toLowerCase().includes(q) ||
        s.destination.city.toLowerCase().includes(q) ||
        s.train.trainNumber.toLowerCase().includes(q)
      );
    }

    return true;
  });

  const getStatusBadge = (status: ShipmentStatus, label: string) => {
    switch (status) {
      case "DELIVERED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-500/30">
            <CheckCircle2 className="size-3" />
            Delivered ✓
          </span>
        );
      case "DELAYED":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30">
            <AlertTriangle className="size-3" />
            Delayed
          </span>
        );
      case "OUT_FOR_DELIVERY":
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-xs font-bold text-cyan-600 border border-cyan-500/30">
            <Truck className="size-3" />
            Out for Delivery
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/15 px-2.5 py-0.5 text-xs font-bold text-blue-600 border border-blue-500/30">
            <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
            In Transit
          </span>
        );
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header Card */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black tracking-tight text-foreground">
            My Consignments & Rakes
          </h2>
          <p className="text-xs text-muted-foreground">
            Manage, track, and review all active and historical multimodal railway cargo shipments.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          {/* Search Input */}
          <div className="relative min-w-[240px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ID, Cargo, City..."
              className="w-full rounded-xl border border-border bg-surface-2/60 py-2 pl-9 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          {/* Filter Pills */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs">
            <button
              onClick={() => setFilter("ALL")}
              className={`rounded-xl px-3 py-2 font-semibold transition ${
                filter === "ALL"
                  ? "bg-blue-600 text-white"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              All ({shipments.length})
            </button>
            <button
              onClick={() => setFilter("IN_TRANSIT")}
              className={`rounded-xl px-3 py-2 font-semibold transition ${
                filter === "IN_TRANSIT"
                  ? "bg-blue-600 text-white"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              In Transit
            </button>
            <button
              onClick={() => setFilter("DELIVERED")}
              className={`rounded-xl px-3 py-2 font-semibold transition ${
                filter === "DELIVERED"
                  ? "bg-blue-600 text-white"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              Delivered
            </button>
            <button
              onClick={() => setFilter("DELAYED")}
              className={`rounded-xl px-3 py-2 font-semibold transition ${
                filter === "DELAYED"
                  ? "bg-blue-600 text-white"
                  : "bg-surface-2 text-muted-foreground hover:text-foreground"
              }`}
            >
              Delayed
            </button>
          </div>
        </div>
      </div>

      {/* Shipment Cards Grid */}
      <div className="grid grid-cols-1 gap-4">
        {filteredShipments.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-surface p-12 text-center space-y-3">
            <Package className="mx-auto size-10 text-muted-foreground opacity-40" />
            <h4 className="font-bold text-foreground">No Shipments Found</h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              No cargo consignments matched your active filter or search keyword.
            </p>
          </div>
        ) : (
          filteredShipments.map((s) => {
            const isSelected = s.id === activeShipmentId;

            return (
              <div
                key={s.id}
                className={`rounded-2xl border p-5 transition shadow-sm hover:shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-5 ${
                  isSelected
                    ? "border-2 border-blue-500 bg-blue-50/20 dark:bg-blue-950/20"
                    : "border-border bg-surface hover:border-border/90"
                }`}
              >
                {/* Left: Cargo ID, Name, Train, Type */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <span className="text-base font-black text-foreground font-mono">{s.id}</span>
                    <span className="rounded-md bg-surface-2 px-2 py-0.5 font-mono text-[10px] text-muted-foreground border border-border">
                      RR: {s.consignmentNumber}
                    </span>
                    {getStatusBadge(s.status, s.statusLabel)}
                    {isSelected && (
                      <span className="rounded-full bg-blue-600 px-2 py-0.2 font-mono text-[9px] font-bold text-white">
                        Currently Viewing
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-foreground">{s.title}</div>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Train className="size-3 text-blue-600" />
                      <span>
                        {s.train.trainName} ({s.train.trainNumber})
                      </span>
                    </span>
                    <span>·</span>
                    <span>
                      Wagon: <strong className="text-foreground">{s.train.wagonNumber}</strong>
                    </span>
                    <span>·</span>
                    <span>
                      Weight: <strong className="text-foreground">{s.weightTons} Tons</strong>
                    </span>
                  </div>
                </div>

                {/* Middle: Route & Current Station */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-4 lg:px-6 border-y lg:border-y-0 lg:border-x border-border/70 py-3 lg:py-0">
                  {/* Origin to Destination */}
                  <div className="space-y-1 min-w-[170px]">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">
                      Route
                    </div>
                    <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                      <span>{s.origin.city}</span>
                      <ArrowRight className="size-3 text-blue-600" />
                      <span>{s.destination.city}</span>
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {s.remainingDistanceKm > 0
                        ? `${s.remainingDistanceKm} km left`
                        : "0 km (Arrived)"}
                    </div>
                  </div>

                  {/* Current Location */}
                  <div className="space-y-1 min-w-[170px]">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">
                      Current Location
                    </div>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1">
                      <MapPin className="size-3 text-red-500 shrink-0" />
                      <span className="truncate max-w-[150px]">{s.currentLocationName}</span>
                    </div>
                    <div className="text-[10px] text-emerald-600 font-semibold">
                      Speed: {s.currentSpeedKmh} km/h
                    </div>
                  </div>

                  {/* ETA */}
                  <div className="space-y-1 min-w-[150px]">
                    <div className="text-[10px] uppercase font-bold text-muted-foreground">
                      Estimated Delivery
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      {s.estimatedDeliveryDate}
                    </div>
                    <div className="text-[10px] text-blue-600 font-semibold">
                      {s.estimatedDeliveryTime}
                    </div>
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onTrackShipment(s)}
                    className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition"
                  >
                    <Eye className="size-3.5" />
                    <span>Track Live</span>
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
