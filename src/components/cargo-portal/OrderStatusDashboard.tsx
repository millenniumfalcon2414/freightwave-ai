import React, { useState } from "react";
import {
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  FileText,
  Download,
  Truck,
  Train,
  MapPin,
  Building2,
  DollarSign,
  ShieldCheck,
  ChevronRight,
  Filter,
  Eye,
  RefreshCw,
  ExternalLink,
  PhoneCall,
  Calendar,
  Layers,
  ArrowRight,
  Check,
  FileCheck2,
} from "lucide-react";
import { CargoShipment, ShipmentStatus } from "@/types/cargo-portal";

interface OrderStatusDashboardProps {
  shipments: CargoShipment[];
  activeShipment: CargoShipment;
  onSelectShipment: (shipment: CargoShipment) => void;
  onViewDocuments: () => void;
  onRefreshGps: () => void;
  isRefreshing?: boolean;
}

export function OrderStatusDashboard({
  shipments,
  activeShipment,
  onSelectShipment,
  onViewDocuments,
  onRefreshGps,
  isRefreshing = false,
}: OrderStatusDashboardProps) {
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [orderSearch, setOrderSearch] = useState<string>("");

  // Filter shipments
  const filteredShipments = shipments.filter((s) => {
    if (statusFilter === "IN_TRANSIT" && s.status !== "IN_TRANSIT" && s.status !== "DEPARTED")
      return false;
    if (statusFilter === "OUT_FOR_DELIVERY" && s.status !== "OUT_FOR_DELIVERY") return false;
    if (statusFilter === "DELIVERED" && s.status !== "DELIVERED") return false;
    if (statusFilter === "DELAYED" && !s.isDelayed && s.status !== "DELAYED") return false;

    if (orderSearch.trim()) {
      const q = orderSearch.toLowerCase();
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

  // Calculate order statistics
  const totalOrders = shipments.length;
  const inTransitCount = shipments.filter(
    (s) => s.status === "IN_TRANSIT" || s.status === "DEPARTED",
  ).length;
  const drayageCount = shipments.filter((s) => s.status === "OUT_FOR_DELIVERY").length;
  const deliveredCount = shipments.filter((s) => s.status === "DELIVERED").length;
  const delayedCount = shipments.filter((s) => s.isDelayed || s.status === "DELAYED").length;

  // Order lifecycle stages
  const orderStages = [
    { label: "Order Booked", done: true, desc: "Consignment registered with e-RR" },
    { label: "QA Inspected", done: true, desc: "Bureau Veritas seal & weight verified" },
    { label: "Loaded & Departed", done: true, desc: "Wagon shunting cleared at origin" },
    {
      label: "In Transit Freight",
      done: activeShipment.currentStageIndex >= 3,
      active: activeShipment.status === "IN_TRANSIT",
      desc: "High-speed DFC Corridor transport",
    },
    {
      label: "Customs & Yard Gate In",
      done: activeShipment.currentStageIndex >= 4,
      active: activeShipment.status === "AT_DESTINATION_STATION",
      desc: "Destination ICD yard shunting",
    },
    {
      label: "Out for Drayage",
      done: activeShipment.currentStageIndex >= 5,
      active: activeShipment.status === "OUT_FOR_DELIVERY",
      desc: "Last-mile heavy highway transport",
    },
    {
      label: "Delivered & Signed",
      done: activeShipment.status === "DELIVERED",
      desc: "Consignee digital e-POD clearance",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header & Quick Metrics Banner */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-blue-600 to-cyan-500 text-white shadow-md">
              <Package className="size-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight text-foreground">
                  Order Status & Commercial Consignment Dashboard
                </h2>
                <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-blue-600 border border-blue-500/20 font-mono">
                  FOIS Waybill Sync
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Track full commercial order lifecycle, railway receipts (e-RR), invoices, payment
                clearance & digital e-POD
              </p>
            </div>
          </div>

          <button
            onClick={onRefreshGps}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50 shrink-0"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Sync Orders</span>
          </button>
        </div>

        {/* 5 KPI Metric Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`rounded-xl border p-3 text-left transition ${
              statusFilter === "ALL"
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                : "border-border bg-surface-2/40 hover:bg-surface-2"
            }`}
          >
            <span className="text-[10px] font-bold text-muted-foreground block">Total Orders</span>
            <strong className="text-xl font-black text-foreground font-mono">{totalOrders}</strong>
          </button>

          <button
            onClick={() => setStatusFilter("IN_TRANSIT")}
            className={`rounded-xl border p-3 text-left transition ${
              statusFilter === "IN_TRANSIT"
                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-950/30 ring-2 ring-blue-500/20"
                : "border-border bg-surface-2/40 hover:bg-surface-2"
            }`}
          >
            <span className="text-[10px] font-bold text-blue-600 block">In Transit</span>
            <strong className="text-xl font-black text-blue-600 font-mono">{inTransitCount}</strong>
          </button>

          <button
            onClick={() => setStatusFilter("OUT_FOR_DELIVERY")}
            className={`rounded-xl border p-3 text-left transition ${
              statusFilter === "OUT_FOR_DELIVERY"
                ? "border-cyan-500 bg-cyan-50/50 dark:bg-cyan-950/30 ring-2 ring-cyan-500/20"
                : "border-border bg-surface-2/40 hover:bg-surface-2"
            }`}
          >
            <span className="text-[10px] font-bold text-cyan-600 block">Out for Delivery</span>
            <strong className="text-xl font-black text-cyan-600 font-mono">{drayageCount}</strong>
          </button>

          <button
            onClick={() => setStatusFilter("DELIVERED")}
            className={`rounded-xl border p-3 text-left transition ${
              statusFilter === "DELIVERED"
                ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 ring-2 ring-emerald-500/20"
                : "border-border bg-surface-2/40 hover:bg-surface-2"
            }`}
          >
            <span className="text-[10px] font-bold text-emerald-600 block">Delivered ✓</span>
            <strong className="text-xl font-black text-emerald-600 font-mono">
              {deliveredCount}
            </strong>
          </button>

          <button
            onClick={() => setStatusFilter("DELAYED")}
            className={`rounded-xl border p-3 text-left transition ${
              statusFilter === "DELAYED"
                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 ring-2 ring-amber-500/20"
                : "border-border bg-surface-2/40 hover:bg-surface-2"
            }`}
          >
            <span className="text-[10px] font-bold text-amber-600 block">Delayed / Alert</span>
            <strong className="text-xl font-black text-amber-600 font-mono">{delayedCount}</strong>
          </button>
        </div>
      </div>

      {/* Active Order Highlight & Lifecycle Stepper */}
      <div className="rounded-2xl border border-border bg-surface p-5 sm:p-6 shadow-md space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-blue-600 bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-500/20">
                Active Order: {activeShipment.id}
              </span>
              <span className="font-mono text-xs font-bold text-foreground">
                Consignment: {activeShipment.consignmentNumber}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-foreground mt-1">
              {activeShipment.title} ({activeShipment.origin.city} →{" "}
              {activeShipment.destination.city})
            </h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onViewDocuments}
              className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-1.5 text-xs font-bold text-foreground hover:bg-surface-3 transition"
            >
              <FileText className="size-3.5 text-blue-600" />
              <span>Waybill Documents</span>
            </button>
          </div>
        </div>

        {/* ORDER LIFECYCLE STEPPER */}
        <div className="space-y-3">
          <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
            <FileCheck2 className="size-3.5 text-blue-600" />
            Order Fulfillment Progress Lifecycle
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
            {orderStages.map((stage, idx) => (
              <div
                key={idx}
                className={`rounded-xl border p-3 text-xs space-y-1 transition ${
                  stage.done
                    ? "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 text-foreground"
                    : stage.active
                      ? "border-blue-500 bg-blue-50 dark:bg-blue-950/40 text-foreground ring-2 ring-blue-500/20"
                      : "border-border/60 bg-surface-2/40 text-muted-foreground opacity-60"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold">
                  <span className="font-mono">Step {idx + 1}</span>
                  {stage.done ? (
                    <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Clock className="size-3.5 text-muted-foreground shrink-0" />
                  )}
                </div>
                <div className="font-extrabold text-foreground truncate">{stage.label}</div>
                <div className="text-[9px] text-muted-foreground leading-tight">{stage.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Financials & Commercial Specifications Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-2">
          <div className="rounded-xl border border-border bg-surface-2/50 p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Declared Order Value
            </span>
            <div className="text-lg font-black text-emerald-600 font-mono">
              ₹{activeShipment.declaredValueInr}
            </div>
            <div className="text-[10px] font-semibold text-emerald-600">
              Freight Paid & Insurance Covered
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2/50 p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Consignor (Sender)
            </span>
            <div className="font-bold text-foreground truncate">{activeShipment.origin.name}</div>
            <div className="text-[10px] text-muted-foreground">
              {activeShipment.origin.city}, {activeShipment.origin.state}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2/50 p-3.5 space-y-1">
            <span className="text-[10px] uppercase font-bold text-muted-foreground block">
              Consignee (Receiver)
            </span>
            <div className="font-bold text-foreground truncate">
              {activeShipment.destination.name}
            </div>
            <div className="text-[10px] text-muted-foreground">
              {activeShipment.destination.city}, {activeShipment.destination.state}
            </div>
          </div>
        </div>
      </div>

      {/* Orders Master List Table */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Layers className="size-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Customer Consignment & Freight Orders Master List
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Search, filter and manage order status, e-RR waybills and delivery confirmations
              </p>
            </div>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
            <input
              type="text"
              value={orderSearch}
              onChange={(e) => setOrderSearch(e.target.value)}
              placeholder="Filter by Order ID / City..."
              className="w-full rounded-xl border border-border bg-surface-2/80 py-1.5 pl-8 pr-3 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:border-blue-500 focus:outline-hidden"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-2/60 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Order ID & Waybill</th>
                <th className="py-2.5 px-3">Consignment Details</th>
                <th className="py-2.5 px-3">Declared Value</th>
                <th className="py-2.5 px-3">Origin → Destination</th>
                <th className="py-2.5 px-3">Order Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {filteredShipments.map((s) => {
                const isSelected = s.id === activeShipment.id;
                return (
                  <tr
                    key={s.id}
                    className={`hover:bg-surface-2/80 transition ${
                      isSelected ? "bg-blue-50/50 dark:bg-blue-950/20 font-semibold" : ""
                    }`}
                  >
                    <td className="py-3 px-3">
                      <div className="font-bold text-foreground">{s.id}</div>
                      <div className="text-[10px] text-muted-foreground">{s.consignmentNumber}</div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-foreground">{s.cargoType}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {s.weightTons} Tons · {s.packagesCount} {s.packageType}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-emerald-600">₹{s.declaredValueInr}</div>
                      <div className="text-[10px] text-muted-foreground">Paid (e-RR Clear)</div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-foreground">
                        {s.origin.city} → {s.destination.city}
                      </div>
                      <div className="text-[10px] text-muted-foreground">{s.destination.name}</div>
                    </td>

                    <td className="py-3 px-3 font-sans">
                      {s.status === "DELIVERED" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          Delivered & Signed
                        </span>
                      ) : s.status === "OUT_FOR_DELIVERY" ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-cyan-500/15 px-2.5 py-0.5 text-[10px] font-bold text-cyan-600 border border-cyan-500/30">
                          <Truck className="size-3" />
                          Out for Delivery
                        </span>
                      ) : s.isDelayed ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[10px] font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30">
                          <AlertTriangle className="size-3" />
                          Delayed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-[10px] font-bold text-blue-600 border border-blue-500/20">
                          <span className="size-1.5 rounded-full bg-blue-600 animate-pulse" />
                          In Transit
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-3 text-right font-sans">
                      <button
                        onClick={() => onSelectShipment(s)}
                        className={`rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                          isSelected
                            ? "bg-blue-600 text-white"
                            : "border border-border bg-surface text-foreground hover:bg-surface-2"
                        }`}
                      >
                        {isSelected ? "Selected" : "Select Order"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
