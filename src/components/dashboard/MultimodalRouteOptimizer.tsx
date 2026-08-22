import { useState, useMemo } from "react";
import {
  Train,
  Truck,
  Boxes,
  Sparkles,
  ArrowRight,
  TrendingDown,
  Clock,
  Leaf,
  CheckCircle2,
  DollarSign,
  ShieldCheck,
  Sliders,
  RotateCcw,
  Zap,
  MapPin,
  Package,
  Layers,
  Fuel,
  ChevronRight,
  Send,
  Info,
} from "lucide-react";
import { simStore } from "@/lib/simulation/useSim";

export interface HubNode {
  id: string;
  name: string;
  city: string;
  state: string;
  hasDfc: boolean;
  lat: number;
  lng: number;
}

export const FREIGHT_HUBS: HubNode[] = [
  {
    id: "DEL",
    name: "Delhi NCR (Dadri ICD Hub)",
    city: "Delhi / Greater Noida",
    state: "NCR / UP",
    hasDfc: true,
    lat: 28.5355,
    lng: 77.5542,
  },
  {
    id: "MUM",
    name: "Mumbai (JNPT Port & Navi Mumbai)",
    city: "Mumbai",
    state: "Maharashtra",
    hasDfc: true,
    lat: 18.9499,
    lng: 72.9515,
  },
  {
    id: "MND",
    name: "Mundra Port Logistics SEZ",
    city: "Mundra / Kutch",
    state: "Gujarat",
    hasDfc: true,
    lat: 22.8396,
    lng: 69.7042,
  },
  {
    id: "AHM",
    name: "Ahmedabad Multimodal Logistics Park",
    city: "Ahmedabad / Sanand",
    state: "Gujarat",
    hasDfc: true,
    lat: 23.0225,
    lng: 72.5714,
  },
  {
    id: "BLR",
    name: "Bengaluru (Whitefield ICD)",
    city: "Bengaluru",
    state: "Karnataka",
    hasDfc: false,
    lat: 12.9716,
    lng: 77.5946,
  },
  {
    id: "CHE",
    name: "Chennai Port & Tondiarpet ICD",
    city: "Chennai",
    state: "Tamil Nadu",
    hasDfc: false,
    lat: 13.0827,
    lng: 80.2707,
  },
  {
    id: "KOL",
    name: "Kolkata (Dankuni EDFC Terminal)",
    city: "Kolkata",
    state: "West Bengal",
    hasDfc: true,
    lat: 22.5726,
    lng: 88.3639,
  },
  {
    id: "NAG",
    name: "Nagpur Multi-Modal Mihan Hub",
    city: "Nagpur",
    state: "Maharashtra",
    hasDfc: true,
    lat: 21.1458,
    lng: 79.0882,
  },
  {
    id: "LDH",
    name: "Ludhiana Sahnewal Freight Terminal",
    city: "Ludhiana",
    state: "Punjab",
    hasDfc: true,
    lat: 30.901,
    lng: 75.8573,
  },
  {
    id: "HYD",
    name: "Hyderabad Sanathnagar ICD",
    city: "Hyderabad",
    state: "Telangana",
    hasDfc: false,
    lat: 17.385,
    lng: 78.4867,
  },
  {
    id: "PUN",
    name: "Pune Chakan Automotive Cluster",
    city: "Pune",
    state: "Maharashtra",
    hasDfc: false,
    lat: 18.5204,
    lng: 73.8567,
  },
  {
    id: "JAI",
    name: "Jaipur Kanakpura Inland Terminal",
    city: "Jaipur",
    state: "Rajasthan",
    hasDfc: true,
    lat: 26.9124,
    lng: 75.7873,
  },
];

