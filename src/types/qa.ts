export type QaWorkflowType =
  | "PRE_DISPATCH_RAIL"
  | "CONTAINER_LOADING"
  | "COLD_CHAIN_IOT"
  | "MID_TRANSIT_CHECKPOINT"
  | "INWARD_RECEIVING_EPOD";

export type InspectionStatus =
  "DRAFT" | "IN_PROGRESS" | "PASSED" | "CONDITIONALLY_PASSED" | "FAILED" | "REJECTED";

export type QaStepId =
  | "manifest"
  | "wagon_seal"
  | "sensors_iot"
  | "brake_mechanical"
  | "defects_signoff"
  | "certificate";

export interface ChecklistItem {
  id: string;
  category: "MANIFEST" | "STRUCTURAL" | "SEAL" | "ENVIRONMENTAL" | "BRAKE" | "SAFETY";
  label: string;
  description: string;
  standardReference?: string; // e.g. "RDSO G-95", "ISO 1496-1", "IMDG Code 3.2"
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
  category: "SEAL_BARCODE" | "WAGON_BODY" | "LASHING_CHAINS" | "HAZMAT_LABEL" | "DEFECT_RECTIFIED";
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
  category: "STRUCTURAL" | "SEAL" | "MECHANICAL" | "SENSOR" | "DOCUMENTATION";
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
  evidencePhotos: EvidencePhoto[];
  defects: DefectItem[];
  inspectorSignoff?: InspectorSignoff;
  certificate?: QaCertificate;
}
