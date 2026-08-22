import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../db/database";

const AuthContextSchema = z.object({
  userId: z.string().optional(),
  userRole: z.string().default("fleet_manager"),
  userName: z.string().default("Emergency Dispatcher"),
});

const CreateIncidentSchema = z.object({
  vehicleId: z.string().min(1),
  vehicleNumber: z.string().min(1),
  shipmentId: z.string().optional(),
  driverName: z.string().min(1),
  location: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  severity: z.enum(["CRITICAL_LEVEL_1", "HIGH_LEVEL_2", "MEDIUM_LEVEL_3"]),
  cause: z.string().min(3),
  actionTaken: z.string().min(3),
  ambulanceDispatched: z.boolean().default(false),
  cargoSafeguardActive: z.boolean().default(false),
  auth: AuthContextSchema.optional(),
});

const UpdateIncidentStatusSchema = z.object({
  incidentId: z.string().min(1),
  status: z.enum(["ACTIVE", "DISPATCHED", "CONTAINED", "RESOLVED"]),
  actionTaken: z.string().optional(),
  note: z.string().optional(),
  auth: AuthContextSchema.optional(),
});

export const getIncidentsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const incidents = db.getIncidents();
    const activeCount = incidents.filter((i) => i.status !== "RESOLVED").length;
    return { success: true, incidents, total: incidents.length, activeCount };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to retrieve incidents";
    return { success: false, error: msg, incidents: [] };
  }
});

export const createIncidentFn = createServerFn({ method: "POST" })
  .validator(CreateIncidentSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "SOS Trigger";
      const userRole = data.auth?.userRole || "dispatcher";

      const created = db.createIncident(
        {
          vehicleId: data.vehicleId,
          vehicleNumber: data.vehicleNumber,
          shipmentId: data.shipmentId,
          driverName: data.driverName,
          location: data.location,
          severity: data.severity,
          cause: data.cause,
          actionTaken: data.actionTaken,
          ambulanceDispatched: data.ambulanceDispatched,
          cargoSafeguardActive: data.cargoSafeguardActive,
        },
        userName,
        userRole,
      );

      return { success: true, incident: created };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create incident";
      return { success: false, error: msg };
    }
  });

export const updateIncidentStatusFn = createServerFn({ method: "POST" })
  .validator(UpdateIncidentStatusSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Emergency Commander";
      const userRole = data.auth?.userRole || "dispatcher";

      const updated = db.updateIncidentStatus(
        data.incidentId,
        data.status,
        data.actionTaken,
        userName,
        userRole,
        data.note,
      );

      if (!updated) {
        return { success: false, error: `Incident ${data.incidentId} not found` };
      }

      return { success: true, incident: updated };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update incident";
      return { success: false, error: msg };
    }
  });
