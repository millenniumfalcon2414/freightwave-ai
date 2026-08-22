import {
  DatabaseState,
  DbShipment,
  DbVehicle,
  DbDriver,
  DbAlert,
  DbIncident,
  DbPrediction,
  DbRoute,
  DbAuditLog,
  DbUser,
  DbTrackingEvent,
  DbSimulationEvent,
} from "./types";
import { calculateShipmentRisk, generatePredictionRecord } from "../risk/riskEngine";
import { liveEventBus } from "../realtime/liveEventBus";
import {
  readPersistentDatabase,
  writePersistentDatabase,
  executeSqliteDelete,
} from "./serverStorage";

const STORAGE_KEY = "FREIGHTWAVE_AI_DB_PERSISTENCE_V2";

export const INITIAL_ROUTES: DbRoute[] = [
  {
    routeId: "RTE-WDFC-MAIN",
    name: "Western Dedicated Freight Corridor (Electrified DFC Rail)",
    origin: "Delhi NCR (Dadri ICD Hub)",
    destination: "Mumbai (JNPT Port Terminal)",
    mode: "rail",
    distanceKm: 1483,
    estimatedDurationHours: 22,
    congestionScore: 8,
    riskScore: 12,
    tollCostInr: 0,
    freightCostInr: 42500,
    carbonKg: 32600,
    co2SavedPct: 58,
    isRecommended: true,
    description:
      "Fully automated, electric double-stack container corridor with 100 km/h priority transit slots.",
    path: [
      [28.5284, 77.5682], // Dadri ICD
      [28.1928, 76.6189], // Rewari Junction
      [27.5706, 76.6032], // Alwar
      [26.9124, 75.7873], // Phulera / Jaipur
      [26.4499, 74.6399], // Ajmer
      [25.3407, 74.6313], // Bhilwara
      [24.5854, 73.7125], // Udaipur Bypass
      [23.0225, 72.5714], // Ahmedabad Logistics
      [22.3072, 73.1812], // Vadodara
      [21.1702, 72.8311], // Surat
      [20.3893, 72.9106], // Vapi
      [19.2183, 72.9781], // Vasai Road
      [18.95, 72.95], // JNPT Port
    ],
  },
  {
    routeId: "RTE-NH48-ROAD",
    name: "NH-48 National Highway Drayage Corridor",
    origin: "Delhi NCR (Dadri)",
    destination: "Mumbai (JNPT)",
    mode: "road",
    distanceKm: 1410,
    estimatedDurationHours: 36,
    congestionScore: 78,
    riskScore: 68,
    tollCostInr: 14800,
    freightCostInr: 68000,
    carbonKg: 87400,
    co2SavedPct: 0,
    isRecommended: false,
    description:
      "Multi-lane national highway prone to toll plaza bottle-necks, monsoon waterlogging, and truck queues.",
    path: [
      [28.5284, 77.5682],
      [28.4595, 77.0266], // Gurgaon
      [28.1928, 76.6189], // Rewari / Manesar
      [27.9135, 76.3882], // Behror
      [26.9124, 75.7873], // Jaipur
      [25.8234, 74.3421], // Kishangarh
      [24.5854, 73.7125], // Udaipur
      [23.0225, 72.5714], // Ahmedabad
      [21.1702, 72.8311], // Surat
      [19.076, 72.8777], // Mumbai Suburban
      [18.95, 72.95], // JNPT
    ],
  },
  {
    routeId: "RTE-GREEN-EXPR",
    name: "Delhi-Mumbai Green Expressway (EV Hauler Sector)",
    origin: "Delhi NCR (Dadri Hub)",
    destination: "Mumbai (JNPT)",
    mode: "multimodal",
    distanceKm: 1380,
    estimatedDurationHours: 26,
    congestionScore: 24,
    riskScore: 28,
    tollCostInr: 11200,
    freightCostInr: 54000,
    carbonKg: 46200,
    co2SavedPct: 44,
    isRecommended: true,
    description:
      "Access-controlled 8-lane expressway with dedicated fast-charging stations for heavy electric prime movers.",
    path: [
      [28.5284, 77.5682],
      [28.02, 76.85], // Sohna
      [27.15, 76.9], // Dausa
      [26.15, 76.35], // Sawai Madhopur
      [25.18, 75.83], // Kota
      [24.12, 75.6], // Garoth
      [23.33, 75.03], // Ratlam
      [22.3072, 73.1812], // Vadodara
      [20.9, 72.95], // Valsad
      [18.95, 72.95], // JNPT
    ],
  },
];

export const INITIAL_USERS: DbUser[] = [
  {
    id: "USR-001",
    name: "Dr. Vikramaditya Sharma",
    email: "superadmin@freightwave.ai",
    role: "super_admin",
    company: "FreightWave AI Global Systems HQ",
    phone: "+91 98100 12001",
    avatarLetter: "V",
    createdAt: "2026-01-10T08:00:00Z",
    updatedAt: "2026-08-22T08:00:00Z",
  },
  {
    id: "USR-002",
    name: "Priya Sundaram",
    email: "logistics.mgr@freightwave.ai",
    role: "logistics_manager",
    company: "National Freight Corridor Operations",
    phone: "+91 98200 45002",
    avatarLetter: "P",
    createdAt: "2026-01-15T09:30:00Z",
    updatedAt: "2026-08-22T09:30:00Z",
  },
  {
    id: "USR-003",
    name: "Vikram R. Lad",
    email: "dispatch.mumbai@vrl-logistics.com",
    role: "fleet_manager",
    company: "VRL Multimodal Roadways Ltd.",
    phone: "+91 98300 78003",
    avatarLetter: "V",
    createdAt: "2026-02-01T10:00:00Z",
    updatedAt: "2026-08-22T10:00:00Z",
  },
  {
    id: "USR-004",
    name: "Amitabh Banerjee",
    email: "dispatcher.central@freightwave.ai",
    role: "dispatcher",
    company: "Central Multimodal Dispatch Control",
    phone: "+91 98400 33004",
    avatarLetter: "A",
    createdAt: "2026-02-10T11:00:00Z",
    updatedAt: "2026-08-22T11:00:00Z",
  },
  {
    id: "USR-005",
    name: "Gurpreet Singh Gill",
    email: "driver.sharma@expresslogistics.in",
    role: "driver",
    company: "Western Express Freight Drivers Guild",
    phone: "+91 98500 66005",
    avatarLetter: "G",
    createdAt: "2026-03-01T12:00:00Z",
    updatedAt: "2026-08-22T12:00:00Z",
  },
  {
    id: "USR-006",
    name: "Rajeshwar Sengupta",
    email: "rajesh.sengupta@tata-steel.in",
    role: "customer",
    company: "Tata Steel BSL Logistics Division",
    phone: "+91 98600 88006",
    avatarLetter: "R",
    createdAt: "2026-03-15T14:00:00Z",
    updatedAt: "2026-08-22T14:00:00Z",
  },
  {
    id: "USR-007",
    name: "Kavita Ramachandran",
    email: "analyst@freightwave.ai",
    role: "analyst",
    company: "National Logistics Intelligence Unit",
    phone: "+91 98700 99007",
    avatarLetter: "K",
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-08-22T09:00:00Z",
  },
  {
    id: "USR-008",
    name: "Sneha Nair",
    email: "viewer.ops@freightwave.ai",
    role: "viewer",
    company: "Ministry of Commerce Logistics Wing",
    phone: "+91 98800 11008",
    avatarLetter: "S",
    createdAt: "2026-04-10T10:00:00Z",
    updatedAt: "2026-08-22T10:00:00Z",
  },
];

