import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../db/database";
import { publishServerEvent } from "../realtime/serverEventBus";

const AuthContextSchema = z.object({
  userId: z.string().optional(),
  userRole: z.string().default("fleet_manager"),
  userName: z.string().default("Fleet Controller"),
});

const UpdateVehicleLocationSchema = z.object({
  vehicleId: z.string().min(1),
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  address: z.string().min(1),
  speed: z.number().nonnegative(),
  fuelOrBatteryPct: z.number().min(0).max(100).optional(),
  auth: AuthContextSchema.optional(),
});

const UpdateVehicleStatusSchema = z.object({
  vehicleId: z.string().min(1),
  status: z.enum(["in_transit", "idle", "maintenance", "emergency", "loading"]),
  reason: z.string().optional(),
  auth: AuthContextSchema.optional(),
});

export const getVehiclesFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const vehicles = db.getVehicles();
    return { success: true, vehicles, total: vehicles.length };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to retrieve vehicles";
    return { success: false, error: msg, vehicles: [] };
  }
});

export const getVehicleByIdFn = createServerFn({ method: "POST" })
  .validator(z.object({ vehicleId: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const vehicle = db.getVehicle(data.vehicleId);
      if (!vehicle) {
        return { success: false, error: `Vehicle ${data.vehicleId} not found` };
      }
      return { success: true, vehicle };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to retrieve vehicle";
      return { success: false, error: msg };
    }
  });

export const updateVehicleLocationFn = createServerFn({ method: "POST" })
  .validator(UpdateVehicleLocationSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Telemetry Ingestion";
      const userRole = data.auth?.userRole || "fleet_manager";

      const updated = db.updateVehicleLocation(
        data.vehicleId,
        {
          lat: data.lat,
          lng: data.lng,
          address: data.address,
        },
        data.speed,
        data.fuelOrBatteryPct,
        userName,
        userRole,
      );

      if (!updated) {
        return { success: false, error: `Vehicle ${data.vehicleId} not found` };
      }

      publishServerEvent({
        type: "VEHICLE_GPS_PING",
        payload: {
          vehicleId: data.vehicleId,
          lat: data.lat,
          lng: data.lng,
          address: data.address,
          speed: data.speed,
        },
      });

      return { success: true, vehicle: updated };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update vehicle location";
      return { success: false, error: msg };
    }
  });

const CreateVehicleSchema = z.object({
  vehicleId: z.string().min(1),
  registrationNumber: z.string().min(1),
  driverId: z.string().default("DRV-IND-101"),
  driverName: z.string().default("Unassigned"),
  driverPhone: z.string().default("+91 98765 00000"),
  currentShipmentId: z.string().optional(),
  status: z.enum(["in_transit", "idle", "maintenance", "emergency", "loading"]).default("idle"),
  currentLocation: z.object({
    lat: z.number(),
    lng: z.number(),
    address: z.string(),
  }),
  speed: z.number().default(0),
  expectedSpeed: z.number().default(65),
  utilization: z.number().default(85),
  riskScore: z.number().default(10),
  mode: z.enum(["road", "rail", "electric_hauler"]).default("road"),
  fuelOrBatteryPct: z.number().default(100),
  telemetry: z
    .object({
      temperatureC: z.number().default(4.2),
      vibrationG: z.number().default(0.15),
      tirePressurePsi: z.number().default(110),
      odometerKm: z.number().default(45000),
    })
    .default({
      temperatureC: 4.2,
      vibrationG: 0.15,
      tirePressurePsi: 110,
      odometerKm: 45000,
    }),
  auth: AuthContextSchema.optional(),
});

export const createVehicleFn = createServerFn({ method: "POST" })
  .validator(CreateVehicleSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Fleet Manager";
      const userRole = data.auth?.userRole || "fleet_manager";

      const created = db.createVehicle(
        {
          vehicleId: data.vehicleId,
          registrationNumber: data.registrationNumber,
          driverId: data.driverId,
          driverName: data.driverName,
          driverPhone: data.driverPhone,
          currentShipmentId: data.currentShipmentId,
          status: data.status,
          currentLocation: data.currentLocation,
          speed: data.speed,
          expectedSpeed: data.expectedSpeed,
          utilization: data.utilization,
          riskScore: data.riskScore,
          mode: data.mode,
          fuelOrBatteryPct: data.fuelOrBatteryPct,
          telemetry: data.telemetry,
          lastUpdated: new Date().toISOString(),
        },
        userName,
        userRole,
      );

      return { success: true, vehicle: created };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to create vehicle";
      return { success: false, error: msg };
    }
  });

export const updateVehicleStatusFn = createServerFn({ method: "POST" })
  .validator(UpdateVehicleStatusSchema)
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Fleet Manager";
      const userRole = data.auth?.userRole || "fleet_manager";

      const vehicle = db.getVehicle(data.vehicleId);
      if (!vehicle) {
        return { success: false, error: `Vehicle ${data.vehicleId} not found` };
      }

      const prevStatus = vehicle.status;
      vehicle.status = data.status;
      vehicle.lastUpdated = new Date().toISOString();

      db.addAuditLog({
        user: userName,
        role: userRole,
        action: `Vehicle status changed: ${prevStatus} → ${data.status}`,
        entity: "Vehicle",
        entityId: data.vehicleId,
        previousValue: prevStatus,
        newValue: data.status,
        reason: data.reason || "Manual fleet dispatch update",
      });

      return { success: true, vehicle };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to update vehicle status";
      return { success: false, error: msg };
    }
  });

export const deleteVehicleFn = createServerFn({ method: "POST" })
  .validator(z.object({ vehicleId: z.string().min(1), auth: AuthContextSchema.optional() }))
  .handler(async ({ data }) => {
    try {
      const userName = data.auth?.userName || "Fleet Manager";
      const userRole = data.auth?.userRole || "fleet_manager";

      const deleted = db.deleteVehicle(data.vehicleId, userName, userRole);
      if (!deleted) {
        return { success: false, error: `Vehicle ${data.vehicleId} not found` };
      }

      return { success: true, vehicleId: data.vehicleId };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to delete vehicle";
      return { success: false, error: msg };
    }
  });
