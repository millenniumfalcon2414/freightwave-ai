import { useSyncExternalStore } from "react";
import { emergencyStore } from "./emergencyStore";
import { AccidentIncident } from "@/types/emergency";

export function useEmergency<T>(selector: (store: typeof emergencyStore) => T): T {
  return useSyncExternalStore(
    emergencyStore.subscribe,
    () => selector(emergencyStore),
    () => selector(emergencyStore),
  );
}

export function useActiveIncident(): AccidentIncident | null {
  return useEmergency((s) => s.getActiveIncident());
}

export function useIncidentHistory(): AccidentIncident[] {
  return useEmergency((s) => s.getIncidentHistory());
}

export function useIsSirenActive(): boolean {
  return useEmergency((s) => s.isSirenActive());
}
