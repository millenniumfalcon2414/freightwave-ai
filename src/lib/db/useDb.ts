import { useSuspenseQuery } from "@tanstack/react-query";
import { getDatabaseSnapshotFn } from "../api/database.functions";
import { DatabaseState } from "./types";

export function useDb<T = DatabaseState>(selector?: (state: DatabaseState) => T): T {
  const { data } = useSuspenseQuery({
    queryKey: ["db_snapshot"],
    queryFn: async () => {
      try {
        const res = await getDatabaseSnapshotFn();
        if (!res) {
          throw new Error("Unable to load operational data");
        }
        return res as DatabaseState;
      } catch (err) {
        console.error("Failed to fetch DB snapshot", err);
        throw new Error("Unable to load operational data");
      }
    },
  });

  return selector ? selector(data) : (data as T);
}

export function useShipments() {
  return useDb((s) => s.shipments);
}

export function useShipment(id: string) {
  return useDb((s) => s.shipments.find((ship) => ship.shipmentId === id));
}

export function useVehicles() {
  return useDb((s) => s.vehicles);
}

export function useAlerts() {
  return useDb((s) => s.alerts);
}

export function useIncidents() {
  return useDb((s) => s.incidents);
}

export function usePredictions() {
  return useDb((s) => s.predictions);
}

export function useRoutes() {
  return useDb((s) => s.routes);
}

export function useAuditLogs() {
  return useDb((s) => s.auditLogs);
}
