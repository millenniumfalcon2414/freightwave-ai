import { useSyncExternalStore } from "react";
import {
  InspectionRecord,
  QaWorkflowType,
  ChecklistItem,
  SensorCalibrationData,
  BpcMetrics,
  EvidencePhoto,
  DefectItem,
  InspectorSignoff,
  QaCertificate,
} from "@/types/qa";

const DEFAULT_CHECKLIST: ChecklistItem[] = [
  {
    id: "chk-manifest-match",
    category: "MANIFEST",
    label: "e-RR Consignment & FOIS Weight Bridge Match",
    description:
      "Verified gross tare weight against FOIS electronic railway receipt (<2% variance).",
    standardReference: "FOIS Freight Code Sec 12",
    required: true,
    passed: true,
  },
  {
    id: "chk-hazmat-placard",
    category: "MANIFEST",
    label: "Hazardous Materials (Hazmat) & UN Code Audit",
    description:
      "IMDG/RDSO hazardous diamond classification placards affixed correctly on both sides.",
    standardReference: "IRCA Red Tariff No. 20",
    required: true,
    passed: true,
  },
  {
    id: "chk-wagon-structural",
    category: "STRUCTURAL",
    label: "Container Shell & Roof Integrity Inspection",
    description:
      "Checked for structural dents, corrosion, twist-lock seating, and floor water-tightness.",
    standardReference: "ISO 1496-1 Freight Grade A",
    required: true,
    passed: true,
  },
  {
    id: "chk-lashing-tension",
    category: "STRUCTURAL",
    label: "Heavy Cargo Lashing Chains & Dunnage Airbag Pressure",
    description: "Lash tension chains torqued to 28 kN; dunnage airbag inflated to 0.28 bar.",
    standardReference: "RDSO Wagon Lashing Manual 2024",
    required: true,
    passed: true,
  },
  {
    id: "chk-rfid-seal",
    category: "SEAL",
    label: "Electronic High-Security e-Seal (RFID) Verification",
    description:
      "Scanned tamper-evident cryptographic barcode; matched with central FOIS registry.",
    standardReference: "ISO 17712:2013 Grade 'H'",
    required: true,
    passed: true,
  },
  {
    id: "chk-door-tamper-bolt",
    category: "SEAL",
    label: "Dual Cam Door Locking & Anti-Theft Bolt Locking",
    description: "Both container door handles sealed with hardened 18mm carbon steel lock pins.",
    standardReference: "Indian Railways Security Directive 88/B",
    required: true,
    passed: true,
  },
  {
    id: "chk-iot-sensor-zero",
    category: "ENVIRONMENTAL",
    label: "Cold-Chain Temperature Probe & Humidity Zero Calibration",
    description:
      "PT100 dual probes calibrated against thermal dry-well standard (±0.2°C accuracy).",
    standardReference: "NABL Temperature Standard",
    required: true,
    passed: true,
  },
  {
    id: "chk-shock-accelerometer",
    category: "ENVIRONMENTAL",
    label: "3-Axis Impact & Vibration Shock Logger Armed",
    description: "Accelerometer zero-g offset tuned; buffer shock alert threshold set to 1.2G.",
    standardReference: "ASTM D4169 Rail Transit Profile",
    required: true,
    passed: true,
  },
  {
    id: "chk-bpc-air-pressure",
    category: "BRAKE",
    label: "Brake Pipe Air Pressure & Train Continuity Test",
    description: "Engine 5.0 kg/cm², Brake Van 4.8 kg/cm²; maximum drop < 0.2 kg/cm² in 3 minutes.",
    standardReference: "RDSO G-95 Air Brake Manual",
    required: true,
    passed: true,
  },
  {
    id: "chk-axle-pyrometer",
    category: "SAFETY",
    label: "Infrared Axle-Box Hot-Box Pyrometer Scan",
    description: "All 8 journal bearings scanned; operating temperature below 48°C (Limit: 65°C).",
    standardReference: "RDSO Mechanical Directive 142",
    required: true,
    passed: true,
  },
];

