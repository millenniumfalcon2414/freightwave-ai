import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { db } from "../db/database";

const QueryAuditSchema = z.object({
  entity: z.enum(["Shipment", "Vehicle", "Alert", "Incident", "Route", "System"]).optional(),
  entityId: z.string().optional(),
  limit: z.number().min(1).max(200).default(50),
});

export const getAuditLogsFn = createServerFn({ method: "POST" })
  .validator(QueryAuditSchema)
  .handler(async ({ data }) => {
    try {
      let logs = db.getAuditLogs();
      if (data.entity) {
        logs = logs.filter((l) => l.entity === data.entity);
      }
      if (data.entityId) {
        logs = logs.filter((l) => l.entityId === data.entityId);
      }
      return { success: true, logs: logs.slice(0, data.limit), total: logs.length };
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "Failed to retrieve audit logs";
      return { success: false, error: msg, logs: [] };
    }
  });
