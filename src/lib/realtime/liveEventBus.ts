export type LiveEventType =
  | "VEHICLE_GPS_PING"
  | "RAIL_WAGON_UPDATE"
  | "EMERGENCY_SOS_TRIGGERED"
  | "EMERGENCY_STATUS_CHANGED"
  | "FLEET_HEALTH_ALERT"
  | "SHIPMENT_ETA_UPDATED"
  | "NOTIFICATION_BROADCAST"
  | "GEOFENCE_BREACH"
  | "SIMULATION_TICK"
  | "PREDICTION_RECALCULATED";

export interface LiveEvent<T = Record<string, unknown>> {
  id: string;
  type: LiveEventType;
  timestamp: string;
  payload: T;
}

type EventCallback<T = Record<string, unknown>> = (event: LiveEvent<T>) => void;

class LiveEventBus {
  private subscribers: Map<LiveEventType | "*", Set<EventCallback<unknown>>> = new Map();
  private isConnected: boolean = true;
  private connectionListeners: Set<(connected: boolean) => void> = new Set();

  constructor() {
    // Client-side initialization without simulated heartbeat
  }

  public publish<T = Record<string, unknown>>(event: LiveEvent<T>) {
    const specificListeners = this.subscribers.get(event.type);
    if (specificListeners) {
      specificListeners.forEach((cb) => {
        try {
          cb(event as LiveEvent<unknown>);
        } catch (e) {
          console.error(`Error in event listener for ${event.type}`, e);
        }
      });
    }

    const wildcardListeners = this.subscribers.get("*");
    if (wildcardListeners) {
      wildcardListeners.forEach((cb) => {
        try {
          cb(event as LiveEvent<unknown>);
        } catch (e) {
          console.error(`Error in wildcard listener for ${event.type}`, e);
        }
      });
    }
  }

  public subscribe<T = Record<string, unknown>>(
    type: LiveEventType | "*",
    callback: EventCallback<T>,
  ): () => void {
    if (!this.subscribers.has(type)) {
      this.subscribers.set(type, new Set());
    }
    this.subscribers.get(type)!.add(callback as EventCallback<unknown>);

    return () => {
      const listeners = this.subscribers.get(type);
      if (listeners) {
        listeners.delete(callback as EventCallback<unknown>);
      }
    };
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public onConnectionChange(cb: (connected: boolean) => void): () => void {
    this.connectionListeners.add(cb);
    return () => this.connectionListeners.delete(cb);
  }
}

export const liveEventBus = new LiveEventBus();
