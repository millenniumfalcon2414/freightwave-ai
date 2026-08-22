// RailFlow AI — client-side simulation engine.
// Vanilla observable store; React reads via useSyncExternalStore.

import { triggerSimulatedEventFn } from "../api/realtime.functions";
import { db } from "../db/database";

export type Severity = "critical" | "high" | "med" | "low";

export type Alert = {
  id: string;
  t: string;
  sev: Severity;
  msg: string;
  node: string;
};

export type Shipment = {
  id: string;
  corridor: string;
  cargo: string;
  etaMin: number; // remaining minutes
  status: "on_schedule" | "delay_20m" | "rerouted";
  confidence: number;
};

export type Params = {
  running: boolean;
  tickMs: number; // 250..5000
  demandMultiplier: number; // 0.5..2.0
  fuelPriceIndex: number; // 80..160 (₹)
  railShareTarget: number; // 30..85 (% target)
  weatherSeverity: number; // 0..100
  disruptionLevel: number; // 0..100
  aiAggressiveness: number; // 0..100
  carbonFocus: number; // 0..100
  fleetSize: number; // 200..3000
  emergencyMode: boolean;
};

export type SimState = {
  params: Params;
  tickCount: number;
  kpis: {
    totalOrders: number;
    activeShipments: number;
    railUtil: number;
    roadUtil: number;
    aiScore: number;
    costSavingsCr: number;
    carbonKt: number;
    consolidated: number;
    emergency: number;
    fleetEff: number;
    railDelta: number;
    roadDelta: number;
  };
  freightTrend: { d: string; rail: number; road: number; multi: number }[];
  corridorPerf: { c: string; util: number }[];
  costTrend: { m: string; cost: number; saved: number }[];
  alerts: Alert[];
  shipments: Shipment[];
  hardware: {
    gpsNodes: number;
    fuelHealthy: number;
    shockEvents24h: number;
    mqttRate: number;
  };
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CORRIDORS = ["DEL-MUM", "DEL-KOL", "MUM-CHE", "KOL-VSK", "AHM-MND", "LDH-DEL"];
const CARGO = [
  "Containers",
  "Auto parts",
  "Steel coil",
  "Coal",
  "FMCG",
  "Cement",
  "Fertilizer",
  "Petrochem",
];
const NODES = ["MND", "VAR", "REW", "RAKE", "F-227", "JNPT", "DFC-E", "CONCOR-D", "DAD"];

const defaultParams: Params = {
  running: true,
  tickMs: 1500,
  demandMultiplier: 1,
  fuelPriceIndex: 102,
  railShareTarget: 62,
  weatherSeverity: 18,
  disruptionLevel: 22,
  aiAggressiveness: 70,
  carbonFocus: 60,
  fleetSize: 1248,
  emergencyMode: false,
};

function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}
function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v));
}
function id() {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}
function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function seedTrend(p: Params) {
  return DAYS.map((d, i) => {
    const base = 4200 + i * 220 * p.demandMultiplier;
    const railBias = p.railShareTarget / 60;
    return {
      d,
      rail: Math.round(base * railBias + rand(-150, 150)),
      road: Math.round(base * (1.4 - railBias * 0.7) + rand(-150, 150)),
      multi: Math.round(base * 0.78 + rand(-150, 150)),
    };
  });
}
function seedCorridors() {
  return CORRIDORS.map((c) => ({ c, util: Math.round(rand(70, 95)) }));
}
function seedCost(p: Params) {
  return ["W1", "W2", "W3", "W4"].map((m, i) => ({
    m,
    cost: Math.round(150 - i * 4 * (p.aiAggressiveness / 70) + rand(-2, 2)),
    saved: Math.round(16 + i * 5 * (p.aiAggressiveness / 70) + rand(-1, 1)),
  }));
}
function seedShipments(): Shipment[] {
  if (typeof window !== "undefined") {
    const dbShipments = db.getShipments();
    if (dbShipments && dbShipments.length > 0) {
      return dbShipments.map((s) => ({
        id: s.shipmentId,
        corridor: `${s.origin} → ${s.destination}`,
        cargo: s.cargoType,
        etaMin: s.remainingKm ? Math.round((s.remainingKm / 65) * 60) : 1200,
        status:
          s.status === "DELAYED"
            ? "delay_20m"
            : s.status === "REROUTED"
              ? "rerouted"
              : "on_schedule",
        confidence: 90,
      }));
    }
  }
  return Array.from({ length: 7 }, (_, i) => ({
    id: `RAKE-${1000 + Math.floor(rand(0, 9000))}-${String.fromCharCode(65 + i)}`,
    corridor: `${["Mumbai", "Ludhiana", "Nagpur", "Kolkata", "Bengaluru", "Delhi", "Chennai"][i]} → ${["Dadri", "Mundra", "Chennai", "Vizag", "Mumbai", "JNPT", "Dadri"][i]}`,
    cargo: CARGO[Math.floor(Math.random() * CARGO.length)],
    etaMin: Math.round(rand(8 * 60, 48 * 60)),
    status: "on_schedule",
    confidence: Math.round(rand(82, 98)),
  }));
}
function seedAlerts(): Alert[] {
  return [
    {
      id: id(),
      t: nowHM(),
      sev: "high",
      msg: "Mundra Port: congestion forecast T+120m. Rerouting 18 rakes.",
      node: "MND",
    },
    {
      id: id(),
      t: nowHM(),
      sev: "low",
      msg: "Varanasi Hub: load balancing complete. Utilization +14%.",
      node: "VAR",
    },
    {
      id: id(),
      t: nowHM(),
      sev: "med",
      msg: "Rewari segment: corridor maintenance window opens 22:00.",
      node: "REW",
    },
  ];
}

