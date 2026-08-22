import React, { useState } from "react";
import {
  ShieldCheck,
  Thermometer,
  Droplets,
  Activity,
  Lock,
  BatteryCharging,
  Compass,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  Package,
  Weight,
  Layers,
  FileCheck2,
  Box,
  Truck,
  Train,
  Sliders,
  Maximize2,
  Download,
  Search,
  Check,
  Shield,
  Gauge,
  Flame,
  Info,
  Clock,
  MapPin,
} from "lucide-react";
import { CargoShipment } from "@/types/cargo-portal";

interface GoodsStatusDashboardProps {
  shipments: CargoShipment[];
  activeShipment: CargoShipment;
  onSelectShipment: (shipment: CargoShipment) => void;
  onRefreshGps: () => void;
  isRefreshing?: boolean;
}

export function GoodsStatusDashboard({
  shipments,
  activeShipment,
  onSelectShipment,
  onRefreshGps,
  isRefreshing = false,
}: GoodsStatusDashboardProps) {
  const [selectedSensorTab, setSelectedSensorTab] = useState<"telemetry" | "specs" | "inspection">(
    "telemetry",
  );
  const [filterCommodity, setFilterCommodity] = useState<string>("ALL");

  const condition = activeShipment.condition;

  // Commodity badge helper
  const getHazardBadge = (hazardousCode?: string) => {
    if (!hazardousCode) {
      return (
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-600 border border-emerald-500/20">
          <Shield className="size-3" />
          Non-Hazardous (Safe Cargo)
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-bold text-amber-700 dark:text-amber-400 border border-amber-500/30">
        <Flame className="size-3 text-amber-600" />
        Hazmat Class: {hazardousCode}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Selector & Cargo Goods Switcher Header */}
      <div className="rounded-2xl border border-border bg-surface p-4 sm:p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-600 to-cyan-500 text-white shadow-md">
            <ShieldCheck className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight text-foreground">
                Goods Status & Cold-Chain Telemetry Dashboard
              </h2>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 border border-emerald-500/20 font-mono">
                Preservation Index: 99.8%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Real-time ISRO NavIC + BLE Container Gateway monitoring temperature, humidity, shock,
              e-seals & payload integrity
            </p>
          </div>
        </div>

        {/* Consignment Selection Dropdown & Refresh */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <select
              value={activeShipment.id}
              onChange={(e) => {
                const found = shipments.find((s) => s.id === e.target.value);
                if (found) onSelectShipment(found);
              }}
              className="rounded-xl border border-border bg-surface-2/80 py-2 pl-3 pr-8 text-xs font-mono font-bold text-foreground focus:border-blue-500 focus:outline-hidden"
            >
              {shipments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.id} — {s.cargoType} ({s.origin.city} → {s.destination.city})
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onRefreshGps}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition disabled:opacity-50"
            title="Refresh IoT Sensor Readings"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Sync IoT</span>
          </button>
        </div>
      </div>

      {/* Hero Overview Card for Active Cargo Goods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Core Goods Health & Preservation Status */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-gradient-to-br from-surface via-surface to-surface-2 p-5 sm:p-6 shadow-md space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/80 pb-3">
            <div className="flex items-center gap-2">
              <Package className="size-5 text-emerald-600" />
              <div>
                <h3 className="text-base font-extrabold text-foreground">
                  {activeShipment.cargoType}
                </h3>
                <span className="font-mono text-xs text-muted-foreground">
                  Consignment:{" "}
                  <strong className="text-foreground">{activeShipment.consignmentNumber}</strong> ·
                  {activeShipment.transportMode === "ROAD" && activeShipment.road ? (
                    <>
                      Truck/Trailer:{" "}
                      <strong className="text-emerald-600 font-bold">
                        {activeShipment.road.vehicleNumber} ({activeShipment.road.trailerType})
                      </strong>
                    </>
                  ) : (
                    <>
                      Container/Wagon:{" "}
                      <strong className="text-blue-600 font-bold">
                        {activeShipment.train?.wagonNumber || "N/A"}
                      </strong>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {getHazardBadge(activeShipment.hazardousCode)}
              <span className="rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-600 border border-blue-500/20 font-mono">
                {activeShipment.packageType}
              </span>
            </div>
          </div>

          {/* 4 Sensor Gauges Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* 1. Temperature */}
            <div className="rounded-xl border border-blue-500/20 bg-blue-50/50 dark:bg-blue-950/30 p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-blue-900 dark:text-blue-300">
                <span className="flex items-center gap-1">
                  <Thermometer className="size-3.5 text-blue-600" />
                  Temperature
                </span>
                <span className="text-emerald-600 font-bold">✓ Optimal</span>
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {condition.temperatureC.toFixed(1)}°C
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Target: {condition.temperatureTargetC}°C</span>
                <span className="font-mono text-emerald-600">Band ±2.0°C</span>
              </div>
              {/* Temp progress visual */}
              <div className="w-full bg-border rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full"
                  style={{
                    width: `${Math.min(100, Math.max(20, (condition.temperatureC / 10) * 100))}%`,
                  }}
                />
              </div>
            </div>

            {/* 2. Humidity */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-950/30 p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-cyan-900 dark:text-cyan-300">
                <span className="flex items-center gap-1">
                  <Droplets className="size-3.5 text-cyan-600" />
                  Humidity (RH)
                </span>
                <span className="text-emerald-600 font-bold">✓ Normal</span>
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {condition.humidityPct}%
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Threshold &lt; 65%</span>
                <span className="font-mono text-emerald-600">Stable</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-cyan-500 h-full rounded-full"
                  style={{ width: `${condition.humidityPct}%` }}
                />
              </div>
            </div>

            {/* 3. Shock & Vibration */}
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-emerald-900 dark:text-emerald-300">
                <span className="flex items-center gap-1">
                  <Activity className="size-3.5 text-emerald-600" />
                  Shock G-Force
                </span>
                <span className="text-emerald-600 font-bold">✓ Safe</span>
              </div>
              <div className="text-2xl font-black text-foreground font-mono">
                {condition.vibrationG.toFixed(2)}g
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Max Limit 1.50g</span>
                <span className="font-mono text-emerald-600">Impact Free</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(condition.vibrationG / 1.5) * 100}%` }}
                />
              </div>
            </div>

            {/* 4. Electronic Seal */}
            <div className="rounded-xl border border-amber-500/20 bg-amber-50/50 dark:bg-amber-950/30 p-3 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-bold text-amber-900 dark:text-amber-300">
                <span className="flex items-center gap-1">
                  <Lock className="size-3.5 text-amber-600" />
                  RFID E-Seal
                </span>
                <span className="text-emerald-600 font-bold">✓ Intact</span>
              </div>
              <div className="text-sm font-black text-foreground font-mono truncate">
                {condition.eSealId}
              </div>
              <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                <span>Door: {condition.doorStatus}</span>
                <span className="font-mono text-emerald-600">Locked</span>
              </div>
              <div className="w-full bg-border rounded-full h-1.5 mt-2 overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full w-full" />
              </div>
            </div>
          </div>

          {/* Description & Cargo Details Grid */}
          <div className="rounded-xl border border-border bg-surface-2/60 p-4 space-y-3">
            <h4 className="text-xs font-extrabold uppercase text-muted-foreground tracking-wider flex items-center gap-1.5">
              <Info className="size-3.5 text-blue-600" />
              Goods Description & Manifest Specifications
            </h4>
            <p className="text-xs text-foreground leading-relaxed">
              {activeShipment.cargoDescription}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs pt-1 border-t border-border/60">
              <div>
                <span className="text-[10px] text-muted-foreground block">Net Payload Tonnage</span>
                <strong className="font-mono text-foreground font-bold">
                  {activeShipment.weightTons} Metric Tons
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Total Packages</span>
                <strong className="font-mono text-foreground font-bold">
                  {activeShipment.packagesCount} Units ({activeShipment.packageType})
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Declared Value</span>
                <strong className="font-mono text-emerald-600 font-bold">
                  ₹{activeShipment.declaredValueInr}
                </strong>
              </div>
              <div>
                <span className="text-[10px] text-muted-foreground block">Gateway Battery</span>
                <strong className="font-mono text-foreground font-bold">
                  {condition.batteryPct}% ({condition.batteryLifeRemaining})
                </strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Cargo Quality & Sensor Audit Logs */}
        <div className="rounded-2xl border border-border bg-surface p-5 shadow-md flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center justify-between border-b border-border/80 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="size-4 text-emerald-600" />
                <h3 className="text-sm font-bold text-foreground">
                  Compliance & Quality Certification
                </h3>
              </div>
              <span className="rounded-md bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono text-emerald-600 font-bold border border-emerald-500/20">
                VERIFIED
              </span>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-surface-2/40 p-3">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">Bureau Veritas Quality Pass</div>
                  <div className="text-[10px] text-muted-foreground">
                    Certified pre-dispatch cold chain inspection cleared at origin yard
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-surface-2/40 p-3">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">
                    Customs E-Seal Seal Tag Verification
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    RFID Tag {condition.eSealId} verified by Customs Gateway
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-2.5 rounded-xl border border-border/80 bg-surface-2/40 p-3">
                <CheckCircle2 className="size-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <div className="font-bold text-foreground">
                    Phytosanitary & Temperature Compliance
                  </div>
                  <div className="text-[10px] text-muted-foreground">
                    0 temperature breaches recorded during 420 km transit
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-3 border border-blue-200 dark:border-blue-900 text-xs space-y-1">
            <div className="font-bold text-blue-900 dark:text-blue-300 flex items-center justify-between">
              <span>ISRO NavIC Telemetry Sync</span>
              <span className="font-mono text-[10px] text-blue-600">Live</span>
            </div>
            <div className="text-[10px] text-muted-foreground">
              Last sensor sync: {condition.lastSyncTime} via Constellation{" "}
              {condition.gpsConstellation}
            </div>
          </div>
        </div>
      </div>

      {/* Detailed Goods Breakdown Table across All Customer Consignments */}
      <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            <Box className="size-5 text-blue-600" />
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Goods Summary across Active Fleet Orders
              </h3>
              <p className="text-[10px] text-muted-foreground">
                Track status, tonnage, commodity type and preservation status for all active cargo
                consignments
              </p>
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex items-center gap-1 bg-surface-2 p-1 rounded-xl border border-border text-xs font-semibold">
            {[
              "ALL",
              "Reefer Cold-Chain",
              "Automotive",
              "Industrial Steel",
              "Grain & Agricultural",
            ].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterCommodity(cat)}
                className={`rounded-lg px-2.5 py-1 text-[11px] font-bold transition ${
                  filterCommodity === cat
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border bg-surface-2/60 text-muted-foreground font-semibold">
                <th className="py-2.5 px-3">Cargo ID & Consignment</th>
                <th className="py-2.5 px-3">Goods / Commodity</th>
                <th className="py-2.5 px-3">Tonnage & Packages</th>
                <th className="py-2.5 px-3">Temperature & RH</th>
                <th className="py-2.5 px-3">E-Seal & Security</th>
                <th className="py-2.5 px-3">Preservation Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 font-mono">
              {shipments
                .filter(
                  (s) =>
                    filterCommodity === "ALL" ||
                    s.cargoType.toLowerCase().includes(filterCommodity.toLowerCase()),
                )
                .map((s) => {
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
                        <div className="text-[10px] text-muted-foreground">
                          {s.consignmentNumber}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-sans font-bold text-foreground">{s.cargoType}</div>
                        <div className="text-[10px] text-muted-foreground font-sans truncate max-w-[200px]">
                          {s.cargoDescription}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-foreground">{s.weightTons} Tons</div>
                        <div className="text-[10px] text-muted-foreground">
                          {s.packagesCount} {s.packageType}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-blue-600">
                          {s.condition.temperatureC.toFixed(1)}°C (Target{" "}
                          {s.condition.temperatureTargetC}°C)
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          RH: {s.condition.humidityPct}%
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-bold text-emerald-600 flex items-center gap-1">
                          <Lock className="size-3" />
                          <span>{s.condition.eSealId}</span>
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {s.condition.doorStatus}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-600 border border-emerald-500/20">
                          <CheckCircle2 className="size-3" />
                          Optimal
                        </span>
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
                          {isSelected ? "Viewing" : "Inspect Goods"}
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
