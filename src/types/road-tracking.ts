import { GeoLocation } from "@/types/cargo-portal";

export interface LiveVehicleTelemetry {
  id: string;
  vehicleNumber: string; // e.g. "MH-12-RN-8812"
  vehicleModel: string;
  type: "heavy_truck" | "reefer_van" | "electric_hauler" | "trailer_40ft" | "drayage_truck";
  driverName: string;
  driverPhone: string;
  driverPhoto?: string;
  driverLicenseNumber: string;
  driverVigilanceScore: number; // 0-100%
  driverFatigueAlert: boolean;
  bloodGroup: string;
  shiftHoursDriven: number;
  currentLat: number;
  currentLng: number;
  currentAltitudeM: number;
  speedKmh: number;
  speedLimitKmh: number;
  isSpeeding: boolean;
  headingDeg: number;
  headingText: string;
  fuelLevelPct: number;
  adBluePct: number;
  batteryPct?: number;
  tirePressurePsi: {
    frontLeft: number;
    frontRight: number;
    rearLeftOuter: number;
    rearLeftInner: number;
    rearRightInner: number;
    rearRightOuter: number;
  };
  cargoId: string;
  consignmentTitle: string;
  consignor: string;
  originHub: GeoLocation;
  destinationHub: GeoLocation;
  currentLocationName: string;
  etaIso: string;
  etaRemainingHours: number;
  remainingDistanceKm: number;
  totalDistanceKm: number;
  tripProgressPct: number;
  geofenceStatus: "INSIDE_CORRIDOR" | "GEOFENCE_WARNING" | "OFF_ROUTE_BREACH" | "AT_CHECKPOINT";
  activeGeofenceName: string;
  routeHistory: Array<{ lat: number; lng: number; timestamp: string; speed: number }>;
  lastHeartbeatIso: string;
  status: "CRUISING" | "TOLL_PLAZA" | "REST_STOP" | "DELAYED_TRAFFIC" | "UNLOADING";
  fastagTagId: string;
  fastagBalanceInr: number;
  eWayBillNumber: string;
}

