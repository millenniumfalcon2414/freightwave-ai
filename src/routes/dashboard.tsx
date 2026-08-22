import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import {
  Activity,
  Boxes,
  Brain,
  Gauge,
  Leaf,
  ShieldAlert,
  TrendingUp,
  Train,
  Truck,
  AlertTriangle,
  Zap,
  Radio,
  Search,
  Plus,
  ArrowRight,
  Filter,
  CheckCircle2,
  Clock,
  MapPin,
  Sparkles,
  Layers,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  ShieldCheck,
  Thermometer,
  SlidersHorizontal,
  Package,
  Send,
  HelpCircle,
  X,
  Share2,
  Download,
  Flame,
  FileSpreadsheet,
  FileCheck2,
  Award,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SiteNav } from "@/components/site/SiteNav";
import { SiteFooter } from "@/components/site/SiteFooter";
import { KpiCard } from "@/components/site/KpiCard";
import { AICopilot } from "@/components/site/AICopilot";
import { SimControlPanel } from "@/components/site/SimControlPanel";
import { IndiaNetwork } from "@/components/site/IndiaNetwork";
import { RealGpsMap } from "@/components/site/RealGpsMap";
import { EmergencyIncidentConsole } from "@/components/emergency/EmergencyIncidentConsole";
import { EmergencyFloatingBanner } from "@/components/emergency/EmergencyFloatingBanner";
import { useActiveIncident } from "@/lib/emergency/useEmergency";
import { emergencyStore } from "@/lib/emergency/emergencyStore";
import { useSim, simStore } from "@/lib/simulation/useSim";
import type { Shipment, Alert } from "@/lib/simulation/engine";
import { QaWorkflowHub } from "@/components/qa/QaWorkflowHub";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Consignments & Logistics Hub · RailFlow AI" },
      {
        name: "description",
        content:
          "Simple, intelligent multimodal freight command center for Indian Railways and road logistics.",
      },
    ],
  }),
  component: Dashboard,
});

const COLORS = {
  primary: "oklch(0.52 0.2 255)",
  accent: "oklch(0.55 0.15 190)",
  warn: "oklch(0.68 0.16 75)",
  success: "oklch(0.55 0.17 155)",
  muted: "oklch(0.52 0.02 245)",
};

function fmtNum(n: number) {
  if (n >= 1e9) return (n / 1e9).toFixed(2) + "B";
  if (n >= 1e6) return (n / 1e6).toFixed(2) + "M";
  if (n >= 1e3) return n.toLocaleString("en-IN");
  return n.toString();
}

function fmtEta(min: number) {
  const h = Math.floor(min / 60);
  const m = Math.floor(min % 60);
  if (h === 0) return `${m} mins`;
  return `${h}h ${String(m).padStart(2, "0")}m`;
}

function trendOf(v: number): "up" | "down" | "flat" {
  return v > 0.1 ? "up" : v < -0.1 ? "down" : "flat";
}

const CITY_NODES = [
  { id: "DEL", name: "Delhi NCR (Dadri ICD)", state: "Uttar Pradesh / NCR" },
  { id: "MUM", name: "Mumbai (JNPT Port)", state: "Maharashtra" },
  { id: "MND", name: "Mundra Port Hub", state: "Gujarat" },
  { id: "AHM", name: "Ahmedabad Logistics Park", state: "Gujarat" },
  { id: "BLR", name: "Bengaluru (Whitefield ICD)", state: "Karnataka" },
  { id: "CHE", name: "Chennai Port Terminal", state: "Tamil Nadu" },
  { id: "KOL", name: "Kolkata (Dankuni EDFC)", state: "West Bengal" },
  { id: "NAG", name: "Nagpur Multi-Modal Hub", state: "Maharashtra" },
  { id: "LDH", name: "Ludhiana Freight Terminal", state: "Punjab" },
  { id: "HYD", name: "Hyderabad Sanathnagar ICD", state: "Telangana" },
];

