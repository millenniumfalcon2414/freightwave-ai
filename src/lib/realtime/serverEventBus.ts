import { EventEmitter } from "events";
import { LiveEvent } from "./liveEventBus";

// Global singleton to prevent memory leaks in dev
const globalAny = global as unknown;
if (!globalAny.__serverEventBus) {
  globalAny.__serverEventBus = new EventEmitter();
  globalAny.__serverEventBus.setMaxListeners(100);
}

export const serverEventBus: EventEmitter = globalAny.__serverEventBus;

export function publishServerEvent(event: Omit<LiveEvent, "timestamp" | "id"> & { id?: string }) {
  const fullEvent: LiveEvent = {
    ...event,
    id: event.id || `EVT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
  };
  serverEventBus.emit("event", fullEvent);
}