export const MOCK_LIVE_ROAD_FLEET: LiveVehicleTelemetry[] = [
  {
    id: "VEH-MH12-8812",
    vehicleNumber: "MH-12-RN-8812",
    vehicleModel: "BharatBenz 4028T Multi-Axle Tractor",
    type: "heavy_truck",
    driverName: "Gurpreet Singh Gill",
    driverPhone: "+91 98201 44819",
    driverLicenseNumber: "DL-0420188492019",
    driverVigilanceScore: 97,
    driverFatigueAlert: false,
    bloodGroup: "B+ Positive",
    shiftHoursDriven: 3.8,
    currentLat: 20.8982,
    currentLng: 74.7744,
    currentAltitudeM: 320,
    speedKmh: 68.4,
    speedLimitKmh: 80.0,
    isSpeeding: false,
    headingDeg: 195,
    headingText: "South-Southwest (SSW)",
    fuelLevelPct: 78,
    adBluePct: 84,
    tirePressurePsi: {
      frontLeft: 118,
      frontRight: 119,
      rearLeftOuter: 120,
      rearLeftInner: 121,
      rearRightInner: 120,
      rearRightOuter: 119,
    },
    cargoId: "FW-892301",
    consignmentTitle: "Precision Auto CNC Machined Parts (40ft High-Cube)",
    consignor: "Tata Motors Commercial Vehicle Hub",
    originHub: {
      name: "Sanand Auto Industrial Corridor, Gujarat",
      lat: 22.9833,
      lng: 72.3833,
      type: "road_office",
    },
    destinationHub: {
      name: "Bhosari Industrial Area, Pune (MH)",
      lat: 18.6279,
      lng: 73.8475,
      type: "warehouse",
    },
    currentLocationName: "Dhule Bypass, NH-52 / NH-53 Interchange, Maharashtra",
    etaIso: "2026-08-22T16:30:00.000Z",
    etaRemainingHours: 3.5,
    remainingDistanceKm: 218,
    totalDistanceKm: 580,
    tripProgressPct: 62.4,
    geofenceStatus: "INSIDE_CORRIDOR",
    activeGeofenceName: "Western Freight Highway Expressway Corridor (NH-48 / NH-52)",
    routeHistory: [
      { lat: 22.9833, lng: 72.3833, timestamp: "06:00 AM", speed: 0 },
      { lat: 22.3072, lng: 73.1812, timestamp: "08:15 AM", speed: 72 },
      { lat: 21.1702, lng: 72.8311, timestamp: "10:30 AM", speed: 65 },
      { lat: 20.8982, lng: 74.7744, timestamp: "12:15 PM", speed: 68.4 },
    ],
    lastHeartbeatIso: new Date().toISOString(),
    status: "CRUISING",
    fastagTagId: "34161FA82039102",
    fastagBalanceInr: 4850,
    eWayBillNumber: "EB-2026-9901-4402",
  },
  {
    id: "VEH-GJ06-4409",
    vehicleNumber: "GJ-06-AX-4409",
    vehicleModel: "Volvo FH16 540 Quad-Axle Heavy Carrier",
    type: "trailer_40ft",
    driverName: "Rameshwar K. Patel",
    driverPhone: "+91 94280 11928",
    driverLicenseNumber: "GJ-0620173918204",
    driverVigilanceScore: 94,
    driverFatigueAlert: false,
    bloodGroup: "O+ Positive",
    shiftHoursDriven: 5.2,
    currentLat: 22.3072,
    currentLng: 73.1812,
    currentAltitudeM: 140,
    speedKmh: 62.0,
    speedLimitKmh: 75.0,
    isSpeeding: false,
    headingDeg: 180,
    headingText: "South (S)",
    fuelLevelPct: 64,
    adBluePct: 72,
    tirePressurePsi: {
      frontLeft: 119,
      frontRight: 120,
      rearLeftOuter: 122,
      rearLeftInner: 121,
      rearRightInner: 121,
      rearRightOuter: 120,
    },
    cargoId: "FW-892302",
    consignmentTitle: "Industrial Transformer & High Voltage Switchgear",
    consignor: "ABB India Power Grid Division",
    originHub: {
      name: "Vadodara Heavy Engineering Hub (GJ)",
      lat: 22.3072,
      lng: 73.1812,
      type: "road_office",
    },
    destinationHub: {
      name: "JNPT Container Terminal Gate 3 (MH)",
      lat: 18.9498,
      lng: 72.9515,
      type: "port",
    },
    currentLocationName: "Bharuch Narmada Bridge Corridor, NH-48",
    etaIso: "2026-08-22T21:15:00.000Z",
    etaRemainingHours: 6.8,
    remainingDistanceKm: 380,
    totalDistanceKm: 460,
    tripProgressPct: 17.3,
    geofenceStatus: "INSIDE_CORRIDOR",
    activeGeofenceName: "Golden Quadrilateral Gujarat-Maharashtra Highway Geofence",
    routeHistory: [
      { lat: 22.3072, lng: 73.1812, timestamp: "09:00 AM", speed: 0 },
      { lat: 21.7051, lng: 72.9959, timestamp: "11:30 AM", speed: 62 },
    ],
    lastHeartbeatIso: new Date().toISOString(),
    status: "CRUISING",
    fastagTagId: "34161FA82039884",
    fastagBalanceInr: 6200,
    eWayBillNumber: "EB-2026-8812-7711",
  },
  {
    id: "VEH-DL01-1920",
    vehicleNumber: "DL-01-EE-1920",
    vehicleModel: "Tata Ultra T.7 Electric Urban Express",
    type: "electric_hauler",
    driverName: "Sandeep Verma",
    driverPhone: "+91 98110 55921",
    driverLicenseNumber: "DL-1120204928109",
    driverVigilanceScore: 99,
    driverFatigueAlert: false,
    bloodGroup: "A+ Positive",
    shiftHoursDriven: 2.1,
    currentLat: 28.5284,
    currentLng: 77.5682,
    currentAltitudeM: 214,
    speedKmh: 0,
    speedLimitKmh: 60.0,
    isSpeeding: false,
    headingDeg: 90,
    headingText: "East (E)",
    fuelLevelPct: 0,
    adBluePct: 0,
    batteryPct: 88,
    tirePressurePsi: {
      frontLeft: 110,
      frontRight: 110,
      rearLeftOuter: 112,
      rearLeftInner: 112,
      rearRightInner: 112,
      rearRightOuter: 112,
    },
    cargoId: "FW-892303",
    consignmentTitle: "Pharmaceutical Cold Chain Vaccines (Reefer Active)",
    consignor: "Serum Institute Logistics North Hub",
    originHub: {
      name: "Dadri Inland Container Depot (UP)",
      lat: 28.5284,
      lng: 77.5682,
      type: "icd_hub",
    },
    destinationHub: {
      name: "Indira Gandhi Cargo Terminal 3, Delhi",
      lat: 28.5562,
      lng: 77.1,
      type: "warehouse",
    },
    currentLocationName: "Dadri ICD Rapid Fast-Charging Bay 4",
    etaIso: "2026-08-22T14:00:00.000Z",
    etaRemainingHours: 1.2,
    remainingDistanceKm: 48,
    totalDistanceKm: 65,
    tripProgressPct: 26.1,
    geofenceStatus: "AT_CHECKPOINT",
    activeGeofenceName: "NCR Expressway Clean Air Commercial Green Zone",
    routeHistory: [{ lat: 28.5284, lng: 77.5682, timestamp: "11:00 AM", speed: 0 }],
    lastHeartbeatIso: new Date().toISOString(),
    status: "REST_STOP",
    fastagTagId: "34161FA89012344",
    fastagBalanceInr: 3400,
    eWayBillNumber: "EB-2026-1109-8833",
  },
  {
    id: "VEH-KA01-7719",
    vehicleNumber: "KA-01-MJ-7719",
    vehicleModel: "Ashok Leyland 4220 5-Axle Rigid Hauler",
    type: "heavy_truck",
    driverName: "Manjunath Gowda",
    driverPhone: "+91 97400 33810",
    driverLicenseNumber: "KA-0120194819201",
    driverVigilanceScore: 91,
    driverFatigueAlert: false,
    bloodGroup: "B+ Positive",
    shiftHoursDriven: 6.4,
    currentLat: 13.0827,
    currentLng: 80.2707,
    currentAltitudeM: 20,
    speedKmh: 42.5,
    speedLimitKmh: 60.0,
    isSpeeding: false,
    headingDeg: 270,
    headingText: "West (W)",
    fuelLevelPct: 52,
    adBluePct: 60,
    tirePressurePsi: {
      frontLeft: 116,
      frontRight: 118,
      rearLeftOuter: 120,
      rearLeftInner: 119,
      rearRightInner: 120,
      rearRightOuter: 119,
    },
    cargoId: "FW-892304",
    consignmentTitle: "Solar PV Photovoltaic Cells & Inverters",
    consignor: "Adani Solar Logistics Chennai Hub",
    originHub: {
      name: "Ennore Port Container Gate, Chennai",
      lat: 13.2644,
      lng: 80.3314,
      type: "port",
    },
    destinationHub: {
      name: "Whitefield ICD & Inland Logistics Terminal, Bengaluru",
      lat: 12.9698,
      lng: 77.7499,
      type: "icd_hub",
    },
    currentLocationName: "Sriperumbudur Industrial Highway Corridor (NH-48)",
    etaIso: "2026-08-22T20:45:00.000Z",
    etaRemainingHours: 5.5,
    remainingDistanceKm: 260,
    totalDistanceKm: 345,
    tripProgressPct: 24.6,
    geofenceStatus: "INSIDE_CORRIDOR",
    activeGeofenceName: "Chennai-Bengaluru Industrial Freight Corridor (CBIC)",
    routeHistory: [
      { lat: 13.2644, lng: 80.3314, timestamp: "08:30 AM", speed: 0 },
      { lat: 13.0827, lng: 80.2707, timestamp: "11:45 AM", speed: 42.5 },
    ],
    lastHeartbeatIso: new Date().toISOString(),
    status: "CRUISING",
    fastagTagId: "34161FA99120481",
    fastagBalanceInr: 5120,
    eWayBillNumber: "EB-2026-7731-9920",
  },
];
