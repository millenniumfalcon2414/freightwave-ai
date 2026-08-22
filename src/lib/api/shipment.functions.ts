import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../db/database";
import { publishServerEvent } from "../realtime/serverEventBus";
import { calculateShipmentRisk, generatePredictionRecord } from "../risk/riskEngine";
import { DbShipment } from "../db/types";

const AuthContextSchema = z.object({
  userId: z.string().optional(),
  userRole: z.string().default("logistics_manager"),
  userName: z.string().default("Logistics Controller"),
});

const CreateShipmentSchema = z.object({
  customer: z.string().min(2, "Customer name must be at least 2 characters"),
  customerPhone: z.string().optional(),
  origin: z.string().min(2, "Origin required"),
  originCoords: z.object({ lat: z.number(), lng: z.number() }),
  destination: z.string().min(2, "Destination required"),
  destCoords: z.object({ lat: z.number(), lng: z.number() }),
  cargoType: z.string().min(2, "Cargo type required"),
  cargoWeight: z.number().positive("Weight must be positive"),
  declaredValueInr: z.string().default("₹1.5 Cr"),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "STANDARD"]).default("HIGH"),
  mode: z.enum(["rail", "road", "multimodal"]).default("multimodal"),
  vehicleId: z.string().default("AUTO-ASSIGNED"),
  driverId: z.string().default("DRV-IND-101"),
  totalKm: z.number().positive().default(1200),
  activeRouteName: z.string().default("Western Dedicated Freight Corridor"),
  expectedDeliveryTime: z.string().default("Tomorrow, 14:00"),
  notes: z.string().optional(),
  auth: AuthContextSchema.optional(),
});

const UpdateShipmentSchema = z.object({
  shipmentId: z.string().min(1),
  status: z
    .enum(["BOOKED", "LOADED", "IN_TRANSIT", "DELAYED", "REROUTED", "AT_DESTINATION", "DELIVERED"])
    .optional(),
  routeDeviationKm: z.number().nonnegative().optional(),
  remainingKm: z.number().nonnegative().optional(),
  currentLocation: z
    .object({
      lat: z.number(),
      lng: z.number(),
      address: z.string(),
    })
    .optional(),
  notes: z.string().optional(),
  auth: AuthContextSchema.optional(),
});

const RerouteShipmentSchema = z.object({
  shipmentId: z.string().min(1),
  newRouteId: z.string().min(1),
  newRouteName: z.string().min(1),
  reason: z.string().min(3),
  auth: AuthContextSchema.optional(),
});

export const getShipmentsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const shipments = db.getShipments();
    return { success: true, shipments, total: shipments.length };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to retrieve shipments";
    return { success: false, error: msg, shipments: [] };
  }
});

export const getShipmentByIdFn = createServerFn({ method: "POST" })
  .validator(z.object({ shipmentId: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const shipment = db.getShipment(data.shipmentId);
      if (!shipment) {
        return { success: false, error: `Shipment ${data.shipmentId} not found` };
      }
      const prediction = db.getPredictionsForShipment(data.shipmentId);
      const alerts = db.getAlertsForShipment(data.shipmentId);
      return { success: true, shipment, prediction, alerts };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to retrieve shipment";
      return { success: false, error: msg };
    }
  });

export const createShipmentFn = createServerFn({ method: "POST" })
  .validator(CreateShipmentSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Operator";
      const userRole = data.auth?.userRole || "logistics_manager";

      const created = db.createShipment(
        {
          customer: data.customer,
          customerPhone: data.customerPhone,
          origin: data.origin,
          originCoords: data.originCoords,
          destination: data.destination,
          destCoords: data.destCoords,
          cargoType: data.cargoType,
          cargoWeight: data.cargoWeight,
          declaredValueInr: data.declaredValueInr,
          priority: data.priority,
          mode: data.mode,
          vehicleId: data.vehicleId,
          driverId: data.driverId,
          totalKm: data.totalKm,
          remainingKm: data.totalKm,
          activeRouteName: data.activeRouteName,
          expectedDeliveryTime: data.expectedDeliveryTime,
          originalEta: data.expectedDeliveryTime,
          departureTime: new Date().toISOString(),
          status: "BOOKED",
          currentLocation: {
            lat: data.originCoords.lat,
            lng: data.originCoords.lng,
            address: data.origin,
          },
          notes: data.notes,
        },
        userName,
        userRole,
      );

      return { success: true, shipment: created };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create shipment";
      return { success: false, error: msg };
    }
  });

export const updateShipmentFn = createServerFn({ method: "POST" })
  .validator(UpdateShipmentSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Operator";
      const userRole = data.auth?.userRole || "logistics_manager";

      const updated = db.updateShipment(
        data.shipmentId,
        {
          ...(data.status ? { status: data.status } : {}),
          ...(typeof data.routeDeviationKm === "number"
            ? { routeDeviationKm: data.routeDeviationKm }
            : {}),
          ...(typeof data.remainingKm === "number" ? { remainingKm: data.remainingKm } : {}),
          ...(data.currentLocation ? { currentLocation: data.currentLocation } : {}),
          ...(data.notes ? { notes: data.notes } : {}),
        },
        userName,
        userRole,
        "Telemetry / Status synchronization",
      );

      if (!updated) {
        return { success: false, error: `Shipment ${data.shipmentId} not found` };
      }

      publishServerEvent({ type: "SHIPMENT_ETA_UPDATED", payload: { shipment: updated } });
      return { success: true, shipment: updated };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update shipment";
      return { success: false, error: msg };
    }
  });

export const deleteShipmentFn = createServerFn({ method: "POST" })
  .validator(z.object({ shipmentId: z.string().min(1), auth: AuthContextSchema.optional() }))
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Operator";
      const userRole = data.auth?.userRole || "logistics_manager";

      const deleted = db.deleteShipment(data.shipmentId, userName, userRole);
      if (!deleted) {
        return { success: false, error: `Shipment ${data.shipmentId} not found` };
      }

      return { success: true, shipmentId: data.shipmentId };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to delete shipment";
      return { success: false, error: msg };
    }
  });

export const rerouteShipmentFn = createServerFn({ method: "POST" })
  .validator(RerouteShipmentSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Operator";
      const userRole = data.auth?.userRole || "dispatcher";

      const res = db.rerouteShipment(
        data.shipmentId,
        data.newRouteId,
        data.reason,
        userName,
        userRole,
      );

      if (!res.success) {
        return { success: false, error: res.message };
      }

      return { success: true, shipment: res.shipment, message: res.message };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to reroute shipment";
      return { success: false, error: msg };
    }
  });
