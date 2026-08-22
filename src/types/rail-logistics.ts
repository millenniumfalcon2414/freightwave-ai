export interface RailWagon {
  wagonNumber: string; // e.g. "BLCA-2201948"
  type: "BLCA_CONTAINER" | "BLCB_CONTAINER" | "BOXN_BULK" | "BTPN_TANKER" | "BCNA_COVERED";
  containerId?: string; // e.g. "MSKU-982104-1"
  containerType?: "40FT_HIGH_CUBE" | "20FT_STANDARD" | "REEFER_COLD_CHAIN" | "TANK_ISO";
  tareWeightTons: number;
  payloadWeightTons: number;
  maxGrossWeightTons: number;
  sealNumber: string;
  cargoCategory: string;
  consignor: string;
  consignee: string;
  temperatureCelsius?: number;
  shockVibrationG?: number;
  status: "LOCKED_LOADED" | "EMPTY_SLOT" | "INSPECTION_PENDING" | "TRANSSHIPMENT_ACTIVE";
}

export interface TrainRakeTelemetry {
  rakeId: string; // e.g. "RAKE-WDFC-9912"
  rakeName: string; // e.g. "Garuda Double-Stack Super-Freighter"
  locoNumber: string; // e.g. "WAG-12B #60024 Twin Electric"
  locoHorsepower: number; // e.g. 12000 HP
  corridor: "WESTERN_DFC" | "EASTERN_DFC" | "SOUTHERN_FEEDER" | "GOLDEN_QUAD_RAIL";
  originYard: {
    code: string;
    name: string;
    lat: number;
    lng: number;
  };
  destinationYard: {
    code: string;
    name: string;
    lat: number;
    lng: number;
  };
  currentLat: number;
  currentLng: number;
  currentStationOrBlock: string;
  nextSignalingBlock: string;
  currentSpeedKmh: number;
  maxPermissibleSpeedKmh: number;
  totalWagonsCount: number;
  loadedWagonsCount: number;
  totalGrossWeightTons: number;
  totalTeuCapacity: number;
  bookedTeuCount: number;
  departureTimeIso: string;
  scheduledArrivalIso: string;
  estimatedArrivalIso: string;
  delayMinutes: number;
  delayReason?: string;
  dfcSlotNumber: string;
  oisFoisSyncStatus: "SYNCHRONIZED" | "FOIS_LAG_3M" | "LOCAL_BUFFER";
  driverLocoPilotName: string;
  driverLocoPilotPhone: string;
  assistantLocoPilotName: string;
  guardName: string;
  catenaryVoltageKv: number; // ~25 kV AC
  brakePipePressureKgCm2: number; // 5.0 kg/cm2
  status: "HIGH_SPEED_RUNNING" | "YARD_DWELL" | "CREW_CHANGEOVER" | "SIGNAL_HALT" | "TRANSSHIPMENT";
  wagons: RailWagon[];
  dwellTimeMinutesAtCurrentNode: number;
}

