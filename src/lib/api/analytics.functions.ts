import { createServerFn } from "@tanstack/react-start";
import { db } from "../db/database";

export interface AnalyticsSummary {
  onTimeDeliveryRate: number; // 0..100
  averageDelayMinutes: number;
  activeShipmentsCount: number;
  atRiskShipmentsCount: number;
  criticalAlertsCount: number;
  resolvedIncidentsCount: number;
  totalFreightTonnes: number;
  averageRiskScore: number;
  fleetUtilizationPct: number;
  railModalSharePct: number;
  co2SavedTonnes: number;
  riskDistribution: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  modeDistribution: {
    rail: number;
    road: number;
    multimodal: number;
  };
  corridorPerformance: Array<{
    name: string;
    mode: string;
    riskScore: number;
    onTimePct: number;
    co2SavedPct: number;
    freightTonnes: number;
  }>;
  recentAuditCount: number;
}

export function computeDatabaseAnalytics(): AnalyticsSummary {
  const shipments = db.getShipments();
  const vehicles = db.getVehicles();
  const alerts = db.getAlerts();
  const incidents = db.getIncidents();
  const auditLogs = db.getAuditLogs();
  const routes = db.getRoutes();

  const totalShipments = shipments.length || 1;
  const onTimeCount = shipments.filter(
    (s) => s.status !== "DELAYED" && s.delayProbability < 30,
  ).length;
  const atRiskCount = shipments.filter((s) => s.riskScore >= 60 || s.status === "DELAYED").length;

  const totalDelayMins = shipments.reduce((acc, s) => acc + (s.estimatedDelayMinutes || 0), 0);
  const avgDelay = +(totalDelayMins / totalShipments).toFixed(1);

  const totalWeight = shipments.reduce((acc, s) => acc + (s.cargoWeight || 0), 0);
  const avgRisk = +(shipments.reduce((acc, s) => acc + s.riskScore, 0) / totalShipments).toFixed(1);

  const totalVehicles = vehicles.length || 1;
  const avgFleetUtil = +(
    vehicles.reduce((acc, v) => acc + (v.utilization || 80), 0) / totalVehicles
  ).toFixed(1);

  const railShipments = shipments.filter((s) => s.mode === "rail").length;
  const roadShipments = shipments.filter((s) => s.mode === "road").length;
  const multiShipments = shipments.filter((s) => s.mode === "multimodal").length;

  const railShare = +(((railShipments + multiShipments * 0.5) / totalShipments) * 100).toFixed(1);

  const riskDistribution = {
    low: shipments.filter((s) => s.riskLevel === "LOW").length,
    medium: shipments.filter((s) => s.riskLevel === "MEDIUM").length,
    high: shipments.filter((s) => s.riskLevel === "HIGH").length,
    critical: shipments.filter((s) => s.riskLevel === "CRITICAL").length,
  };

  const criticalAlerts = alerts.filter(
    (a) => a.severity === "CRITICAL" && a.status === "ACTIVE",
  ).length;
  const resolvedIncidents = incidents.filter((i) => i.status === "RESOLVED").length;

  const corridorPerformance = routes.map((r) => {
    const routeShipments = shipments.filter((s) =>
      s.activeRouteName.toLowerCase().includes(r.name.slice(0, 8).toLowerCase()),
    );
    const routeWeight = routeShipments.reduce((acc, s) => acc + s.cargoWeight, 0);
    const onTimeOnRoute = routeShipments.length
      ? Math.round(
          (routeShipments.filter((s) => s.delayProbability < 40).length / routeShipments.length) *
            100,
        )
      : r.mode === "rail"
        ? 94
        : 68;

    return {
      name: r.name,
      mode: r.mode,
      riskScore: r.riskScore,
      onTimePct: onTimeOnRoute,
      co2SavedPct: r.co2SavedPct,
      freightTonnes: routeWeight || Math.round(totalWeight * 0.3),
    };
  });

  return {
    onTimeDeliveryRate: Math.round((onTimeCount / totalShipments) * 100),
    averageDelayMinutes: avgDelay,
    activeShipmentsCount: shipments.filter(
      (s) => s.status === "IN_TRANSIT" || s.status === "DELAYED" || s.status === "REROUTED",
    ).length,
    atRiskShipmentsCount: atRiskCount,
    criticalAlertsCount: criticalAlerts,
    resolvedIncidentsCount: resolvedIncidents,
    totalFreightTonnes: +totalWeight.toFixed(1),
    averageRiskScore: avgRisk,
    fleetUtilizationPct: avgFleetUtil,
    railModalSharePct: railShare,
    co2SavedTonnes: +(totalWeight * 0.084).toFixed(1),
    riskDistribution,
    modeDistribution: {
      rail: railShipments,
      road: roadShipments,
      multimodal: multiShipments,
    },
    corridorPerformance,
    recentAuditCount: auditLogs.length,
  };
}

export const getAnalyticsSummaryFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const summary = computeDatabaseAnalytics();
    return { success: true, analytics: summary };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to calculate analytics";
    return { success: false, error: msg };
  }
});