export const CARGO_CATEGORIES = [
  {
    id: "fmcg",
    name: "Packaged FMCG & Retail Goods",
    density: "medium",
    defaultRailShare: 70,
    icon: Package,
  },
  {
    id: "auto",
    name: "Automotive Parts & Finished Vehicles",
    density: "high",
    defaultRailShare: 85,
    icon: Boxes,
  },
  {
    id: "steel",
    name: "Heavy Industrial Steel & Minerals",
    density: "heavy",
    defaultRailShare: 95,
    icon: Layers,
  },
  {
    id: "cold",
    name: "Perishable Food & Cold Chain",
    density: "light",
    defaultRailShare: 40,
    icon: Zap,
  },
  {
    id: "ecom",
    name: "Express E-Commerce Parcels",
    density: "light",
    defaultRailShare: 30,
    icon: Sparkles,
  },
  {
    id: "chem",
    name: "Chemicals & Liquid Cargo",
    density: "heavy",
    defaultRailShare: 80,
    icon: Fuel,
  },
];

interface MultimodalRouteOptimizerProps {
  onConsignmentDispatched?: (details: string) => void;
}

export function MultimodalRouteOptimizer({
  onConsignmentDispatched,
}: MultimodalRouteOptimizerProps) {
  // 1. User Defined Inputs
  const [originId, setOriginId] = useState("DEL");
  const [destId, setDestId] = useState("MUM");
  const [cargoType, setCargoType] = useState("fmcg");
  const [tonnage, setTonnage] = useState(1200); // Metric Tonnes
  const [priority, setPriority] = useState<"balanced" | "cost_green" | "urgent_speed">("balanced");
  const [maxHours, setMaxHours] = useState(36);
  const [customSplitRail, setCustomSplitRail] = useState<number | null>(null);
  const [isDispatched, setIsDispatched] = useState(false);

  // Lookup objects
  const originNode = FREIGHT_HUBS.find((h) => h.id === originId) || FREIGHT_HUBS[0];
  const destNode = FREIGHT_HUBS.find((h) => h.id === destId) || FREIGHT_HUBS[1];
  const cargoInfo = CARGO_CATEGORIES.find((c) => c.id === cargoType) || CARGO_CATEGORIES[0];

  // Approximate distance calculation
  const distanceKm = useMemo(() => {
    const latDiff = Math.abs(originNode.lat - destNode.lat);
    const lngDiff = Math.abs(originNode.lng - destNode.lng);
    const approxKm = Math.round(Math.sqrt(latDiff * latDiff + lngDiff * lngDiff) * 111 * 1.25);
    return Math.max(approxKm, 350);
  }, [originNode, destNode]);

  // Is DFC corridor available on this route?
  const hasDfcLink = originNode.hasDfc && destNode.hasDfc;

  // AI Recommended Default Rail Percentage
  const aiRecommendedRailPct = useMemo(() => {
    if (priority === "urgent_speed") {
      return distanceKm > 1000 && hasDfcLink ? 45 : 20;
    }
    if (priority === "cost_green") {
      return distanceKm > 500 ? 90 : 75;
    }
    // Balanced
    let base = cargoInfo.defaultRailShare;
    if (hasDfcLink) base += 10;
    if (distanceKm > 1000) base += 10;
    if (distanceKm < 500) base -= 20;
    return Math.min(Math.max(base, 15), 90);
  }, [priority, distanceKm, hasDfcLink, cargoInfo]);

  // Active rail split percentage (user customized or AI recommended)
  const activeRailPct = customSplitRail !== null ? customSplitRail : aiRecommendedRailPct;
  const activeRoadPct = 100 - activeRailPct;

  // Cargo Distribution Breakdown
  const distribution = useMemo(() => {
    // 100% Rail metrics
    const railTonnesAll = tonnage;
    const railRakesAll = Math.ceil(railTonnesAll / 2400); // 1 rake ~ 2400 tonnes (90 TEU)
    const railRatePerTonKm = hasDfcLink ? 1.35 : 1.65;
    const railBaseCostAll = Math.round(distanceKm * railTonnesAll * railRatePerTonKm);
    const railTerminalHandlingAll = railTonnesAll * 250;
    const railTotalCostAll = railBaseCostAll + railTerminalHandlingAll;
    const railSpeedKmh = hasDfcLink ? 75 : 50;
    const railTransitHoursAll = Math.round(distanceKm / railSpeedKmh + 6); // 6h terminal loading
    const railCo2TonnesAll = Number(((distanceKm * railTonnesAll * 0.022) / 1000).toFixed(1));

    // 100% Road metrics
    const roadTonnesAll = tonnage;
    const roadTrucksAll = Math.ceil(roadTonnesAll / 28); // 1 multi-axle truck ~ 28 tonnes
    const roadRatePerTonKm = 2.75;
    const roadTollsAll = roadTrucksAll * Math.round(distanceKm * 3.8);
    const roadTotalCostAll =
      Math.round(distanceKm * roadTonnesAll * roadRatePerTonKm) + roadTollsAll;
    const roadSpeedKmh = 48;
    const roadTransitHoursAll = Math.round(distanceKm / roadSpeedKmh + 4);
    const roadCo2TonnesAll = Number(((distanceKm * roadTonnesAll * 0.062) / 1000).toFixed(1));

    // Hybrid Multimodal Split metrics
    const splitRailTonnes = Math.round((tonnage * activeRailPct) / 100);
    const splitRoadTonnes = tonnage - splitRailTonnes;

    const splitRailRakes = Math.ceil(splitRailTonnes / 2400);
    const splitRoadTrucks = Math.ceil(splitRoadTonnes / 28);

    const splitRailCost = Math.round(
      distanceKm * splitRailTonnes * railRatePerTonKm + splitRailTonnes * 250,
    );
    const splitRoadCost = Math.round(
      distanceKm * splitRoadTonnes * roadRatePerTonKm + splitRoadTrucks * (distanceKm * 3.8),
    );
    const splitTotalCost = splitRailCost + splitRoadCost;

    // Split transit time is bounded by delivery of the priority road batch & rail trunk
    const splitTransitHours =
      activeRoadPct > 0 ? Math.min(railTransitHoursAll, roadTransitHoursAll) : railTransitHoursAll;

    const splitCo2Tonnes = Number(
      (
        (distanceKm * splitRailTonnes * 0.022 + distanceKm * splitRoadTonnes * 0.062) /
        1000
      ).toFixed(1),
    );

    // Savings comparing Multimodal Hybrid vs 100% Road
    const costSavedVsRoad = roadTotalCostAll - splitTotalCost;
    const costSavedPct = Math.round((costSavedVsRoad / roadTotalCostAll) * 100);
    const co2AvoidedTonnes = Number((roadCo2TonnesAll - splitCo2Tonnes).toFixed(1));
    const co2AvoidedPct = Math.round(
      ((roadCo2TonnesAll - splitCo2Tonnes) / roadCo2TonnesAll) * 100,
    );

    return {
      distanceKm,
      hasDfcLink,
      allRail: {
        tonnes: railTonnesAll,
        rakes: railRakesAll,
        cost: railTotalCostAll,
        hours: railTransitHoursAll,
        co2: railCo2TonnesAll,
      },
      allRoad: {
        tonnes: roadTonnesAll,
        trucks: roadTrucksAll,
        cost: roadTotalCostAll,
        hours: roadTransitHoursAll,
        co2: roadCo2TonnesAll,
      },
      hybrid: {
        railTonnes: splitRailTonnes,
        roadTonnes: splitRoadTonnes,
        railPct: activeRailPct,
        roadPct: activeRoadPct,
        rakes: splitRailRakes,
        trucks: splitRoadTrucks,
        totalCost: splitTotalCost,
        hours: splitTransitHours,
        co2: splitCo2Tonnes,
        costSavedVsRoad,
        costSavedPct,
        co2AvoidedTonnes,
        co2AvoidedPct,
      },
    };
  }, [tonnage, distanceKm, hasDfcLink, activeRailPct]);

  const handleDispatch = () => {
    setIsDispatched(true);
    simStore.step();
    if (onConsignmentDispatched) {
      onConsignmentDispatched(
        `Consignment [${originNode.city} ➔ ${destNode.city}] optimized & allocated: ${distribution.hybrid.railTonnes.toLocaleString("en-IN")}t Rail + ${distribution.hybrid.roadTonnes.toLocaleString("en-IN")}t Road!`,
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-2xl border border-border/80 bg-surface/90 p-5 sm:p-6 shadow-xs">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400 border border-blue-500/20">
                FreightWave AI Route Engine
              </span>
              <span className="rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Multimodal Optimization
              </span>
            </div>
            <h2 className="mt-2 text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              User-Defined Route & Modal Cargo Distribution Hub
            </h2>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Input origin, destination, cargo volume, and SLA constraints. The AI models
              permutations across Indian Railways (DFC), Highway Express Fleets, and Multimodal
              Splits to allocate your payload for maximum savings and speed.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => {
                setCustomSplitRail(null);
                setTonnage(1200);
                setPriority("balanced");
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-border/80 bg-surface-2 px-3 py-2 text-xs font-semibold text-muted-foreground hover:text-foreground transition"
            >
              <RotateCcw className="size-3.5" />
              <span>Reset Parameters</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Left Controls (5 cols) + Right Output Matrix (7 cols) */}
      <div className="grid gap-6 lg:grid-cols-12">
        {/* LEFT: User Input Configuration Panel */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Sliders className="size-4 text-primary" />
                <h3 className="text-sm font-bold text-foreground">1. Consignment Parameters</h3>
              </div>
              <span className="text-[11px] font-mono text-muted-foreground">Step 1 of 2</span>
            </div>

            {/* Origin & Destination Hub Selection */}
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="size-3.5 text-primary" /> Origin Hub / ICD
                </label>
                <select
                  value={originId}
                  onChange={(e) => {
                    setOriginId(e.target.value);
                    setCustomSplitRail(null);
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {FREIGHT_HUBS.map((hub) => (
                    <option key={hub.id} value={hub.id} disabled={hub.id === destId}>
                      {hub.name} {hub.hasDfc ? "⚡ [DFC]" : ""}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-muted-foreground flex items-center gap-1 mb-1">
                  <MapPin className="size-3.5 text-accent" /> Destination Gateway
                </label>
                <select
                  value={destId}
                  onChange={(e) => {
                    setDestId(e.target.value);
                    setCustomSplitRail(null);
                  }}
                  className="w-full rounded-xl border border-border bg-background px-3 py-2.5 text-xs font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  {FREIGHT_HUBS.map((hub) => (
                    <option key={hub.id} value={hub.id} disabled={hub.id === originId}>
                      {hub.name} {hub.hasDfc ? "⚡ [DFC]" : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Distance & DFC Availability Badge */}
            <div className="flex items-center justify-between rounded-xl bg-surface-2 p-3 text-xs border border-border/60">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-foreground">Corridor Distance:</span>
                <span className="font-mono font-bold text-primary">
                  {distanceKm.toLocaleString("en-IN")} km
                </span>
              </div>
              <div>
                {hasDfcLink ? (
                  <span className="rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                    ⚡ Dedicated Freight Corridor Enabled
                  </span>
                ) : (
                  <span className="rounded-md bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 text-[10px] font-bold">
                    🛣️ National Expressway & Broad-Gauge
                  </span>
                )}
              </div>
            </div>

            {/* Cargo Category Selection */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Cargo Commodity Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {CARGO_CATEGORIES.map((c) => {
                  const Icon = c.icon;
                  const isSelected = cargoType === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setCargoType(c.id);
                        setCustomSplitRail(null);
                      }}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-left text-xs transition border ${
                        isSelected
                          ? "bg-primary/10 border-primary text-primary font-bold shadow-xs"
                          : "bg-surface-2 border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface"
                      }`}
                    >
                      <Icon
                        className={`size-4 shrink-0 ${isSelected ? "text-primary" : "text-muted-foreground"}`}
                      />
                      <span className="truncate">{c.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Total Tonnage Input + Quick Presets */}
            <div>
              <div className="flex items-center justify-between text-xs font-semibold mb-1">
                <span className="text-muted-foreground">Total Consignment Payload Weight</span>
                <span className="font-mono font-bold text-primary text-sm">
                  {tonnage.toLocaleString("en-IN")} Metric Tonnes
                </span>
              </div>
              <input
                type="range"
                min="50"
                max="5000"
                step="50"
                value={tonnage}
                onChange={(e) => setTonnage(Number(e.target.value))}
                className="w-full accent-primary"
              />
              <div className="mt-2 flex flex-wrap gap-1.5">
                {[150, 600, 1200, 2400, 3600].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setTonnage(t)}
                    className={`rounded-lg px-2.5 py-1 text-[11px] font-semibold transition ${
                      tonnage === t
                        ? "bg-primary text-primary-foreground font-bold"
                        : "bg-surface-2 text-muted-foreground hover:bg-surface hover:text-foreground border border-border/60"
                    }`}
                  >
                    {t >= 1000 ? `${t / 1000}k Tonnes` : `${t} Tonnes`}
                  </button>
                ))}
              </div>
            </div>

            {/* Optimization Priority Strategy */}
            <div>
              <label className="text-xs font-semibold text-muted-foreground mb-1.5 block">
                Optimization Objective & Priority
              </label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {[
                  { id: "balanced" as const, label: "⚖️ Balanced", desc: "Best Cost & SLA" },
                  {
                    id: "cost_green" as const,
                    label: "🌿 Green & Low Cost",
                    desc: "Heavy Rail Shift",
                  },
                  { id: "urgent_speed" as const, label: "⚡ Express SLA", desc: "Highway Speed" },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setPriority(opt.id);
                      setCustomSplitRail(null);
                    }}
                    className={`rounded-xl p-2.5 text-center transition border ${
                      priority === opt.id
                        ? "bg-primary text-primary-foreground font-bold border-primary shadow-xs"
                        : "bg-surface-2 border-border/70 text-muted-foreground hover:text-foreground hover:bg-surface"
                    }`}
                  >
                    <div className="font-semibold">{opt.label}</div>
                    <div
                      className={`text-[10px] mt-0.5 ${priority === opt.id ? "text-primary-foreground/80" : "text-muted-foreground"}`}
                    >
                      {opt.desc}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Interactive Modal Split Customizer Slider */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-border/60 pb-3">
              <div className="flex items-center gap-2">
                <Boxes className="size-4 text-accent" />
                <h3 className="text-sm font-bold text-foreground">
                  2. Modal Split Allocation Tuner
                </h3>
              </div>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-mono text-[10px] font-bold text-primary">
                AI Target: {aiRecommendedRailPct}% Rail
              </span>
            </div>

            <p className="text-xs text-muted-foreground">
              Adjust the split ratio between <strong>Electric Railways (Goods Rakes)</strong> and{" "}
              <strong>Roadway Trucks (Express Highway)</strong> to balance your consignment
              economics.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-blue-600">
                  <Train className="size-4" /> Railways: {activeRailPct}% (
                  {distribution.hybrid.railTonnes.toLocaleString("en-IN")} t)
                </span>
                <span className="flex items-center gap-1.5 text-amber-600">
                  <Truck className="size-4" /> Roadways: {activeRoadPct}% (
                  {distribution.hybrid.roadTonnes.toLocaleString("en-IN")} t)
                </span>
              </div>

              {/* Visual Split Bar */}
              <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 flex">
                <div
                  className="h-full bg-blue-600 transition-all duration-300"
                  style={{ width: `${activeRailPct}%` }}
                  title={`Railways: ${activeRailPct}%`}
                />
                <div
                  className="h-full bg-amber-500 transition-all duration-300"
                  style={{ width: `${activeRoadPct}%` }}
                  title={`Roadways: ${activeRoadPct}%`}
                />
              </div>

              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={activeRailPct}
                onChange={(e) => setCustomSplitRail(Number(e.target.value))}
                className="w-full accent-blue-600"
              />

              {/* Quick Split Presets */}
              <div className="flex items-center justify-between gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCustomSplitRail(100)}
                  className={`rounded-lg px-2 py-1 font-semibold transition border ${
                    activeRailPct === 100
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  100% Rail Only
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSplitRail(aiRecommendedRailPct)}
                  className={`rounded-lg px-2 py-1 font-bold transition border ${
                    customSplitRail === null
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-surface-2 text-primary border-primary/40"
                  }`}
                >
                  ✨ AI Optimal ({aiRecommendedRailPct}/{100 - aiRecommendedRailPct})
                </button>
                <button
                  type="button"
                  onClick={() => setCustomSplitRail(0)}
                  className={`rounded-lg px-2 py-1 font-semibold transition border ${
                    activeRailPct === 0
                      ? "bg-amber-600 text-white border-amber-600"
                      : "bg-surface-2 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  100% Road Only
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Multimodal Optimization Results Matrix (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Top Recommendation Banner */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 dark:bg-emerald-950/20 p-5 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="grid size-8 place-items-center rounded-xl bg-emerald-600 text-white shadow-xs">
                  <Sparkles className="size-4.5" />
                </span>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:text-emerald-300">
                    Optimized Modal Allocation Result
                  </span>
                  <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-100">
                    {activeRailPct === 100
                      ? "100% Rail DFC Freight Allocation"
                      : activeRailPct === 0
                        ? "100% Roadway Express Trucking"
                        : `Multimodal Hybrid: ${activeRailPct}% Rail Trunk + ${activeRoadPct}% Road Fleet`}
                  </h3>
                </div>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto">
                <span className="rounded-full bg-emerald-600 text-white px-3 py-1 text-xs font-black shadow-xs">
                  Saves ₹{distribution.hybrid.costSavedVsRoad.toLocaleString("en-IN")}
                </span>
              </div>
            </div>

            <p className="text-xs text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
              {activeRailPct > 0 ? (
                <>
                  By routing{" "}
                  <strong>{distribution.hybrid.railTonnes.toLocaleString("en-IN")} tonnes</strong>{" "}
                  across electric rail rakes on the{" "}
                  {hasDfcLink ? "Western/Eastern DFC" : "Mainline Broad-Gauge"} corridor and{" "}
                  <strong>{distribution.hybrid.roadTonnes.toLocaleString("en-IN")} tonnes</strong>{" "}
                  via express road transport, you reduce freight cost by{" "}
                  <strong>{distribution.hybrid.costSavedPct}%</strong> and eliminate{" "}
                  <strong>{distribution.hybrid.co2AvoidedTonnes} tonnes of CO₂</strong> (
                  {distribution.hybrid.co2AvoidedPct}% Scope 3 cut).
                </>
              ) : (
                <>
                  Direct door-to-door road transit via national expressways delivers{" "}
                  {distribution.hybrid.roadTonnes.toLocaleString("en-IN")} tonnes in{" "}
                  {distribution.allRoad.hours} hours with point-to-point agility.
                </>
              )}
            </p>
          </div>

          {/* 3-Column Comparative Cards (Railways vs Roadways vs Selected Multimodal) */}
          <div className="grid gap-3 sm:grid-cols-3">
            {/* 1. 100% Rail Only */}
            <div
              className={`rounded-2xl border p-4 flex flex-col justify-between transition ${
                activeRailPct === 100
                  ? "border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-sm"
                  : "border-border/80 bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-blue-700 dark:text-blue-400">
                  <span className="flex items-center gap-1.5">
                    <Train className="size-4" /> 100% Rail
                  </span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/40 px-2 py-0.5 rounded-md">
                    DFC / IR
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] text-muted-foreground">Estimated Tariff</div>
                  <div className="text-lg font-bold text-foreground font-mono">
                    ₹{distribution.allRail.cost.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                  <div className="flex justify-between">
                    <span>Transit Time:</span>
                    <span className="font-semibold text-foreground">
                      {distribution.allRail.hours} Hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Electric Rakes:</span>
                    <span className="font-semibold text-foreground">
                      {distribution.allRail.rakes} Block Rake(s)
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>CO₂ Footprint:</span>
                    <span className="font-semibold text-emerald-600">
                      {distribution.allRail.co2} Tonnes
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCustomSplitRail(100)}
                className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition ${
                  activeRailPct === 100
                    ? "bg-blue-600 text-white"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeRailPct === 100 ? "Selected Mode" : "Select 100% Rail"}
              </button>
            </div>

            {/* 2. Optimized Multimodal Split (Recommended) */}
            <div
              className={`rounded-2xl border p-4 flex flex-col justify-between transition ${
                activeRailPct > 0 && activeRailPct < 100
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-md"
                  : "border-border/80 bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-primary">
                  <span className="flex items-center gap-1.5">
                    <Boxes className="size-4" /> Multimodal Split
                  </span>
                  <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-md font-black">
                    OPTIMAL
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] text-muted-foreground">Blended Freight Cost</div>
                  <div className="text-lg font-bold text-foreground font-mono">
                    ₹{distribution.hybrid.totalCost.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                  <div className="flex justify-between">
                    <span>Effective ETA:</span>
                    <span className="font-semibold text-primary">
                      {distribution.hybrid.hours} Hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fleet Required:</span>
                    <span className="font-semibold text-foreground">
                      {distribution.hybrid.rakes} Rake + {distribution.hybrid.trucks} Trucks
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Carbon Saved:</span>
                    <span className="font-semibold text-emerald-600">
                      -{distribution.hybrid.co2AvoidedPct}% Green
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCustomSplitRail(aiRecommendedRailPct)}
                className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition ${
                  activeRailPct > 0 && activeRailPct < 100
                    ? "bg-primary text-primary-foreground shadow-xs"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeRailPct > 0 && activeRailPct < 100
                  ? "Active Allocation"
                  : "Apply Multimodal"}
              </button>
            </div>

            {/* 3. 100% Roadway Only */}
            <div
              className={`rounded-2xl border p-4 flex flex-col justify-between transition ${
                activeRailPct === 0
                  ? "border-amber-600 bg-amber-50/50 dark:bg-amber-950/20 shadow-sm"
                  : "border-border/80 bg-surface"
              }`}
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-amber-700 dark:text-amber-400">
                  <span className="flex items-center gap-1.5">
                    <Truck className="size-4" /> 100% Road
                  </span>
                  <span className="text-[10px] bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                    Highway FTL
                  </span>
                </div>

                <div className="mt-3">
                  <div className="text-[11px] text-muted-foreground">Truck Fleet Cost</div>
                  <div className="text-lg font-bold text-foreground font-mono">
                    ₹{distribution.allRoad.cost.toLocaleString("en-IN")}
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-muted-foreground border-t border-border/60 pt-2.5">
                  <div className="flex justify-between">
                    <span>Transit Time:</span>
                    <span className="font-semibold text-foreground">
                      {distribution.allRoad.hours} Hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trucks Required:</span>
                    <span className="font-semibold text-foreground">
                      {distribution.allRoad.trucks} Multi-Axle
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>CO₂ Footprint:</span>
                    <span className="font-semibold text-rose-600">
                      {distribution.allRoad.co2} Tonnes
                    </span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setCustomSplitRail(0)}
                className={`mt-4 w-full rounded-xl py-2 text-xs font-bold transition ${
                  activeRailPct === 0
                    ? "bg-amber-600 text-white"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground"
                }`}
              >
                {activeRailPct === 0 ? "Selected Mode" : "Select 100% Road"}
              </button>
            </div>
          </div>

          {/* Leg-by-Leg Intermodal Route Workflow */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-xs space-y-4">
            <h4 className="text-sm font-bold text-foreground flex items-center gap-2">
              <Layers className="size-4 text-primary" />
              Dynamic Execution Routing & Transshipment Pipeline
            </h4>

            <div className="space-y-3">
              {/* Leg 1 */}
              <div className="flex items-start gap-3 rounded-xl bg-surface-2 p-3 border border-border/60 text-xs">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-blue-600 text-white font-bold font-mono">
                  1
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      First-Mile Pickup & Consolidation: {originNode.city}
                    </span>
                    <span className="font-mono text-muted-foreground">0 — 3 hrs</span>
                  </div>
                  <p className="mt-0.5 text-muted-foreground">
                    Direct pickup from factory / warehouse gates. Local drayage trucks transport
                    payload to {originNode.name} for containerization and automated RFID scanning.
                  </p>
                </div>
              </div>

              {/* Leg 2 */}
              <div className="flex items-start gap-3 rounded-xl bg-primary/10 p-3 border border-primary/30 text-xs">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-primary text-primary-foreground font-bold font-mono">
                  2
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground flex items-center gap-1.5">
                      <Train className="size-3.5 text-primary" /> High-Speed Electrified Rail Trunk
                      Line ({distribution.hybrid.railTonnes.toLocaleString("en-IN")} tonnes)
                    </span>
                    <span className="font-mono text-primary font-bold">
                      3 — {distribution.allRail.hours - 4} hrs
                    </span>
                  </div>
                  <p className="mt-0.5 text-muted-foreground">
                    Loaded on {distribution.hybrid.rakes} continuous high-capacity electric freight
                    rake(s). Transits via{" "}
                    {hasDfcLink
                      ? "Western Dedicated Freight Corridor (WDFC)"
                      : "National Rail Backbone"}{" "}
                    at average 75 km/h with zero highway tolls.
                  </p>
                </div>
              </div>

              {/* Leg 3 */}
              {distribution.hybrid.roadTonnes > 0 && (
                <div className="flex items-start gap-3 rounded-xl bg-amber-500/10 p-3 border border-amber-500/30 text-xs">
                  <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-amber-600 text-white font-bold font-mono">
                    3
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-foreground flex items-center gap-1.5">
                        <Truck className="size-3.5 text-amber-600" /> Express Highway Parallel Fleet
                        ({distribution.hybrid.roadTonnes.toLocaleString("en-IN")} tonnes)
                      </span>
                      <span className="font-mono text-amber-700 dark:text-amber-400 font-bold">
                        Direct 24h Express
                      </span>
                    </div>
                    <p className="mt-0.5 text-muted-foreground">
                      Dispatched across {distribution.hybrid.trucks} FASTag-enabled multi-axle
                      trucks on National Expressways for urgent delivery batches requiring zero
                      transshipment delay.
                    </p>
                  </div>
                </div>
              )}

              {/* Leg 4 */}
              <div className="flex items-start gap-3 rounded-xl bg-surface-2 p-3 border border-border/60 text-xs">
                <div className="grid size-7 shrink-0 place-items-center rounded-lg bg-emerald-600 text-white font-bold font-mono">
                  {distribution.hybrid.roadTonnes > 0 ? "4" : "3"}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-foreground">
                      Gateway Transshipment & Final Delivery: {destNode.city}
                    </span>
                    <span className="font-mono text-emerald-600 font-bold">Total SLA Met</span>
                  </div>
                  <p className="mt-0.5 text-muted-foreground">
                    Arrives at {destNode.name}. Fast gantry crane offloading and last-mile electric
                    truck dispatch directly to consignee dock with end-to-end digital
                    proof-of-delivery.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 pt-4">
              <div className="text-xs text-muted-foreground">
                Total Allocated: <strong>{tonnage.toLocaleString("en-IN")} Tonnes</strong> (
                {distribution.hybrid.railTonnes.toLocaleString("en-IN")}t Rail +{" "}
                {distribution.hybrid.roadTonnes.toLocaleString("en-IN")}t Road)
              </div>

              <button
                type="button"
                onClick={handleDispatch}
                disabled={isDispatched}
                className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-xs font-bold transition shadow-md ${
                  isDispatched
                    ? "bg-emerald-600 text-white"
                    : "bg-primary text-primary-foreground hover:brightness-110 active:scale-98"
                }`}
              >
                {isDispatched ? (
                  <>
                    <CheckCircle2 className="size-4" />
                    <span>Allocated & Dispatched to Corridor!</span>
                  </>
                ) : (
                  <>
                    <Send className="size-4" />
                    <span>Confirm & Dispatch Multimodal Route</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