function Dashboard() {
  const kpis = useSim((s) => s.kpis);
  const freightTrend = useSim((s) => s.freightTrend);
  const corridorPerf = useSim((s) => s.corridorPerf);
  const costTrend = useSim((s) => s.costTrend);
  const alerts = useSim((s) => s.alerts);
  const shipments = useSim((s) => s.shipments);
  const hardware = useSim((s) => s.hardware);
  const params = useSim((s) => s.params);
  const activeIncident = useActiveIncident();

  // User interaction states
  const [activeTab, setActiveTab] = useState<
    | "emergency"
    | "gps_map"
    | "qa_workflow"
    | "shipments"
    | "map"
    | "recommendations"
    | "analytics"
    | "telemetry"
    | "controls"
  >("gps_map");
  const [mapDisplayMode, setMapDisplayMode] = useState<"satellite_gps" | "schematic_vector">(
    "satellite_gps",
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [isBookModalOpen, setIsBookModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Route calculator state for the Map/Planner tab
  const [calcOrigin, setCalcOrigin] = useState("DEL");
  const [calcDest, setCalcDest] = useState("MUM");
  const [calcWeight, setCalcWeight] = useState(24);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Filtered shipments
  const filteredShipments = useMemo(() => {
    return shipments.filter((s) => {
      const q = searchQuery.toLowerCase();
      const matchesQuery =
        !q ||
        s.id.toLowerCase().includes(q) ||
        s.corridor.toLowerCase().includes(q) ||
        s.cargo.toLowerCase().includes(q) ||
        s.status.toLowerCase().includes(q);

      if (!matchesQuery) return false;

      if (filterStatus === "all") return true;
      if (filterStatus === "rail") return s.corridor.includes("DEL") || s.corridor.includes("DFC");
      if (filterStatus === "road") return !s.corridor.includes("DFC");
      if (filterStatus === "delayed") return s.status.includes("delay");
      if (filterStatus === "rerouted") return s.status === "rerouted";
      if (filterStatus === "onschedule") return s.status === "on_schedule";
      return true;
    });
  }, [shipments, searchQuery, filterStatus]);

  // Route calculation results
  const routeCalculation = useMemo(() => {
    const isDfcCorridor =
      (calcOrigin === "DEL" && calcDest === "MUM") ||
      (calcOrigin === "MUM" && calcDest === "DEL") ||
      (calcOrigin === "DEL" && calcDest === "KOL") ||
      (calcOrigin === "KOL" && calcDest === "DEL") ||
      (calcOrigin === "AHM" && calcDest === "MND");

    const baseDistanceKm = 1400;
    const railCostPerTeu = Math.round(calcWeight * 1450 + (isDfcCorridor ? 22000 : 28000));
    const roadCostPerTeu = Math.round(calcWeight * 2600 + 39000);
    const railTimeHrs = isDfcCorridor ? 22 : 36;
    const roadTimeHrs = 42;
    const co2RailKg = Math.round(baseDistanceKm * calcWeight * 0.022);
    const co2RoadKg = Math.round(baseDistanceKm * calcWeight * 0.062);
    const costSaved = roadCostPerTeu - railCostPerTeu;
    const co2SavedPct = Math.round(((co2RoadKg - co2RailKg) / co2RoadKg) * 100);

    return {
      isDfcCorridor,
      railCostPerTeu,
      roadCostPerTeu,
      railTimeHrs,
      roadTimeHrs,
      co2RailKg,
      co2RoadKg,
      costSaved,
      co2SavedPct,
    };
  }, [calcOrigin, calcDest, calcWeight]);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      <SiteNav />

      {/* Persistent Global Emergency Crash Banner */}
      <EmergencyFloatingBanner onOpenConsole={() => setActiveTab("emergency")} />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 flex items-center gap-3 rounded-xl border border-emerald-200 bg-surface px-4 py-3 text-sm shadow-xl backdrop-blur-md animate-in fade-in slide-in-from-top-4">
          <CheckCircle2 className="size-5 text-emerald-600 shrink-0" />
          <span className="font-semibold text-foreground">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-muted-foreground hover:text-foreground ml-2"
          >
            <X className="size-4" />
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 space-y-6">
        {/* Amazon/Flipkart Style Top Welcome & Quick Actions Bar */}
        <div className="rounded-2xl border border-border/80 bg-surface p-5 sm:p-6 shadow-xs">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight sm:text-2xl">
                  👋 Welcome to Freight Central
                </span>
                <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-bold text-emerald-700">
                  ● All Systems Normal
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                Monitoring <strong>{params.fleetSize.toLocaleString("en-IN")} freight units</strong>{" "}
                across Indian Railways Dedicated Freight Corridors (Western & Eastern DFC) and
                National Expressways.
              </p>
            </div>

            {/* Quick Actions Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              <Link
                to="/cargo-portal"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-blue-500/40 bg-blue-500/10 px-4 py-2.5 text-xs sm:text-sm font-bold text-blue-700 dark:text-blue-300 shadow-xs transition hover:bg-blue-500/20 active:scale-98"
              >
                <Train className="size-4 text-blue-600 stroke-[2.5]" />
                <span>Cargo Owner Portal</span>
              </Link>
              <button
                onClick={() => setIsBookModalOpen(true)}
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-xs sm:text-sm font-bold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-98"
              >
                <Plus className="size-4 stroke-[2.5]" />
                <span>Book New Consignment</span>
              </button>
              <button
                onClick={() => {
                  simStore.step();
                  showToast("1-Click Optimization Applied: 3 Rakes consolidated, ₹48,000 saved.");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-3.5 py-2.5 text-xs sm:text-sm font-medium text-foreground hover:border-primary/50 hover:bg-surface-2 transition active:scale-98"
              >
                <Sparkles className="size-4 text-accent" />
                <span>Auto-Consolidate</span>
              </button>
              <button
                onClick={() => {
                  const csv = shipments
                    .map(
                      (s) =>
                        `${s.id},${s.corridor},${s.cargo},${s.etaMin} mins,${s.status},${s.confidence}%`,
                    )
                    .join("\n");
                  const blob = new Blob(
                    [`Shipment ID,Corridor,Cargo,ETA,Status,Confidence\n${csv}`],
                    {
                      type: "text/csv",
                    },
                  );
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `RailFlow_Manifest_${new Date().toISOString().slice(0, 10)}.csv`;
                  a.click();
                  showToast("Manifest downloaded successfully as CSV.");
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-surface px-3 py-2.5 text-xs font-medium text-muted-foreground hover:text-foreground hover:bg-surface-2 transition"
                title="Download Manifest"
              >
                <Download className="size-4" />
                <span className="hidden sm:inline">Export Manifest</span>
              </button>
            </div>
          </div>

          {/* Universal Search & Quick Filter Bar */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by Tracking ID (e.g. TRK-8921), Corridor (Delhi, Mumbai), Cargo, or Status..."
                className="w-full rounded-xl border border-border/80 bg-background/80 py-2.5 pl-10 pr-4 text-xs sm:text-sm placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hover:text-foreground"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Quick Status Chips */}
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              {[
                { id: "all", label: "All Consignments" },
                { id: "rail", label: "🚆 Rail DFC" },
                { id: "road", label: "🚛 Highway Road" },
                { id: "onschedule", label: "✅ On Schedule" },
                { id: "delayed", label: "⚠️ Delayed" },
              ].map((chip) => (
                <button
                  key={chip.id}
                  onClick={() => setFilterStatus(chip.id)}
                  className={`rounded-lg px-3 py-2 font-medium transition ${
                    filterStatus === chip.id
                      ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                      : "bg-surface/80 border border-border/60 text-muted-foreground hover:text-foreground hover:bg-surface-2"
                  }`}
                >
                  {chip.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Amazon/Flipkart Key Metrics Strip */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          <KpiCard
            label="Active Consignments"
            value={fmtNum(kpis.activeShipments)}
            delta="96.8% On-Time"
            sublabel="Live fleet moving"
            trend="up"
            icon={Boxes}
            badge="Live"
            highlight
          />
          <KpiCard
            label="Rail Freight Share"
            value={`${kpis.railUtil.toFixed(1)}%`}
            delta={`${kpis.railDelta > 0 ? "+" : ""}${kpis.railDelta} pts`}
            sublabel="Western & Eastern DFC"
            trend={trendOf(kpis.railDelta)}
            icon={Train}
          />
          <KpiCard
            label="Road Drayage Fleet"
            value={`${kpis.roadUtil.toFixed(1)}%`}
            delta="2.2h Turnaround"
            sublabel="First & last mile"
            trend="flat"
            icon={Truck}
          />
          <KpiCard
            label="Total Freight Saved"
            value={`₹${kpis.costSavingsCr.toFixed(1)} Cr`}
            delta="32% Cost Cut"
            sublabel="vs pure road trucking"
            trend="up"
            icon={TrendingUp}
          />
          <KpiCard
            label="CO₂ Carbon Avoided"
            value={`${kpis.carbonKt.toFixed(1)} kt`}
            delta="58% Cleaner"
            sublabel="~18,400 trees saved"
            trend="up"
            icon={Leaf}
          />
          <KpiCard
            label="AI Optimization Score"
            value={`${kpis.aiScore}/100`}
            delta="High Accuracy"
            sublabel="Real-time multi-modal"
            trend="up"
            icon={Brain}
          />
        </div>

        {/* Primary View Switcher Tabs (Amazon / Flipkart Navigation Structure) */}
        <div className="border-b border-border/80">
          <div className="flex space-x-2 overflow-x-auto pb-1">
            {[
              {
                id: "emergency" as const,
                label: "🚨 Emergency & Accident Response",
                badge:
                  activeIncident && activeIncident.status !== "RESOLVED"
                    ? "1 ACTIVE SOS"
                    : undefined,
                isAlert: activeIncident && activeIncident.status !== "RESOLVED",
              },
              {
                id: "gps_map" as const,
                label: "🛰️ Real GPS & Satellite Map",
                badge: "LIVE GNSS",
              },
              {
                id: "qa_workflow" as const,
                label: "🛡️ Quality Assurance & RDSO Audit",
                badge: "RDSO G-95",
              },
              {
                id: "shipments" as const,
                label: "📦 Live Consignments & Tracking",
                count: filteredShipments.length,
              },
              { id: "map" as const, label: "🗺️ India Freight Corridors & Route Estimator" },
              {
                id: "recommendations" as const,
                label: "💡 Smart AI Opportunities & Savings",
                count: 3,
              },
              { id: "analytics" as const, label: "📊 Cost & Volume Analytics" },
              { id: "telemetry" as const, label: "📡 IoT Edge Sensors & Telemetry" },
              { id: "controls" as const, label: "🎛️ Simulation Controls" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 whitespace-nowrap rounded-t-xl px-4 py-3 text-xs sm:text-sm font-semibold transition border-b-2 ${
                  activeTab === tab.id
                    ? tab.id === "emergency" && tab.isAlert
                      ? "border-red-500 text-red-500 bg-red-950/20"
                      : "border-primary text-primary bg-surface/80"
                    : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface/40"
                }`}
              >
                <span>{tab.label}</span>
                {"badge" in tab && tab.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[9px] font-bold border ${
                      tab.id === "emergency" && tab.isAlert
                        ? "bg-red-600 text-white border-red-500 animate-pulse font-black"
                        : "bg-emerald-50 text-emerald-700 border-emerald-200"
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
                {"count" in tab && tab.count !== undefined && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                      activeTab === tab.id
                        ? "bg-primary/20 text-primary"
                        : "bg-surface-2 text-muted-foreground"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* TAB: Emergency & Accident Response Matrix */}
        {activeTab === "emergency" && (
          <div className="space-y-6">
            <EmergencyIncidentConsole />
          </div>
        )}

        {/* TAB 0: Real GPS & Satellite Spatial Map */}
        {activeTab === "gps_map" && (
          <div className="space-y-6">
            <RealGpsMap />
          </div>
        )}

        {/* TAB: Quality Assurance & RDSO Inspection Workflow Portal */}
        {activeTab === "qa_workflow" && (
          <div className="space-y-6">
            <QaWorkflowHub
              onDispatchGreenCorridor={(shipmentId) => {
                showToast(
                  `Consignment ${shipmentId} certified & dispatched to Green Corridor High-Speed Rake!`,
                );
                simStore.step();
              }}
            />
          </div>
        )}

        {/* TAB 1: Live Consignments & Tracking (Amazon / Flipkart Order List Style) */}
        {activeTab === "shipments" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Active Multimodal Consignments</h2>
                <p className="text-xs text-muted-foreground">
                  Showing {filteredShipments.length} consignments with live GPS telemetry, rake
                  allocations, and step-by-step progress tracking.
                </p>
              </div>
              <button
                onClick={() => simStore.step()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-surface px-3 py-1.5 text-xs font-medium text-foreground hover:bg-surface-2"
              >
                <RefreshCw className="size-3.5 text-primary" />
                <span>Simulate Next Tick</span>
              </button>
            </div>

            {/* Shipment Cards Grid */}
            <div className="grid gap-3 sm:gap-4">
              {filteredShipments.map((shipment) => {
                const isRail =
                  shipment.corridor.includes("DEL") ||
                  shipment.corridor.includes("DFC") ||
                  shipment.corridor.includes("MUM");
                const progressStep =
                  shipment.status === "on_schedule"
                    ? shipment.etaMin > 180
                      ? 2
                      : shipment.etaMin > 60
                        ? 3
                        : 4
                    : shipment.status === "rerouted"
                      ? 3
                      : 2;

                return (
                  <div
                    key={shipment.id}
                    className="group rounded-2xl border border-border/70 bg-surface/70 p-4 sm:p-5 transition hover:border-primary/50 hover:bg-surface/90 hover:shadow-md"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      {/* Left: Main details */}
                      <div className="flex items-start gap-3.5">
                        <div
                          className={`grid size-11 shrink-0 place-items-center rounded-xl border ${
                            isRail
                              ? "border-blue-200 bg-blue-50 text-blue-700"
                              : "border-emerald-200 bg-emerald-50 text-emerald-700"
                          }`}
                        >
                          {isRail ? <Train className="size-5" /> : <Truck className="size-5" />}
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-sm font-bold text-foreground">
                              {shipment.id}
                            </span>
                            <span className="rounded-md border border-border/80 bg-surface-2 px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                              {shipment.cargo}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                                isRail
                                  ? "bg-blue-50 text-blue-700 border border-blue-200"
                                  : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                              }`}
                            >
                              {isRail ? "Dedicated Freight Corridor" : "Express Road Drayage"}
                            </span>
                          </div>

                          <div className="mt-1 flex items-center gap-2 text-xs sm:text-sm font-medium text-foreground">
                            <span className="font-semibold text-primary">{shipment.corridor}</span>
                            <span className="text-muted-foreground">•</span>
                            <span className="flex items-center gap-1 text-muted-foreground">
                              <Clock className="size-3.5" />
                              Estimated Arrival:{" "}
                              <strong className="text-foreground">{fmtEta(shipment.etaMin)}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Confidence & Actions */}
                      <div className="flex flex-wrap items-center gap-3 justify-between lg:justify-end">
                        <div className="flex items-center gap-2 rounded-xl bg-surface-2 border border-border/80 px-3 py-1.5 text-xs">
                          <span className="text-muted-foreground">AI Reliability:</span>
                          <span className="font-mono font-bold text-emerald-700">
                            {shipment.confidence}% High
                          </span>
                        </div>

                        <StatusBadge status={shipment.status} />

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedShipment(shipment)}
                            className="inline-flex items-center gap-1 rounded-lg bg-surface-2 border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:border-primary/50 hover:bg-primary/10 transition"
                          >
                            <Package className="size-3.5" />
                            <span>Track Package</span>
                          </button>
                          <button
                            onClick={() => setActiveTab("qa_workflow")}
                            className="inline-flex items-center gap-1 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-600 hover:text-white transition shadow-xs"
                            title="Launch 5-Step Guided QA & RDSO Inspection"
                          >
                            <ShieldCheck className="size-3.5" />
                            <span>QA Audit</span>
                          </button>
                          <button
                            onClick={() => {
                              showToast(
                                `AI Reroute generated for ${shipment.id}: Saved 3.5 hrs via DFC bypass.`,
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-primary/10 border border-primary/30 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary hover:text-primary-foreground transition"
                          >
                            <Sparkles className="size-3.5" />
                            <span>Optimize</span>
                          </button>
                          <button
                            onClick={() => {
                              emergencyStore.triggerAccident({
                                vehicleNumber: shipment.id,
                                vehicleType: isRail ? "rail_rake" : "heavy_truck",
                                corridor: shipment.corridor,
                                cargoDescription: `${shipment.cargo} Container (${shipment.weightTons} T)`,
                              });
                              setActiveTab("emergency");
                              showToast(
                                `🚨 SOS Accident Dispatched: 108 Ambulance called for ${shipment.id}`,
                              );
                            }}
                            className="inline-flex items-center gap-1 rounded-lg bg-red-50 border border-red-200 px-2.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-600 hover:text-white transition shadow-xs"
                            title="Simulate Accident & Dispatch Emergency Services"
                          >
                            <span>🚨 SOS</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Visual 5-Stage Amazon-style Progress Tracker */}
                    <div className="mt-4 pt-4 border-t border-border/50">
                      <div className="grid grid-cols-5 gap-1 sm:gap-2 text-center text-[10px] sm:text-xs">
                        {[
                          { step: 1, label: "1. Pickup / ICD Loading", icon: CheckCircle2 },
                          { step: 2, label: "2. Loaded on Rake", icon: Train },
                          { step: 3, label: "3. DFC Fast Haul", icon: Activity },
                          { step: 4, label: "4. Destination Drayage", icon: Truck },
                          { step: 5, label: "5. Delivered to Consignee", icon: CheckCircle2 },
                        ].map((item) => {
                          const isDone = item.step < progressStep;
                          const isCurrent = item.step === progressStep;
                          return (
                            <div key={item.step} className="flex flex-col items-center">
                              <div
                                className={`mb-1.5 grid size-6 sm:size-7 place-items-center rounded-full text-[11px] font-bold transition ${
                                  isDone
                                    ? "bg-emerald-600 text-white shadow-xs"
                                    : isCurrent
                                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20 animate-pulse"
                                      : "bg-surface-2 border border-border text-muted-foreground"
                                }`}
                              >
                                {isDone ? "✓" : item.step}
                              </div>
                              <span
                                className={`text-[10px] sm:text-xs font-medium truncate max-w-full ${
                                  isCurrent
                                    ? "font-bold text-primary"
                                    : isDone
                                      ? "text-foreground"
                                      : "text-muted-foreground"
                                }`}
                              >
                                {item.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>

                      {/* Connecting Line Progress Bar */}
                      <div className="relative mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 via-primary to-accent transition-all duration-500"
                          style={{ width: `${(progressStep / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredShipments.length === 0 && (
                <div className="rounded-2xl border border-dashed border-border p-12 text-center">
                  <Package className="mx-auto size-10 text-muted-foreground" />
                  <h3 className="mt-3 text-base font-bold">No matching consignments found</h3>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Try adjusting your search keywords or clearing your status filters.
                  </p>
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setFilterStatus("all");
                    }}
                    className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: India Freight Corridors & Route Estimator */}
        {activeTab === "map" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Interactive Route Estimator (Left 5 cols) */}
              <div className="lg:col-span-5 space-y-4">
                <div className="rounded-2xl border border-border/70 bg-surface/80 p-5 shadow-sm space-y-4">
                  <div>
                    <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                      Instant Route Cost & Carbon Estimator
                    </span>
                    <h2 className="mt-1.5 text-lg font-bold">Compare Rail vs Road</h2>
                    <p className="text-xs text-muted-foreground">
                      Select origin and destination hubs in India to calculate freight cost,
                      turnaround hours, and CO₂ savings.
                    </p>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Origin Hub (ICD / Port / Warehouse)
                      </label>
                      <select
                        value={calcOrigin}
                        onChange={(e) => setCalcOrigin(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium focus:border-primary focus:outline-none"
                      >
                        {CITY_NODES.map((city) => (
                          <option key={city.id} value={city.id} disabled={city.id === calcDest}>
                            {city.name} ({city.state})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-semibold text-muted-foreground">
                        Destination Hub
                      </label>
                      <select
                        value={calcDest}
                        onChange={(e) => setCalcDest(e.target.value)}
                        className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs sm:text-sm font-medium focus:border-primary focus:outline-none"
                      >
                        {CITY_NODES.map((city) => (
                          <option key={city.id} value={city.id} disabled={city.id === calcOrigin}>
                            {city.name} ({city.state})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-semibold">
                        <span className="text-muted-foreground">Cargo Payload Weight</span>
                        <span className="font-mono text-primary">
                          {calcWeight} Metric Tonnes (1 TEU)
                        </span>
                      </div>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        value={calcWeight}
                        onChange={(e) => setCalcWeight(Number(e.target.value))}
                        className="mt-2 w-full accent-primary"
                      />
                    </div>
                  </div>

                  {/* Estimation Comparison Cards */}
                  <div className="rounded-xl border border-border/80 bg-surface-2/70 p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span>Multi-Modal Rail DFC</span>
                      <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        RECOMMENDED
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="rounded-lg bg-surface p-2 border border-border/60">
                        <div className="text-[10px] text-muted-foreground">Estimated Cost</div>
                        <div className="mt-0.5 text-sm font-bold text-foreground">
                          ₹{routeCalculation.railCostPerTeu.toLocaleString("en-IN")}
                        </div>
                      </div>
                      <div className="rounded-lg bg-surface p-2 border border-border/60">
                        <div className="text-[10px] text-muted-foreground">Transit Time</div>
                        <div className="mt-0.5 text-sm font-bold text-primary">
                          {routeCalculation.railTimeHrs} Hours
                        </div>
                      </div>
                      <div className="rounded-lg bg-surface p-2 border border-border/60">
                        <div className="text-[10px] text-muted-foreground">CO₂ Impact</div>
                        <div className="mt-0.5 text-sm font-bold text-emerald-700">
                          -{routeCalculation.co2SavedPct}% Green
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-2.5 text-xs text-emerald-800 flex items-center gap-2">
                      <Sparkles className="size-4 shrink-0 text-emerald-600" />
                      <span>
                        Saves <strong>₹{routeCalculation.costSaved.toLocaleString("en-IN")}</strong>{" "}
                        and{" "}
                        <strong>
                          {routeCalculation.roadTimeHrs - routeCalculation.railTimeHrs} hours
                        </strong>{" "}
                        vs highway trucks!
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        setIsBookModalOpen(true);
                      }}
                      className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:brightness-110"
                    >
                      Book This Multimodal Corridor
                    </button>
                  </div>
                </div>

                {/* Corridor Live Speeds */}
                <div className="rounded-2xl border border-border/70 bg-surface/80 p-5 space-y-3">
                  <h3 className="text-sm font-bold">Dedicated Freight Corridor Speeds</h3>
                  <div className="space-y-2 text-xs">
                    {[
                      {
                        name: "Western DFC (Dadri ➔ JNPT)",
                        speed: "78 km/h",
                        status: "Optimal",
                        util: "86%",
                      },
                      {
                        name: "Eastern DFC (Ludhiana ➔ Dankuni)",
                        speed: "74 km/h",
                        status: "Optimal",
                        util: "82%",
                      },
                      {
                        name: "Golden Quadrilateral Rail Link",
                        speed: "62 km/h",
                        status: "Moderate",
                        util: "91%",
                      },
                    ].map((c) => (
                      <div
                        key={c.name}
                        className="flex items-center justify-between rounded-lg bg-surface-2 p-2.5 border border-border/60"
                      >
                        <div>
                          <div className="font-semibold text-foreground">{c.name}</div>
                          <div className="text-[10px] text-muted-foreground">
                            Capacity Utilization: {c.util}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-mono font-bold text-primary">{c.speed}</div>
                          <div className="text-[10px] font-semibold text-emerald-400">
                            {c.status}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Animated Map View (Right 7 cols) */}
              <div className="lg:col-span-7 rounded-2xl border border-border/70 bg-surface/80 p-5 shadow-sm space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold">Corridor Visualizer</h3>
                    <p className="text-xs text-muted-foreground">
                      Switch between Real Satellite Imagery & Schematic Rail Corridors
                    </p>
                  </div>
                  <div className="flex items-center rounded-xl border border-border/80 bg-surface-2 p-1 text-xs">
                    <button
                      onClick={() => setMapDisplayMode("satellite_gps")}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                        mapDisplayMode === "satellite_gps"
                          ? "bg-surface text-primary shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🛰️ Real Satellite GPS
                    </button>
                    <button
                      onClick={() => setMapDisplayMode("schematic_vector")}
                      className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                        mapDisplayMode === "schematic_vector"
                          ? "bg-surface text-primary shadow-xs font-bold"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      🗺️ Schematic Twin
                    </button>
                  </div>
                </div>

                <div className="min-h-[520px] w-full rounded-xl overflow-hidden border border-border/60">
                  {mapDisplayMode === "satellite_gps" ? <RealGpsMap /> : <IndiaNetwork />}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Smart AI Opportunities & Savings (Amazon-style Opportunity Center) */}
        {activeTab === "recommendations" && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold">
                Active Logistics Opportunities & AI Recommendations
              </h2>
              <p className="text-xs text-muted-foreground">
                Automated high-margin suggestions to lower freight tariffs, aggregate LCL cargo, and
                bypass highway bottlenecks.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  id: "REC-1",
                  title: "Consolidate 3 Dadri LCL Shipments",
                  badge: "₹42,000 Potential Savings",
                  badgeColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
                  desc: "Three partial containers heading to Mundra Port can be pooled into 1 dedicated block rake leaving at 21:30.",
                  action: "Auto-Consolidate Rake",
                  impact: "Cuts 2 road trips & saves 340 kg CO₂",
                },
                {
                  id: "REC-2",
                  title: "Shift 14 Mumbai Containers to Western DFC",
                  badge: "18 Hours Faster Transit",
                  badgeColor: "text-blue-700 bg-blue-50 border-blue-200",
                  desc: "Western DFC slot opened up for Dadri-JNPT sector. Switching from NH48 road transport reduces transit time by 48%.",
                  action: "Switch to Rail Rake",
                  impact: "Avoids 3 highway toll delays",
                },
                {
                  id: "REC-3",
                  title: "Pre-emptive Monsoon Reroute near Konkan",
                  badge: "Prevents 8h Demurrage",
                  badgeColor: "text-amber-700 bg-amber-50 border-amber-200",
                  desc: "Weather radar indicates heavy precipitation on coastal road stretch. Central Railway electrified route cleared for seamless bypass.",
                  action: "Apply Safety Reroute",
                  impact: "Zero penalty risk on delivery SLA",
                },
              ].map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-col justify-between rounded-2xl border border-border/80 bg-surface/80 p-5 transition hover:border-primary/50 hover:shadow-md"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs font-bold text-muted-foreground">
                        {rec.id}
                      </span>
                      <span
                        className={`rounded-md border px-2 py-0.5 text-xs font-bold ${rec.badgeColor}`}
                      >
                        {rec.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-foreground">{rec.title}</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{rec.desc}</p>
                    <div className="rounded-lg bg-surface-2 p-2.5 text-xs font-medium text-primary">
                      ✓ Impact: {rec.impact}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-border/50">
                    <button
                      onClick={() => {
                        simStore.step();
                        showToast(`Applied ${rec.title}! Network state updated.`);
                      }}
                      className="w-full rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:brightness-110 active:scale-98"
                    >
                      {rec.action}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: Cost & Volume Analytics */}
        {activeTab === "analytics" && (
          <div className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              {/* Freight Volume by Mode */}
              <div className="rounded-2xl border border-border/70 bg-surface/80 p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold">Freight Volume by Transport Mode</h3>
                  <p className="text-xs text-muted-foreground">
                    Tonnes transported daily (in thousands)
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart
                    data={freightTrend}
                    margin={{ top: 10, right: 8, left: -20, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="gRail" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.primary} stopOpacity={0.6} />
                        <stop offset="100%" stopColor={COLORS.primary} stopOpacity={0.05} />
                      </linearGradient>
                      <linearGradient id="gRoad" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="0%" stopColor={COLORS.accent} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={COLORS.accent} stopOpacity={0.05} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="oklch(0.88 0.01 240 / 0.8)" vertical={false} />
                    <XAxis
                      dataKey="d"
                      stroke={COLORS.muted}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Area
                      type="monotone"
                      dataKey="rail"
                      name="Rail Freight (DFC)"
                      stroke={COLORS.primary}
                      fill="url(#gRail)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="road"
                      name="Road Drayage"
                      stroke={COLORS.accent}
                      fill="url(#gRoad)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Cost & Savings Trend */}
              <div className="rounded-2xl border border-border/70 bg-surface/80 p-5 shadow-sm space-y-4">
                <div>
                  <h3 className="text-base font-bold">Monthly Logistics Cost vs Savings</h3>
                  <p className="text-xs text-muted-foreground">
                    In ₹ Crores (Cr) comparing highway haulage against multimodal rail
                  </p>
                </div>
                <ResponsiveContainer width="100%" height={260}>
                  <LineChart data={costTrend} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                    <CartesianGrid stroke="oklch(0.88 0.01 240 / 0.8)" vertical={false} />
                    <XAxis
                      dataKey="m"
                      stroke={COLORS.muted}
                      fontSize={11}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip content={<ChartTip />} />
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Line
                      type="monotone"
                      dataKey="cost"
                      name="Net Cost (₹ Cr)"
                      stroke={COLORS.accent}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="saved"
                      name="Savings (₹ Cr)"
                      stroke={COLORS.primary}
                      strokeWidth={2.5}
                      dot={{ r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Corridor Utilization Bar Chart */}
            <div className="rounded-2xl border border-border/70 bg-surface/80 p-5 shadow-sm space-y-4">
              <h3 className="text-base font-bold">
                Major Indian Corridor Capacity Utilization (%)
              </h3>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={corridorPerf} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid stroke="oklch(0.88 0.01 240 / 0.8)" vertical={false} />
                  <XAxis
                    dataKey="c"
                    stroke={COLORS.muted}
                    fontSize={11}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke={COLORS.muted} fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip content={<ChartTip />} />
                  <Bar dataKey="util" name="Capacity Util %" radius={[6, 6, 0, 0]}>
                    {corridorPerf.map((c, i) => (
                      <Cell
                        key={i}
                        fill={
                          c.util > 90 ? COLORS.primary : c.util > 80 ? COLORS.accent : COLORS.warn
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* TAB 5: IoT Edge Sensors & Telemetry */}
        {activeTab === "telemetry" && (
          <div className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border border-border/80 bg-surface p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                    <Radio className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">
                      Active GPS Nodes
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {hardware.gpsNodes.toLocaleString("en-IN")}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs font-bold text-emerald-700">
                  ● 99.8% Uplink Connectivity
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200">
                    <Zap className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">
                      Fuel Sensor Health
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {hardware.fuelHealthy.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs font-bold text-emerald-700">
                  ● Nominal Battery Levels
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-amber-50 text-amber-700 border border-amber-200">
                    <AlertTriangle className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">
                      Shock Alerts (24h)
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {hardware.shockEvents24h}
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs font-medium text-muted-foreground">
                  All containers secured
                </div>
              </div>

              <div className="rounded-2xl border border-border/80 bg-surface p-5">
                <div className="flex items-center gap-3">
                  <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-primary border border-blue-200">
                    <Activity className="size-5" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-muted-foreground">
                      MQTT Message Pipe
                    </div>
                    <div className="text-xl font-bold text-foreground">
                      {(hardware.mqttRate / 1000).toFixed(1)}k msg/s
                    </div>
                  </div>
                </div>
                <div className="mt-3 text-xs font-bold text-primary">Zero packet loss</div>
              </div>
            </div>

            {/* Critical Alerts Stream */}
            <div className="rounded-2xl border border-border/70 bg-surface/80 p-5 space-y-3">
              <h3 className="text-base font-bold">Real-Time Operational Alerts</h3>
              <div className="space-y-2">
                {alerts.map((a) => (
                  <div
                    key={a.id}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-surface-2 p-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold uppercase ${
                          a.sev === "critical"
                            ? "bg-rose-500/20 text-rose-400"
                            : a.sev === "high"
                              ? "bg-amber-500/20 text-amber-400"
                              : "bg-sky-500/20 text-sky-400"
                        }`}
                      >
                        {a.sev}
                      </span>
                      <span className="font-semibold text-foreground">{a.msg}</span>
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground font-mono">
                      <span>Hub: {a.node}</span>
                      <span>{a.t}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 6: Simulation Controls */}
        {activeTab === "controls" && (
          <div className="rounded-2xl border border-border/70 bg-surface/80 p-6 space-y-6">
            <div>
              <h2 className="text-lg font-bold">Operations Simulation & Stress Testing</h2>
              <p className="text-xs text-muted-foreground">
                Tweak parameters to model peak festival seasons, fuel price hikes, and severe
                weather disruptions across India.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary">Quick Scenario Presets</h3>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {[
                    {
                      label: "🎉 Festive Surge (+50% Demand)",
                      fn: () => {
                        simStore.setParam("demandMultiplier", 1.5);
                        simStore.setParam("fleetSize", 2100);
                        showToast("Preset Applied: Festive Season Surge Mode.");
                      },
                    },
                    {
                      label: "🌧️ Monsoon Disruption",
                      fn: () => {
                        simStore.setParam("weatherSeverity", 75);
                        simStore.setParam("disruptionLevel", 60);
                        showToast("Preset Applied: Severe Monsoon Disruptions.");
                      },
                    },
                    {
                      label: "⛽ Diesel Fuel Price Hike (₹140)",
                      fn: () => {
                        simStore.setParam("fuelPriceIndex", 140);
                        simStore.setParam("railShareTarget", 80);
                        showToast("Preset Applied: High Fuel Cost (Promotes Rail).");
                      },
                    },
                    {
                      label: "🌱 Zero-Carbon Push",
                      fn: () => {
                        simStore.setParam("carbonFocus", 95);
                        simStore.setParam("railShareTarget", 85);
                        showToast("Preset Applied: Maximum Sustainability Mode.");
                      },
                    },
                  ].map((p, i) => (
                    <button
                      key={i}
                      onClick={p.fn}
                      className="rounded-xl border border-border bg-surface-2 p-3 text-left font-medium hover:border-primary/50 hover:bg-surface transition"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary">Engine Controls</h3>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => simStore.setParam("running", !params.running)}
                    className="flex-1 rounded-xl bg-primary py-2.5 text-xs font-bold text-primary-foreground shadow-md transition hover:brightness-110"
                  >
                    {params.running ? "⏸ Pause Live Simulation" : "▶ Resume Simulation"}
                  </button>
                  <button
                    onClick={() => simStore.step()}
                    className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-surface"
                  >
                    Step 1 Tick
                  </button>
                  <button
                    onClick={() => simStore.reseed()}
                    className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-xs font-semibold text-foreground hover:bg-surface"
                  >
                    Reset
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Book New Consignment Modal (Amazon-style Multi-step Form) */}
      {isBookModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface-2 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold uppercase text-primary">
                  Fast Consignment Booking
                </span>
                <h3 className="text-lg font-bold text-foreground">
                  Book New Multimodal Consignment
                </h3>
              </div>
              <button
                onClick={() => setIsBookModalOpen(false)}
                className="grid size-8 place-items-center rounded-lg hover:bg-surface text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                setIsBookModalOpen(false);
                simStore.step();
                showToast(
                  `Consignment booked successfully! Allocated to Western DFC freight rake.`,
                );
              }}
              className="space-y-4 text-xs"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">Origin Hub</label>
                  <select className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none">
                    <option>Delhi NCR (Dadri ICD)</option>
                    <option>Ludhiana Freight Terminal</option>
                    <option>Ahmedabad Logistics Park</option>
                    <option>Bengaluru (Whitefield ICD)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">
                    Destination Port / Hub
                  </label>
                  <select className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none">
                    <option>Mumbai (JNPT Port)</option>
                    <option>Mundra Port Hub</option>
                    <option>Chennai Port Terminal</option>
                    <option>Kolkata (Dankuni EDFC)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-muted-foreground">
                    Cargo Commodity Type
                  </label>
                  <select className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none">
                    <option>Automotive Components</option>
                    <option>Electronics & Consumer Goods</option>
                    <option>Industrial Steel & Metal</option>
                    <option>FMCG & Packaged Retail</option>
                    <option>Pharmaceuticals (Cold Chain)</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-muted-foreground">
                    Container Load (TEU)
                  </label>
                  <input
                    type="number"
                    defaultValue={2}
                    min={1}
                    max={50}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-xs font-medium focus:border-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-emerald-800">
                <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                  <Sparkles className="size-3.5 text-emerald-600" /> AI Recommended Mode: DFC
                  Electrified Rail
                </div>
                <div className="mt-1 text-[11px] text-emerald-700">
                  Estimated Tariff: <strong>₹48,500 / TEU</strong> · Transit:{" "}
                  <strong>22 hours</strong> · Estimated CO₂ savings: <strong>62%</strong>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  type="button"
                  onClick={() => setIsBookModalOpen(false)}
                  className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-surface"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground shadow-md transition hover:brightness-110"
                >
                  Confirm & Dispatch Consignment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Track Shipment Modal (Amazon Package Inspector Style) */}
      {selectedShipment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div>
                <span className="font-mono text-xs font-bold text-primary">LIVE TRACKING</span>
                <h3 className="text-lg font-bold text-foreground">{selectedShipment.id}</h3>
              </div>
              <button
                onClick={() => setSelectedShipment(null)}
                className="grid size-8 place-items-center rounded-lg hover:bg-surface-2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3 rounded-xl bg-surface p-3 border border-border/60">
                <div>
                  <span className="text-muted-foreground">Corridor:</span>
                  <div className="font-bold text-foreground">{selectedShipment.corridor}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Cargo:</span>
                  <div className="font-bold text-foreground">{selectedShipment.cargo}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Estimated Arrival:</span>
                  <div className="font-bold text-primary">{fmtEta(selectedShipment.etaMin)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">AI Status:</span>
                  <div>
                    <StatusBadge status={selectedShipment.status} />
                  </div>
                </div>
              </div>

              {/* Detailed Tracking Milestone Feed */}
              <div>
                <h4 className="font-bold text-foreground mb-2">Live Milestones</h4>
                <div className="space-y-2 border-l-2 border-primary/40 pl-3 ml-1">
                  <div className="relative">
                    <div className="font-semibold text-foreground">
                      Departed Rewari Freight Interchange
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Western DFC High-Speed Section · 78 km/h
                    </div>
                  </div>
                  <div className="relative">
                    <div className="font-semibold text-muted-foreground">
                      Rake Container Scanning Passed
                    </div>
                    <div className="text-[11px] text-muted-foreground">
                      Dadri ICD Security Checkpoint · Completed
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-border/60">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText?.(
                      `https://railflow.ai/track/${selectedShipment.id}`,
                    );
                    showToast("Tracking link copied to clipboard!");
                  }}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-surface px-4 py-2 font-semibold hover:bg-surface-2"
                >
                  <Share2 className="size-3.5" />
                  <span>Share Tracking</span>
                </button>
                <button
                  onClick={() => setSelectedShipment(null)}
                  className="rounded-xl bg-primary px-5 py-2 font-bold text-primary-foreground"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating Docked AI Copilot */}
      <AICopilot />
      <SimControlPanel />
      <SiteFooter />
    </div>
  );
}

function StatusBadge({ status }: { status: Shipment["status"] }) {
  if (status === "on_schedule") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700">
        <CheckCircle2 className="size-3" /> On Schedule
      </span>
    );
  }
  if (status === "delay_20m") {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-0.5 text-[11px] font-bold text-amber-700">
        <Clock className="size-3" /> Minor Delay
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-[11px] font-bold text-blue-700">
      <RefreshCw className="size-3" /> AI Rerouted
    </span>
  );
}

interface ChartPayloadItem {
  dataKey?: string | number;
  color?: string;
  value?: string | number;
  name?: string;
}

interface ChartTipProps {
  active?: boolean;
  payload?: ChartPayloadItem[];
  label?: string | number;
}

function ChartTip({ active, payload, label }: ChartTipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-background/95 px-3 py-2.5 text-xs shadow-xl backdrop-blur-md">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground mb-1">
        {label}
      </div>
      {payload.map((p) => (
        <div
          key={String(p.dataKey || p.name)}
          className="flex items-center justify-between gap-4 py-0.5"
        >
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground">{p.name || p.dataKey}:</span>
          </div>
          <span className="font-mono font-bold text-foreground">{p.value}</span>
        </div>
      ))}
    </div>
  );
}
