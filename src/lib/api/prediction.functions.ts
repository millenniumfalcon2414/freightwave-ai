import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../db/database";

export const getPredictionsFn = createServerFn({ method: "GET" }).handler(async () => {
  try {
    const predictions = db.getPredictions();
    return { success: true, predictions, total: predictions.length };
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Failed to retrieve predictions";
    return { success: false, error: msg, predictions: [] };
  }
});

export const getPredictionsByShipmentIdFn = createServerFn({ method: "POST" })
  .validator(z.object({ shipmentId: z.string().min(1) }))
  .handler(async ({ data }) => {
    try {
      const predictions = db.getPredictionsForShipment(data.shipmentId);
      return { success: true, predictions };
    } catch (error: unknown) {
      const msg =
        error instanceof Error ? error.message : "Failed to retrieve shipment predictions";
      return { success: false, error: msg, predictions: [] };
    }
  });