const INITIAL_INSPECTIONS: InspectionRecord[] = [
  {
    id: "QA-2026-BLR-001",
    shipmentId: "RAIL-IND-28491",
    consignmentNumber: "RR-CR-2026-994182",
    wagonNumber: "WAG-9-41029 (BLCA-49)",
    trainNumber: "12849-DFC",
    trainName: "Western DFC Super-Fast Freight Corridor Express",
    corridor: "BLR-DEL (Bengaluru → Tughlakabad ICD)",
    cargoDescription: "Industrial CNC Machinery & High-Precision Turbines",
    consignorName: "Bharat Heavy Engineering & Logistics Ltd.",
    consigneeName: "Northern Power Infra Equipment Hub, New Delhi",
    inspectionType: "PRE_DISPATCH_RAIL",
    status: "PASSED",
    currentStepIndex: 5,
    initiatedTimestamp: "20 Aug 2026, 04:15 PM",
    completedTimestamp: "20 Aug 2026, 05:30 PM",
    locationName: "Bengaluru Whitefield Goods Yard, Siding #4",
    zonalStationCode: "SWR-WFD",
    checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, passed: true })),
    sensorData: {
      tempProbeActive: true,
      tempProbeCalibrationDate: "20 Aug 2026, 04:30 PM",
      tempTargetMinC: 15.0,
      tempTargetMaxC: 28.0,
      currentTempReadingC: 22.4,
      tempProbeZeroed: true,
      humidityTargetMaxPercent: 65,
      currentHumidityReadingPercent: 48,
      humiditySensorZeroed: true,
      shockMaxGForceAllowed: 1.2,
      currentShockReadingG: 0.12,
      accelerometerCalibrated: true,
      navicGpsLock: true,
      satelliteCount: 14,
      signalStrengthDbm: -68,
      batteryLevelPercent: 98,
      tamperSensorArmed: true,
    },
    bpcMetrics: {
      locomotiveNumber: "WAG-12B #60098",
      locoClass: "Twin Co-Co 12,000 HP Heavy Haul Electric",
      rakeLengthWagons: 45,
      brakePipePressureEngineKg: 5.0,
      brakePipePressureBrakeVanKg: 4.85,
      airContinuityTestPassed: true,
      pistonStrokeMm: 112,
      brakePowerPercentage: 98.4,
      hotAxleBoxTempC: 42.1,
      wheelFlangeVisualCheck: "GOOD",
      handbrakeReleaseConfirmed: true,
      rdsoFitnessCertificateNumber: "RDSO/SWR/BPC/2026/88921",
    },
    evidencePhotos: [
      {
        id: "ev-01",
        category: "SEAL_BARCODE",
        title: "RFID e-Seal Tamper Verification Barcode",
        timestamp: "20 Aug 2026, 04:45 PM",
        locationName: "Whitefield Siding #4",
        gpsCoords: [12.9698, 77.7499],
        dataUrl:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
        notes: "Cryptographic hash matches central FOIS database 100%.",
      },
      {
        id: "ev-02",
        category: "LASHING_CHAINS",
        title: "Heavy CNC Machine Grade 80 Lashing Chains",
        timestamp: "20 Aug 2026, 05:00 PM",
        locationName: "Whitefield Siding #4",
        gpsCoords: [12.9698, 77.7499],
        dataUrl:
          "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=600&q=80",
        notes: "Tension load test passed without slack.",
      },
    ],
    defects: [
      {
        id: "def-01",
        title: "Minor surface paint scuff on container corner post",
        category: "STRUCTURAL",
        severity: "MINOR",
        rectificationStatus: "RECTIFIED_ON_SITE",
        reportedTimestamp: "20 Aug 2026, 04:25 PM",
        rectifiedTimestamp: "20 Aug 2026, 04:40 PM",
        remedyApplied: "Anti-corrosion primer coating applied on site.",
        inspectorRemarks: "No structural deformation detected; fully sound.",
      },
    ],
    inspectorSignoff: {
      inspectorName: "Virender Kumar Sharma",
      inspectorId: "IR-QA-77291",
      badgeNumber: "SWR-SENIOR-SE-44",
      designation: "Senior Section Engineer (C&W) / Chief Freight Inspector",
      zonalRailway: "South Western Railway (SWR)",
      yardStationCode: "WFD Goods Yard",
      signedTimestamp: "20 Aug 2026, 05:25 PM",
      witnessName: "Rajeev Nambiar (Loco Pilot 1st Class)",
      witnessRole: "Loco Operations",
      remarks: "Rake inspected and certified fit for Western DFC high-speed freight run.",
    },
    certificate: {
      certificateNumber: "RDSO-BPC-SWR-2026-99418",
      qrCodePayload:
        "RAILFLOW-IR-QA-VERIFIED:RAIL-IND-28491:BPC-98.4%:RDSO-SWR-2026-99418:APPROVED",
      issueTimestamp: "20 Aug 2026, 05:30 PM",
      validUntilTimestamp: "27 Aug 2026, 05:30 PM",
      clearanceStatus: "GREEN_CORRIDOR_CLEARED",
      overallScorePercentage: 99.4,
      rdsoComplianceBadge: "RDSO G-95 GRADE A+",
      digitalSignatureHash: "SHA256:7c9e9b28a410efd910b832104fa2810ce8891048b",
    },
  },
  {
    id: "QA-2026-JNPT-042",
    shipmentId: "RAIL-IND-39104",
    consignmentNumber: "RR-WR-2026-773199",
    wagonNumber: "BTPN-TANKER-884",
    trainNumber: "39104-WDFC",
    trainName: "Special Container Express - JNPT Dadri",
    corridor: "MUM-DEL (JNPT Port → Dadri ICD)",
    cargoDescription: "Automotive Precision Sub-Assemblies & Stamped Steel Parts",
    consignorName: "Mahindra Logistics & Auto Freight Corp",
    consigneeName: "Maruti Suzuki Plant Siding, Manesar",
    inspectionType: "PRE_DISPATCH_RAIL",
    status: "PASSED",
    currentStepIndex: 5,
    initiatedTimestamp: "19 Aug 2026, 02:00 PM",
    completedTimestamp: "19 Aug 2026, 03:15 PM",
    locationName: "JNPT Container Freight Yard, Nhava Sheva",
    zonalStationCode: "CR-JNPT",
    checklist: DEFAULT_CHECKLIST.map((c) => ({ ...c, passed: true })),
    sensorData: {
      tempProbeActive: true,
      tempProbeCalibrationDate: "19 Aug 2026, 02:15 PM",
      tempTargetMinC: 10.0,
      tempTargetMaxC: 35.0,
      currentTempReadingC: 28.1,
      tempProbeZeroed: true,
      humidityTargetMaxPercent: 70,
      currentHumidityReadingPercent: 54,
      humiditySensorZeroed: true,
      shockMaxGForceAllowed: 1.0,
      currentShockReadingG: 0.08,
      accelerometerCalibrated: true,
      navicGpsLock: true,
      satelliteCount: 16,
      signalStrengthDbm: -62,
      batteryLevelPercent: 100,
      tamperSensorArmed: true,
    },
    bpcMetrics: {
      locomotiveNumber: "WAG-9HC #32901",
      locoClass: "Co-Co 9,000 HP Freight Electric",
      rakeLengthWagons: 42,
      brakePipePressureEngineKg: 5.0,
      brakePipePressureBrakeVanKg: 4.8,
      airContinuityTestPassed: true,
      pistonStrokeMm: 118,
      brakePowerPercentage: 97.2,
      hotAxleBoxTempC: 39.8,
      wheelFlangeVisualCheck: "GOOD",
      handbrakeReleaseConfirmed: true,
      rdsoFitnessCertificateNumber: "RDSO/WR/BPC/2026/44019",
    },
    evidencePhotos: [
      {
        id: "ev-03",
        category: "SEAL_BARCODE",
        title: "Customs High Security Bolt Seal",
        timestamp: "19 Aug 2026, 02:30 PM",
        locationName: "JNPT Gate 3",
        gpsCoords: [18.9498, 72.95],
        dataUrl:
          "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
        notes: "Indian Customs seal verified intact.",
      },
    ],
    defects: [],
    inspectorSignoff: {
      inspectorName: "Anand M. Patil",
      inspectorId: "IR-QA-99104",
      badgeNumber: "CR-JNPT-08",
      designation: "Divisional Mechanical Engineer (Freight QA)",
      zonalRailway: "Central Railway (CR)",
      yardStationCode: "JNPT Yard",
      signedTimestamp: "19 Aug 2026, 03:10 PM",
      witnessName: "Santosh Gawade",
      witnessRole: "Terminal Yard Master",
      remarks: "Full wagon batch passed without deviations.",
    },
    certificate: {
      certificateNumber: "RDSO-BPC-CR-2026-77319",
      qrCodePayload: "RAILFLOW-IR-QA-VERIFIED:RAIL-IND-39104:BPC-97.2%:RDSO-CR-2026-77319:APPROVED",
      issueTimestamp: "19 Aug 2026, 03:15 PM",
      validUntilTimestamp: "26 Aug 2026, 03:15 PM",
      clearanceStatus: "GREEN_CORRIDOR_CLEARED",
      overallScorePercentage: 98.8,
      rdsoComplianceBadge: "RDSO G-95 GRADE A+",
      digitalSignatureHash: "SHA256:9a8f4c2810be38910427810ce8891048b110321a",
    },
  },
];