function initialState(): SimState {
  const p = { ...defaultParams };
  return {
    params: p,
    tickCount: 0,
    kpis: {
      totalOrders: 12438,
      activeShipments: 1248,
      railUtil: 92.4,
      roadUtil: 78.6,
      aiScore: 94,
      costSavingsCr: 287,
      carbonKt: 82.4,
      consolidated: 19540,
      emergency: 34,
      fleetEff: 88.1,
      railDelta: 3.1,
      roadDelta: -1.4,
    },
    freightTrend: seedTrend(p),
    corridorPerf: seedCorridors(),
    costTrend: seedCost(p),
    alerts: seedAlerts(),
    shipments: seedShipments(),
    hardware: { gpsNodes: 1248, fuelHealthy: 92.4, shockEvents24h: 3, mqttRate: 14200 },
  };
}

type Listener = () => void;

class SimStore {
  private state: SimState = initialState();
  private listeners = new Set<Listener>();
  private timer: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    if (typeof window !== "undefined") this.schedule();
  }

  getState = () => this.state;
  subscribe = (l: Listener) => {
    this.listeners.add(l);
    return () => {
      this.listeners.delete(l);
    };
  };
  private emit() {
    this.state = { ...this.state };
    this.listeners.forEach((l) => l());
  }

  setParam = <K extends keyof Params>(k: K, v: Params[K]) => {
    this.state.params = { ...this.state.params, [k]: v };
    if (k === "tickMs" || k === "running") this.schedule();
    this.emit();
  };
  resetParams = () => {
    this.state.params = { ...defaultParams };
    this.schedule();
    this.emit();
  };
  reseed = () => {
    const p = this.state.params;
    this.state = { ...initialState(), params: p };
    this.emit();
  };
  step = () => {
    this.tick();
    this.emit();
  };
  injectAlert = (sev: Severity = "high") => {
    const msgs: Record<Severity, string[]> = {
      critical: [
        "Derailment risk flagged on segment, traffic halted.",
        "Shock event 5.1g on RAKE — emergency stop.",
      ],
      high: [
        "Port congestion spike — rerouting active.",
        "Weather front intersecting corridor in T+90m.",
      ],
      med: ["Load imbalance detected on multimodal hub.", "Fuel anomaly on truck fleet segment."],
      low: ["AI rebalancing complete on regional cluster.", "Throughput optimization landed."],
    };
    const a: Alert = {
      id: id(),
      t: nowHM(),
      sev,
      msg: msgs[sev][Math.floor(Math.random() * 2)],
      node: NODES[Math.floor(Math.random() * NODES.length)],
    };
    this.state.alerts = [a, ...this.state.alerts].slice(0, 30);
    this.emit();
  };

  private schedule() {
    if (this.timer) clearTimeout(this.timer);
    if (!this.state.params.running) return;
    this.timer = setTimeout(() => {
      this.tick();
      this.emit();
      this.schedule();
    }, this.state.params.tickMs);
  }

  private tick() {
    const s = this.state;
    const p = s.params;
    s.tickCount += 1;

    const demand = p.demandMultiplier;
    const ai = p.aiAggressiveness / 100;
    const disrupt = p.disruptionLevel / 100;
    const weather = p.weatherSeverity / 100;
    const railTarget = p.railShareTarget;
    const carbon = p.carbonFocus / 100;

    // KPIs
    const k = { ...s.kpis };
    k.totalOrders += Math.round(rand(2, 14) * demand);
    k.activeShipments = clamp(
      Math.round(p.fleetSize * (0.7 + ai * 0.2 - weather * 0.15) + rand(-20, 20)),
      50,
      p.fleetSize,
    );
    const railDrift = (railTarget - k.railUtil) * 0.08 + rand(-0.6, 0.6) - weather * 0.4;
    k.railUtil = clamp(k.railUtil + railDrift, 40, 99);
    k.railDelta = +railDrift.toFixed(2);
    const roadDrift = -railDrift * 0.6 + rand(-0.5, 0.5) - disrupt * 0.3;
    k.roadUtil = clamp(k.roadUtil + roadDrift, 30, 98);
    k.roadDelta = +roadDrift.toFixed(2);
    k.aiScore = clamp(Math.round(60 + ai * 35 + rand(-1, 1)), 30, 100);
    k.costSavingsCr = +clamp(
      k.costSavingsCr + ai * 0.6 - (p.fuelPriceIndex - 100) * 0.04 + rand(-0.3, 0.3),
      0,
      9999,
    ).toFixed(1);
    k.carbonKt = +clamp(
      k.carbonKt + (carbon * 0.18 + k.railUtil / 1000) + rand(-0.05, 0.08),
      0,
      9999,
    ).toFixed(2);
    k.consolidated += Math.round(rand(5, 22) * demand * (0.6 + ai));
    k.emergency = p.emergencyMode
      ? Math.round(60 + rand(-5, 12))
      : Math.round(30 + disrupt * 30 + rand(-3, 3));
    k.fleetEff = +clamp(k.fleetEff + (ai * 0.2 - weather * 0.25) + rand(-0.3, 0.3), 40, 99).toFixed(
      2,
    );
    s.kpis = k;

    // Freight trend — rotate last bucket
    s.freightTrend = s.freightTrend.map((row, i) => {
      const isLast = i === s.freightTrend.length - 1;
      const jitter = isLast ? rand(-100, 200) : rand(-60, 60);
      const railBias = railTarget / 60;
      return {
        d: row.d,
        rail: clamp(Math.round(row.rail + jitter * railBias * demand), 1000, 12000),
        road: clamp(Math.round(row.road + jitter * (1.6 - railBias)), 800, 12000),
        multi: clamp(Math.round(row.multi + jitter * 0.9), 800, 10000),
      };
    });

    // Corridors
    s.corridorPerf = s.corridorPerf.map((c) => ({
      c: c.c,
      util: clamp(Math.round(c.util + rand(-3, 3) - weather * 1.2 + ai * 0.6), 40, 99),
    }));

    // Cost trend
    s.costTrend = s.costTrend.map((w, i) => ({
      m: w.m,
      cost: +clamp(w.cost + rand(-1.2, 0.8) + (p.fuelPriceIndex - 100) * 0.03, 80, 220).toFixed(1),
      saved: +clamp(w.saved + ai * 0.4 + rand(-0.6, 1), 0, 60).toFixed(1),
    }));

    // Shipments — decrement ETA; flip status by disruption
    s.shipments = s.shipments.map((sh) => {
      const dec = (p.tickMs / 1000) * (10 + ai * 4); // minutes per tick
      const eta = Math.max(0, sh.etaMin - dec);
      let status = sh.status;
      const r = Math.random();
      if (r < disrupt * 0.06) status = "delay_20m";
      else if (r < disrupt * 0.1) status = "rerouted";
      else if (r < 0.04) status = "on_schedule";
      const confidence = clamp(sh.confidence + rand(-2, 2) + ai - weather * 2, 50, 99);
      const updatedSh = {
        ...sh,
        etaMin: eta,
        status: status as unknown,
        confidence: Math.round(confidence),
      };
      if (typeof window !== "undefined" && !sh.id.startsWith("RAKE-")) {
        let dbStatus: "IN_TRANSIT" | "DELAYED" | "REROUTED" = "IN_TRANSIT";
        if (status === "delay_20m") dbStatus = "DELAYED";
        if (status === "rerouted") dbStatus = "REROUTED";
        const remainingKm = Math.round((eta * 65) / 60);
        if (sh.status !== status || Math.random() < 0.1) {
          triggerSimulatedEventFn({
            data: {
              id: `SIM-SHP-${Date.now()}`,
              type: "SHIPMENT_ETA_UPDATED",
              timestamp: new Date().toISOString(),
              payload: {
                shipmentId: sh.id,
                status: dbStatus,
                remainingKm,
                confidence: updatedSh.confidence,
              },
            },
          });
        }
      }
      if (eta === 0) {
        if (!sh.id.startsWith("RAKE-")) {
          updatedSh.etaMin = Math.round(rand(8 * 60, 48 * 60));
          updatedSh.status = "on_schedule";
        } else {
          updatedSh.id = `RAKE-${1000 + Math.floor(rand(0, 9000))}-${String.fromCharCode(65 + Math.floor(rand(0, 26)))}`;
          updatedSh.etaMin = Math.round(rand(8 * 60, 48 * 60));
          updatedSh.status = "on_schedule";
          updatedSh.cargo = CARGO[Math.floor(Math.random() * CARGO.length)];
        }
      }
      return updatedSh;
    });

    // Hardware telemetry
    s.hardware = {
      gpsNodes: clamp(Math.round(p.fleetSize + rand(-5, 5)), 0, 99999),
      fuelHealthy: +clamp(
        s.hardware.fuelHealthy + rand(-0.3, 0.3) - weather * 0.2,
        50,
        99.9,
      ).toFixed(1),
      shockEvents24h: clamp(
        s.hardware.shockEvents24h + (Math.random() < disrupt * 0.3 ? 1 : 0),
        0,
        99,
      ),
      mqttRate: Math.round(14000 + demand * 1500 + rand(-400, 400)),
    };
    if (typeof window !== "undefined") {
      const allVehicles = db.getVehicles();
      if (allVehicles.length > 0 && Math.random() < 0.4) {
        const v = allVehicles[Math.floor(Math.random() * allVehicles.length)];
        if (v.status === "in_transit") {
          triggerSimulatedEventFn({
            data: {
              id: `SIM-VEH-${Date.now()}`,
              type: "VEHICLE_GPS_PING",
              timestamp: new Date().toISOString(),
              payload: {
                vehicleId: v.vehicleId,
                lat: v.currentLocation.lat + (Math.random() - 0.5) * 0.01,
                lng: v.currentLocation.lng + (Math.random() - 0.5) * 0.01,
                address: v.currentLocation.address,
                speed: Math.max(0, Math.min(120, v.speed || 60 + (Math.random() - 0.5) * 10)),
              },
            },
          });
        }
      }
    }

    // Alerts — probabilistic spawn
    const spawnP = 0.08 + disrupt * 0.5 + weather * 0.2;
    if (Math.random() < spawnP) {
      const sev: Severity =
        Math.random() < disrupt * 0.15
          ? "critical"
          : Math.random() < disrupt * 0.5
            ? "high"
            : Math.random() < 0.5
              ? "med"
              : "low";
      this.injectAlertSilent(sev);
    }

    // Publish to LiveEventBus and keep persistent DB synchronized
    if (typeof window !== "undefined") {
      triggerSimulatedEventFn({
        data: {
          id: `TICK-${Date.now()}-${s.tickCount}`,
          type: "SIMULATION_TICK",
          timestamp: new Date().toISOString(),
          payload: {
            tickCount: s.tickCount,
            activeShipments: k.activeShipments,
            railUtil: k.railUtil,
            roadUtil: k.roadUtil,
            carbonKt: k.carbonKt,
            costSavingsCr: k.costSavingsCr,
            totalOrders: k.totalOrders,
          },
        },
      });
    }
  }

  private injectAlertSilent(sev: Severity) {
    const msgs: Record<Severity, string[]> = {
      critical: [
        "Derailment risk flagged on segment.",
        "Shock event detected — emergency stop initiated.",
      ],
      high: ["Port congestion spike — rerouting active.", "Weather front intersecting corridor."],
      med: ["Load imbalance detected on hub.", "Fuel anomaly on truck fleet."],
      low: ["AI rebalancing complete on cluster.", "Throughput optimization landed."],
    };
    const a: Alert = {
      id: id(),
      t: nowHM(),
      sev,
      msg: msgs[sev][Math.floor(Math.random() * msgs[sev].length)],
      node: NODES[Math.floor(Math.random() * NODES.length)],
    };
    this.state.alerts = [a, ...this.state.alerts].slice(0, 30);
  }
}

export const simStore = new SimStore();