export const INITIAL_DRIVERS: DbDriver[] = [
  {
    driverId: "DRV-IND-101",
    name: "Gurpreet Singh Gill",
    phone: "+91 98500 66005",
    licenseNumber: "DL-04-2018-9988112",
    bloodGroup: "B+",
    safetyScore: 98.4,
    assignedVehicleId: "TRK-HR26-EA-9912",
    dutyStatus: "on_duty",
    dutyHoursToday: 4.5,
    maxDutyHours: 8.0,
    lastMedicalCheck: "2026-07-15",
  },
  {
    driverId: "DRV-IND-102",
    name: "Sukhwinder Singh",
    phone: "+91 98102 34112",
    licenseNumber: "PB-08-2019-7744211",
    bloodGroup: "O+",
    safetyScore: 96.2,
    assignedVehicleId: "TRK-MH12-RN-8812",
    dutyStatus: "on_duty",
    dutyHoursToday: 6.2,
    maxDutyHours: 8.0,
    lastMedicalCheck: "2026-06-20",
  },
  {
    driverId: "DRV-IND-103",
    name: "Mahendra Chawla (Hazmat Lead)",
    phone: "+91 1274 259904",
    licenseNumber: "HR-26-2016-1122334",
    bloodGroup: "AB+",
    safetyScore: 99.8,
    assignedVehicleId: "SALV-HZ-REW-04",
    dutyStatus: "on_duty",
    dutyHoursToday: 2.0,
    maxDutyHours: 10.0,
    lastMedicalCheck: "2026-08-01",
  },
  {
    driverId: "DRV-IND-104",
    name: "Rameshwar Rao",
    phone: "+91 98490 12345",
    licenseNumber: "KA-01-2020-5566778",
    bloodGroup: "A+",
    safetyScore: 97.5,
    assignedVehicleId: "EV-DL01-TG-4401",
    dutyStatus: "on_duty",
    dutyHoursToday: 3.8,
    maxDutyHours: 8.0,
    lastMedicalCheck: "2026-07-28",
  },
];

