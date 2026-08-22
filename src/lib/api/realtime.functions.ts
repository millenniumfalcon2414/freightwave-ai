import { createServerFn } from "@tanstack/react-start";
import { serverEventBus, publishServerEvent } from "../realtime/serverEventBus";
import { LiveEvent } from "../realtime/liveEventBus";
import { z } from "zod";
import { db } from "../db/database";

export const getLiveEventsFn = createServerFn({ method: "GET" }).handler(async () => {
  return new Promise<LiveEvent[]>((resolve) => {
    const events: LiveEvent[] = [];
    const onEvent = (event: LiveEvent) => {
      events.push(event);
    };
    serverEventBus.on("event", onEvent);
    setTimeout(() => {
      serverEventBus.off("event", onEvent);
      resolve(events);
    }, 2000);
  });
});

const SimulatedEventSchema = z.object({
  id: z.string().optional(),
  type: z.string(),
  timestamp: z.string().optional(),
  payload: z.any(),
});

export const triggerSimulatedEventFn = createServerFn({ method: "POST" })
  .validator(SimulatedEventSchema)
  .handler(async ({ data }) => {
    const timestamp = data.timestamp || new Date().toISOString();
    const id = data.id || `SIM-${Date.now()}`;

    // 1. Persist SimulationEvent
    db.createSimulationEvent({
      id,
      timestamp,
      eventType: data.type,
      payload: JSON.stringify(data.payload),
    });

    // 2. update affected operational entity when applicable
    if (data.type === "VEHICLE_GPS_PING") {
      const p = data.payload as unknown;
      if (p.vehicleId) {
        db.updateVehicleLocation(
          p.vehicleId,
          { lat: p.lat, lng: p.lng, address: p.address },
          p.speed || 0,
          undefined,
          "Simulation",
          "system",
        );
      }
    } else if (data.type === "SHIPMENT_ETA_UPDATED") {
      const p = data.payload as unknown;
      if (p.shipmentId) {
        db.updateShipment(
          p.shipmentId,
          {
            status: p.status,
            remainingKm: p.remainingKm,
          },
          "Simulation",
          "system",
          "Simulated ETA Update",
        );
      }
    } else if (data.type === "FLEET_HEALTH_ALERT" || data.type === "EMERGENCY_STATUS_CHANGED") {
      const p = data.payload as unknown;
      if (p.alert && p.alert.type && p.alert.severity) {
        db.createAlert(
          {
            severity: p.alert.severity,
            type: p.alert.type,
            description: p.alert.description || "Simulated alert",
            riskScore: p.alert.riskScore || 50,
            recommendedAction: p.alert.recommendedAction || "Investigate",
            aiExplanation: p.alert.aiExplanation || {
              what: "Simulated event",
              why: ["Simulation triggered"],
              impact: "None",
              recommendedAction: "Acknowledge",
              confidence: 90,
            },
          },
          "Simulation",
          "system",
        );
      }
    }

    // 3. publishServerEvent
    publishServerEvent({
      id,
      type: data.type as unknown,
      timestamp,
      payload: {
        ...data.payload,
        _source: "SIMULATED", // Clearly mark simulated events
      },
    });

    return { success: true };
  });
