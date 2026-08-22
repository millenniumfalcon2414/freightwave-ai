import { CargoShipment, CargoAlert, UserProfile } from "@/types/cargo-portal";

export const MOCK_USER_PROFILE: UserProfile = {
  id: "USR-TATA-IND-4019",
  name: "Rajeshwar Sengupta",
  company: "Bharat Heavy Engineering & Logistics Ltd.",
  email: "r.sengupta@bhel-logistics.in",
  phone: "+91 98450 19823",
  role: "Cargo Owner / Consignor",
  accountType: "Enterprise Freight Plus",
  gstin: "29AAACB1234F1Z5",
  activeShipmentsCount: 4,
  totalShipments2026: 184,
};

export const MOCK_SHIPMENTS: CargoShipment[] = [
  {
    id: "RAIL-IND-28491",
    consignmentNumber: "RR-CR-2026-994182",
    title: "Industrial Equipment & Precision CNC Machinery",
    customerName: "Bharat Heavy Engineering & Logistics Ltd.",
    customerId: "USR-TATA-IND-4019",
    currentLocationName: "Nagpur Railway Station Yard",
    currentLocationType: "Railway Station",
    lastUpdatedMinutesAgo: 2,
    status: "IN_TRANSIT",
    statusLabel: "In Transit (On Schedule)",
    currentStageIndex: 3, // In Transit

    origin: {
      name: "Bengaluru Whitefield Goods Terminal",
      hub: "Whitefield ICD & Freight Depot",
      city: "Bengaluru",
      state: "Karnataka",
      lat: 12.9698,
      lng: 77.7499,
      bookedDate: "20 Aug 2026, 09:30 AM",
      dispatchedDate: "20 Aug 2026, 05:45 PM",
    },
    destination: {
      name: "Tughlakabad ICD Terminal & Inland Port",
      hub: "Container Corporation of India (CONCOR) ICD",
      city: "New Delhi",
      state: "Delhi NCR",
      lat: 28.5085,
      lng: 77.2912,
      expectedDate: "24 August 2026",
      expectedTime: "6:30 PM",
    },

    currentGps: {
      lat: 21.1458,
      lng: 79.0882,
      headingDeg: 350,
    },

    // Realistic rail route from Bengaluru -> Hubballi -> Solapur -> Nagpur -> Bhopal -> Jhansi -> Agra -> New Delhi
    railRouteCoords: [
      [12.9698, 77.7499], // Bengaluru Whitefield
      [13.3409, 77.101], // Tumakuru
      [14.4644, 75.9218], // Davanagere
      [15.3647, 75.124], // Hubballi
      [17.6599, 75.9064], // Solapur
      [19.8762, 75.3433], // Aurangabad
      [21.1458, 79.0882], // Nagpur (CURRENT)
      [22.7533, 77.7289], // Itarsi Junction
      [23.2599, 77.4126], // Bhopal
      [24.8797, 78.4354], // Lalitpur
      [25.4484, 78.5685], // Jhansi Junction
      [26.2183, 78.1828], // Gwalior
      [27.1767, 78.0081], // Agra Cantt
      [27.4924, 77.6737], // Mathura
      [28.5085, 77.2912], // New Delhi Tughlakabad ICD
    ],

    roadDrayageCoords: [
      [28.5085, 77.2912], // Tughlakabad ICD
      [28.5355, 77.271], // Okhla Industrial Area Phase-III
      [28.5512, 77.2625], // Consignee Warehouse
    ],

    intermediateWaypoints: [
      {
        name: "Bengaluru Whitefield ICD",
        code: "WFD",
        type: "station",
        lat: 12.9698,
        lng: 77.7499,
        description: "Origin Loading Yard",
      },
      {
        name: "Hubballi Junction",
        code: "UBL",
        type: "station",
        lat: 15.3647,
        lng: 75.124,
        description: "Crew & Inspection Halt",
      },
      {
        name: "Solapur Goods Yard",
        code: "SUR",
        type: "station",
        lat: 17.6599,
        lng: 75.9064,
        description: "Central Railway Handover",
      },
      {
        name: "Nagpur Railway Station",
        code: "NGP",
        type: "current_gps",
        lat: 21.1458,
        lng: 79.0882,
        description: "Current Position (Moving 58 km/h)",
      },
      {
        name: "Nagpur Multimodal Logistics Park",
        code: "NMLP",
        type: "road_office",
        lat: 21.082,
        lng: 79.041,
        description: "Road Drayage Transport Office",
      },
      {
        name: "Itarsi Junction",
        code: "ET",
        type: "station",
        lat: 22.7533,
        lng: 77.7289,
        description: "Upcoming Technical Halt",
      },
      {
        name: "Bhopal Junction",
        code: "BPL",
        type: "station",
        lat: 23.2599,
        lng: 77.4126,
        description: "West Central Railway Depot",
      },
      {
        name: "Jhansi Junction",
        code: "VGLJ",
        type: "station",
        lat: 25.4484,
        lng: 78.5685,
        description: "North Central Division Halt",
      },
      {
        name: "Agra Road Logistics Hub",
        code: "AGR-HUB",
        type: "road_office",
        lat: 27.15,
        lng: 78.03,
        description: "Northern Highway Transport Hub",
      },
      {
        name: "Tughlakabad ICD & Freight Terminal",
        code: "TKD",
        type: "icd_hub",
        lat: 28.5085,
        lng: 77.2912,
        description: "Destination Rail Head",
      },
    ],

    estimatedDeliveryDate: "24 August 2026",
    estimatedDeliveryTime: "6:30 PM",
    remainingDistanceKm: 742,
    estimatedTravelTime: "~11 hours 20 minutes",
    currentSpeedKmh: 58,
    isDelayed: false,
    delayMinutes: 0,

    cargoType: "Industrial Heavy Equipment",
    cargoDescription: "High-Precision CNC Machine Tooling & Servo Drives",
    declaredValueInr: "₹2,45,00,000 (₹2.45 Cr)",
    weightTons: 28.4,
    packagesCount: 120,
    packageType: "Export Pallets & 4 High-Cube Containers",

    train: {
      trainNumber: "12645",
      trainName: "Freight Express / DFC Fast Freight Rake",
      locomotiveType: "WAG-12B Twin Heavy Electric (12,000 HP)",
      locomotiveId: "WAG12B-60042",
      currentSpeedKmh: 58,
      currentStation: "Nagpur Railway Station Yard (Km 648)",
      nextStation: "Bhopal Junction (Km 912)",
      lastStationPassed: "Solapur Junction (Km 420)",
      totalWagons: 45,
      wagonNumber: "BOXN-45821",
      wagonType: "BOXN (High-Sided Heavy Bogie)",
      trainStatus: "Running on Schedule",
      locoPilotName: "S. K. Sharma (Chief Loco Pilot) / A. K. Verma",
      operatingDivision: "Central Railway (Nagpur Division)",
      corridorName: "North-South Dedicated Heavy Freight Spine",
      trackSection: "Automatic Block Signalling (ABS Section 4)",
    },

    roadDrayageTruck: {
      vehicleNumber: "DL-01-EA-9912",
      driverName: "Ramchandra Yadav",
      driverPhone: "+91 98102 34112",
      transporterName: "Northern Express Drayage Fleet",
    },

    timeline: [
      {
        id: "tl-1",
        title: "Cargo Booked & E-Way Bill Generated",
        location: "Bengaluru Whitefield Hub",
        timestamp: "20 Aug 2026, 09:30 AM",
        status: "COMPLETED",
        description:
          "Consignment note e-RR #RR-CR-2026-994182 issued. Customs & Railway security scan cleared.",
        mode: "warehouse",
        tag: "Verified",
      },
      {
        id: "tl-2",
        title: "Cargo Loaded onto Wagon BOXN-45821",
        location: "Bengaluru Freight Yard",
        timestamp: "20 Aug 2026, 02:15 PM",
        status: "COMPLETED",
        description:
          "120 pallets mechanically locked with pneumatic dunnage. Electronic seal #SL-9941 engaged.",
        mode: "yard",
        tag: "28.4 Tons",
      },
      {
        id: "tl-3",
        title: "Train Departed — Bengaluru Terminal",
        location: "Bengaluru South Yard",
        timestamp: "20 Aug 2026, 05:45 PM",
        status: "COMPLETED",
        description:
          "Freight Express 12645 flagged off on green signal. On-time departure recorded.",
        mode: "rail",
        speedKmh: 62,
        tag: "On-Time",
      },
      {
        id: "tl-4",
        title: "Arrived & Inspected — Hubballi Junction",
        location: "Hubballi Division Yard",
        timestamp: "21 Aug 2026, 01:20 AM",
        status: "COMPLETED",
        description:
          "Brake power certificate (BPC) validated 98%. IoT sensor telemetry synced via NavIC.",
        mode: "rail",
        tag: "Passed",
      },
      {
        id: "tl-5",
        title: "Departed — Hubballi Junction",
        location: "Hubballi Junction",
        timestamp: "21 Aug 2026, 02:00 AM",
        status: "COMPLETED",
        description: "Smooth transit via Hubballi-Solapur broad gauge double track.",
        mode: "rail",
        speedKmh: 68,
      },
      {
        id: "tl-6",
        title: "Currently at — Nagpur Railway Station",
        location: "Nagpur Central Yard (Km 648)",
        timestamp: "22 Aug 2026, 07:15 AM",
        status: "ACTIVE",
        description:
          "Locomotive traction healthy (12,000 HP). Train moving steadily at 58 km/h on clear block.",
        mode: "rail",
        speedKmh: 58,
        tag: "Live Position",
      },
      {
        id: "tl-7",
        title: "Next Stop — Bhopal Junction",
        location: "Bhopal Junction",
        timestamp: "Est. 22 Aug 2026, 02:30 PM",
        status: "UPCOMING",
        description: "Scheduled crew interchange and rapid axle-box temperature sensor check.",
        mode: "rail",
      },
      {
        id: "tl-8",
        title: "Destination Arrival — Tughlakabad ICD",
        location: "New Delhi ICD Yard",
        timestamp: "Est. 23 Aug 2026, 08:00 AM",
        status: "UPCOMING",
        description:
          "Unloading into bonded container dock. Cross-docking to road drayage trailer DL-01-EA-9912.",
        mode: "yard",
      },
      {
        id: "tl-9",
        title: "Out for Delivery — Last-Mile Road Drayage",
        location: "Delhi-NCR Expressway",
        timestamp: "Est. 23 Aug 2026, 02:30 PM",
        status: "UPCOMING",
        description: "Hydraulic heavy trailer transport with GPS live link.",
        mode: "road",
      },
      {
        id: "tl-10",
        title: "Final Delivery — Consignee Warehouse",
        location: "Okhla Industrial Area, New Delhi",
        timestamp: "Est. 24 Aug 2026, 06:30 PM",
        status: "UPCOMING",
        description: "Electronic Proof of Delivery (e-POD) sign-off and final gate pass clearance.",
        mode: "warehouse",
      },
    ],

    condition: {
      temperatureC: 24.2,
      temperatureTargetC: 22.0,
      temperatureStatus: "Normal",
      humidityPct: 52,
      humidityStatus: "Normal",
      vibrationG: 0.18,
      vibrationStatus: "Normal",
      doorLocked: true,
      eSealId: "SL-9941-SECURE",
      doorStatus: "Secure & Locked",
      gpsSignal: "Connected",
      gpsConstellation: "NavIC (ISRO) + GPS L1/L5 Dual Band",
      batteryPct: 86,
      batteryLifeRemaining: "~18 Days Active",
      tiltDegrees: 1.2,
      lastSyncTime: "2 minutes ago (Real-time telemetry stream)",
    },

    documents: [
      {
        id: "DOC-RR-28491",
        title: "Electronic Railway Receipt (e-RR)",
        docNumber: "RR-CR-2026-994182",
        category: "e-RR (Railway Receipt)",
        issuedDate: "20 Aug 2026",
        fileSize: "1.4 MB",
        verified: true,
      },
      {
        id: "DOC-CN-28491",
        title: "Multimodal Consignment Note",
        docNumber: "CN-BHEL-DEL-28491",
        category: "Consignment Note",
        issuedDate: "20 Aug 2026",
        fileSize: "840 KB",
        verified: true,
      },
      {
        id: "DOC-INV-28491",
        title: "Freight Tax Invoice & GST Breakdown",
        docNumber: "INV-RF-2026-08812",
        category: "Tax Invoice",
        issuedDate: "20 Aug 2026",
        fileSize: "620 KB",
        verified: true,
      },
      {
        id: "DOC-CHL-28491",
        title: "Advance Delivery Challan & Gate Pass",
        docNumber: "CHL-TKD-2026-5510",
        category: "Delivery Challan",
        issuedDate: "21 Aug 2026",
        fileSize: "490 KB",
        verified: true,
      },
      {
        id: "DOC-INSP-28491",
        title: "FOIS Safety & Weight Certification",
        docNumber: "INSP-BLR-09941",
        category: "Inspection Certificate",
        issuedDate: "20 Aug 2026",
        fileSize: "1.1 MB",
        verified: true,
      },
    ],
  },

  // 2. Second Shipment: Mumbai JNPT to Dadri ICD (In Transit, On Schedule)
  {
    id: "RAIL-IND-55912",
    consignmentNumber: "RR-WR-2026-441209",
    title: "Containerised Solar PV Modules & Inverters",
    customerName: "Bharat Heavy Engineering & Logistics Ltd.",
    customerId: "USR-TATA-IND-4019",
    currentLocationName: "Kota Junction Yard (WDFC Corridor)",
    currentLocationType: "Railway Station",
    lastUpdatedMinutesAgo: 5,
    status: "IN_TRANSIT",
    statusLabel: "In Transit (WDFC Express)",
    currentStageIndex: 3,

    origin: {
      name: "JNPT Port Container Terminal",
      hub: "Navi Mumbai Marine Freight Dock",
      city: "Mumbai",
      state: "Maharashtra",
      lat: 18.9482,
      lng: 72.9514,
      bookedDate: "21 Aug 2026, 11:00 AM",
      dispatchedDate: "21 Aug 2026, 07:30 PM",
    },
    destination: {
      name: "Dadri Multimodal Freight ICD",
      hub: "Western DFC Dadri Intermodal Terminus",
      city: "Greater Noida",
      state: "Uttar Pradesh",
      lat: 28.552,
      lng: 77.554,
      expectedDate: "23 August 2026",
      expectedTime: "11:45 AM",
    },

    currentGps: {
      lat: 25.18,
      lng: 75.83,
      headingDeg: 20,
    },

    railRouteCoords: [
      [18.9482, 72.9514], // JNPT
      [19.2183, 73.0867], // Kalyan
      [20.9042, 74.7749], // Dhule
      [22.3072, 73.1812], // Vadodara
      [23.0225, 72.5714], // Ahmedabad
      [25.18, 75.83], // Kota (CURRENT)
      [26.9124, 75.7873], // Jaipur
      [28.1928, 76.6189], // Rewari
      [28.552, 77.554], // Dadri ICD
    ],

    intermediateWaypoints: [
      { name: "JNPT Port Terminal", code: "JNPT", type: "port", lat: 18.9482, lng: 72.9514 },
      { name: "Vadodara DFC Hub", code: "BRC", type: "station", lat: 22.3072, lng: 73.1812 },
      { name: "Kota Junction", code: "KOTA", type: "current_gps", lat: 25.18, lng: 75.83 },
      { name: "Rewari ICD Hub", code: "RE", type: "station", lat: 28.1928, lng: 76.6189 },
      { name: "Dadri DFC Terminal", code: "DER", type: "icd_hub", lat: 28.552, lng: 77.554 },
    ],

    estimatedDeliveryDate: "23 August 2026",
    estimatedDeliveryTime: "11:45 AM",
    remainingDistanceKm: 460,
    estimatedTravelTime: "~6 hours 45 minutes",
    currentSpeedKmh: 75,
    isDelayed: false,
    delayMinutes: 0,

    cargoType: "Clean Energy Equipment",
    cargoDescription: "High-Efficiency Bifacial Solar Modules & Heavy String Inverters",
    declaredValueInr: "₹4,10,00,000 (₹4.10 Cr)",
    weightTons: 42.0,
    packagesCount: 240,
    packageType: "8 x 40ft High Cube Containers",

    train: {
      trainNumber: "WDFC-7704",
      trainName: "Western DFC Double-Stack High-Speed Freight",
      locomotiveType: "WAG-12B Twin Electric",
      locomotiveId: "WAG12B-60098",
      currentSpeedKmh: 75,
      currentStation: "Kota Junction Yard",
      nextStation: "Sawai Madhopur",
      lastStationPassed: "Ratlam Junction",
      totalWagons: 90,
      wagonNumber: "BLCA-88910",
      wagonType: "BLCA (Low-Bed Intermodal Flat)",
      trainStatus: "Running on Schedule",
      locoPilotName: "Dharmendra Rawat / V. P. Joshi",
      operatingDivision: "Western Railway (Kota Division)",
      corridorName: "Western Dedicated Freight Corridor (WDFC)",
      trackSection: "Automatic Cab Signalling (ETCS Level-2)",
    },

    timeline: [
      {
        id: "tl-201",
        title: "Customs Clearance & Rail Gate-In",
        location: "JNPT Port Container Dock",
        timestamp: "21 Aug 2026, 11:00 AM",
        status: "COMPLETED",
        description: "Consignment e-RR generated and container loaded on double-stack rake.",
        mode: "port",
      },
      {
        id: "tl-202",
        title: "Departed JNPT Intermodal Yard",
        location: "Navi Mumbai Yard",
        timestamp: "21 Aug 2026, 07:30 PM",
        status: "COMPLETED",
        description: "Rake departed on Western DFC priority green corridor.",
        mode: "rail",
        speedKmh: 72,
      },
      {
        id: "tl-203",
        title: "Passed Vadodara Freight Junction",
        location: "Vadodara DFC Bypass",
        timestamp: "22 Aug 2026, 02:40 AM",
        status: "COMPLETED",
        description: "Automated RFID & wheel acoustic diagnostics normal.",
        mode: "rail",
        speedKmh: 78,
      },
      {
        id: "tl-204",
        title: "Currently Moving past Kota Junction",
        location: "Kota DFC Section (Km 510)",
        timestamp: "22 Aug 2026, 07:45 AM",
        status: "ACTIVE",
        description: "Cruising at 75 km/h. On-schedule for early arrival at Dadri.",
        mode: "rail",
        speedKmh: 75,
        tag: "Live Position",
      },
      {
        id: "tl-205",
        title: "Scheduled Arrival — Dadri ICD",
        location: "Dadri Multimodal Terminal",
        timestamp: "Est. 23 Aug 2026, 11:45 AM",
        status: "UPCOMING",
        description: "Direct gantry discharge into consignee road transport bay.",
        mode: "yard",
      },
    ],

    condition: {
      temperatureC: 26.5,
      temperatureTargetC: 25.0,
      temperatureStatus: "Normal",
      humidityPct: 45,
      humidityStatus: "Normal",
      vibrationG: 0.12,
      vibrationStatus: "Normal",
      doorLocked: true,
      eSealId: "SL-SOLAR-8891",
      doorStatus: "Secure & Locked",
      gpsSignal: "Connected",
      gpsConstellation: "NavIC + GLONASS Hybrid",
      batteryPct: 92,
      batteryLifeRemaining: "~24 Days Active",
      tiltDegrees: 0.8,
      lastSyncTime: "5 minutes ago",
    },

    documents: [
      {
        id: "DOC-RR-55912",
        title: "Electronic Railway Receipt (e-RR)",
        docNumber: "RR-WR-2026-441209",
        category: "e-RR (Railway Receipt)",
        issuedDate: "21 Aug 2026",
        fileSize: "1.2 MB",
        verified: true,
      },
      {
        id: "DOC-INV-55912",
        title: "Solar Export Freight Invoice",
        docNumber: "INV-RF-2026-10291",
        category: "Tax Invoice",
        issuedDate: "21 Aug 2026",
        fileSize: "780 KB",
        verified: true,
      },
    ],
  },

  // 3. Third Shipment: Kolkata to Chennai (DELIVERED ✓)
  {
    id: "RAIL-IND-88231",
    consignmentNumber: "RR-ER-2026-778901",
    title: "Structural Alloy Steel Coils & Heavy Plates",
    customerName: "Bharat Heavy Engineering & Logistics Ltd.",
    customerId: "USR-TATA-IND-4019",
    currentLocationName: "Chennai Port Container Terminal (Delivered)",
    currentLocationType: "Consignee Hub",
    lastUpdatedMinutesAgo: 120,
    status: "DELIVERED",
    statusLabel: "Delivered ✓",
    currentStageIndex: 6, // 100% Complete / Delivered

    origin: {
      name: "Kolkata Shalimar Freight Yard",
      hub: "Eastern Railway Heavy Goods Shed",
      city: "Kolkata",
      state: "West Bengal",
      lat: 22.5532,
      lng: 88.3248,
      bookedDate: "17 Aug 2026, 08:00 AM",
      dispatchedDate: "17 Aug 2026, 04:00 PM",
    },
    destination: {
      name: "Chennai Port Industrial Siding & Dock #04",
      hub: "Southern Port Logistic Yard",
      city: "Chennai",
      state: "Tamil Nadu",
      lat: 13.0827,
      lng: 80.2707,
      expectedDate: "21 August 2026",
      expectedTime: "04:30 PM",
    },

    currentGps: {
      lat: 13.0827,
      lng: 80.2707,
      headingDeg: 180,
    },

    railRouteCoords: [
      [22.5532, 88.3248], // Kolkata
      [21.4934, 86.9135], // Balasore
      [20.2961, 85.8245], // Bhubaneswar
      [17.6868, 83.2185], // Visakhapatnam
      [16.5062, 80.648], // Vijayawada
      [13.0827, 80.2707], // Chennai
    ],

    intermediateWaypoints: [
      { name: "Kolkata Shalimar Yard", code: "SHM", type: "yard", lat: 22.5532, lng: 88.3248 },
      { name: "Bhubaneswar Yard", code: "BBS", type: "station", lat: 20.2961, lng: 85.8245 },
      { name: "Visakhapatnam Port Siding", code: "VSKP", type: "port", lat: 17.6868, lng: 83.2185 },
      { name: "Vijayawada Junction", code: "BZA", type: "station", lat: 16.5062, lng: 80.648 },
      { name: "Chennai Port Siding", code: "MAS-PORT", type: "port", lat: 13.0827, lng: 80.2707 },
    ],

    estimatedDeliveryDate: "21 August 2026 (Completed)",
    estimatedDeliveryTime: "04:15 PM (15m Early)",
    remainingDistanceKm: 0,
    estimatedTravelTime: "Delivered",
    currentSpeedKmh: 0,
    isDelayed: false,
    delayMinutes: 0,

    cargoType: "Heavy Structural Steel",
    cargoDescription: "Cold-Rolled Automotive Alloy Steel Coils",
    declaredValueInr: "₹6,80,00,000 (₹6.80 Cr)",
    weightTons: 84.5,
    packagesCount: 18,
    packageType: "Specialized Cradle-Secured Coils",

    train: {
      trainNumber: "STEEL-EX-9921",
      trainName: "East Coast Heavy Steel Express",
      locomotiveType: "WAG-9 Heavy 3-Phase Electric",
      locomotiveId: "WAG9-31102",
      currentSpeedKmh: 0,
      currentStation: "Chennai Port Siding (Delivered)",
      nextStation: "Journey Complete",
      lastStationPassed: "Vijayawada Junction",
      totalWagons: 32,
      wagonNumber: "BOST-22941",
      wagonType: "BOST (Open Steel Carrier)",
      trainStatus: "Early by 15m",
      locoPilotName: "B. K. Panda / N. C. Murthy",
      operatingDivision: "Southern Railway (Chennai Division)",
      corridorName: "East Coast Heavy Freight Corridor",
      trackSection: "Terminal Siding Complete",
    },

    timeline: [
      {
        id: "tl-301",
        title: "Cargo Booked & Loaded",
        location: "Kolkata Shalimar Goods Yard",
        timestamp: "17 Aug 2026, 08:00 AM",
        status: "COMPLETED",
        description: "Coils secured with heavy-duty tension chains & ultrasonic inspection done.",
        mode: "yard",
      },
      {
        id: "tl-302",
        title: "Departed Kolkata Shalimar",
        location: "Eastern Railway Mainline",
        timestamp: "17 Aug 2026, 04:00 PM",
        status: "COMPLETED",
        description: "Flagged off on time.",
        mode: "rail",
      },
      {
        id: "tl-303",
        title: "Crossed Visakhapatnam Port Yard",
        location: "Visakhapatnam",
        timestamp: "19 Aug 2026, 06:15 AM",
        status: "COMPLETED",
        description: "Midway axle and load balance inspection passed 100%.",
        mode: "rail",
      },
      {
        id: "tl-304",
        title: "Arrived at Chennai Port Siding",
        location: "Chennai Port Terminal Siding #04",
        timestamp: "21 Aug 2026, 03:30 PM",
        status: "COMPLETED",
        description: "Rake spotted onto gantry crane track for automated discharge.",
        mode: "yard",
      },
      {
        id: "tl-305",
        title: "Cargo Delivered & Received ✓",
        location: "Consignee Warehouse Dock, Chennai Port",
        timestamp: "21 Aug 2026, 04:15 PM",
        status: "COMPLETED",
        description:
          "Consignee acknowledged full 84.5 Tons in pristine condition with e-POD signature.",
        mode: "warehouse",
        tag: "Delivered",
      },
    ],

    condition: {
      temperatureC: 28.1,
      temperatureTargetC: 28.0,
      temperatureStatus: "Normal",
      humidityPct: 58,
      humidityStatus: "Normal",
      vibrationG: 0.0,
      vibrationStatus: "Normal",
      doorLocked: true,
      eSealId: "SL-STEEL-CH-8823",
      doorStatus: "Secure & Locked",
      gpsSignal: "Connected",
      gpsConstellation: "NavIC Ground Station",
      batteryPct: 78,
      batteryLifeRemaining: "~14 Days",
      tiltDegrees: 0.0,
      lastSyncTime: "Delivered (Terminal Sync Closed)",
    },

    documents: [
      {
        id: "DOC-RR-88231",
        title: "Completed Electronic Railway Receipt (e-RR)",
        docNumber: "RR-ER-2026-778901",
        category: "e-RR (Railway Receipt)",
        issuedDate: "17 Aug 2026",
        fileSize: "1.5 MB",
        verified: true,
      },
      {
        id: "DOC-EPOD-88231",
        title: "Electronic Proof of Delivery (e-POD)",
        docNumber: "EPOD-CHN-2026-99120",
        category: "Delivery Challan",
        issuedDate: "21 Aug 2026",
        fileSize: "1.8 MB",
        verified: true,
      },
    ],

    deliveryProof: {
      deliveredAt: "21 August 2026 at 04:15 PM IST",
      destinationAddress: "Chennai Port Industrial Siding #04, Rajaji Salai, Chennai, TN 600001",
      receiverName: "K. Subramanian",
      receiverDesignation: "Chief Materials Officer, Hyundai Steel Logistics Chennai",
      receiverPhone: "+91 94440 18290",
      digitalSignatureUrl: "https://api.railflow.ai/signatures/sign-88231.png",
      ePodNumber: "EPOD-CHN-2026-99120",
      sealIntactVerified: true,
      gatePassCleared: true,
      totalPackagesReceived: 18,
    },
  },

  // 4. Fourth Shipment: Ludhiana to Nagpur (Delayed by 20m)
  {
    id: "RAIL-IND-73920",
    consignmentNumber: "RR-NR-2026-339102",
    title: "Precision Textile Weaving Looms & Cotton Yarn",
    customerName: "Bharat Heavy Engineering & Logistics Ltd.",
    customerId: "USR-TATA-IND-4019",
    currentLocationName: "Jhansi Outer Siding (Caution Restricted)",
    currentLocationType: "Railway Station",
    lastUpdatedMinutesAgo: 1,
    status: "DELAYED",
    statusLabel: "Delayed by 20m (Monsoon Speed Caution)",
    currentStageIndex: 3,

    origin: {
      name: "Ludhiana DFC Freight Terminal",
      hub: "Northern Inland Container Depot",
      city: "Ludhiana",
      state: "Punjab",
      lat: 30.901,
      lng: 75.8573,
      bookedDate: "21 Aug 2026, 06:00 AM",
      dispatchedDate: "21 Aug 2026, 01:00 PM",
    },
    destination: {
      name: "Nagpur Multi-Modal Logistics Hub",
      hub: "MIHAN SEZ Container Depot",
      city: "Nagpur",
      state: "Maharashtra",
      lat: 21.082,
      lng: 79.041,
      expectedDate: "23 August 2026",
      expectedTime: "08:15 PM (Revised)",
    },

    currentGps: {
      lat: 25.4484,
      lng: 78.5685,
      headingDeg: 175,
    },

    railRouteCoords: [
      [30.901, 75.8573], // Ludhiana
      [28.7041, 77.1025], // Delhi
      [27.1767, 78.0081], // Agra
      [25.4484, 78.5685], // Jhansi (CURRENT)
      [23.2599, 77.4126], // Bhopal
      [21.082, 79.041], // Nagpur
    ],

    intermediateWaypoints: [
      { name: "Ludhiana DFC Hub", code: "LDH", type: "icd_hub", lat: 30.901, lng: 75.8573 },
      { name: "Delhi Tughlakabad", code: "TKD", type: "station", lat: 28.7041, lng: 77.1025 },
      {
        name: "Jhansi Outer Siding",
        code: "VGLJ",
        type: "current_gps",
        lat: 25.4484,
        lng: 78.5685,
      },
      { name: "Bhopal Junction", code: "BPL", type: "station", lat: 23.2599, lng: 77.4126 },
      { name: "Nagpur MIHAN SEZ Hub", code: "MIHAN", type: "icd_hub", lat: 21.082, lng: 79.041 },
    ],

    estimatedDeliveryDate: "23 August 2026",
    estimatedDeliveryTime: "08:15 PM",
    remainingDistanceKm: 610,
    estimatedTravelTime: "~9 hours 40 minutes",
    currentSpeedKmh: 42,
    isDelayed: true,
    delayMinutes: 20,
    delayReason: "Precautionary Monsoon 45 km/h speed restriction on Betwa River Bridge sector.",

    cargoType: "Textile Machinery & Yarn",
    cargoDescription: "Automated Air-Jet Looms & High-Grade Combed Cotton Yarn",
    declaredValueInr: "₹1,95,00,000 (₹1.95 Cr)",
    weightTons: 19.8,
    packagesCount: 88,
    packageType: "Palletized Wooden Crates",

    train: {
      trainNumber: "DFC-NORTH-551",
      trainName: "Punjab-Deccan Express Rake",
      locomotiveType: "WAG-12B Electric",
      locomotiveId: "WAG12B-60031",
      currentSpeedKmh: 42,
      currentStation: "Jhansi Outer Siding",
      nextStation: "Lalitpur Junction",
      lastStationPassed: "Gwalior Yard",
      totalWagons: 42,
      wagonNumber: "BCNHL-99120",
      wagonType: "BCNHL (Covered Water-Tight Bogie)",
      trainStatus: "Delayed by 20m",
      locoPilotName: "Harpreet Singh / Ankit Mishra",
      operatingDivision: "North Central Railway (Jhansi Division)",
      corridorName: "Northern DFC Feeder Line",
      trackSection: "Speed Restriction Sector 12",
    },

    timeline: [
      {
        id: "tl-401",
        title: "Cargo Booked & Loaded",
        location: "Ludhiana DFC Terminal",
        timestamp: "21 Aug 2026, 06:00 AM",
        status: "COMPLETED",
        description: "Customs and railway loading completed.",
        mode: "yard",
      },
      {
        id: "tl-402",
        title: "Departed Ludhiana DFC",
        location: "Ludhiana Goods Yard",
        timestamp: "21 Aug 2026, 01:00 PM",
        status: "COMPLETED",
        description: "Train departed on time.",
        mode: "rail",
      },
      {
        id: "tl-403",
        title: "Speed Restriction Notice Applied (+20m)",
        location: "Jhansi Division Control",
        timestamp: "22 Aug 2026, 06:30 AM",
        status: "COMPLETED",
        description: "Railway safety order enforced 45 km/h limit on bridge sector.",
        mode: "rail",
        tag: "Speed Caution",
      },
      {
        id: "tl-404",
        title: "Currently Moving at 42 km/h",
        location: "Jhansi Outer Track",
        timestamp: "22 Aug 2026, 07:30 AM",
        status: "ACTIVE",
        description: "Navigating caution section safely. Clear track ahead past Lalitpur.",
        mode: "rail",
        speedKmh: 42,
        tag: "Live Position",
      },
    ],

    condition: {
      temperatureC: 23.8,
      temperatureTargetC: 22.0,
      temperatureStatus: "Normal",
      humidityPct: 54,
      humidityStatus: "Normal",
      vibrationG: 0.15,
      vibrationStatus: "Normal",
      doorLocked: true,
      eSealId: "SL-TEX-9912",
      doorStatus: "Secure & Locked",
      gpsSignal: "Connected",
      gpsConstellation: "NavIC (ISRO)",
      batteryPct: 88,
      batteryLifeRemaining: "~20 Days",
      tiltDegrees: 0.9,
      lastSyncTime: "1 minute ago",
    },

    documents: [
      {
        id: "DOC-RR-73920",
        title: "Electronic Railway Receipt",
        docNumber: "RR-NR-2026-339102",
        category: "e-RR (Railway Receipt)",
        issuedDate: "21 Aug 2026",
        fileSize: "1.1 MB",
        verified: true,
      },
    ],
  },
];

