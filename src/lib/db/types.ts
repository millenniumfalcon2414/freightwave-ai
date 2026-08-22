import { z } from "zod";

export type RoleType =
  | "admin"
  | "super_admin"
  | "fleet_manager"
  | "logistics_manager"
  | "dispatcher"
  | "driver"
  | "analyst"
  | "viewer"
  | "customer";

export interface DbUser {
  id: string;
  name: string;
  email: string;
  role: RoleType;
  company: string;
  phone?: string;
  avatarLetter: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbVehicle {
  vehicleId: string;
  registrationNumber: string;
  driverId: string;
  driverName: string;
  driverPhone: string;
  currentShipmentId?: string;
  status: "in_transit" | "idle" | "maintenance" | "emergency" | "loading";
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  speed: number;
  expectedSpeed: number;
  utilization: number;
  riskScore: number;
  mode: "road" | "rail" | "electric_hauler";
  fuelOrBatteryPct: number;
  telemetry: {
    temperatureC: number;
    vibrationG: number;
    tirePressurePsi: number;
    odometerKm: number;
  };
  lastUpdated: string;
}

export interface DbDriver {
  driverId: string;
  name: string;
  phone: string;
  licenseNumber: string;
  bloodGroup: string;
  safetyScore: number;
  assignedVehicleId?: string;
  dutyStatus: "on_duty" | "resting" | "off_duty";
  dutyHoursToday: number;
  maxDutyHours: number;
  lastMedicalCheck: string;
}

export interface DbShipment {
  shipmentId: string;
  trackingNumber: string;
  customer: string;
  customerPhone?: string;
  origin: string;
  originCoords: { lat: number; lng: number };
  destination: string;
  destCoords: { lat: number; lng: number };
  cargoType: string;
  cargoWeight: number; // in metric tonnes
  declaredValueInr: string;
  vehicleId: string;
  driverId: string;
  priority: "CRITICAL" | "HIGH" | "MEDIUM" | "STANDARD";
  status:
    "BOOKED" | "LOADED" | "IN_TRANSIT" | "DELAYED" | "REROUTED" | "AT_DESTINATION" | "DELIVERED";
  departureTime: string;
  expectedDeliveryTime: string;
  originalEta: string;
  currentEta: string;
  predictedEta: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
  };
  remainingKm: number;
  totalKm: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  delayProbability: number; // 0..100
  estimatedDelayMinutes: number;
  routeDeviationKm: number;
  mode: "rail" | "road" | "multimodal";
  activeRouteName: string;
  alternativeRouteName?: string;
  isSimulated?: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DbTrackingEvent {
  id: string;
  eventId?: string;
  shipmentId: string;
  vehicleId: string;
  timestamp: string;
  lat: number;
  latitude?: number;
  lng: number;
  longitude?: number;
  speed: number;
  locationName: string;
  eventType:
    | "GPS_PING"
    | "GPS_UPDATE"
    | "CHECKPOINT"
    | "DEVIATION"
    | "ROUTE_DEVIATION"
    | "SPEED_DROP"
    | "SPEED_CHANGE"
    | "UNEXPECTED_STOP"
    | "STATUS_CHANGE"
    | "TRAFFIC_EVENT"
    | "WEATHER_EVENT"
    | "EMERGENCY"
    | "REROUTED"
    | "ALERT_TRIGGERED"
    | "DELIVERED"
    | string;
  description?: string;
  source?: string;
  metadata?: Record<string, unknown> | string;
  isSimulated?: boolean;
}

export interface DbAiExplanation {
  what: string;
  why: string[];
  impact: string;
  recommendedAction: string;
  confidence: number;
}

export interface DbAlert {
  alertId: string;
  severity: "INFO" | "WARNING" | "HIGH" | "CRITICAL";
  type:
    | "ROUTE_DEVIATION"
    | "CONGESTION_DELAY"
    | "SPEED_ANOMALY"
    | "TEMPERATURE_SPIKE"
    | "SHOCK_IMPACT"
    | "EMERGENCY_SOS"
    | "MAINTENANCE_DUE"
    | "WEATHER_ALERT";
  shipmentId?: string;
  vehicleId?: string;
  timestamp: string;
  description: string;
  riskScore: number;
  aiExplanation: DbAiExplanation;
  recommendedAction: string;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "ESCALATED";
  acknowledgedBy?: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export interface DbIncident {
  incidentId: string;
  time: string;
  vehicle?: string;
  vehicleId: string;
  vehicleNumber: string;
  shipment?: string;
  shipmentId?: string;
  driverName: string;
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  severity: "CRITICAL_LEVEL_1" | "HIGH_LEVEL_2" | "MEDIUM_LEVEL_3" | string;
  cause: string;
  actionTaken: string;
  status: "ACTIVE" | "DISPATCHED" | "CONTAINED" | "RESOLVED" | string;
  resolvedAt?: string;
  crewCount?: number;
  ambulanceDispatched?: boolean;
  cargoSafeguardActive?: boolean;
  notes?: string[];
}

export interface DbPrediction {
  id: string;
  predictionId?: string;
  shipmentId: string;
  calculatedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  originalEta: string;
  currentEta: string;
  predictedEta: string;
  delayMinutes: number;
  estimatedDelay?: number;
  delayProbability: number;
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  riskFactors?: string[];
  reason?: string;
  recommendedAction: string;
  explanation?: DbAiExplanation;
  history?: Array<{
    timestamp: string;
    predictedEta: string;
    riskScore: number;
    delayMinutes: number;
  }>;
}

export interface DbRoute {
  routeId: string;
  shipmentId?: string;
  name: string;
  origin: string;
  destination: string;
  mode: "rail" | "road" | "multimodal";
  routeType?: string;
  distance?: number;
  distanceKm: number;
  estimatedTime?: number;
  estimatedDurationHours: number;
  congestionScore: number; // 0..100
  risk?: number;
  riskScore: number;
  cost?: number;
  tollCostInr: number;
  freightCostInr: number;
  carbonKg: number;
  co2SavedPct: number;
  delayProbability?: number;
  path: [number, number][];
  isRecommended: boolean;
  description: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface DbSimulationEvent {
  id: string;
  simulationEventId?: string;
  timestamp: string;
  scenario?:
    | "NORMAL"
    | "HIGHWAY_CONGESTION"
    | "ROUTE_DEVIATION"
    | "TRACK_OBSTRUCTION"
    | "COLD_CHAIN_ALERT"
    | "CRASH_SOS"
    | "AI_REROUTE_SUCCESS"
    | string;
  eventType?: string;
  description?: string;
  payload?: Record<string, unknown> | string;
  affectedShipments?: string[];
  source?: string;
  isSimulated?: boolean;
}

export interface DbAuditLog {
  id: string;
  auditLogId?: string;
  timestamp: string;
  user: string;
  role: string;
  action: string;
  entity: "Shipment" | "Vehicle" | "Alert" | "Incident" | "Route" | "System" | string;
  entityId: string;
  previousValue?: string;
  newValue?: string;
  reason?: string;
}

export interface DatabaseState {
  users: DbUser[];
  vehicles: DbVehicle[];
  drivers: DbDriver[];
  shipments: DbShipment[];
  trackingEvents: DbTrackingEvent[];
  alerts: DbAlert[];
  incidents: DbIncident[];
  predictions: DbPrediction[];
  routes: DbRoute[];
  simulationEvents: DbSimulationEvent[];
  auditLogs: DbAuditLog[];
  lastUpdated: string;
}

// Zod Schemas for API Validation
export const ShipmentCreateInput = z.object({
  customer: z.string().min(2),
  origin: z.string().min(2),
  destination: z.string().min(2),
  cargoType: z.string().min(2),
  cargoWeight: z.number().positive(),
  priority: z.enum(["CRITICAL", "HIGH", "MEDIUM", "STANDARD"]),
  mode: z.enum(["rail", "road", "multimodal"]),
  vehicleId: z.string().optional(),
  driverId: z.string().optional(),
  notes: z.string().optional(),
});

export const RerouteInput = z.object({
  shipmentId: z.string().min(1),
  newRouteId: z.string().min(1),
  reason: z.string().min(2),
  user: z.string().min(1),
  role: z.string().min(1),
});

export const AlertActionInput = z.object({
  alertId: z.string().min(1),
  action: z.enum(["ACKNOWLEDGE", "RESOLVE", "ESCALATE"]),
  note: z.string().optional(),
  user: z.string().min(1),
  role: z.string().min(1),
});
