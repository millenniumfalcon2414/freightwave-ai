import { useSyncExternalStore } from "react";
import { simStore, type SimState } from "./engine";

export function useSim<T>(selector: (s: SimState) => T): T {
  return useSyncExternalStore(
    simStore.subscribe,
    () => selector(simStore.getState()),
    () => selector(simStore.getState()),
  );
}

export { simStore };
