export type ShipmentStatus =
  | "BOOKED"
  | "LOADED"
  | "DEPARTED"
  | "IN_TRANSIT"
  | "AT_DESTINATION_STATION"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "DELAYED"
  | "PENDING";

export type TrackingStage =
  | "Cargo Booked"
  | "Loaded"
  | "Departed"
  | "In Transit"
  | "Destination Station"
  | "Out for Delivery"
  | "Delivered";

export interface GeoLocation {
  name: string;
  code?: string;
  type: "station" | "road_office" | "icd_hub" | "port" | "warehouse" | "current_gps";
  lat: number;
  lng: number;
  description?: string;
}

export interface TimelineEvent {
  id: string;
  title: string;
  location: string;
  timestamp: string;
  status: "COMPLETED" | "ACTIVE" | "UPCOMING";
  description: string;
  speedKmh?: number;
  mode: "rail" | "road" | "yard" | "warehouse";
  tag?: string;
}

export interface CargoDocument {
  id: string;
  title: string;
  docNumber: string;
  category:
    | "e-RR (Railway Receipt)"
    | "Consignment Note"
    | "Tax Invoice"
    | "Delivery Challan"
    | "Gate Pass"
    | "Inspection Certificate";
  issuedDate: string;
  fileSize: string;
  verified: boolean;
  downloadUrl?: string;
}

export interface CargoConditionTelemetry {
  temperatureC: number;
  temperatureTargetC: number;
  temperatureStatus: "Normal" | "Warning" | "Critical";
  humidityPct: number;
  humidityStatus: "Normal" | "Warning";
  vibrationG: number;
  vibrationStatus: "Normal" | "Warning";
  doorLocked: boolean;
  eSealId: string;
  doorStatus: "Secure & Locked" | "Tampered" | "Open";
  gpsSignal: "Connected" | "Weak" | "Offline";
  gpsConstellation: string;
  batteryPct: number;
  batteryLifeRemaining: string;
  tiltDegrees: number;
  lastSyncTime: string;
}

export interface TrainCarrierDetails {
  trainNumber: string;
  trainName: string;
  locomotiveType: string;
  locomotiveId: string;
  currentSpeedKmh: number;
  currentStation: string;
  nextStation: string;
  lastStationPassed: string;
  totalWagons: number;
  wagonNumber: string;
  wagonType: string; // e.g. "BOXN (High-Sided Open)", "BLCA (Container Flat)", "BTPN (Liquid Tanker)"
  trainStatus: "Running on Schedule" | "Delayed by 20m" | "Delayed by 45m" | "Early by 15m";
  locoPilotName: string;
  operatingDivision: string;
  corridorName: string;
  trackSection: string;
}

export interface DeliveryProof {
  deliveredAt: string;
  destinationAddress: string;
  receiverName: string;
  receiverDesignation: string;
  receiverPhone: string;
  digitalSignatureUrl?: string;
  ePodNumber: string;
  sealIntactVerified: boolean;
  gatePassCleared: boolean;
  totalPackagesReceived: number;
}

export interface CargoShipment {
  id: string; // e.g. "RAIL-IND-28491"
  consignmentNumber: string; // e.g. "RR-CR-2026-994182"
  title: string;
  customerName: string;
  customerId: string;

  // High-level UX summary
  currentLocationName: string;
  currentLocationType:
    "Railway Station" | "Yard" | "Road Highway" | "ICD Terminal" | "Consignee Hub";
  lastUpdatedMinutesAgo: number;
  status: ShipmentStatus;
  statusLabel: string;
  currentStageIndex: number; // 0..6 corresponding to stages

  // Origin & Destination
  origin: {
    name: string;
    hub: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    bookedDate: string;
    dispatchedDate: string;
  };
  destination: {
    name: string;
    hub: string;
    city: string;
    state: string;
    lat: number;
    lng: number;
    expectedDate: string;
    expectedTime: string;
  };

  // Route coordinates for Leaflet
  currentGps: {
    lat: number;
    lng: number;
    headingDeg: number;
  };
  railRouteCoords: [number, number][];
  roadDrayageCoords?: [number, number][];
  intermediateWaypoints: GeoLocation[];

  // ETA & Distance
  estimatedDeliveryDate: string;
  estimatedDeliveryTime: string;
  remainingDistanceKm: number;
  estimatedTravelTime: string;
  currentSpeedKmh: number;
  isDelayed: boolean;
  delayMinutes: number;
  delayReason?: string;

  // Cargo Specifics
  cargoType: string;
  cargoDescription: string;
  declaredValueInr: string;
  weightTons: number;
  packagesCount: number;
  packageType: string; // e.g., "Palletized Containers", "Heavy Steel Coils", "Reefer Totes"
  hazardousCode?: string;

  // Train & Multimodal Carrier info
  train: TrainCarrierDetails;
  roadDrayageTruck?: {
    vehicleNumber: string;
    driverName: string;
    driverPhone: string;
    transporterName: string;
  };

  // Timeline
  timeline: TimelineEvent[];

  // IoT Sensor Telemetry
  condition: CargoConditionTelemetry;

  // Documents
  documents: CargoDocument[];

  // Delivery Proof (if delivered)
  deliveryProof?: DeliveryProof;
}

export interface CargoAlert {
  id: string;
  shipmentId: string;
  type: "ON_SCHEDULE" | "DEPARTURE" | "DELAY" | "WEATHER" | "SENSOR" | "DELIVERED";
  severity: "info" | "success" | "warning" | "error";
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  role: "Cargo Owner / Consignor" | "Logistics Manager" | "Consignee";
  accountType: "Enterprise Freight Plus" | "Standard Business";
  gstin: string;
  activeShipmentsCount: number;
  totalShipments2026: number;
}