class QaStore {
  private inspections: InspectionRecord[] = [];
  private listeners = new Set<() => void>();

  constructor() {
    this.inspections = INITIAL_INSPECTIONS;
    this.loadFromStorage();
  }

  private loadFromStorage() {
    if (typeof window === "undefined") return;
    try {
      const saved = localStorage.getItem("railflow_qa_inspections");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          this.inspections = parsed;
        }
      }
    } catch {
      // Ignore storage errors
    }
  }

  private persist() {
    if (typeof window === "undefined") return;
    try {
      localStorage.setItem("railflow_qa_inspections", JSON.stringify(this.inspections));
    } catch {
      // Ignore storage errors
    }
  }

  public subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  };

  private notify() {
    this.persist();
    this.listeners.forEach((l) => l());
  }

  public getState() {
    return this.inspections;
  }

  public getInspectionById(id: string): InspectionRecord | undefined {
    return this.inspections.find((i) => i.id === id);
  }

  public getInspectionByShipmentId(shipmentId: string): InspectionRecord | undefined {
    return this.inspections.find((i) => i.shipmentId === shipmentId);
  }

  public createNewInspection(params: {
    shipmentId: string;
    consignmentNumber?: string;
    wagonNumber?: string;
    trainNumber?: string;
    trainName?: string;
    corridor?: string;
    cargoDescription?: string;
    consignorName?: string;
    consigneeName?: string;
    locationName?: string;
    zonalStationCode?: string;
    inspectionType?: QaWorkflowType;
  }): InspectionRecord {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, ${now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;

    const newId = `QA-${now.getFullYear()}-RAIL-${Math.floor(1000 + Math.random() * 9000)}`;

    const newRecord: InspectionRecord = {
      id: newId,
      shipmentId: params.shipmentId,
      consignmentNumber:
        params.consignmentNumber ||
        `RR-IR-${now.getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`,
      wagonNumber: params.wagonNumber || "BLCA-WAGON-204",
      trainNumber: params.trainNumber || "28491-DFC",
      trainName: params.trainName || "Western DFC Super-Fast Express Freight",
      corridor: params.corridor || "DEL-MUM Corridor",
      cargoDescription: params.cargoDescription || "General Multimodal Heavy Freight",
      consignorName: params.consignorName || "Industrial Freight Consignor Ltd.",
      consigneeName: params.consigneeName || "National Infrastructure Terminal",
      inspectionType: params.inspectionType || "PRE_DISPATCH_RAIL",
      status: "IN_PROGRESS",
      currentStepIndex: 0, // starts at step 0 (Manifest)
      initiatedTimestamp: formattedDate,
      locationName: params.locationName || "Dadri ICD Freight Logistics Yard",
      zonalStationCode: params.zonalStationCode || "NCR-DADRI",
      checklist: DEFAULT_CHECKLIST.map((item) => ({ ...item, passed: false })),
      sensorData: {
        tempProbeActive: true,
        tempProbeCalibrationDate: formattedDate,
        tempTargetMinC: 15.0,
        tempTargetMaxC: 30.0,
        currentTempReadingC: 22.0,
        tempProbeZeroed: false,
        humidityTargetMaxPercent: 65,
        currentHumidityReadingPercent: 45,
        humiditySensorZeroed: false,
        shockMaxGForceAllowed: 1.2,
        currentShockReadingG: 0.1,
        accelerometerCalibrated: false,
        navicGpsLock: true,
        satelliteCount: 12,
        signalStrengthDbm: -70,
        batteryLevelPercent: 95,
        tamperSensorArmed: false,
      },
      bpcMetrics: {
        locomotiveNumber: "WAG-12B #60142",
        locoClass: "Twin Co-Co 12,000 HP Heavy Haul Electric",
        rakeLengthWagons: 45,
        brakePipePressureEngineKg: 5.0,
        brakePipePressureBrakeVanKg: 4.8,
        airContinuityTestPassed: false,
        pistonStrokeMm: 115,
        brakePowerPercentage: 98.0,
        hotAxleBoxTempC: 41.5,
        wheelFlangeVisualCheck: "GOOD",
        handbrakeReleaseConfirmed: false,
        rdsoFitnessCertificateNumber: `RDSO/NCR/BPC/${now.getFullYear()}/${Math.floor(10000 + Math.random() * 90000)}`,
      },
      evidencePhotos: [
        {
          id: `ev-seal-${Date.now()}`,
          category: "SEAL_BARCODE",
          title: "Pre-Dispatch RFID Seal Verification",
          timestamp: formattedDate,
          locationName: params.locationName || "Dadri Siding #1",
          gpsCoords: [28.5355, 77.5539],
          dataUrl:
            "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=600&q=80",
          notes: "RFID Seal barcode scanned and cryptographically registered.",
        },
      ],
      defects: [],
    };

    // Remove any existing in-progress draft for the same shipment ID
    this.inspections = [newRecord, ...this.inspections.filter((i) => i.id !== newId)];
    this.notify();
    return newRecord;
  }

  public updateStepIndex(inspectionId: string, stepIndex: number) {
    this.inspections = this.inspections.map((rec) => {
      if (rec.id === inspectionId) {
        return {
          ...rec,
          currentStepIndex: Math.max(0, Math.min(5, stepIndex)),
        };
      }
      return rec;
    });
    this.notify();
  }

  public toggleChecklistItem(inspectionId: string, itemId: string, passed?: boolean) {
    this.inspections = this.inspections.map((rec) => {
      if (rec.id === inspectionId) {
        const updatedChecklist = rec.checklist.map((item) => {
          if (item.id === itemId) {
            return {
              ...item,
              passed: passed !== undefined ? passed : !item.passed,
            };
          }
          return item;
        });
        return { ...rec, checklist: updatedChecklist };
      }
      return rec;
    });
    this.notify();
  }

  public updateSensorData(inspectionId: string, data: Partial<SensorCalibrationData>) {
    this.inspections = this.inspections.map((rec) => {
      if (rec.id === inspectionId) {
        return {
          ...rec,
          sensorData: { ...rec.sensorData, ...data },
        };
      }
      return rec;
    });
    this.notify();
  }

  public updateBpcMetrics(inspectionId: string, data: Partial<BpcMetrics>) {
    this.inspections = this.inspections.map((rec) => {
      if (rec.id === inspectionId) {
        return {
          ...rec,
          bpcMetrics: { ...rec.bpcMetrics, ...data },
        };
      }
      return rec;
    });
    this.notify();
  }

  public addEvidencePhoto(inspectionId: string, photo: EvidencePhoto) {
    this.inspections = this.inspections.map((rec) => {
      if (rec.id === inspectionId) {
        return {
          ...rec,
          evidencePhotos: [...rec.evidencePhotos, photo],
        };
      }
      return rec;
    });
    this.notify();
  }

  public addDefect(inspectionId: string, defect: Omit<DefectItem, "id" | "reportedTimestamp">) {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })}, ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

    const newDefect: DefectItem = {
      ...defect,
      id: `def-${Date.now()}`,
      reportedTimestamp: formattedDate,
    };

    this.inspections = this.inspections.map((rec) => {
      if (rec.id === inspectionId) {
        return {
          ...rec,
          defects: [...rec.defects, newDefect],
        };
      }
      return rec;
    });
    this.notify();
  }

  public resolveDefect(inspectionId: string, defectId: string, remedyApplied: string) {
    const now = new Date();
    const formattedDate = `${now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
    })}, ${now.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}`;

    this.inspections = this.inspections.map((rec) => {
      if (rec.id === inspectionId) {
        const updatedDefects = rec.defects.map((d) => {
          if (d.id === defectId) {
            return {
              ...d,
              rectificationStatus: "RECTIFIED_ON_SITE" as const,
              rectifiedTimestamp: formattedDate,
              remedyApplied,
            };
          }
          return d;
        });
        return { ...rec, defects: updatedDefects };
      }
      return rec;
    });
    this.notify();
  }

  public signAndCompleteInspection(
    inspectionId: string,
    signoff: InspectorSignoff,
  ): InspectionRecord | undefined {
    const now = new Date();
    const completedTimestamp = `${now.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, ${now.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;

    const validUntil = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const validUntilFormatted = `${validUntil.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    })}, ${validUntil.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    })}`;

    let updatedTarget: InspectionRecord | undefined;

    this.inspections = this.inspections.map((rec) => {
      if (rec.id === inspectionId) {
        // Calculate pass rate
        const totalChecks = rec.checklist.length;
        const passedChecks = rec.checklist.filter((c) => c.passed).length;
        const score = Math.round((passedChecks / Math.max(1, totalChecks)) * 100);

        const hasCriticalOpenDefect = rec.defects.some(
          (d) => d.severity === "CRITICAL" && d.rectificationStatus === "OPEN",
        );

        let finalStatus: InspectionRecord["status"] = "PASSED";
        let clearanceStatus: QaCertificate["clearanceStatus"] = "GREEN_CORRIDOR_CLEARED";

        if (hasCriticalOpenDefect) {
          finalStatus = "REJECTED";
          clearanceStatus = "REJECTED_GROUNDED";
        } else if (score < 90) {
          finalStatus = "CONDITIONALLY_PASSED";
          clearanceStatus = "CONDITIONAL_TRANSIT";
        }

        const certNumber = `RDSO-IR-QA-${now.getFullYear()}-${Math.floor(10000 + Math.random() * 90000)}`;

        const certificate: QaCertificate = {
          certificateNumber: certNumber,
          qrCodePayload: `RAILFLOW-IR-QA-VERIFIED:${rec.shipmentId}:SCORE-${score}%:${certNumber}:CLEARANCE-${clearanceStatus}`,
          issueTimestamp: completedTimestamp,
          validUntilTimestamp: validUntilFormatted,
          clearanceStatus,
          overallScorePercentage: score,
          rdsoComplianceBadge: score >= 95 ? "RDSO G-95 GRADE A+" : "RDSO G-95 COMPLIANT",
          digitalSignatureHash: `SHA256:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
        };

        const updated: InspectionRecord = {
          ...rec,
          status: finalStatus,
          currentStepIndex: 5, // on certificate step
          completedTimestamp,
          inspectorSignoff: signoff,
          certificate,
        };

        updatedTarget = updated;
        return updated;
      }
      return rec;
    });

    this.notify();
    return updatedTarget;
  }

  public deleteInspection(id: string) {
    this.inspections = this.inspections.filter((i) => i.id !== id);
    this.notify();
  }

  public resetAllToDemo() {
    this.inspections = INITIAL_INSPECTIONS;
    this.notify();
  }
}

export const qaStore = new QaStore();

export function useQaStore(): InspectionRecord[] {
  return useSyncExternalStore(qaStore.subscribe, qaStore.getState, qaStore.getState);
}
