export type QaWorkflowType =
  | "PRE_DISPATCH_RAIL"
  | "ROAD_TRUCK_FITNESS"
  | "CONTAINER_LOADING"
  | "COLD_CHAIN_IOT"
  | "MID_TRANSIT_CHECKPOINT"
  | "INWARD_RECEIVING_EPOD";

export type InspectionStatus =
  "DRAFT" | "IN_PROGRESS" | "PASSED" | "CONDITIONALLY_PASSED" | "FAILED" | "REJECTED";

export type TransportInspectionMode =
  "RAIL_FREIGHT" | "ROAD_COMMERCIAL_TRUCK" | "MULTIMODAL_INTERMODAL";

export type QaStepId =
  | "manifest"
  | "wagon_seal"
  | "sensors_iot"
  | "brake_mechanical"
  | "defects_signoff"
  | "certificate";

export interface ChecklistItem {
  id: string;
  category:
    "MANIFEST" | "STRUCTURAL" | "SEAL" | "ENVIRONMENTAL" | "BRAKE" | "SAFETY" | "HIGHWAY_FITNESS";
  label: string;
  description: string;
  standardReference?: string; // e.g. "RDSO G-95", "CMVR Rule 138", "ISO 1496-1", "IMDG Code 3.2"
  required: boolean;
  passed: boolean;
  value?: string | number;
  notes?: string;
}

export interface SensorCalibrationData {
  tempProbeActive: boolean;
  tempProbeCalibrationDate: string;
  tempTargetMinC: number;
  tempTargetMaxC: number;
  currentTempReadingC: number;
  tempProbeZeroed: boolean;

  humidityTargetMaxPercent: number;
  currentHumidityReadingPercent: number;
  humiditySensorZeroed: boolean;

  shockMaxGForceAllowed: number;
  currentShockReadingG: number;
  accelerometerCalibrated: boolean;

  navicGpsLock: boolean;
  satelliteCount: number;
  signalStrengthDbm: number;

  batteryLevelPercent: number;
  tamperSensorArmed: boolean;
}

export interface RoadTruckFitnessMetrics {
  truckRegistrationNumber: string;
  vehicleMakeModel: string;
  grossVehicleWeightTons: number;
  fastagTagId: string;
  fastagStatusVerified: boolean;
  eWayBillNumber: string;
  eWayBillValidUntil: string;
  cmvrFitnessCertNumber: string;
  tyreTreadDepthMm: number; // Min required >= 3.0 mm
  tyrePressureAllAxlesPsi: number; // Target ~120 PSI
  fifthWheelKingpinLocked: boolean;
  airBrakeDualPressurePsi: number; // Target ~125 PSI
  emergencyBrakeActuatorPassed: boolean;
  retroReflectiveTapeInstalled: boolean;
  driverBreathalyzerPassed: boolean;
  driverSarathiDlVerified: boolean;
}

export interface BpcMetrics {
  locomotiveNumber: string;
  locoClass: string;
  rakeLengthWagons: number;
  brakePipePressureEngineKg: number; // Normal: ~5.0 kg/cm²
  brakePipePressureBrakeVanKg: number; // Normal: ~4.8 kg/cm²
  airContinuityTestPassed: boolean;
  pistonStrokeMm: number; // Range: 100-130mm
  brakePowerPercentage: number; // Target: >= 90% (e.g. 98.4%)
  hotAxleBoxTempC: number; // Max allowed: 65°C
  wheelFlangeVisualCheck: "GOOD" | "ACCEPTABLE" | "DEFECTIVE";
  handbrakeReleaseConfirmed: boolean;
  rdsoFitnessCertificateNumber: string;
}

export interface EvidencePhoto {
  id: string;
  category:
    | "SEAL_BARCODE"
    | "WAGON_BODY"
    | "LASHING_CHAINS"
    | "HAZMAT_LABEL"
    | "DEFECT_RECTIFIED"
    | "TRUCK_TYRE"
    | "FASTAG_EWAY";
  title: string;
  timestamp: string;
  locationName: string;
  gpsCoords: [number, number];
  dataUrl?: string;
  notes?: string;
}

export interface DefectItem {
  id: string;
  title: string;
  category: "STRUCTURAL" | "SEAL" | "MECHANICAL" | "SENSOR" | "DOCUMENTATION" | "HIGHWAY_SAFETY";
  severity: "MINOR" | "MAJOR" | "CRITICAL";
  rectificationStatus: "OPEN" | "RECTIFIED_ON_SITE" | "WAIVED_WITH_RESTRICTIONS";
  reportedTimestamp: string;
  rectifiedTimestamp?: string;
  remedyApplied?: string;
  inspectorRemarks: string;
}

export interface InspectorSignoff {
  inspectorName: string;
  inspectorId: string;
  badgeNumber: string;
  designation: string;
  zonalRailway: string;
  yardStationCode: string;
  signatureDataUrl?: string;
  signedTimestamp: string;
  witnessName?: string;
  witnessRole?: string;
  remarks?: string;
}

export interface QaCertificate {
  certificateNumber: string;
  qrCodePayload: string;
  issueTimestamp: string;
  validUntilTimestamp: string;
  clearanceStatus: "GREEN_CORRIDOR_CLEARED" | "CONDITIONAL_TRANSIT" | "REJECTED_GROUNDED";
  overallScorePercentage: number;
  rdsoComplianceBadge: string;
  digitalSignatureHash: string;
  pdfDownloadUrl?: string;
}

export interface InspectionRecord {
  id: string;
  shipmentId: string;
  consignmentNumber: string;
  wagonNumber: string;
  truckNumber?: string;
  transportMode?: TransportInspectionMode;
  trainNumber?: string;
  trainName?: string;
  corridor: string;
  cargoDescription: string;
  consignorName: string;
  consigneeName: string;
  inspectionType: QaWorkflowType;
  status: InspectionStatus;
  currentStepIndex: number;
  initiatedTimestamp: string;
  completedTimestamp?: string;
  locationName: string;
  zonalStationCode: string;

  // Step Data
  checklist: ChecklistItem[];
  sensorData: SensorCalibrationData;
  bpcMetrics: BpcMetrics;
  roadFitnessMetrics?: RoadTruckFitnessMetrics;
  evidencePhotos: EvidencePhoto[];
  defects: DefectItem[];
  inspectorSignoff?: InspectorSignoff;
  certificate?: QaCertificate;
}