export const MOCK_ALERTS: CargoAlert[] = [
  {
    id: "ALT-001",
    shipmentId: "RAIL-IND-28491",
    type: "DEPARTURE",
    severity: "success",
    title: "Cargo Departed Hubballi on Schedule",
    message:
      "Train 12645 departed Hubballi Junction at 02:00 AM. Next major tracking waypoint: Nagpur Yard.",
    timestamp: "5 hours ago",
    read: false,
  },
  {
    id: "ALT-002",
    shipmentId: "RAIL-IND-28491",
    type: "ON_SCHEDULE",
    severity: "info",
    title: "Train Running on Schedule (58 km/h)",
    message: "Automated block signalling confirms clear green track between Nagpur and Itarsi.",
    timestamp: "12 minutes ago",
    read: false,
  },
  {
    id: "ALT-003",
    shipmentId: "RAIL-IND-73920",
    type: "DELAY",
    severity: "warning",
    title: "Expected Arrival Updated by +20 minutes",
    message:
      "Precautionary monsoon speed restriction (45 km/h) active on Betwa River Bridge sector.",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: "ALT-004",
    shipmentId: "RAIL-IND-88231",
    type: "DELIVERED",
    severity: "success",
    title: "Cargo Delivered at Chennai Port ✓",
    message:
      "All 18 steel coil packages received by K. Subramanian. Electronic Proof of Delivery signed.",
    timestamp: "Yesterday",
    read: true,
  },
  {
    id: "ALT-005",
    shipmentId: "RAIL-IND-28491",
    type: "SENSOR",
    severity: "info",
    title: "IoT Health Optimal (Temp 24.2°C, E-Seal Locked)",
    message: "Wagon BOXN-45821 reported 100% telemetry integrity via ISRO NavIC satellite link.",
    timestamp: "2 minutes ago",
    read: true,
  },
];