export const INITIAL_VEHICLES: DbVehicle[] = [
  {
    vehicleId: "TRK-HR26-EA-9912",
    registrationNumber: "HR-26-EA-9912",
    driverId: "DRV-IND-101",
    driverName: "Gurpreet Singh Gill",
    driverPhone: "+91 98500 66005",
    currentShipmentId: "FW-1042",
    status: "in_transit",
    currentLocation: {
      lat: 28.1928,
      lng: 76.6189,
      address: "NH-48 Jaipur Highway, Near Rewari Multi-Modal Hub",
    },
    speed: 28,
    expectedSpeed: 65,
    utilization: 94,
    riskScore: 84,
    mode: "road",
    fuelOrBatteryPct: 76,
    telemetry: {
      temperatureC: 22.4,
      vibrationG: 0.18,
      tirePressurePsi: 118,
      odometerKm: 142850,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    vehicleId: "RAKE-WDFC-9021",
    registrationNumber: "IR-WDFC-BLK-9021",
    driverId: "DRV-IND-103",
    driverName: "Loco Pilot V. K. Deshmukh",
    driverPhone: "+91 98201 55443",
    currentShipmentId: "FW-1099",
    status: "in_transit",
    currentLocation: {
      lat: 25.3407,
      lng: 74.6313,
      address: "WDFC Electrified Track Section KM-412 (Bhilwara Bypass)",
    },
    speed: 92,
    expectedSpeed: 95,
    utilization: 98,
    riskScore: 12,
    mode: "rail",
    fuelOrBatteryPct: 100, // Catenary 25kV AC Electric
    telemetry: {
      temperatureC: 19.8,
      vibrationG: 0.08,
      tirePressurePsi: 0,
      odometerKm: 384000,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    vehicleId: "TRK-MH12-RN-8812",
    registrationNumber: "MH-12-RN-8812",
    driverId: "DRV-IND-102",
    driverName: "Sukhwinder Singh",
    driverPhone: "+91 98102 34112",
    currentShipmentId: "FW-1088",
    status: "in_transit",
    currentLocation: {
      lat: 19.2183,
      lng: 72.9781,
      address: "Thane-Belapur Expressway Drayage Corridor",
    },
    speed: 58,
    expectedSpeed: 60,
    utilization: 88,
    riskScore: 22,
    mode: "road",
    fuelOrBatteryPct: 82,
    telemetry: {
      temperatureC: 4.2, // Cold Chain Reefer
      vibrationG: 0.12,
      tirePressurePsi: 120,
      odometerKm: 98200,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    vehicleId: "RAKE-EDFC-7714",
    registrationNumber: "IR-EDFC-BLK-7714",
    driverId: "DRV-IND-103",
    driverName: "Loco Pilot Arvind Verma",
    driverPhone: "+91 98334 77889",
    currentShipmentId: "FW-1024",
    status: "in_transit",
    currentLocation: {
      lat: 25.3176,
      lng: 82.9739,
      address: "EDFC Corridor Varanasi Freight Bypass Track",
    },
    speed: 88,
    expectedSpeed: 90,
    utilization: 100,
    riskScore: 16,
    mode: "rail",
    fuelOrBatteryPct: 100,
    telemetry: {
      temperatureC: 28.0,
      vibrationG: 0.09,
      tirePressurePsi: 0,
      odometerKm: 512000,
    },
    lastUpdated: new Date().toISOString(),
  },
  {
    vehicleId: "EV-DL01-TG-4401",
    registrationNumber: "DL-01-TG-4401",
    driverId: "DRV-IND-104",
    driverName: "Rameshwar Rao",
    driverPhone: "+91 98490 12345",
    currentShipmentId: "FW-1055",
    status: "in_transit",
    currentLocation: {
      lat: 27.15,
      lng: 76.9,
      address: "Delhi-Mumbai Green Expressway KM-180 Fast-Charge Hub",
    },
    speed: 72,
    expectedSpeed: 75,
    utilization: 85,
    riskScore: 18,
    mode: "electric_hauler",
    fuelOrBatteryPct: 88,
    telemetry: {
      temperatureC: 24.1,
      vibrationG: 0.11,
      tirePressurePsi: 122,
      odometerKm: 42100,
    },
    lastUpdated: new Date().toISOString(),
  },
];

export const INITIAL_SHIPMENTS: DbShipment[] = [
  {
    shipmentId: "FW-1042",
    trackingNumber: "TRK-IND-2026-FW1042",
    customer: "Maruti Suzuki & Exide Energy Corp",
    customerPhone: "+91 124 439 2000",
    origin: "Delhi NCR (Dadri ICD Hub)",
    originCoords: { lat: 28.5284, lng: 77.5682 },
    destination: "Mumbai (JNPT Port Terminal)",
    destCoords: { lat: 18.95, lng: 72.95 },
    cargoType: "Lithium-Ion Battery Enclosures & Precision Auto Spares",
    cargoWeight: 28.5,
    declaredValueInr: "₹4.85 Cr",
    vehicleId: "TRK-HR26-EA-9912",
    driverId: "DRV-IND-101",
    priority: "CRITICAL",
    status: "DELAYED",
    departureTime: "2026-08-22T06:00:00Z",
    expectedDeliveryTime: "2026-08-23T14:00:00Z",
    originalEta: "Tomorrow, 14:00",
    currentEta: "Tomorrow, 15:45 (+105m)",
    predictedEta: "Tomorrow, 15:52 (+112m delay)",
    currentLocation: {
      lat: 28.1928,
      lng: 76.6189,
      address: "NH-48 Jaipur Highway, Near Rewari Multi-Modal Hub Overpass",
    },
    remainingKm: 1220,
    totalKm: 1410,
    riskScore: 84,
    riskLevel: "CRITICAL",
    delayProbability: 86,
    estimatedDelayMinutes: 112,
    routeDeviationKm: 8.4,
    mode: "road",
    activeRouteName: "NH-48 National Highway Drayage Corridor",
    alternativeRouteName: "Western Dedicated Freight Corridor (Electrified DFC Rail)",
    isSimulated: false,
    notes:
      "High risk due to NH-48 bottleneck & 8.4km local detour. Transfer to WDFC Rail slot #402 recommended.",
    createdAt: "2026-08-22T05:30:00Z",
    updatedAt: "2026-08-22T10:15:00Z",
  },
  {
    shipmentId: "FW-1024",
    trackingNumber: "TRK-IND-2026-FW1024",
    customer: "Tata Steel BSL Logistics Division",
    customerPhone: "+91 657 664 1000",
    origin: "Kolkata (Dankuni EDFC Terminal)",
    originCoords: { lat: 22.686, lng: 88.298 },
    destination: "Delhi NCR (Dadri ICD Hub)",
    destCoords: { lat: 28.5284, lng: 77.5682 },
    cargoType: "High-Tensile Automotive Steel Coils (Cold Rolled)",
    cargoWeight: 840.0, // Full Block Rake
    declaredValueInr: "₹18.4 Cr",
    vehicleId: "RAKE-EDFC-7714",
    driverId: "DRV-IND-103",
    priority: "HIGH",
    status: "IN_TRANSIT",
    departureTime: "2026-08-22T02:00:00Z",
    expectedDeliveryTime: "2026-08-22T22:00:00Z",
    originalEta: "Today, 22:00",
    currentEta: "Today, 21:45 (-15m early)",
    predictedEta: "Today, 21:45",
    currentLocation: {
      lat: 25.3176,
      lng: 82.9739,
      address: "EDFC Electrified Corridor Varanasi Track Section",
    },
    remainingKm: 460,
    totalKm: 1337,
    riskScore: 14,
    riskLevel: "LOW",
    delayProbability: 8,
    estimatedDelayMinutes: 0,
    routeDeviationKm: 0.0,
    mode: "rail",
    activeRouteName: "Eastern Dedicated Freight Corridor (EDFC)",
    isSimulated: false,
    notes: "Operating with green signal clearance on automated block signaling.",
    createdAt: "2026-08-22T01:30:00Z",
    updatedAt: "2026-08-22T10:00:00Z",
  },
  {
    shipmentId: "FW-1088",
    trackingNumber: "TRK-IND-2026-FW1088",
    customer: "Biocon & Dr. Reddy's Laboratories",
    customerPhone: "+91 80 2808 2808",
    origin: "Bengaluru (Whitefield ICD)",
    originCoords: { lat: 12.9698, lng: 77.75 },
    destination: "Mumbai (JNPT Reefer Export Terminal)",
    destCoords: { lat: 18.95, lng: 72.95 },
    cargoType: "Temperature-Controlled Biologics & Vaccines (2°C to 8°C)",
    cargoWeight: 14.2,
    declaredValueInr: "₹9.2 Cr",
    vehicleId: "TRK-MH12-RN-8812",
    driverId: "DRV-IND-102",
    priority: "CRITICAL",
    status: "IN_TRANSIT",
    departureTime: "2026-08-21T18:00:00Z",
    expectedDeliveryTime: "2026-08-22T19:00:00Z",
    originalEta: "Today, 19:00",
    currentEta: "Today, 18:50",
    predictedEta: "Today, 18:50",
    currentLocation: {
      lat: 19.2183,
      lng: 72.9781,
      address: "Thane-Belapur Expressway Drayage Corridor",
    },
    remainingKm: 42,
    totalKm: 980,
    riskScore: 22,
    riskLevel: "LOW",
    delayProbability: 12,
    estimatedDelayMinutes: 0,
    routeDeviationKm: 0.4,
    mode: "multimodal",
    activeRouteName: "South-Western Multimodal Cold Corridor",
    isSimulated: false,
    notes: "Active cold-chain compressor operating nominal at 4.2°C.",
    createdAt: "2026-08-21T17:00:00Z",
    updatedAt: "2026-08-22T10:10:00Z",
  },
  {
    shipmentId: "FW-1099",
    trackingNumber: "TRK-IND-2026-FW1099",
    customer: "Adani Solar & Renewables Grid",
    customerPhone: "+91 79 2656 5555",
    origin: "Mundra Port Hub (Gujarat)",
    originCoords: { lat: 22.84, lng: 69.7 },
    destination: "Delhi NCR (Dadri Solar Hub)",
    destCoords: { lat: 28.5284, lng: 77.5682 },
    cargoType: "High-Efficiency Photovoltaic Modules & Inverters",
    cargoWeight: 620.0,
    declaredValueInr: "₹12.6 Cr",
    vehicleId: "RAKE-WDFC-9021",
    driverId: "DRV-IND-103",
    priority: "HIGH",
    status: "IN_TRANSIT",
    departureTime: "2026-08-22T04:00:00Z",
    expectedDeliveryTime: "2026-08-23T01:00:00Z",
    originalEta: "Tomorrow, 01:00",
    currentEta: "Tomorrow, 00:40 (-20m)",
    predictedEta: "Tomorrow, 00:40",
    currentLocation: {
      lat: 25.3407,
      lng: 74.6313,
      address: "WDFC Track KM-412 (Bhilwara Bypass)",
    },
    remainingKm: 490,
    totalKm: 1140,
    riskScore: 12,
    riskLevel: "LOW",
    delayProbability: 6,
    estimatedDelayMinutes: 0,
    routeDeviationKm: 0.0,
    mode: "rail",
    activeRouteName: "Western Dedicated Freight Corridor (Electrified DFC Rail)",
    isSimulated: false,
    notes: "Double-stack flat wagons BLCA at 92 km/h on catenary track.",
    createdAt: "2026-08-22T03:30:00Z",
    updatedAt: "2026-08-22T10:14:00Z",
  },
  {
    shipmentId: "FW-1055",
    trackingNumber: "TRK-IND-2026-FW1055",
    customer: "Bharat Heavy Electricals Ltd. (BHEL)",
    customerPhone: "+91 11 6633 7000",
    origin: "Delhi NCR (Dadri ICD)",
    originCoords: { lat: 28.5284, lng: 77.5682 },
    destination: "Mumbai (JNPT Port)",
    destCoords: { lat: 18.95, lng: 72.95 },
    cargoType: "Electric Grid Distribution Transformers",
    cargoWeight: 34.0,
    declaredValueInr: "₹3.4 Cr",
    vehicleId: "EV-DL01-TG-4401",
    driverId: "DRV-IND-104",
    priority: "MEDIUM",
    status: "IN_TRANSIT",
    departureTime: "2026-08-22T06:30:00Z",
    expectedDeliveryTime: "2026-08-23T08:30:00Z",
    originalEta: "Tomorrow, 08:30",
    currentEta: "Tomorrow, 08:30",
    predictedEta: "Tomorrow, 08:30",
    currentLocation: {
      lat: 27.15,
      lng: 76.9,
      address: "Delhi-Mumbai Green Expressway KM-180 Fast-Charge Hub",
    },
    remainingKm: 1200,
    totalKm: 1380,
    riskScore: 18,
    riskLevel: "LOW",
    delayProbability: 10,
    estimatedDelayMinutes: 0,
    routeDeviationKm: 0.2,
    mode: "multimodal",
    activeRouteName: "Delhi-Mumbai Green Expressway (EV Hauler Sector)",
    isSimulated: false,
    notes: "EV Prime mover battery at 88%, zero tailpipe emissions.",
    createdAt: "2026-08-22T06:00:00Z",
    updatedAt: "2026-08-22T10:15:00Z",
  },
];

export const INITIAL_ALERTS: DbAlert[] = [
  {
    alertId: "ALT-2026-901",
    severity: "CRITICAL",
    type: "ROUTE_DEVIATION",
    shipmentId: "FW-1042",
    vehicleId: "TRK-HR26-EA-9912",
    timestamp: "2026-08-22T10:10:00Z",
    description:
      "Severe 8.4 km route deviation into heavy NH-48 bottleneck near Rewari. Speed dropped by 58% to 28 km/h.",
    riskScore: 84,
    aiExplanation: {
      what: "CRITICAL DELAY & DEVIATION RISK DETECTED (84/100)",
      why: [
        "Vehicle deviated 8.4 km from authorized corridor onto congested state highway.",
        "Speed dropped to 28 km/h (58% below 65 km/h expected baseline).",
        "Delivery ETA compressed by +112 minutes, breaching SLA delivery window.",
      ],
      impact: "Estimated arrival delay: +112 minutes (86% delay probability).",
      recommendedAction:
        "Execute 1-click modal reroute to Western DFC Electrified Freight Corridor (Slot #402 at Rewari ICD) to save 112m transit time and reduce net carbon footprint by 58%.",
      confidence: 94,
    },
    recommendedAction:
      "Execute 1-click modal reroute to Western DFC Rail Rake Slot #402 at Rewari ICD.",
    status: "ACTIVE",
  },
  {
    alertId: "ALT-2026-902",
    severity: "WARNING",
    type: "TEMPERATURE_SPIKE",
    shipmentId: "FW-1088",
    vehicleId: "TRK-MH12-RN-8812",
    timestamp: "2026-08-22T09:45:00Z",
    description:
      "Reefer chamber internal temperature reached 4.2°C (safe range 2°C-8°C). Compressor switched to auxiliary inverter.",
    riskScore: 28,
    aiExplanation: {
      what: "Transient Cold-Chain Thermal Shift (28/100)",
      why: [
        "External ambient temperature rose to 38°C in Mumbai suburban corridor.",
        "Auxiliary compressor engaged at 100% capacity; cold chain safe.",
      ],
      impact: "Zero cargo compromise. Battery autonomy at 48 hours.",
      recommendedAction:
        "Maintain automated sensor polling every 30 seconds until final JNPT drayage gate-in.",
      confidence: 98,
    },
    recommendedAction: "Monitor sensor telemetry continuously.",
    status: "ACKNOWLEDGED",
    acknowledgedBy: "Priya Sundaram (Logistics Mgr)",
  },
];

export const INITIAL_INCIDENTS: DbIncident[] = [
  {
    incidentId: "INC-2026-8809",
    time: "2026-08-22T10:04:12Z",
    vehicleId: "TRK-HR26-EA-9912",
    vehicleNumber: "HR-26-EA-9912",
    shipmentId: "FW-1042",
    driverName: "Sukhwinder Singh",
    location: {
      lat: 28.1928,
      lng: 76.6189,
      address: "Km 54.2 Milestone, Near Rewari Multi-Modal Hub Overpass (NH-48)",
    },
    severity: "CRITICAL_LEVEL_1",
    cause: "Heavy drayage truck rollover due to oil slick on wet highway asphalt.",
    actionTaken:
      "108 ALS Ambulance dispatched. Hazardous cargo hermetic seal & nitrogen purge engaged.",
    status: "DISPATCHED",
    crewCount: 2,
    ambulanceDispatched: true,
    cargoSafeguardActive: true,
    notes: [
      "10:04:12 - High G-force impact (7.6G) detected via vehicle IMU telemetry.",
      "10:04:13 - Automatic eCall triggered to Haryana Highway Emergency Dispatch.",
      "10:04:15 - ALS Ambulance Unit AMB-108-REW-09 dispatched (ETA 3 mins).",
      "10:04:18 - Nitrogen (N2) cargo bay flood engaged to prevent thermal runaway in battery cargo.",
    ],
  },
];

export const INITIAL_AUDIT_LOGS: DbAuditLog[] = [
  {
    id: "AUD-001",
    timestamp: "2026-08-22T08:00:00Z",
    user: "Dr. Vikramaditya Sharma",
    role: "super_admin",
    action: "System Initialized Persistent Logistics Database",
    entity: "System",
    entityId: "SYS-INIT",
    newValue: "5 active shipments, 5 vehicles, 3 corridors loaded with persistent state",
    reason: "Daily system startup & RDSO compliance initialization",
  },
  {
    id: "AUD-002",
    timestamp: "2026-08-22T09:30:00Z",
    user: "Priya Sundaram",
    role: "logistics_manager",
    action: "Allocated DFC Rail Slot #402 for Dadri-JNPT Corridor",
    entity: "Route",
    entityId: "RTE-WDFC-MAIN",
    newValue: "Slot #402 Locked (98% capacity)",
    reason: "Priority dispatch for high-density automotive container freight",
  },
  {
    id: "AUD-003",
    timestamp: "2026-08-22T10:10:00Z",
    user: "AI Risk Engine",
    role: "system",
    action: "Raised CRITICAL Alert ALT-2026-901 for Shipment FW-1042",
    entity: "Alert",
    entityId: "ALT-2026-901",
    previousValue: "Risk 24% (LOW)",
    newValue: "Risk 84% (CRITICAL)",
    reason: "Route deviation 8.4km & speed reduction to 28 km/h on NH-48",
  },
];

class DatabaseManager {
  private state: DatabaseState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.state = this.loadInitialState();
  }

  private loadInitialState(): DatabaseState {
    // Try to load from persistent disk storage
    const fromDisk = readPersistentDatabase();
    if (fromDisk && Array.isArray(fromDisk.shipments) && fromDisk.shipments.length > 0) {
      return fromDisk;
    }

    // Seed predictions for each shipment
    const predictions = INITIAL_SHIPMENTS.map((s) => {
      const v = INITIAL_VEHICLES.find((veh) => veh.vehicleId === s.vehicleId);
      return generatePredictionRecord(s, v, INITIAL_ALERTS);
    });

    const initial: DatabaseState = {
      users: INITIAL_USERS,
      vehicles: INITIAL_VEHICLES,
      drivers: INITIAL_DRIVERS,
      shipments: INITIAL_SHIPMENTS,
      trackingEvents: [],
      alerts: INITIAL_ALERTS,
      incidents: INITIAL_INCIDENTS,
      predictions,
      routes: INITIAL_ROUTES,
      simulationEvents: [],
      auditLogs: INITIAL_AUDIT_LOGS,
      lastUpdated: new Date().toISOString(),
    };

    this.persist(initial);
    return initial;
  }

  private persist(state: DatabaseState) {
    writePersistentDatabase(state);
  }

  private notify() {
    this.state.lastUpdated = new Date().toISOString();
    this.persist(this.state);
    this.listeners.forEach((l) => {
      try {
        l();
      } catch (e) {
        console.error("Error in DB listener", e);
      }
    });
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  public getState(): DatabaseState {
    return this.state;
  }

  public hydrateState(incomingState: DatabaseState): void {
    if (incomingState && Array.isArray(incomingState.shipments)) {
      this.state = incomingState;
      this.notify();
    }
  }

  // --- USERS & DRIVERS ---
  public getUsers(): DbUser[] {
    return this.state.users || [];
  }

  public getUser(id: string): DbUser | undefined {
    return (this.state.users || []).find((u) => u.id === id);
  }

  public getDrivers(): DbDriver[] {
    return this.state.drivers || [];
  }

  public getDriver(id: string): DbDriver | undefined {
    return (this.state.drivers || []).find((d) => d.driverId === id);
  }

  // --- SHIPMENT CRUD ---
  public getShipments(): DbShipment[] {
    return this.state.shipments;
  }

  public getShipment(id: string): DbShipment | undefined {
    return this.state.shipments.find((s) => s.shipmentId === id);
  }

  public createShipment(
    data: Omit<
      DbShipment,
      | "shipmentId"
      | "trackingNumber"
      | "createdAt"
      | "updatedAt"
      | "riskScore"
      | "riskLevel"
      | "delayProbability"
      | "estimatedDelayMinutes"
      | "routeDeviationKm"
      | "currentEta"
      | "predictedEta"
    > & {
      shipmentId?: string;
      trackingNumber?: string;
      riskScore?: number;
      riskLevel?: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
      delayProbability?: number;
      estimatedDelayMinutes?: number;
      routeDeviationKm?: number;
      currentEta?: string;
      predictedEta?: string;
      createdAt?: string;
      updatedAt?: string;
    },
    user = "Operator",
    role = "logistics_manager",
  ): DbShipment {
    const id = data.shipmentId || `FW-${Math.floor(1000 + Math.random() * 9000)}`;
    const trackingNumber = data.trackingNumber || `TRK-IND-2026-${id}`;
    const now = new Date().toISOString();

    const partial: DbShipment = {
      ...data,
      shipmentId: id,
      trackingNumber,
      status: data.status || "BOOKED",
      currentLocation: data.currentLocation || {
        lat: data.originCoords?.lat || 28.5284,
        lng: data.originCoords?.lng || 77.5682,
        address: data.origin,
      },
      remainingKm: data.remainingKm || data.totalKm || 1200,
      totalKm: data.totalKm || 1200,
      routeDeviationKm: data.routeDeviationKm ?? 0,
      currentEta: data.currentEta || data.expectedDeliveryTime,
      originalEta: data.originalEta || data.expectedDeliveryTime,
      predictedEta: data.predictedEta || data.expectedDeliveryTime,
      riskScore: data.riskScore ?? 12,
      riskLevel: data.riskLevel || "LOW",
      delayProbability: data.delayProbability ?? 5,
      estimatedDelayMinutes: data.estimatedDelayMinutes ?? 0,
      createdAt: data.createdAt || now,
      updatedAt: data.updatedAt || now,
    };

    const risk = calculateShipmentRisk(partial);
    const newShipment: DbShipment = {
      ...partial,
      riskScore: data.riskScore ?? risk.riskScore,
      riskLevel: data.riskLevel ?? risk.riskLevel,
      delayProbability: data.delayProbability ?? risk.delayProbability,
      estimatedDelayMinutes: data.estimatedDelayMinutes ?? risk.estimatedDelayMinutes,
    };

    this.state.shipments = [newShipment, ...this.state.shipments];

    // Generate prediction record
    const prediction = generatePredictionRecord(newShipment);
    this.state.predictions = [prediction, ...this.state.predictions];

    // Log audit
    this.addAuditLog({
      user,
      role,
      action: `Created new consignment ${newShipment.shipmentId} (${newShipment.cargoType})`,
      entity: "Shipment",
      entityId: newShipment.shipmentId,
      newValue: `Origin: ${newShipment.origin} → Dest: ${newShipment.destination} | Priority: ${newShipment.priority}`,
      reason: "New freight order booking",
    });

    liveEventBus.publish({
      id: `EVT-${Date.now()}`,
      type: "SHIPMENT_ETA_UPDATED",
      timestamp: now,
      payload: { shipmentId: newShipment.shipmentId, status: newShipment.status },
    });

    this.notify();
    return newShipment;
  }

  public updateShipment(
    id: string,
    updates: Partial<DbShipment>,
    user = "System",
    role = "dispatcher",
    reason?: string,
  ): DbShipment | undefined {
    const idx = this.state.shipments.findIndex((s) => s.shipmentId === id);
    if (idx === -1) return undefined;

    const old = this.state.shipments[idx];
    const updated: DbShipment = {
      ...old,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    // Recalculate risk if not explicitly provided
    if (updates.riskScore === undefined) {
      const vehicle = this.state.vehicles.find((v) => v.vehicleId === updated.vehicleId);
      const risk = calculateShipmentRisk(updated, vehicle, this.state.alerts);
      updated.riskScore = risk.riskScore;
      updated.riskLevel = risk.riskLevel;
      updated.delayProbability = risk.delayProbability;
      updated.estimatedDelayMinutes = risk.estimatedDelayMinutes;
    }

    this.state.shipments[idx] = updated;

    // Update prediction
    const predIdx = this.state.predictions.findIndex((p) => p.shipmentId === id);
    const vehicle = this.state.vehicles.find((v) => v.vehicleId === updated.vehicleId);
    const newPred = generatePredictionRecord(updated, vehicle, this.state.alerts);
    if (predIdx !== -1) {
      this.state.predictions[predIdx] = newPred;
    } else {
      this.state.predictions.push(newPred);
    }

    this.addAuditLog({
      user,
      role,
      action: `Updated Shipment ${id}`,
      entity: "Shipment",
      entityId: id,
      previousValue: `Status: ${old.status}, Risk: ${old.riskScore}%`,
      newValue: `Status: ${updated.status}, Risk: ${updated.riskScore}%`,
      reason: reason || "Operational update",
    });

    liveEventBus.publish({
      id: `EVT-${Date.now()}`,
      type: "SHIPMENT_ETA_UPDATED",
      timestamp: new Date().toISOString(),
      payload: { shipmentId: id, riskScore: updated.riskScore, status: updated.status },
    });

    this.notify();
    return updated;
  }

  public deleteShipment(id: string, user = "Operator", role = "logistics_manager"): boolean {
    const idx = this.state.shipments.findIndex((s) => s.shipmentId === id);
    if (idx === -1) return false;

    const deleted = this.state.shipments[idx];
    this.state.shipments = this.state.shipments.filter((s) => s.shipmentId !== id);
    this.state.predictions = this.state.predictions.filter((p) => p.shipmentId !== id);

    executeSqliteDelete("shipments", "shipmentId", id);
    executeSqliteDelete("predictions", "shipmentId", id);

    this.addAuditLog({
      user,
      role,
      action: `Deleted Shipment ${id}`,
      entity: "Shipment",
      entityId: id,
      previousValue: `Customer: ${deleted.customer}, Status: ${deleted.status}`,
      reason: "Shipment cancellation / removal",
    });

    this.notify();
    return true;
  }

  public rerouteShipment(
    shipmentId: string,
    newRouteId: string,
    reason: string,
    user = "Dispatcher",
    role = "dispatcher",
  ): { success: boolean; shipment?: DbShipment; message: string } {
    const shipment = this.getShipment(shipmentId);
    const route = this.state.routes.find((r) => r.routeId === newRouteId);

    if (!shipment || !route) {
      return { success: false, message: "Shipment or target route not found" };
    }

    const previousRoute = shipment.activeRouteName;
    const previousRisk = shipment.riskScore;

    // Update shipment with new route, cleared deviation, and lower risk
    const updated = this.updateShipment(
      shipmentId,
      {
        activeRouteName: route.name,
        mode: route.mode,
        routeDeviationKm: 0.0,
        status: "REROUTED",
        notes: `Rerouted via ${route.name} by ${user}. Deviation cleared. Estimated transit savings: ${route.co2SavedPct}% CO2 reduction.`,
        currentEta: `${shipment.originalEta} (On Schedule via DFC)`,
        predictedEta: shipment.originalEta,
      },
      user,
      role,
      `AI Reroute executed: Switched from ${previousRoute} to ${route.name}. ${reason}`,
    );

    // Resolve any active deviation alerts on this shipment
    this.state.alerts.forEach((alert) => {
      if (
        alert.shipmentId === shipmentId &&
        alert.type === "ROUTE_DEVIATION" &&
        alert.status === "ACTIVE"
      ) {
        alert.status = "RESOLVED";
        alert.resolvedAt = new Date().toISOString();
        alert.resolutionNote = `Resolved automatically upon executing multimodal reroute to ${route.name}.`;
      }
    });

    // Add explicit audit entry
    this.addAuditLog({
      user,
      role,
      action: `Executed AI Multimodal Reroute for ${shipmentId}`,
      entity: "Route",
      entityId: shipmentId,
      previousValue: `Route: ${previousRoute} (Risk: ${previousRisk}%)`,
      newValue: `Route: ${route.name} (Risk: ${updated?.riskScore || 14}%)`,
      reason,
    });

    liveEventBus.publish({
      id: `EVT-${Date.now()}`,
      type: "NOTIFICATION_BROADCAST",
      timestamp: new Date().toISOString(),
      payload: {
        title: "AI Reroute Successfully Applied",
        message: `Shipment ${shipmentId} transitioned to ${route.name}. Risk reduced from ${previousRisk}% to ${updated?.riskScore || 14}%.`,
      },
    });

    this.notify();
    return {
      success: true,
      shipment: updated,
      message: `Shipment ${shipmentId} successfully rerouted to ${route.name}. Risk dropped to ${updated?.riskScore || 14}%.`,
    };
  }

  // --- VEHICLE CRUD ---
  public getVehicles(): DbVehicle[] {
    return this.state.vehicles;
  }

  public getVehicle(id: string): DbVehicle | undefined {
    return this.state.vehicles.find((v) => v.vehicleId === id);
  }

  public createVehicle(
    vehicle: DbVehicle,
    user = "Fleet Manager",
    role = "fleet_manager",
  ): DbVehicle {
    this.state.vehicles = [vehicle, ...this.state.vehicles];

    this.addAuditLog({
      user,
      role,
      action: `Registered Vehicle ${vehicle.vehicleId} (${vehicle.registrationNumber})`,
      entity: "Vehicle",
      entityId: vehicle.vehicleId,
      newValue: `Mode: ${vehicle.mode}, Status: ${vehicle.status}`,
      reason: "Fleet asset registration",
    });

    this.notify();
    return vehicle;
  }

  public updateVehicle(
    id: string,
    updates: Partial<DbVehicle>,
    user = "Fleet Manager",
    role = "fleet_manager",
    reason?: string,
  ): DbVehicle | undefined {
    const idx = this.state.vehicles.findIndex((v) => v.vehicleId === id);
    if (idx === -1) return undefined;

    const old = this.state.vehicles[idx];
    const updated: DbVehicle = {
      ...old,
      ...updates,
      lastUpdated: new Date().toISOString(),
    };

    this.state.vehicles[idx] = updated;

    this.addAuditLog({
      user,
      role,
      action: `Updated Vehicle ${id}`,
      entity: "Vehicle",
      entityId: id,
      previousValue: `Status: ${old.status}, Speed: ${old.speed} km/h`,
      newValue: `Status: ${updated.status}, Speed: ${updated.speed} km/h`,
      reason: reason || "Fleet telemetry/state update",
    });

    this.notify();
    return updated;
  }

  public deleteVehicle(id: string, user = "Fleet Manager", role = "fleet_manager"): boolean {
    const idx = this.state.vehicles.findIndex((v) => v.vehicleId === id);
    if (idx === -1) return false;

    const deleted = this.state.vehicles[idx];
    this.state.vehicles = this.state.vehicles.filter((v) => v.vehicleId !== id);

    executeSqliteDelete("vehicles", "vehicleId", id);

    this.addAuditLog({
      user,
      role,
      action: `Decommissioned Vehicle ${id}`,
      entity: "Vehicle",
      entityId: id,
      previousValue: `Registration: ${deleted.registrationNumber}, Mode: ${deleted.mode}`,
      reason: "Fleet asset decommissioning",
    });

    this.notify();
    return true;
  }

  public updateVehicleLocation(
    vehicleId: string,
    location: { lat: number; lng: number; address: string },
    speed: number,
    fuelOrBatteryPct?: number,
    user = "Telemetry Ingestion",
    role = "system",
  ): DbVehicle | undefined {
    const vehicle = this.state.vehicles.find((v) => v.vehicleId === vehicleId);
    if (!vehicle) return undefined;

    vehicle.currentLocation = location;
    vehicle.speed = speed;
    if (fuelOrBatteryPct !== undefined) {
      vehicle.fuelOrBatteryPct = fuelOrBatteryPct;
    }
    vehicle.lastUpdated = new Date().toISOString();

    // Log tracking event
    this.createTrackingEvent({
      vehicleId,
      shipmentId: vehicle.currentShipmentId || "N/A",
      lat: location.lat,
      lng: location.lng,
      speed,
      locationName: location.address,
      eventType: "GPS_PING",
      description: `GPS telemetry recorded: ${speed} km/h at ${location.address}`,
      isSimulated: false,
    });

    this.notify();
    return vehicle;
  }

  // --- ALERTS WORKFLOW ---
  public getAlerts(): DbAlert[] {
    return this.state.alerts;
  }

  public getAlert(id: string): DbAlert | undefined {
    return this.state.alerts.find((a) => a.alertId === id);
  }

  public getAlertsForShipment(shipmentId: string): DbAlert[] {
    return this.state.alerts.filter((a) => a.shipmentId === shipmentId);
  }

  public createAlert(
    data: Omit<DbAlert, "alertId" | "timestamp" | "status"> & {
      alertId?: string;
      timestamp?: string;
      status?: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "ESCALATED";
    },
    user = "System",
    role = "system",
  ): DbAlert {
    const alertId = data.alertId || `ALT-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = data.timestamp || new Date().toISOString();
    const status = data.status || "ACTIVE";

    const newAlert: DbAlert = {
      ...data,
      alertId,
      timestamp,
      status,
    };

    this.state.alerts = [newAlert, ...this.state.alerts];

    this.addAuditLog({
      user,
      role,
      action: `Created Alert ${alertId} (${newAlert.severity} - ${newAlert.type})`,
      entity: "Alert",
      entityId: alertId,
      newValue: newAlert.description,
      reason: "Automated anomaly detection",
    });

    liveEventBus.publish({
      id: `EVT-${Date.now()}`,
      type: "ALERT_GENERATED",
      timestamp,
      payload: {
        alertId,
        severity: newAlert.severity,
        type: newAlert.type,
        shipmentId: newAlert.shipmentId,
      },
    });

    this.notify();
    return newAlert;
  }

  public updateAlert(
    id: string,
    updates: Partial<DbAlert>,
    user = "Dispatcher",
    role = "dispatcher",
    reason?: string,
  ): DbAlert | undefined {
    const idx = this.state.alerts.findIndex((a) => a.alertId === id);
    if (idx === -1) return undefined;

    const old = this.state.alerts[idx];
    const updated: DbAlert = {
      ...old,
      ...updates,
    };

    this.state.alerts[idx] = updated;

    this.addAuditLog({
      user,
      role,
      action: `Updated Alert ${id}`,
      entity: "Alert",
      entityId: id,
      previousValue: `Status: ${old.status}, Severity: ${old.severity}`,
      newValue: `Status: ${updated.status}, Severity: ${updated.severity}`,
      reason: reason || "Alert management",
    });

    this.notify();
    return updated;
  }

  public updateAlertStatus(
    alertId: string,
    action: "ACKNOWLEDGE" | "RESOLVE" | "ESCALATE",
    user = "Dispatcher",
    role = "dispatcher",
    note?: string,
  ): DbAlert | undefined {
    const alert = this.state.alerts.find((a) => a.alertId === alertId);
    if (!alert) return undefined;

    if (action === "ACKNOWLEDGE") {
      alert.status = "ACKNOWLEDGED";
      alert.acknowledgedBy = `${user} (${role})`;
    } else if (action === "RESOLVE") {
      alert.status = "RESOLVED";
      alert.resolvedAt = new Date().toISOString();
      if (note) alert.resolutionNote = note;
    } else if (action === "ESCALATE") {
      alert.status = "ESCALATED";
      alert.severity = "CRITICAL";
    }

    this.addAuditLog({
      user,
      role,
      action: `${action} Alert ${alertId}`,
      entity: "Alert",
      entityId: alertId,
      newValue: `Status: ${alert.status}${note ? ` | Note: ${note}` : ""}`,
      reason: `Operator performed ${action}`,
    });

    this.notify();
    return alert;
  }

  public acknowledgeAlert(alertId: string, user = "Dispatcher", role = "dispatcher") {
    return this.updateAlertStatus(alertId, "ACKNOWLEDGE", user, role);
  }

  public resolveAlert(
    alertId: string,
    resolutionNote: string,
    user = "Dispatcher",
    role = "dispatcher",
  ) {
    return this.updateAlertStatus(alertId, "RESOLVE", user, role, resolutionNote);
  }

  public escalateAlert(alertId: string, user = "Dispatcher", role = "dispatcher") {
    return this.updateAlertStatus(alertId, "ESCALATE", user, role);
  }

  public deleteAlert(id: string, user = "Dispatcher", role = "dispatcher"): boolean {
    const idx = this.state.alerts.findIndex((a) => a.alertId === id);
    if (idx === -1) return false;

    this.state.alerts = this.state.alerts.filter((a) => a.alertId !== id);
    this.addAuditLog({
      user,
      role,
      action: `Deleted Alert ${id}`,
      entity: "Alert",
      entityId: id,
      reason: "Alert discarded",
    });

    this.notify();
    return true;
  }

  // --- INCIDENTS ---
  public getIncidents(): DbIncident[] {
    return this.state.incidents;
  }

  public getIncident(id: string): DbIncident | undefined {
    return this.state.incidents.find((i) => i.incidentId === id);
  }

  public createIncident(
    data: Omit<DbIncident, "incidentId" | "time" | "status" | "crewCount" | "notes"> & {
      incidentId?: string;
      time?: string;
      status?: "ACTIVE" | "DISPATCHED" | "CONTAINED" | "RESOLVED";
      crewCount?: number;
      notes?: string[];
    },
    user = "Safety Officer",
    role = "logistics_manager",
  ): DbIncident {
    const incidentId = data.incidentId || `INC-2026-${Math.floor(100 + Math.random() * 900)}`;
    const time = data.time || new Date().toISOString();

    const newIncident: DbIncident = {
      ...data,
      incidentId,
      time,
      status: data.status || "ACTIVE",
      crewCount: data.crewCount ?? (data.severity === "CRITICAL_LEVEL_1" ? 4 : 2),
      notes: data.notes || [data.actionTaken],
    };

    this.state.incidents = [newIncident, ...this.state.incidents];

    this.addAuditLog({
      user,
      role,
      action: `Reported Incident ${incidentId} (${newIncident.severity})`,
      entity: "Incident",
      entityId: incidentId,
      newValue: `Vehicle: ${newIncident.vehicleNumber}, Cause: ${newIncident.cause}`,
      reason: "Emergency dispatch & safety log",
    });

    this.notify();
    return newIncident;
  }

  public updateIncident(
    incidentId: string,
    updates: Partial<DbIncident>,
    user = "Safety Officer",
    role = "logistics_manager",
  ): DbIncident | undefined {
    const idx = this.state.incidents.findIndex((i) => i.incidentId === incidentId);
    if (idx === -1) return undefined;

    const old = this.state.incidents[idx];
    const updated: DbIncident = { ...old, ...updates };
    this.state.incidents[idx] = updated;

    this.addAuditLog({
      user,
      role,
      action: `Updated Incident ${incidentId}`,
      entity: "Incident",
      entityId: incidentId,
      previousValue: `Status: ${old.status}`,
      newValue: `Status: ${updated.status} - ${updated.actionTaken}`,
      reason: "Incident mitigation update",
    });

    this.notify();
    return updated;
  }

  public updateIncidentStatus(
    incidentId: string,
    status: "ACTIVE" | "DISPATCHED" | "CONTAINED" | "RESOLVED",
    actionTaken?: string,
    user = "Emergency Commander",
    role = "dispatcher",
    note?: string,
  ): DbIncident | undefined {
    const incident = this.state.incidents.find((i) => i.incidentId === incidentId);
    if (!incident) return undefined;

    const prevStatus = incident.status;
    incident.status = status;
    if (actionTaken) incident.actionTaken = actionTaken;
    if (status === "RESOLVED") {
      incident.resolvedAt = new Date().toISOString();
    }
    if (note) {
      incident.notes = [...(incident.notes || []), note];
    }

    this.addAuditLog({
      user,
      role,
      action: `Incident ${incidentId} transitioned: ${prevStatus} → ${status}`,
      entity: "Incident",
      entityId: incidentId,
      previousValue: prevStatus,
      newValue: status,
      reason: note || actionTaken || "Emergency management protocol update",
    });

    this.notify();
    return incident;
  }

  public deleteIncident(id: string, user = "Safety Officer", role = "logistics_manager"): boolean {
    const idx = this.state.incidents.findIndex((i) => i.incidentId === id);
    if (idx === -1) return false;

    this.state.incidents = this.state.incidents.filter((i) => i.incidentId !== id);
    this.addAuditLog({
      user,
      role,
      action: `Deleted Incident ${id}`,
      entity: "Incident",
      entityId: id,
      reason: "Incident archived/deleted",
    });

    this.notify();
    return true;
  }

  // --- PREDICTIONS ---
  public getPredictions(): DbPrediction[] {
    return this.state.predictions;
  }

  public getPrediction(id: string): DbPrediction | undefined {
    return this.state.predictions.find((p) => p.id === id || p.predictionId === id);
  }

  public getPredictionsForShipment(shipmentId: string): DbPrediction | undefined {
    return this.state.predictions.find((p) => p.shipmentId === shipmentId);
  }

  public createPrediction(prediction: DbPrediction): DbPrediction {
    this.state.predictions = [prediction, ...this.state.predictions];
    this.notify();
    return prediction;
  }

  public updatePrediction(id: string, updates: Partial<DbPrediction>): DbPrediction | undefined {
    const idx = this.state.predictions.findIndex((p) => p.id === id || p.predictionId === id);
    if (idx === -1) return undefined;

    const old = this.state.predictions[idx];
    const updated: DbPrediction = { ...old, ...updates, updatedAt: new Date().toISOString() };
    this.state.predictions[idx] = updated;
    this.notify();
    return updated;
  }

  // --- ROUTES ---
  public getRoutes(): DbRoute[] {
    return this.state.routes;
  }

  public getRoute(id: string): DbRoute | undefined {
    return this.state.routes.find((r) => r.routeId === id);
  }

  public createRoute(
    route: DbRoute,
    user = "Logistics Admin",
    role = "logistics_manager",
  ): DbRoute {
    this.state.routes = [route, ...this.state.routes];

    this.addAuditLog({
      user,
      role,
      action: `Registered Route ${route.routeId} (${route.name})`,
      entity: "Route",
      entityId: route.routeId,
      newValue: `Mode: ${route.mode}, Distance: ${route.distanceKm} km`,
      reason: "Logistics corridor definition",
    });

    this.notify();
    return route;
  }

  public updateRoute(
    id: string,
    updates: Partial<DbRoute>,
    user = "Logistics Admin",
    role = "logistics_manager",
  ): DbRoute | undefined {
    const idx = this.state.routes.findIndex((r) => r.routeId === id);
    if (idx === -1) return undefined;

    const old = this.state.routes[idx];
    const updated: DbRoute = { ...old, ...updates, updatedAt: new Date().toISOString() };
    this.state.routes[idx] = updated;

    this.addAuditLog({
      user,
      role,
      action: `Updated Route ${id}`,
      entity: "Route",
      entityId: id,
      previousValue: `Name: ${old.name}, Distance: ${old.distanceKm} km`,
      newValue: `Name: ${updated.name}, Distance: ${updated.distanceKm} km`,
      reason: "Route profile update",
    });

    this.notify();
    return updated;
  }

  public deleteRoute(id: string, user = "Logistics Admin", role = "logistics_manager"): boolean {
    const idx = this.state.routes.findIndex((r) => r.routeId === id);
    if (idx === -1) return false;

    this.state.routes = this.state.routes.filter((r) => r.routeId !== id);
    this.addAuditLog({
      user,
      role,
      action: `Deleted Route ${id}`,
      entity: "Route",
      entityId: id,
      reason: "Route corridor removed",
    });

    this.notify();
    return true;
  }

  // --- TRACKING EVENTS ---
  public getTrackingEvents(shipmentId?: string): DbTrackingEvent[] {
    if (shipmentId) {
      return (this.state.trackingEvents || []).filter((e) => e.shipmentId === shipmentId);
    }
    return this.state.trackingEvents || [];
  }

  public createTrackingEvent(
    event: Omit<DbTrackingEvent, "id" | "timestamp"> & { id?: string; timestamp?: string },
  ): DbTrackingEvent {
    const id = event.id || `TRK-EVT-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
    const timestamp = event.timestamp || new Date().toISOString();

    const newEvent: DbTrackingEvent = {
      ...event,
      id,
      timestamp,
      latitude: event.latitude ?? event.lat,
      longitude: event.longitude ?? event.lng,
      source: event.source || (event.isSimulated ? "SIMULATED" : "GPS_TELEMETRY"),
    };

    this.state.trackingEvents = [newEvent, ...(this.state.trackingEvents || [])];
    this.notify();
    return newEvent;
  }

  public addTrackingEvent(
    event: Omit<DbTrackingEvent, "id" | "timestamp"> & { id?: string; timestamp?: string },
  ): DbTrackingEvent {
    return this.createTrackingEvent(event);
  }

  // --- SIMULATION EVENTS ---
  public getSimulationEvents(): DbSimulationEvent[] {
    return this.state.simulationEvents || [];
  }

  public createSimulationEvent(
    event: Omit<DbSimulationEvent, "id" | "timestamp"> & { id?: string; timestamp?: string },
  ): DbSimulationEvent {
    const id = event.id || `SIM-EVT-${Date.now()}`;
    const timestamp = event.timestamp || new Date().toISOString();

    const newEvent: DbSimulationEvent = {
      ...event,
      id,
      timestamp,
      isSimulated: true,
      source: event.source || "SIMULATED",
    };

    this.state.simulationEvents = [newEvent, ...(this.state.simulationEvents || [])];
    this.notify();
    return newEvent;
  }

  // --- AUDIT LOGS ---
  public getAuditLogs(): DbAuditLog[] {
    return this.state.auditLogs;
  }

  public createAuditLog(entry: Omit<DbAuditLog, "id" | "timestamp">): DbAuditLog {
    const log: DbAuditLog = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs = [log, ...this.state.auditLogs];
    this.notify();
    return log;
  }

  public addAuditLog(entry: Omit<DbAuditLog, "id" | "timestamp">): DbAuditLog {
    const log: DbAuditLog = {
      ...entry,
      id: `AUD-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toISOString(),
    };
    this.state.auditLogs = [log, ...this.state.auditLogs];
    this.notify();
    return log;
  }

  // --- DEMO STEP ENGINE ---
  public runDemoStep(
    step: number,
    user = "Demo Presenter",
  ): {
    step: number;
    title: string;
    description: string;
    affectedShipmentId: string;
  } {
    const shipmentId = "FW-1042";

    if (step === 1) {
      // Step 1: Normal state
      this.updateShipment(
        shipmentId,
        {
          status: "IN_TRANSIT",
          routeDeviationKm: 0.0,
          remainingKm: 1220,
          currentLocation: {
            lat: 28.5284,
            lng: 77.5682,
            address: "Delhi NCR (Dadri ICD Hub) - Departed on Schedule",
          },
          currentEta: "Tomorrow, 14:00 (On Time)",
          predictedEta: "Tomorrow, 14:00",
          notes: "Normal operations. High-precision battery cargo secured.",
        },
        user,
        "super_admin",
        "Demo Step 1: Normal initial baseline",
      );

      return {
        step: 1,
        title: "Step 1: Normal Transit Baseline",
        description: "Shipment FW-1042 departed Dadri ICD Hub on schedule. Risk is LOW (14%).",
        affectedShipmentId: shipmentId,
      };
    } else if (step === 2) {
      // Step 2: Traffic congestion & Route Deviation
      const vehicle = this.state.vehicles.find((v) => v.vehicleId === "TRK-HR26-EA-9912");
      if (vehicle) {
        vehicle.speed = 24;
        vehicle.currentLocation = {
          lat: 28.1928,
          lng: 76.6189,
          address: "NH-48 Milestone Km 54.2 - Heavy Traffic Gridlock",
        };
      }

      this.updateShipment(
        shipmentId,
        {
          status: "DELAYED",
          routeDeviationKm: 8.4,
          currentLocation: {
            lat: 28.1928,
            lng: 76.6189,
            address: "NH-48 Jaipur Highway (Congested Arterial Bypass)",
          },
          currentEta: "Tomorrow, 15:45 (+105m)",
          predictedEta: "Tomorrow, 15:54 (+114m delay)",
        },
        user,
        "super_admin",
        "Demo Step 2: Route deviation and speed drop triggered",
      );

      // Trigger Alert
      const alertExists = this.state.alerts.some(
        (a) => a.shipmentId === shipmentId && a.type === "ROUTE_DEVIATION" && a.status === "ACTIVE",
      );
      if (!alertExists) {
        const newAlert: DbAlert = {
          alertId: `ALT-DEMO-${Date.now().toString(36)}`,
          severity: "CRITICAL",
          type: "ROUTE_DEVIATION",
          shipmentId,
          vehicleId: "TRK-HR26-EA-9912",
          timestamp: new Date().toISOString(),
          description:
            "Severe 8.4 km route deviation into heavy NH-48 bottleneck. Speed dropped to 24 km/h.",
          riskScore: 87,
          aiExplanation: {
            what: "CRITICAL TRANSIT DELAY & ROUTE DEVIATION (87/100)",
            why: [
              "Vehicle deviated 8.4 km onto congested state highway.",
              "Current speed (24 km/h) is 63% below expected baseline (65 km/h).",
              "Delivery ETA delayed by +114 minutes, threatening SLA breach.",
            ],
            impact: "+114 minutes delay. 84% probability of missing export vessel at JNPT.",
            recommendedAction:
              "Execute 1-click multimodal transfer to Western Dedicated Freight Corridor (DFC Rail Rake Slot #402 at Rewari ICD).",
            confidence: 94,
          },
          recommendedAction: "Execute 1-click multimodal transfer to Western DFC Rail Slot #402.",
          status: "ACTIVE",
        };
        this.state.alerts = [newAlert, ...this.state.alerts];
      }

      this.notify();

      return {
        step: 2,
        title: "Step 2: Congestion & Route Deviation Detected",
        description:
          "Vehicle deviated 8.4 km; speed plummeted to 24 km/h. Predictive Risk Engine spiked to 87% (CRITICAL).",
        affectedShipmentId: shipmentId,
      };
    } else if (step === 3) {
      // Step 3: AI Explanations and Reroute Recommendation
      return {
        step: 3,
        title: "Step 3: Explainable AI Recommendation Ready",
        description:
          "AI identified the root cause and generated an optimal rail transfer to Western DFC Slot #402 saving 114 minutes and 58% CO2.",
        affectedShipmentId: shipmentId,
      };
    } else if (step === 4) {
      // Step 4: Execute Reroute
      this.rerouteShipment(
        shipmentId,
        "RTE-WDFC-MAIN",
        "Operator accepted AI recommendation: Multimodal transfer to Western DFC Electrified Freight Corridor.",
        user,
        "dispatcher",
      );

      return {
        step: 4,
        title: "Step 4: AI Reroute Accepted & Applied",
        description:
          "Shipment FW-1042 successfully transferred to WDFC Rail. Risk dropped from 87% to 14%. Status: REROUTED_ON_SCHEDULE.",
        affectedShipmentId: shipmentId,
      };
    }

    return {
      step,
      title: "Demo Step Completed",
      description: "Full end-to-end predictive loop executed.",
      affectedShipmentId: shipmentId,
    };
  }

  public resetDatabase() {
    this.state = this.loadInitialState();
    this.notify();
  }
}

export const db = new DatabaseManager();
