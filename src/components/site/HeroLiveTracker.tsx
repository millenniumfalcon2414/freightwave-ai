import { useState, useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Train,
  Truck,
  ArrowRight,
  Search,
  Sparkles,
  MapPin,
  Clock,
  Thermometer,
  Gauge,
  Zap,
  Activity,
  CheckCircle2,
  Layers,
  PhoneCall,
  Navigation,
} from "lucide-react";

interface LiveStreamItem {
  id: string;
  consignmentNumber: string;
  title: string;
  mode: "RAIL" | "ROAD";
  origin: string;
  destination: string;
  cargo: string;
  weight: string;
  speed: number;
  progressPct: number;
  eta: string;
  status: string;
  statusColor: "emerald" | "blue" | "amber";
  telemetry: {
    temp?: string;
    fuelOrCurrent?: string;
    locoOrTruckNo: string;
  };
}

export function HeroLiveTracker() {
  const navigate = useNavigate();
  const [activeMode, setActiveMode] = useState<"ALL" | "RAIL" | "ROAD">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [liveSecond, setLiveSecond] = useState(0);

  // Smooth live telemetry simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveSecond((prev) => prev + 1);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  const streams: LiveStreamItem[] = [
    {
      id: "RAIL-IND-28491",
      consignmentNumber: "RR-NDLS-99412",
      title: "Western DFC Container Super-Rake",
      mode: "RAIL",
      origin: "Delhi / Dadri ICD",
      destination: "Mumbai / JNPT Port",
      cargo: "High-Value Electronics & Solar PV",
      weight: "1,420 Tons (90 TEU)",
      speed: 74 + (liveSecond % 3) * 2,
      progressPct: 62,
      eta: "18h 30m",
      status: "Cruising on Western DFC",
      statusColor: "blue",
      telemetry: {
        locoOrTruckNo: "WAG-12B #60142 Twin-Loco",
        fuelOrCurrent: "25kV OHE Active",
      },
    },
    {
      id: "ROAD-IND-99410",
      consignmentNumber: "LR-MH12-58190",
      title: "Bharat Multi-Axle Cold-Chain Reefer",
      mode: "ROAD",
      origin: "Pune Hinjawadi Hub",
      destination: "Bengaluru Peenya Terminal",
      cargo: "Biopharma Vaccines & Active API",
      weight: "22 Tons (Cold-Box)",
      speed: 68 - (liveSecond % 2) * 2,
      progressPct: 45,
      eta: "9h 15m",
      status: "NH-48 Golden Quadrilateral",
      statusColor: "emerald",
      telemetry: {
        locoOrTruckNo: "MH 12 QX 9941 (Volvo FH16)",
        temp: "+4.2°C (Optimal)",
      },
    },
    {
      id: "RAIL-IND-55912",
      consignmentNumber: "RR-DHN-44210",
      title: "Eastern DFC Heavy Coal Corridor",
      mode: "RAIL",
      origin: "Dhanbad Coal Siding",
      destination: "Dadri Thermal Station",
      cargo: "Washed Thermal Bituminous Coal",
      weight: "3,850 Tons (58 BOXNHL)",
      speed: 62 + (liveSecond % 2) * 3,
      progressPct: 78,
      eta: "6h 40m",
      status: "Panki Yard Priority Clearance",
      statusColor: "blue",
      telemetry: {
        locoOrTruckNo: "WAG-9H #31890 Heavy Freight",
        fuelOrCurrent: "100% Green Rail Traction",
      },
    },
  ];

  const filteredStreams = streams.filter((s) => {
    if (activeMode === "RAIL") return s.mode === "RAIL";
    if (activeMode === "ROAD") return s.mode === "ROAD";
    return true;
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate({
        to: "/cargo-portal",
        search: { q: searchQuery.trim() },
      });
    } else {
      navigate({ to: "/cargo-portal" });
    }
  };

  const handleQuickChip = (id: string) => {
    navigate({
      to: "/cargo-portal",
      search: { q: id },
    });
  };

  return (
    <div
      id="hero-live-freight-tracker"
      className="relative flex flex-col h-full rounded-2xl border border-border/90 bg-surface/90 p-5 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-blue-500/30"
    >
      {/* Header with Live Status & Mode Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 pb-4">
        <div className="flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 border border-blue-500/20 shadow-xs">
            <Activity className="size-4.5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">Live Freight Operations</h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 font-mono text-[9px] font-bold text-emerald-600 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-ping" />
                <span>ONLINE GPS</span>
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Real-time Indian Railways DFC rakes & Highway trucks
            </p>
          </div>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex items-center rounded-xl bg-surface-2 p-1 text-xs border border-border/80 font-semibold">
          <button
            onClick={() => setActiveMode("ALL")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
              activeMode === "ALL"
                ? "bg-surface text-foreground shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Layers className="size-3" />
            <span>All</span>
          </button>
          <button
            onClick={() => setActiveMode("RAIL")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
              activeMode === "RAIL"
                ? "bg-blue-600 text-white shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Train className="size-3" />
            <span>Rail (DFC)</span>
          </button>
          <button
            onClick={() => setActiveMode("ROAD")}
            className={`flex items-center gap-1 rounded-lg px-2.5 py-1 transition ${
              activeMode === "ROAD"
                ? "bg-emerald-600 text-white shadow-xs font-bold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Truck className="size-3" />
            <span>Roadway</span>
          </button>
        </div>
      </div>

      {/* Quick Consignment Tracking Search */}
      <div className="my-3.5 space-y-2">
        <form onSubmit={handleSearchSubmit} className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Consignment, RR/LR No, or Vehicle..."
            className="w-full rounded-xl border border-border bg-surface-2/80 py-2 pl-9 pr-24 text-xs font-mono text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
          />
          <Search className="absolute left-3 top-2.5 size-3.5 text-muted-foreground" />
          <button
            type="submit"
            className="absolute right-1.5 top-1.5 flex items-center gap-1 rounded-lg bg-blue-600 px-2.5 py-1 text-[11px] font-bold text-white shadow-xs hover:bg-blue-700 transition"
          >
            <span>Track</span>
            <ArrowRight className="size-3" />
          </button>
        </form>

        {/* Quick Sample Chips */}
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground overflow-x-auto pb-0.5">
          <span className="font-semibold shrink-0">Quick Try:</span>
          {["RAIL-IND-28491", "ROAD-IND-99410", "RAIL-IND-55912"].map((sampleId) => (
            <button
              key={sampleId}
              onClick={() => handleQuickChip(sampleId)}
              className="rounded-md bg-surface-2 hover:bg-blue-500/10 hover:text-blue-600 px-1.5 py-0.5 font-mono text-[9.5px] border border-border transition shrink-0"
            >
              {sampleId}
            </button>
          ))}
        </div>
      </div>

      {/* Live Stream List */}
      <div className="space-y-3 flex-1 overflow-y-auto pr-1">
        {filteredStreams.map((item) => {
          const isRoad = item.mode === "ROAD";
          return (
            <div
              key={item.id}
              onClick={() => handleQuickChip(item.id)}
              className="group cursor-pointer rounded-xl border border-border/80 bg-surface-2/40 hover:bg-surface-2 p-3.5 transition-all duration-200 hover:border-blue-500/40 hover:shadow-md space-y-2.5"
            >
              {/* Top Row: Mode Badge, ID, Speed */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className={`flex items-center gap-1 rounded-md px-2 py-0.5 font-mono text-[10px] font-bold border ${
                      isRoad
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                        : "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    }`}
                  >
                    {isRoad ? <Truck className="size-3" /> : <Train className="size-3" />}
                    <span>{item.mode} FREIGHT</span>
                  </span>
                  <span className="font-mono text-xs font-bold text-foreground group-hover:text-blue-600 transition">
                    {item.id}
                  </span>
                </div>

                <div className="flex items-center gap-2 font-mono text-[11px]">
                  <span className="flex items-center gap-1 text-foreground font-bold">
                    <Gauge className="size-3 text-blue-600" />
                    <span>{item.speed} km/h</span>
                  </span>
                  <span className="text-muted-foreground">·</span>
                  <span className="text-emerald-600 font-bold flex items-center gap-0.5">
                    <Clock className="size-3" />
                    <span>ETA {item.eta}</span>
                  </span>
                </div>
              </div>

              {/* Middle Row: Route Description */}
              <div className="flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-foreground truncate">
                  <span className="truncate">{item.origin}</span>
                  <ArrowRight className="size-3 text-muted-foreground shrink-0" />
                  <span className="truncate text-blue-600">{item.destination}</span>
                </div>
                <span className="text-[10px] font-mono text-muted-foreground shrink-0">
                  {item.weight}
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="space-y-1">
                <div className="relative h-1.5 w-full rounded-full bg-border overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isRoad
                        ? "bg-gradient-to-r from-emerald-600 to-teal-400"
                        : "bg-gradient-to-r from-blue-600 to-cyan-400"
                    }`}
                    style={{ width: `${item.progressPct}%` }}
                  />
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-muted-foreground">
                  <span className="truncate flex items-center gap-1">
                    <Navigation className="size-2.5 text-blue-600" />
                    <span>{item.status}</span>
                  </span>
                  <span>{item.progressPct}% Completed</span>
                </div>
              </div>

              {/* Bottom Row: Telemetry Indicators */}
              <div className="flex items-center justify-between text-[10px] text-muted-foreground border-t border-border/50 pt-1.5">
                <span className="truncate">{item.telemetry.locoOrTruckNo}</span>
                {item.telemetry.temp ? (
                  <span className="flex items-center gap-1 text-emerald-600 font-bold font-mono">
                    <Thermometer className="size-3" />
                    <span>{item.telemetry.temp}</span>
                  </span>
                ) : (
                  <span className="text-blue-600 font-medium">{item.telemetry.fuelOrCurrent}</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Dispatch Summary Bar */}
      <div className="mt-3.5 flex items-center justify-between rounded-xl bg-surface-2 p-2.5 border border-border/80 text-xs">
        <div className="flex items-center gap-2">
          <div className="flex size-6 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600">
            <Zap className="size-3.5" />
          </div>
          <div>
            <div className="text-[11px] font-bold text-foreground">AI Multimodal Dispatch</div>
            <div className="text-[9.5px] text-muted-foreground">
              98.4% Schedule Adherence · 58% CO₂ Saved
            </div>
          </div>
        </div>

        <Link
          to="/cargo-portal"
          className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition shadow-xs"
        >
          <span>Open Portal</span>
          <ArrowRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
