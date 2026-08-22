export type AssetType = "TRUCK_PRIME_MOVER" | "TRAIN_LOCOMOTIVE" | "REEFER_TRAILER" | "WAGON_RAKE";

export interface ComponentHealthStatus {
  name: string;
  scorePct: number; // 0-100%
  status: "EXCELLENT" | "GOOD" | "ATTENTION_REQUIRED" | "CRITICAL_MAINTENANCE";
  lastServicedKmOrHours: string;
  remainingLifePct: number;
  diagnosticNotes: string;
}

export interface ServiceLogRecord {
  id: string;
  dateIso: string;
  serviceType:
    | "PREVENTIVE_INSPECTION"
    | "BRAKE_OVERHAUL"
    | "OIL_FILTER_REPLACEMENT"
    | "CATENARY_PANTOGRAPH_CHECK"
    | "TIRE_RETREAD";
  serviceStationName: string;
  technicianName: string;
  costInr: number;
  replacedParts: string[];
  serviceStatus: "COMPLETED" | "SCHEDULED" | "IN_PROGRESS";
  nextDueKmOrDate: string;
}

export interface VehicleHealthProfile {
  assetId: string;
  assetNumber: string;
  assetType: AssetType;
  makeModel: string;
  assignedRouteOrCorridor: string;
  odometerKm: number;
  overallHealthScore: number; // 0-100
  uptimePct: number; // e.g. 98.6%
  fuelEfficiencyKmPerL: number;
  engineTemperatureC: number;
  oilPressureBar: number;
  batteryHealthPct: number;
  predictedFailureRisk: "LOW" | "MODERATE" | "HIGH_PRIORITY_MAINTENANCE";
  aiFailurePredictionSummary: string;
  components: {
    engineOrTractionMotor: ComponentHealthStatus;
    brakingSystem: ComponentHealthStatus;
    transmissionOrGearbox: ComponentHealthStatus;
    tiresOrWheelAxles: ComponentHealthStatus;
    suspensionAirSprings: ComponentHealthStatus;
    electricalAndBattery: ComponentHealthStatus;
  };
  serviceLogs: ServiceLogRecord[];
  nextScheduledServiceDate: string;
  isGroundedForRepair: boolean;
}

