export type AccidentSeverity = "CRITICAL_LEVEL_1" | "SEVERE_LEVEL_2" | "MODERATE_LEVEL_3";

export type IncidentStatus =
  "DETECTED" | "DISPATCHING" | "AMBULANCE_EN_ROUTE" | "HOSPITAL_TRIAGE" | "RESOLVED";

export type VehicleType = "truck" | "freight_rake" | "drayage_carrier" | "intermodal_container";

export interface AmbulanceUnit {
  id: string;
  unitName: string;
  type: "Advanced Life Support (ALS)" | "Basic Life Support (BLS)" | "Neonatal / Trauma Unit";
  status: "Assigned" | "En Route with Siren" | "Arrived at Scene" | "Transporting to Hospital";
  etaMinutes: number;
  distanceKm: number;
  contactNumber: string;
  paramedicLead: string;
  vehicleRegistration: string;
  currentCoordinates: { lat: number; lng: number };
  equippedWith: string[];
}

export interface NearbyHospital {
  id: string;
  name: string;
  category: "AIIMS Apex Trauma Center" | "Super-Specialty Hospital" | "District Civil Hospital";
  traumaLevel: "Level 1 (Highest)" | "Level 2" | "Level 3";
  distanceKm: number;
  travelTimeMin: number;
  contactPhone: string;
  emergencyDepartmentHead: string;
  address: string;
  coordinates: { lat: number; lng: number };
  availableBeds: {
    traumaBays: number;
    icuVentilators: number;
    burnsUnit: number;
    bloodO_NegUnits: number;
  };
  preArrivalNotified: boolean;
  traumaBayReserved: string;
}

export interface NearbyStation {
  id: string;
  stationName: string;
  type:
    "Railway Division / Junction" | "Dedicated Freight Corridor Control" | "Highway Police Station";
  stationMasterName: string;
  contactPhone: string;
  distanceKm: number;
  emergencyActionStatus:
    "SIGNAL_TRIP_HALTED" | "TRACTION_POWER_CUT" | "ROAD_CORDON_ACTIVE" | "STANDBY";
  actionLog: string;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  relativeSec: number;
  actor:
    | "TELEMATICS_IMU"
    | "ECALL_AUTOMATION"
    | "AMBULANCE_108"
    | "HOSPITAL_TRAUMA"
    | "STATION_MASTER"
    | "POLICE_112"
    | "CARGO_PRESERVATION"
    | "HAZMAT_SALVAGE";
  title: string;
  description: string;
  verified: boolean;
}

export interface CargoSensorsTelemetry {
  internalTempC: number;
  targetTempC: number;
  humidityPct: number;
  pressureKpa: number;
  shockAbsorptionPct: number;
  tiltDeg: number;
  oxygenLevelPct: number;
  vocToxicPpm: number;
  liquidSpillDetected: boolean;
  thermalRunawayRisk: "None" | "Low" | "Elevated" | "Suppressed";
  backupBatteryPct: number;
  backupBatteryHours: number;
}

export interface CargoProtectionSystem {
  cargoCategory:
    | "Lithium-Ion Batteries & Precision Electronics"
    | "Cold-Chain Pharmaceuticals & Vaccines"
    | "Hazardous Flammable Chemicals (Class 3/8)"
    | "Perishable Fresh Produce & Dairy"
    | "High-Value Industrial Machinery";
  declaredValueInr: string;
  preservationStatus:
    | "Fully Secured & Inert"
    | "Cryo-Backup Active"
    | "Airbag Dunnage Deployed"
    | "Cross-Dock Salvage En Route";
  airbagDunnage: {
    deployed: boolean;
    deploymentLatencyMs: number;
    kineticShockAbsorbedPct: number;
    loadDisplacementMm: number;
  };
  inertGasPurge: {
    active: boolean;
    gasType: "Nitrogen (N2) Flood" | "Clean Agent Aerosol" | "Argon Shield";
    chamberOxygenPct: number;
    fireRiskNeutralized: boolean;
  };
  coldChainAux: {
    active: boolean;
    compressorPowerSource:
      "Auxiliary 240V LiFePO4 Inverter" | "Cryogenic Liquid Jet" | "Normal Grid";
    temperatureC: number;
    targetTemperatureC: number;
    tempDeviationC: number;
    coolingAutonomyHours: number;
  };
  hermeticSeal: {
    sealStatus: "100% Intact & Locked" | "Micro-Breach Compensated" | "Compromised";
    isolationValvesLocked: boolean;
    antiSpillBafflesEngaged: boolean;
    tamperTokenHash: string;
  };
  salvageUnit: {
    id: string;
    teamName: string;
    unitType: "Heavy Hazmat Containment & Reefer Recovery Unit" | "Mobile 40T Crane & Reefer Fleet";
    status: "Dispatched with Siren" | "On-Site Conducting Cross-Dock" | "Standby";
    etaMinutes: number;
    distanceKm: number;
    contactPhone: string;
    teamLead: string;
    designatedTransferBay: string;
    coordinates: { lat: number; lng: number };
  };
  telemetry: CargoSensorsTelemetry;
  mitigationLogs: string[];
}

export interface AccidentIncident {
  id: string;
  title: string;
  vehicleId: string;
  vehicleType: VehicleType;
  vehicleNumber: string;
  driverName: string;
  driverPhone: string;
  driverBloodGroup: string;
  corridor: string;
  landmark: string;
  coordinates: { lat: number; lng: number };
  impactTime: string;
  gForce: number;
  speedAtImpactKmh: number;
  rolloverAngleDeg: number;
  severity: AccidentSeverity;
  cargoDescription: string;
  hazmatCode?: string;
  status: IncidentStatus;
  driverStatus: "Trapped / Critical" | "Conscious / Injured" | "Unresponsive" | "Stable";
  crewCount: number;
  ambulance: AmbulanceUnit;
  hospital: NearbyHospital;
  station: NearbyStation;
  cargoProtection: CargoProtectionSystem;
  policeStation: {
    name: string;
    contactPhone: string;
    patrolUnit: string;
    distanceKm: number;
  };
  fireBrigade: {
    name: string;
    contactPhone: string;
    hazmatUnitDispatched: boolean;
    distanceKm: number;
  };
  timeline: IncidentTimelineEvent[];
  aiTriageSummary: string;
}
