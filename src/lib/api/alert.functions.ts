import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../db/database";
import { publishServerEvent } from "../realtime/serverEventBus";

const AuthContextSchema = z.object({
  userId: z.string().optional(),
  userRole: z.string().default("dispatcher"),
  userName: z.string().default("Dispatch Operator"),
});

const AlertActionSchema = z.object({
  alertId: z.string().min(1),
  action: z.enum(["ACKNOWLEDGE", "RESOLVE", "ESCALATE"]),
  note: z.string().optional(),
  auth: AuthContextSchema.optional(),
});

const CreateAlertSchema = z.object({
  severity: z.enum(["INFO", "WARNING", "HIGH", "CRITICAL"]),
  type: z.enum([
    "ROUTE_DEVIATION",
    "CONGESTION_DELAY",
    "SPEED_ANOMALY",
    "TEMPERATURE_SPIKE",
    "SHOCK_IMPACT",
    "EMERGENCY_SOS",
    "MAINTENANCE_DUE",
    "WEATHER_ALERT",
  ]),
  shipmentId: z.string().optional(),
  vehicleId: z.string().optional(),
  description: z.string().min(3),
  riskScore: z.number().min(0).max(100),
  recommendedAction: z.string().min(3),
  aiExplanation: z.object({
    what: z.string(),
    why: z.array(z.string()),
    impact: z.string(),
    recommendedAction: z.string(),
    confidence: z.number().min(0).max(100),
  }),
  auth: AuthContextSchema.optional(),
});

export const getAlertsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const alerts = db.getAlerts();
    const activeCount = alerts.filter((a) => a.status === "ACTIVE").length;
    return { success: true, alerts, total: alerts.length, activeCount };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to retrieve alerts";
    return { success: false, error: msg, alerts: [], total: 0, activeCount: 0 };
  }
});

export const createAlertFn = createServerFn({ method: "POST" })
  .validator(CreateAlertSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "System Detection Engine";
      const userRole = data.auth?.userRole || "system";

      const created = db.createAlert(
        {
          severity: data.severity,
          type: data.type,
          shipmentId: data.shipmentId,
          vehicleId: data.vehicleId,
          description: data.description,
          riskScore: data.riskScore,
          recommendedAction: data.recommendedAction,
          aiExplanation: data.aiExplanation,
        },
        userName,
        userRole,
      );

      publishServerEvent({ type: "FLEET_HEALTH_ALERT", payload: { alert: created } });
      return { success: true, alert: created };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create alert";
      return { success: false, error: msg };
    }
  });

export const performAlertActionFn = createServerFn({ method: "POST" })
  .validator(AlertActionSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Operator";
      const userRole = data.auth?.userRole || "dispatcher";

      const updated = db.updateAlertStatus(
        data.alertId,
        data.action,
        userName,
        userRole,
        data.note,
      );

      if (!updated) {
        return { success: false, error: `Alert ${data.alertId} not found` };
      }

      publishServerEvent({ type: "EMERGENCY_STATUS_CHANGED", payload: { alert: updated } });
      return { success: true, alert: updated };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update alert";
      return { success: false, error: msg };
    }
  });