export const MOCK_FLEET_HEALTH_PROFILES: VehicleHealthProfile[] = [
  {
    assetId: "HEALTH-MH12-8812",
    assetNumber: "MH-12-RN-8812",
    assetType: "TRUCK_PRIME_MOVER",
    makeModel: "BharatBenz 4028T Multi-Axle Heavy Tractor",
    assignedRouteOrCorridor: "Sanand Auto Corridor ↔ Pune Bhosari (NH-48)",
    odometerKm: 142850,
    overallHealthScore: 94,
    uptimePct: 99.2,
    fuelEfficiencyKmPerL: 4.2,
    engineTemperatureC: 88,
    oilPressureBar: 4.8,
    batteryHealthPct: 96,
    predictedFailureRisk: "LOW",
    aiFailurePredictionSummary:
      "All thermal & vibration harmonics within ISO-10816 nominal limits. Brake liner wear at 18% (12,000 km remaining).",
    components: {
      engineOrTractionMotor: {
        name: "OM 906 6.7L Turbocharged Diesel Engine",
        scorePct: 96,
        status: "EXCELLENT",
        lastServicedKmOrHours: "135,000 km",
        remainingLifePct: 92,
        diagnosticNotes: "Cylinder compression uniform across all 6 banks.",
      },
      brakingSystem: {
        name: "Wabco ABS Dual-Circuit Full Air Brakes",
        scorePct: 88,
        status: "GOOD",
        lastServicedKmOrHours: "128,000 km",
        remainingLifePct: 82,
        diagnosticNotes: "Front brake pads 8.5mm, rear drum linings 9.2mm.",
      },
      transmissionOrGearbox: {
        name: "G 131 9-Speed Synchronized Gearbox",
        scorePct: 95,
        status: "EXCELLENT",
        lastServicedKmOrHours: "135,000 km",
        remainingLifePct: 94,
        diagnosticNotes: "Synthetic transmission fluid viscosity within spec.",
      },
      tiresOrWheelAxles: {
        name: "Bridgestone 295/80 R22.5 Heavy Radial",
        scorePct: 91,
        status: "EXCELLENT",
        lastServicedKmOrHours: "140,000 km",
        remainingLifePct: 78,
        diagnosticNotes: "Tread depth 9.8mm, no uneven shoulder wear detected.",
      },
      suspensionAirSprings: {
        name: "Multi-Leaf Parabolic Front & Rear Suspension",
        scorePct: 93,
        status: "EXCELLENT",
        lastServicedKmOrHours: "135,000 km",
        remainingLifePct: 89,
        diagnosticNotes: "Bushings and shock absorber seals dry and intact.",
      },
      electricalAndBattery: {
        name: "Exide 24V Heavy Commercial Twin Battery Pack",
        scorePct: 97,
        status: "EXCELLENT",
        lastServicedKmOrHours: "142,000 km",
        remainingLifePct: 95,
        diagnosticNotes: "Alternator output 28.2V steady under full light load.",
      },
    },
    serviceLogs: [
      {
        id: "SRV-2026-0810",
        dateIso: "2026-08-10",
        serviceType: "PREVENTIVE_INSPECTION",
        serviceStationName: "BharatBenz Authorized Master Hub, Surat Bypass",
        technicianName: "K. R. Solanki",
        costInr: 14500,
        replacedParts: ["Engine Oil Filter", "Fuel Water Separator Cartridge"],
        serviceStatus: "COMPLETED",
        nextDueKmOrDate: "155,000 km (Scheduled)",
      },
      {
        id: "SRV-2026-0615",
        dateIso: "2026-06-15",
        serviceType: "BRAKE_OVERHAUL",
        serviceStationName: "VRL Central Logistics Workshop, Pune",
        technicianName: "Mahesh Patil",
        costInr: 28400,
        replacedParts: ["Front Brake Liners", "Pneumatic Air Booster Valve"],
        serviceStatus: "COMPLETED",
        nextDueKmOrDate: "170,000 km",
      },
    ],
    nextScheduledServiceDate: "2026-09-15",
    isGroundedForRepair: false,
  },
  {
    assetId: "HEALTH-WAG12-60088",
    assetNumber: "WAG-12B #60088",
    assetType: "TRAIN_LOCOMOTIVE",
    makeModel: "Alstom Prima T8 Heavy Freight Twin Locomotive (12,000 HP)",
    assignedRouteOrCorridor: "Western Dedicated Freight Corridor (MDD ↔ JNPT)",
    odometerKm: 384200,
    overallHealthScore: 98,
    uptimePct: 99.8,
    fuelEfficiencyKmPerL: 0, // Electric
    engineTemperatureC: 62, // Inverter & Traction Motor
    oilPressureBar: 6.2, // Transformer Cooling Oil
    batteryHealthPct: 99,
    predictedFailureRisk: "LOW",
    aiFailurePredictionSummary:
      "IGBT traction converters operating at nominal $62^\\circ\\text{C}$. Pantograph contact strip wear $< 4\\%$. Zero track-circuit harmonics detected.",
    components: {
      engineOrTractionMotor: {
        name: "8x 3-Phase Asynchronous Traction Motors (1,500 kW each)",
        scorePct: 99,
        status: "EXCELLENT",
        lastServicedKmOrHours: "370,000 km",
        remainingLifePct: 96,
        diagnosticNotes: "Stator insulation resistance > 100 Mega-Ohms.",
      },
      brakingSystem: {
        name: "Regenerative Electric Braking + Knorr-Bremse CCB-II Pneumatic",
        scorePct: 98,
        status: "EXCELLENT",
        lastServicedKmOrHours: "375,000 km",
        remainingLifePct: 95,
        diagnosticNotes: "Regenerative energy recapture efficiency 86.4%.",
      },
      transmissionOrGearbox: {
        name: "Axle-Hung Helical Reduction Gear Units",
        scorePct: 97,
        status: "EXCELLENT",
        lastServicedKmOrHours: "370,000 km",
        remainingLifePct: 94,
        diagnosticNotes: "Lube oil spectrographic analysis shows 0 ppm iron particles.",
      },
      tiresOrWheelAxles: {
        name: "Forged Steel Monobloc Wheelsets (Bo-Bo + Bo-Bo)",
        scorePct: 96,
        status: "EXCELLENT",
        lastServicedKmOrHours: "380,000 km",
        remainingLifePct: 91,
        diagnosticNotes: "Flange thickness 31.5mm (RDSO limit 25mm).",
      },
      suspensionAirSprings: {
        name: "Primary Coil & Secondary Flexicoil Suspension",
        scorePct: 98,
        status: "EXCELLENT",
        lastServicedKmOrHours: "370,000 km",
        remainingLifePct: 97,
        diagnosticNotes: "Hydraulic yaw dampers calibrated.",
      },
      electricalAndBattery: {
        name: "25kV AC Pantograph & Vacuum Circuit Breaker (VCB)",
        scorePct: 99,
        status: "EXCELLENT",
        lastServicedKmOrHours: "382,000 km",
        remainingLifePct: 98,
        diagnosticNotes: "Carbon contact strip thickness 26.8mm.",
      },
    },
    serviceLogs: [
      {
        id: "SRV-RAIL-2026-0720",
        dateIso: "2026-07-20",
        serviceType: "CATENARY_PANTOGRAPH_CHECK",
        serviceStationName: "Madar Electric Loco Shed (ELS), Ajmer",
        technicianName: "Senior Section Engineer R. C. Meena",
        costInr: 65000,
        replacedParts: ["Pantograph Carbon Collector Strips", "Transformer Silica Gel Breather"],
        serviceStatus: "COMPLETED",
        nextDueKmOrDate: "410,000 km",
      },
    ],
    nextScheduledServiceDate: "2026-10-05",
    isGroundedForRepair: false,
  },
  {
    assetId: "HEALTH-GJ06-4409",
    assetNumber: "GJ-06-AX-4409",
    assetType: "TRUCK_PRIME_MOVER",
    makeModel: "Volvo FH16 540 Heavy Quad-Axle Multi-Trailer",
    assignedRouteOrCorridor: "Vadodara Heavy Hub ↔ JNPT Port Gate (NH-48)",
    odometerKm: 218400,
    overallHealthScore: 78,
    uptimePct: 94.5,
    fuelEfficiencyKmPerL: 3.6,
    engineTemperatureC: 96,
    oilPressureBar: 4.1,
    batteryHealthPct: 82,
    predictedFailureRisk: "HIGH_PRIORITY_MAINTENANCE",
    aiFailurePredictionSummary:
      "⚠️ Predictive AI Warning: Elevated turbocharger boost temperature detected. Coolant thermostat cycling shows 14% thermal hysteresis. Recommend workshop inspection within 48 hours.",
    components: {
      engineOrTractionMotor: {
        name: "D16K 16.1L Inline 6-Cylinder Euro VI",
        scorePct: 74,
        status: "ATTENTION_REQUIRED",
        lastServicedKmOrHours: "195,000 km",
        remainingLifePct: 62,
        diagnosticNotes: "Thermostat valve opening delay detected in telemetry logs.",
      },
      brakingSystem: {
        name: "Electronic Braking System (EBS) with Hill Hold",
        scorePct: 80,
        status: "GOOD",
        lastServicedKmOrHours: "195,000 km",
        remainingLifePct: 71,
        diagnosticNotes: "Rear axle disc brake pads at 4.2mm (wear alert threshold 3.0mm).",
      },
      transmissionOrGearbox: {
        name: "I-Shift 12-Speed Automated Manual Transmission",
        scorePct: 84,
        status: "GOOD",
        lastServicedKmOrHours: "195,000 km",
        remainingLifePct: 76,
        diagnosticNotes: "Clutch actuator response time nominal.",
      },
      tiresOrWheelAxles: {
        name: "Michelin X MultiWay 3D Heavy Radial",
        scorePct: 76,
        status: "ATTENTION_REQUIRED",
        lastServicedKmOrHours: "205,000 km",
        remainingLifePct: 58,
        diagnosticNotes: "Right tag-axle tire pressure slight decay (104 PSI vs 120 PSI target).",
      },
      suspensionAirSprings: {
        name: "Full Air Suspension with Electronic Leveling",
        scorePct: 82,
        status: "GOOD",
        lastServicedKmOrHours: "195,000 km",
        remainingLifePct: 75,
        diagnosticNotes: "Height sensor feedback calibration verified.",
      },
      electricalAndBattery: {
        name: "Dual AGM High-Cycle Battery Matrix",
        scorePct: 81,
        status: "GOOD",
        lastServicedKmOrHours: "195,000 km",
        remainingLifePct: 74,
        diagnosticNotes: "Cold cranking amps (CCA) test passed at 880A.",
      },
    },
    serviceLogs: [
      {
        id: "SRV-2026-0520",
        dateIso: "2026-05-20",
        serviceType: "OIL_FILTER_REPLACEMENT",
        serviceStationName: "Volvo Commercial Hub, Bharuch",
        technicianName: "Devendra Joshi",
        costInr: 32000,
        replacedParts: ["Synthetic Heavy Engine Oil (42L)", "Primary Air Filter Element"],
        serviceStatus: "COMPLETED",
        nextDueKmOrDate: "220,000 km (OVERDUE BY 1,400 KM)",
      },
    ],
    nextScheduledServiceDate: "2026-08-24",
    isGroundedForRepair: false,
  },
  {
    assetId: "HEALTH-DL01-1920",
    assetNumber: "DL-01-EE-1920",
    assetType: "TRUCK_PRIME_MOVER",
    makeModel: "Tata Ultra T.7 Electric Urban Reefer Hauler",
    assignedRouteOrCorridor: "Dadri ICD ↔ IGI Cargo Terminal 3 Delhi",
    odometerKm: 48600,
    overallHealthScore: 97,
    uptimePct: 99.6,
    fuelEfficiencyKmPerL: 0,
    engineTemperatureC: 45,
    oilPressureBar: 0,
    batteryHealthPct: 98,
    predictedFailureRisk: "LOW",
    aiFailurePredictionSummary:
      "Liquid-cooled LFP battery pack state-of-health (SoH) at 98.4%. Fast-charging cycle efficiency optimal at 94.2%.",
    components: {
      engineOrTractionMotor: {
        name: "Permanent Magnet Synchronous Motor (PMSM 250 kW)",
        scorePct: 98,
        status: "EXCELLENT",
        lastServicedKmOrHours: "40,000 km",
        remainingLifePct: 98,
        diagnosticNotes: "Rotor bearing vibration below 0.02 mm/s.",
      },
      brakingSystem: {
        name: "Dual Circuit Full Air S-Cam + High Regenerative Braking",
        scorePct: 96,
        status: "EXCELLENT",
        lastServicedKmOrHours: "40,000 km",
        remainingLifePct: 94,
        diagnosticNotes: "Regenerative braking reduces pad friction wear by 68%.",
      },
      transmissionOrGearbox: {
        name: "Single-Speed Direct Electric Drive Reduction Gearbox",
        scorePct: 99,
        status: "EXCELLENT",
        lastServicedKmOrHours: "40,000 km",
        remainingLifePct: 99,
        diagnosticNotes: "Hermetically sealed drive casing zero leaks.",
      },
      tiresOrWheelAxles: {
        name: "Low Rolling Resistance Commercial EV Radials",
        scorePct: 95,
        status: "EXCELLENT",
        lastServicedKmOrHours: "45,000 km",
        remainingLifePct: 90,
        diagnosticNotes: "Tread wear even across dual rear axles.",
      },
      suspensionAirSprings: {
        name: "Semi-Elliptical Leaf Springs with Hydraulic Dampers",
        scorePct: 97,
        status: "EXCELLENT",
        lastServicedKmOrHours: "40,000 km",
        remainingLifePct: 96,
        diagnosticNotes: "Bushings lubricated with silicone grease.",
      },
      electricalAndBattery: {
        name: "120 kWh LFP Thermal-Managed Battery Pack",
        scorePct: 98,
        status: "EXCELLENT",
        lastServicedKmOrHours: "48,000 km",
        remainingLifePct: 98,
        diagnosticNotes: "Cell voltage delta < 12mV across all 192 cells.",
      },
    },
    serviceLogs: [
      {
        id: "SRV-EV-2026-0701",
        dateIso: "2026-07-01",
        serviceType: "PREVENTIVE_INSPECTION",
        serviceStationName: "Tata Motors EV Commercial Service Centre, Okhla",
        technicianName: "Deepak Rawat",
        costInr: 8500,
        replacedParts: ["Cabin HEPA Filter", "Coolant Circulation Top-Up"],
        serviceStatus: "COMPLETED",
        nextDueKmOrDate: "60,000 km",
      },
    ],
    nextScheduledServiceDate: "2026-11-10",
    isGroundedForRepair: false,
  },
];