export const MOCK_TRAIN_RAKES: TrainRakeTelemetry[] = [
  {
    rakeId: "RAKE-WDFC-9912",
    rakeName: "Garuda Double-Stack Heavy Express #9912",
    locoNumber: "WAG-12B #60088 (Alstom 12,000 HP)",
    locoHorsepower: 12000,
    corridor: "WESTERN_DFC",
    originYard: {
      code: "MDD",
      name: "Madar JN Inland Rail Terminal (Ajmer, RJ)",
      lat: 26.4952,
      lng: 74.6853,
    },
    destinationYard: {
      code: "JNPT",
      name: "Jawaharlal Nehru Port Trust Rail Siding (Navi Mumbai, MH)",
      lat: 18.9498,
      lng: 72.9515,
    },
    currentLat: 23.0225,
    currentLng: 72.5714,
    currentStationOrBlock: "Sanand WDFC Grade-Separated Automatic Block 42",
    nextSignalingBlock: "Viramgam South High-Speed Loop Entry",
    currentSpeedKmh: 94.2,
    maxPermissibleSpeedKmh: 100.0,
    totalWagonsCount: 45,
    loadedWagonsCount: 43,
    totalGrossWeightTons: 3820,
    totalTeuCapacity: 90,
    bookedTeuCount: 86,
    departureTimeIso: "2026-08-22T04:30:00.000Z",
    scheduledArrivalIso: "2026-08-22T19:00:00.000Z",
    estimatedArrivalIso: "2026-08-22T18:45:00.000Z",
    delayMinutes: -15, // 15 mins ahead of time
    dfcSlotNumber: "WDFC-SLOT-0822-EXP-04",
    oisFoisSyncStatus: "SYNCHRONIZED",
    driverLocoPilotName: "Birendra Kumar Jha",
    driverLocoPilotPhone: "+91 94140 88219",
    assistantLocoPilotName: "Dharmendra S. Rathore",
    guardName: "K. N. Murthy",
    catenaryVoltageKv: 25.4,
    brakePipePressureKgCm2: 5.0,
    status: "HIGH_SPEED_RUNNING",
    dwellTimeMinutesAtCurrentNode: 0,
    wagons: [
      {
        wagonNumber: "BLCA-2201948-A",
        type: "BLCA_CONTAINER",
        containerId: "MSKU-982104-1",
        containerType: "40FT_HIGH_CUBE",
        tareWeightTons: 19.8,
        payloadWeightTons: 28.5,
        maxGrossWeightTons: 61.0,
        sealNumber: "IN-CUS-889120",
        cargoCategory: "Automotive Transmission Assemblies",
        consignor: "Tata Motors Sanand",
        consignee: "JLR Global Supply Chain EU",
        temperatureCelsius: 24.1,
        shockVibrationG: 0.12,
        status: "LOCKED_LOADED",
      },
      {
        wagonNumber: "BLCB-2201948-B",
        type: "BLCB_CONTAINER",
        containerId: "CMAU-441920-8",
        containerType: "REEFER_COLD_CHAIN",
        tareWeightTons: 18.2,
        payloadWeightTons: 22.4,
        maxGrossWeightTons: 61.0,
        sealNumber: "IN-CUS-991204",
        cargoCategory: "High-Grade Table Grapes & Agri Exports",
        consignor: "Mahagrapes Producer Co-Op Nashik",
        consignee: "Rotterdam EuroPort Fresh",
        temperatureCelsius: 2.2,
        shockVibrationG: 0.08,
        status: "LOCKED_LOADED",
      },
      {
        wagonNumber: "BLCA-2201949-A",
        type: "BLCA_CONTAINER",
        containerId: "HLCU-772910-3",
        containerType: "40FT_HIGH_CUBE",
        tareWeightTons: 19.8,
        payloadWeightTons: 29.1,
        maxGrossWeightTons: 61.0,
        sealNumber: "IN-CUS-554109",
        cargoCategory: "Solar PV Panels & Inverter Hardware",
        consignor: "Adani Solar Mundra Hub",
        consignee: "Maharashtra Green Energy Grid",
        temperatureCelsius: 27.5,
        shockVibrationG: 0.15,
        status: "LOCKED_LOADED",
      },
      {
        wagonNumber: "BLCB-2201949-B",
        type: "BLCB_CONTAINER",
        containerId: "MEDU-330194-6",
        containerType: "20FT_STANDARD",
        tareWeightTons: 18.2,
        payloadWeightTons: 21.0,
        maxGrossWeightTons: 61.0,
        sealNumber: "IN-CUS-119284",
        cargoCategory: "Industrial Dyes & Organic Pigments",
        consignor: "Atul Chemicals Vapi",
        consignee: "Antwerp Chemical Logistics",
        temperatureCelsius: 25.0,
        shockVibrationG: 0.11,
        status: "LOCKED_LOADED",
      },
    ],
  },
  {
    rakeId: "RAKE-EDFC-4401",
    rakeName: "Kalinga Steel & Bulk Heavy Hauler #4401",
    locoNumber: "WAG-12B #60102 (Twin Electric 12,000 HP)",
    locoHorsepower: 12000,
    corridor: "EASTERN_DFC",
    originYard: {
      code: "DGR",
      name: "Durgapur Steel Plant Rail Yard (WB)",
      lat: 23.5204,
      lng: 87.3119,
    },
    destinationYard: {
      code: "DER",
      name: "Dadri Multimodal Logistics Hub (UP)",
      lat: 28.5284,
      lng: 77.5682,
    },
    currentLat: 25.3176,
    currentLng: 82.9739,
    currentStationOrBlock: "Deen Dayal Upadhyaya (DDU) EDFC Bypass Loop",
    nextSignalingBlock: "Chunar High-Capacity Junction 1",
    currentSpeedKmh: 82.0,
    maxPermissibleSpeedKmh: 100.0,
    totalWagonsCount: 58,
    loadedWagonsCount: 58,
    totalGrossWeightTons: 5200,
    totalTeuCapacity: 116,
    bookedTeuCount: 116,
    departureTimeIso: "2026-08-22T02:00:00.000Z",
    scheduledArrivalIso: "2026-08-22T22:30:00.000Z",
    estimatedArrivalIso: "2026-08-22T23:15:00.000Z",
    delayMinutes: 45,
    delayReason: "High-density passenger crossing priority at Mughalsarai feeder block",
    dfcSlotNumber: "EDFC-SLOT-0822-BULK-01",
    oisFoisSyncStatus: "SYNCHRONIZED",
    driverLocoPilotName: "S. K. Ganguly",
    driverLocoPilotPhone: "+91 94330 11928",
    assistantLocoPilotName: "Avinash Mishra",
    guardName: "P. R. Tiwari",
    catenaryVoltageKv: 24.8,
    brakePipePressureKgCm2: 5.0,
    status: "HIGH_SPEED_RUNNING",
    dwellTimeMinutesAtCurrentNode: 0,
    wagons: [
      {
        wagonNumber: "BOXN-991204-A",
        type: "BOXN_BULK",
        tareWeightTons: 22.4,
        payloadWeightTons: 64.2,
        maxGrossWeightTons: 88.0,
        sealNumber: "SAIL-SEAL-8910",
        cargoCategory: "High-Tensile Cold Rolled Coils",
        consignor: "Steel Authority of India Ltd. (SAIL)",
        consignee: "NCR Automotive Stamping Hub Dadri",
        shockVibrationG: 0.18,
        status: "LOCKED_LOADED",
      },
    ],
  },
  {
    rakeId: "RAKE-WDFC-8820",
    rakeName: "Mundra Port Inland Rake Shuttle #8820",
    locoNumber: "WAG-9HC #32810 (CLW Electric 6,000 HP)",
    locoHorsepower: 6000,
    corridor: "WESTERN_DFC",
    originYard: {
      code: "MUNDRA",
      name: "Adani Mundra International Container Terminal (GJ)",
      lat: 22.8395,
      lng: 69.7028,
    },
    destinationYard: {
      code: "TKD",
      name: "Tughlakabad ICD Container Depot, New Delhi",
      lat: 28.5033,
      lng: 77.2922,
    },
    currentLat: 27.553,
    currentLng: 76.6346,
    currentStationOrBlock: "Rewari ICD Transshipment Gantry Yard Bay 3",
    nextSignalingBlock: "Gurgaon South DFC Elevated Viaduct",
    currentSpeedKmh: 0,
    maxPermissibleSpeedKmh: 100.0,
    totalWagonsCount: 45,
    loadedWagonsCount: 40,
    totalGrossWeightTons: 3600,
    totalTeuCapacity: 90,
    bookedTeuCount: 80,
    departureTimeIso: "2026-08-21T20:00:00.000Z",
    scheduledArrivalIso: "2026-08-22T14:00:00.000Z",
    estimatedArrivalIso: "2026-08-22T14:40:00.000Z",
    delayMinutes: 40,
    delayReason: "Gantry crane RMGC container transshipment dwell at Rewari",
    dfcSlotNumber: "WDFC-SLOT-0821-NIGHT-09",
    oisFoisSyncStatus: "SYNCHRONIZED",
    driverLocoPilotName: "Rajender Pal Singh",
    driverLocoPilotPhone: "+91 98120 44019",
    assistantLocoPilotName: "Manoj Kumar",
    guardName: "Suraj Bhan",
    catenaryVoltageKv: 25.1,
    brakePipePressureKgCm2: 5.0,
    status: "YARD_DWELL",
    dwellTimeMinutesAtCurrentNode: 28,
    wagons: [
      {
        wagonNumber: "BLCA-1102938-X",
        type: "BLCA_CONTAINER",
        containerId: "TGHU-882109-0",
        containerType: "40FT_HIGH_CUBE",
        tareWeightTons: 19.8,
        payloadWeightTons: 27.0,
        maxGrossWeightTons: 61.0,
        sealNumber: "CUS-MD-99120",
        cargoCategory: "Electronics, Micro-Controllers & Display Glass",
        consignor: "Foxconn Electronics India",
        consignee: "Noida Electronics Manufacturing Hub",
        temperatureCelsius: 23.8,
        shockVibrationG: 0.05,
        status: "TRANSSHIPMENT_ACTIVE",
      },
    ],
  },
];
