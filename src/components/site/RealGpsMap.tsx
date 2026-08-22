import React, { useEffect, useRef, useState } from "react";
import type * as LeafletType from "leaflet";
import {
  Satellite,
  MapPin,
  Compass,
  Radio,
  Navigation,
  Layers,
  Zap,
  Info,
  CheckCircle2,
  Crosshair,
  Maximize2,
  Minimize2,
  Shield,
  Activity,
  Search,
  Eye,
  Train,
  Truck,
  Anchor,
  Clock,
  Sparkles,
  Sliders,
  ChevronRight,
  ExternalLink,
  Ambulance,
  AlertOctagon,
  Building2,
  PhoneCall,
  Package,
  ShieldCheck,
  Play,
  Pause,
  FastForward,
  RotateCw,
  Gauge,
  User,
  Thermometer,
} from "lucide-react";
import { useActiveIncident } from "@/lib/emergency/useEmergency";
import { EmergencyCallModal, EmergencyCallTarget } from "@/components/emergency/EmergencyCallModal";

export type LocationType =
  | "rail_hub"
  | "port"
  | "icd"
  | "active_vehicle"
  | "user"
  | "road_toll"
  | "road_hub"
  | "rail_yard"
  | "rail_signal"
  | "road_ev";

export interface GpsLocation {
  id: string;
  name: string;
  type: LocationType;
  lat: number;
  lng: number;
  altitudeM: number;
  speedKmh?: number;
  headingDeg?: number;
  mode?: "rail" | "road" | "sea" | "intermodal";
  status: string;
  driverInfo?: {
    name: string;
    contact: string;
    vigilanceScorePct: number;
    bloodGroup: string;
    shiftHoursRemaining: number;
  };
  satelliteFix: {
    constellation: "NavIC + GPS L5" | "GPS L1/L2" | "Multi-GNSS (RTK)";
    satellitesVisible: number;
    satellitesUsed: number;
    hdop: number;
    vdop: number;
    carrierNoiseDbHz: number;
    correctionSource: "IRNSS NavIC S-band" | "GAGAN SBAS" | "RTK DGPS Base";
  };
  cargoDetails?: {
    containerId: string;
    origin: string;
    destination: string;
    commodity: string;
    weightTons: number;
    tempC?: number;
  };
  routePath?: [number, number][];
}

// 1. Defined Routes for Smooth Swiggy/Ola Style Polyline Interpolation
const WDFC_ROUTE_PATH: [number, number][] = [
  [28.5284, 77.5682], // Dadri ICD (Origin)
  [28.1983, 76.6189], // Rewari Junction
  [27.553, 76.6346], // Alwar
  [26.9124, 75.7873], // Phulera / Jaipur
  [25.3407, 74.6313], // Bhilwara
  [24.5854, 73.7125], // Udaipur
  [23.0225, 72.5714], // Ahmedabad
  [22.3072, 73.1812], // Vadodara
  [21.1702, 72.8311], // Surat
  [19.076, 73.005], // Navi Mumbai Freight Expressway
  [18.9498, 72.9515], // JNPT Nhava Sheva (Destination)
];

const EDFC_ROUTE_PATH: [number, number][] = [
  [30.901, 75.8573], // Ludhiana ICD (Origin)
  [29.9695, 76.8783], // Kurukshetra
  [28.7041, 77.1025], // Khurja Interchange
  [27.1767, 78.0081], // Agra Freight Bypass
  [26.4499, 80.3319], // Kanpur Central Yard
  [25.3176, 82.9739], // Varanasi / Pt. Deen Dayal Upadhyaya Junction
  [24.7914, 85.0002], // Gaya / Sasaram
  [23.7957, 86.4304], // Dhanbad Coal Line
  [22.6853, 88.2917], // Dankuni Kolkata Terminal (Destination)
];

const ROAD_EXPRESSWAY_PATH_MH: [number, number][] = [
  [19.2968, 73.0631], // Bhiwandi Warehousing Hub
  [19.1983, 73.0336], // Thane Freight Corridor
  [19.076, 73.005], // Navi Mumbai Expressway
  [18.989, 73.117], // Panvel Toll Plaza
  [18.9498, 72.9515], // Nhava Sheva CFS Terminal
];

const ROAD_NH44_PATH_NORTH: [number, number][] = [
  [28.7041, 77.1025], // Delhi Sanjay Gandhi Transport Nagar
  [29.3909, 76.9635], // Panipat Highway Toll Plaza
  [29.6857, 76.9905], // Karnal Logistics Hub
  [30.3782, 76.7767], // Ambala Highway Junction
  [30.901, 75.8573], // Ludhiana Inland Container Yard
];

// Helper to calculate polyline interpolation & bearing heading angle
function interpolatePolyline(path: [number, number][], progress: number) {
  if (!path || path.length < 2)
    return {
      lat: 26.9,
      lng: 75.7,
      headingDeg: 0,
      remainingKm: 0,
      totalKm: 0,
      segIndex: 0,
    };

  let totalKm = 0;
  const lengths: number[] = [];
  for (let i = 0; i < path.length - 1; i++) {
    const lat1 = path[i][0];
    const lng1 = path[i][1];
    const lat2 = path[i + 1][0];
    const lng2 = path[i + 1][1];
    const dLat = (lat2 - lat1) * 111.32;
    const dLng = (lng2 - lng1) * 111.32 * Math.cos((lat1 * Math.PI) / 180);
    const segDist = Math.sqrt(dLat * dLat + dLng * dLng);
    lengths.push(segDist);
    totalKm += segDist;
  }

  // Normalized progress 0 to 1
  const normProg = ((progress % 1) + 1) % 1;
  const targetKm = normProg * totalKm;

  let accumulated = 0;
  let segIndex = 0;
  for (let i = 0; i < lengths.length; i++) {
    if (accumulated + lengths[i] >= targetKm) {
      segIndex = i;
      break;
    }
    accumulated += lengths[i];
  }

  const p1 = path[segIndex];
  const p2 = path[segIndex + 1] || p1;
  const segLen = lengths[segIndex] || 0.0001;
  const segFraction = (targetKm - accumulated) / segLen;

  const lat = p1[0] + (p2[0] - p1[0]) * segFraction;
  const lng = p1[1] + (p2[1] - p1[1]) * segFraction;

  const dLat = p2[0] - p1[0];
  const dLng = (p2[1] - p1[1]) * Math.cos((p1[0] * Math.PI) / 180);
  const rad = Math.atan2(dLng, dLat);
  const headingDeg = (rad * 180) / Math.PI;

  const remainingKm = Math.max(0, totalKm - targetKm);

  return { lat, lng, headingDeg, remainingKm, totalKm, segIndex };
}

// 2. Comprehensive Locations across Roadways & Railways
const DEFAULT_LOCATIONS: GpsLocation[] = [
  // RAIL VEHICLE 1: Western DFC Super-Rake
  {
    id: "TR-WDFC-7702",
    name: "Western DFC Super-Rake (WDFC-7702)",
    type: "active_vehicle",
    lat: 26.9124,
    lng: 75.7873,
    altitudeM: 390,
    speedKmh: 84.5,
    headingDeg: 215,
    mode: "rail",
    status: "In Transit · High Speed Corridor (WDFC)",
    driverInfo: {
      name: "Loco Pilot R. S. Sharma",
      contact: "+91 98710 44210",
      vigilanceScorePct: 98,
      bloodGroup: "B+ Positive",
      shiftHoursRemaining: 4.5,
    },
    satelliteFix: {
      constellation: "NavIC + GPS L5",
      satellitesVisible: 18,
      satellitesUsed: 14,
      hdop: 0.68,
      vdop: 1.0,
      carrierNoiseDbHz: 48.2,
      correctionSource: "GAGAN SBAS",
    },
    cargoDetails: {
      containerId: "CONU-892301-8 (90 TEU Double-Stack)",
      origin: "Dadri ICD, Greater Noida (UP)",
      destination: "JNPT Port, Navi Mumbai (MH)",
      commodity: "Automotive Components & Electronics",
      weightTons: 3240,
      tempC: 22.4,
    },
    routePath: WDFC_ROUTE_PATH,
  },
  // RAIL VEHICLE 2: Eastern DFC Heavy-Haul
  {
    id: "TR-EDFC-4409",
    name: "Eastern DFC Heavy-Haul Steel Rake (EDFC-4409)",
    type: "active_vehicle",
    lat: 25.3176,
    lng: 82.9739,
    altitudeM: 81,
    speedKmh: 76.0,
    headingDeg: 122,
    mode: "rail",
    status: "Passing Pt. Deen Dayal Upadhyaya Junction",
    driverInfo: {
      name: "Loco Pilot A. K. Verma",
      contact: "+91 94120 88201",
      vigilanceScorePct: 96,
      bloodGroup: "O+ Positive",
      shiftHoursRemaining: 5.2,
    },
    satelliteFix: {
      constellation: "Multi-GNSS (RTK)",
      satellitesVisible: 20,
      satellitesUsed: 16,
      hdop: 0.58,
      vdop: 0.85,
      carrierNoiseDbHz: 49.5,
      correctionSource: "RTK DGPS Base",
    },
    cargoDetails: {
      containerId: "RAIL-419022-1 (68 Wagons Heavy Steel)",
      origin: "Ludhiana Freight Hub (PB)",
      destination: "Dankuni Multi-Modal Terminal (WB)",
      commodity: "Industrial Steel Coils & Grain",
      weightTons: 4120,
    },
    routePath: EDFC_ROUTE_PATH,
  },
  // ROAD VEHICLE 1: Intermodal Highway Trailer (MH)
  {
    id: "TRK-EX-881",
    name: "Intermodal Drayage Fleet (MH-46-AR-2099)",
    type: "active_vehicle",
    lat: 19.076,
    lng: 73.005,
    altitudeM: 18,
    speedKmh: 58.2,
    headingDeg: 190,
    mode: "road",
    status: "Last-Mile Express Road Drayage to Nhava Sheva",
    driverInfo: {
      name: "Driver Gurpreet Singh",
      contact: "+91 98200 11982",
      vigilanceScorePct: 94,
      bloodGroup: "A+ Positive",
      shiftHoursRemaining: 3.1,
    },
    satelliteFix: {
      constellation: "NavIC + GPS L5",
      satellitesVisible: 15,
      satellitesUsed: 11,
      hdop: 0.82,
      vdop: 1.3,
      carrierNoiseDbHz: 44.1,
      correctionSource: "IRNSS NavIC S-band",
    },
    cargoDetails: {
      containerId: "MSKU-993102-4 (40ft High Cube Reefer)",
      origin: "Bhiwandi Warehousing Hub (MH)",
      destination: "JNPT Gateway Terminals (MH)",
      commodity: "Pharma & Temperature Sensitive Produce",
      weightTons: 28.5,
      tempC: 4.2,
    },
    routePath: ROAD_EXPRESSWAY_PATH_MH,
  },
  // ROAD VEHICLE 2: Interstate Heavy Truck (NH44 North)
  {
    id: "TRK-NH44-102",
    name: "NH44 Interstate Freight Carrier (DL-01-AX-9911)",
    type: "active_vehicle",
    lat: 29.3909,
    lng: 76.9635,
    altitudeM: 220,
    speedKmh: 64.0,
    headingDeg: 345,
    mode: "road",
    status: "In Transit · NH-44 Panipat Expressway Corridor",
    driverInfo: {
      name: "Driver Ramesh Yadav",
      contact: "+91 97110 55312",
      vigilanceScorePct: 97,
      bloodGroup: "O- Negative",
      shiftHoursRemaining: 6.0,
    },
    satelliteFix: {
      constellation: "NavIC + GPS L5",
      satellitesVisible: 17,
      satellitesUsed: 13,
      hdop: 0.71,
      vdop: 1.1,
      carrierNoiseDbHz: 46.8,
      correctionSource: "GAGAN SBAS",
    },
    cargoDetails: {
      containerId: "EXP-DL-40291 (32ft Multi-Axle Volvo)",
      origin: "Delhi Sanjay Gandhi Transport Nagar (DL)",
      destination: "Ludhiana ICD Terminal (PB)",
      commodity: "FMCG Consumer Packaged Goods",
      weightTons: 32.0,
      tempC: 24.0,
    },
    routePath: ROAD_NH44_PATH_NORTH,
  },

  // ROADWAY PERIPHERALS
  {
    id: "PERIPHERAL-TOLL-KHERKI",
    name: "Kherki Daula Toll Plaza & WIM Scale",
    type: "road_toll",
    lat: 28.3842,
    lng: 76.9741,
    altitudeM: 218,
    mode: "road",
    status: "Operational · 12 Lane FASTag & Automated Axle Scale",
    satelliteFix: {
      constellation: "Multi-GNSS (RTK)",
      satellitesVisible: 22,
      satellitesUsed: 18,
      hdop: 0.52,
      vdop: 0.7,
      carrierNoiseDbHz: 51.0,
      correctionSource: "RTK DGPS Base",
    },
  },
  {
    id: "PERIPHERAL-HUB-BHIWANDI",
    name: "Bhiwandi Warehousing & Multimodal Logistics Hub",
    type: "road_hub",
    lat: 19.2968,
    lng: 73.0631,
    altitudeM: 24,
    mode: "road",
    status: "Active · 450,000 sq.ft Warehousing & Drayage Siding",
    satelliteFix: {
      constellation: "NavIC + GPS L5",
      satellitesVisible: 18,
      satellitesUsed: 14,
      hdop: 0.65,
      vdop: 0.95,
      carrierNoiseDbHz: 47.8,
      correctionSource: "GAGAN SBAS",
    },
  },
  {
    id: "PERIPHERAL-EV-JAIPUR",
    name: "Highway Heavy EV 350kW Fast-Charger & Fleet Pitstop",
    type: "road_ev",
    lat: 26.9124,
    lng: 75.7873,
    altitudeM: 395,
    mode: "road",
    status: "Operational · 8 High-Power Commercial Charger Bay",
    satelliteFix: {
      constellation: "Multi-GNSS (RTK)",
      satellitesVisible: 20,
      satellitesUsed: 16,
      hdop: 0.55,
      vdop: 0.8,
      carrierNoiseDbHz: 49.8,
      correctionSource: "RTK DGPS Base",
    },
  },

  // RAILWAY PERIPHERALS
  {
    id: "PERIPHERAL-RAIL-DDU",
    name: "Pt. Deen Dayal Upadhyaya Marshalling Yard & Hump",
    type: "rail_yard",
    lat: 25.281,
    lng: 83.1189,
    altitudeM: 78,
    mode: "rail",
    status: "Operational · Asia's Largest Freight Classification Yard",
    satelliteFix: {
      constellation: "Multi-GNSS (RTK)",
      satellitesVisible: 21,
      satellitesUsed: 17,
      hdop: 0.53,
      vdop: 0.76,
      carrierNoiseDbHz: 50.4,
      correctionSource: "RTK DGPS Base",
    },
  },
  {
    id: "PERIPHERAL-RAIL-PHULERA",
    name: "Phulera Junction Rail Interlocking & ABS Signal Post",
    type: "rail_signal",
    lat: 26.8778,
    lng: 75.2443,
    altitudeM: 388,
    mode: "rail",
    status: "Active · Automatic Block Signaling (ETCS L2)",
    satelliteFix: {
      constellation: "NavIC + GPS L5",
      satellitesVisible: 17,
      satellitesUsed: 13,
      hdop: 0.72,
      vdop: 1.05,
      carrierNoiseDbHz: 46.5,
      correctionSource: "GAGAN SBAS",
    },
  },
  {
    id: "PERIPHERAL-RAIL-REWARI",
    name: "Rewari 25kV OHE Catenary Traction Sub-Station",
    type: "rail_yard",
    lat: 28.1983,
    lng: 76.6189,
    altitudeM: 242,
    mode: "rail",
    status: "Operational · High-Speed Double-Stack Catenary Grid",
    satelliteFix: {
      constellation: "Multi-GNSS (RTK)",
      satellitesVisible: 19,
      satellitesUsed: 15,
      hdop: 0.61,
      vdop: 0.88,
      carrierNoiseDbHz: 48.9,
      correctionSource: "RTK DGPS Base",
    },
  },

  // PORTS & INTERMODAL HUB PERIPHERALS
  {
    id: "HUB-DADRI",
    name: "Dadri Inland Container Depot (ICD & DFC Junction)",
    type: "icd",
    lat: 28.5284,
    lng: 77.5682,
    altitudeM: 214,
    mode: "intermodal",
    status: "Operational · 18 Track Automatic Siding",
    satelliteFix: {
      constellation: "Multi-GNSS (RTK)",
      satellitesVisible: 22,
      satellitesUsed: 18,
      hdop: 0.51,
      vdop: 0.72,
      carrierNoiseDbHz: 50.8,
      correctionSource: "RTK DGPS Base",
    },
  },
  {
    id: "HUB-JNPT",
    name: "Jawaharlal Nehru Port (JNPT / Nhava Sheva)",
    type: "port",
    lat: 18.9498,
    lng: 72.9515,
    altitudeM: 6,
    mode: "port",
    status: "Operational · Deep Water RMG Container Terminal",
    satelliteFix: {
      constellation: "NavIC + GPS L5",
      satellitesVisible: 18,
      satellitesUsed: 14,
      hdop: 0.69,
      vdop: 1.0,
      carrierNoiseDbHz: 47.9,
      correctionSource: "GAGAN SBAS",
    },
  },
  {
    id: "HUB-MUNDRA",
    name: "Mundra Port Logistics SEZ",
    type: "port",
    lat: 22.7533,
    lng: 69.7042,
    altitudeM: 12,
    mode: "port",
    status: "Operational · Rail-Linked Marine Gateway",
    satelliteFix: {
      constellation: "Multi-GNSS (RTK)",
      satellitesVisible: 20,
      satellitesUsed: 16,
      hdop: 0.58,
      vdop: 0.85,
      carrierNoiseDbHz: 49.3,
      correctionSource: "RTK DGPS Base",
    },
  },
  {
    id: "HUB-CHENNAI",
    name: "Chennai Port & Tondiarpet ICD",
    type: "port",
    lat: 13.0827,
    lng: 80.2907,
    altitudeM: 8,
    mode: "port",
    status: "Operational · Southern Freight Corridor Gateway",
    satelliteFix: {
      constellation: "NavIC + GPS L5",
      satellitesVisible: 17,
      satellitesUsed: 13,
      hdop: 0.71,
      vdop: 1.1,
      carrierNoiseDbHz: 45.8,
      correctionSource: "GAGAN SBAS",
    },
  },
];

type MapTileLayer = "satellite" | "hybrid" | "streets" | "dark";

export function RealGpsMap() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof LeafletType | null>(null);
  const mapInstanceRef = useRef<LeafletType.Map | null>(null);
  const markersRef = useRef<Map<string, LeafletType.Marker>>(new Map());
  const polylinesRef = useRef<LeafletType.Polyline[]>([]);
  const userMarkerRef = useRef<LeafletType.Marker | null>(null);
  const userCircleRef = useRef<LeafletType.Circle | null>(null);
  const tileLayerRef = useRef<LeafletType.TileLayer | null>(null);

  const activeIncident = useActiveIncident();
  const [callModalTarget, setCallModalTarget] = useState<EmergencyCallTarget | null>(null);

  const [isClientReady, setIsClientReady] = useState(false);
  const [activeLayer, setActiveLayer] = useState<MapTileLayer>("hybrid");
  const [selectedLocation, setSelectedLocation] = useState<GpsLocation | null>(
    DEFAULT_LOCATIONS[0],
  );

  // Peripheral Filters
  const [showRoadways, setShowRoadways] = useState(true);
  const [showRailways, setShowRailways] = useState(true);
  const [showPorts, setShowPorts] = useState(true);

  // Swiggy/Ola style Live Camera Lock
  const [isCameraLocked, setIsCameraLocked] = useState(false);
  const [simProgress, setSimProgress] = useState(0.42); // 42% initial journey progress
  const [isSimRunning, setIsSimRunning] = useState(true);

  const [userGps, setUserGps] = useState<{
    lat: number;
    lng: number;
    accuracy: number;
    altitude: number | null;
    speed: number | null;
    heading: number | null;
  } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Tile definitions
  const TILE_CONFIGS: Record<MapTileLayer, { url: string; attribution: string; maxZoom: number }> =
    {
      satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; Satellite",
        maxZoom: 19,
      },
      hybrid: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; World Imagery",
        maxZoom: 19,
      },
      streets: {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      },
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> Voyager',
        maxZoom: 19,
      },
    };

  // Client-side dynamic import of Leaflet
  useEffect(() => {
    let active = true;
    import("leaflet")
      .then((mod) => {
        if (!active) return;
        leafletRef.current = mod.default || mod;
        setIsClientReady(true);
      })
      .catch((err) => {
        console.error("Failed to load Leaflet:", err);
      });
    return () => {
      active = false;
    };
  }, []);

  // Initialize Leaflet Map once client and Leaflet library are ready
  useEffect(() => {
    if (!isClientReady || !mapContainerRef.current) return;
    const L = leafletRef.current;
    if (!L) return;
    if (mapInstanceRef.current) return; // already created

    const map = L.map(mapContainerRef.current, {
      center: [23.5, 78.5], // Center of India
      zoom: 5,
      zoomControl: false,
    });

    L.control
      .zoom({
        position: "bottomright",
      })
      .addTo(map);

    const tileConfig = TILE_CONFIGS[activeLayer];
    const initialTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);
    tileLayerRef.current = initialTileLayer;

    mapInstanceRef.current = map;

    // Draw Corridors
    drawCorridors(map, L);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isClientReady]);

  // Update Tile Layer when layer switch triggered
  useEffect(() => {
    const L = leafletRef.current;
    if (!mapInstanceRef.current || !L) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileConfig = TILE_CONFIGS[activeLayer];
    const newTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTileLayer;
  }, [activeLayer, isClientReady]);

  // High Frequency Smooth Ticker for Swiggy/Ola style Freight Movement
  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => (prev + 0.001) % 1);
    }, 120);
    return () => clearInterval(interval);
  }, [isSimRunning]);

  // Render & Update Live Animated Markers & Peripherals
  useEffect(() => {
    const L = leafletRef.current;
    if (!mapInstanceRef.current || !L) return;
    const map = mapInstanceRef.current;

    // Clear previous markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    DEFAULT_LOCATIONS.forEach((loc) => {
      // 1. Filter Check for Peripherals
      const isRoadType =
        loc.mode === "road" ||
        loc.type === "road_toll" ||
        loc.type === "road_hub" ||
        loc.type === "road_ev";
      const isRailType =
        loc.mode === "rail" || loc.type === "rail_yard" || loc.type === "rail_signal";
      const isPortType = loc.mode === "port" || loc.type === "port" || loc.type === "icd";

      if (isRoadType && !showRoadways && loc.type !== "active_vehicle") return;
      if (isRailType && !showRailways && loc.type !== "active_vehicle") return;
      if (isPortType && !showPorts && loc.type !== "active_vehicle") return;

      let currentLat = loc.lat;
      let currentLng = loc.lng;
      let currentHeading = loc.headingDeg || 0;
      let remainingDist = 0;

      // 2. Continuous Smooth Trajectory Interpolation for Active Freight Vehicles
      if (loc.type === "active_vehicle" && loc.routePath) {
        const interpolated = interpolatePolyline(loc.routePath, simProgress);
        currentLat = interpolated.lat;
        currentLng = interpolated.lng;
        currentHeading = interpolated.headingDeg;
        remainingDist = Math.round(interpolated.remainingKm);

        // If selected location is this vehicle and camera lock enabled -> smooth camera follow
        if (selectedLocation?.id === loc.id && isCameraLocked) {
          map.panTo([currentLat, currentLng], { animate: true, duration: 0.2 });
        }
      }

      // 3. Custom Marker Styling based on vehicle or peripheral type
      let markerBgClass = "bg-blue-600 border-white text-white";
      let iconSvg = `<svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 16v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v7m14 0H5"/></svg>`;

      if (loc.mode === "rail" || loc.type === "rail_yard" || loc.type === "rail_signal") {
        markerBgClass = "bg-indigo-600 border-white text-white";
        iconSvg = `<svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 15V9a2 2 0 012-2h12a2 2 0 012 2v6m-16 0v2a2 2 0 002 2h1m13-4v2a2 2 0 01-2 2h-1m-10 0h8m-8-9h8m-8 4h8M7 19l-3 3m13-3l3 3"/></svg>`;
      } else if (loc.mode === "road" || loc.type === "road_toll" || loc.type === "road_ev") {
        markerBgClass = "bg-amber-600 border-white text-white";
        iconSvg = `<svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2m-6 0a1 1 0 001-1v-3"/></svg>`;
      } else if (loc.type === "port" || loc.type === "icd") {
        markerBgClass = "bg-teal-600 border-white text-white";
        iconSvg = `<svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v20m0 0l-4-4m4 4l4-4M5 8h14"/></svg>`;
      }

      const isVehicle = loc.type === "active_vehicle";
      const isSelected = selectedLocation?.id === loc.id;

      const customIcon = L.divIcon({
        className: "custom-gps-marker",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute -inset-2 rounded-full ${
              isVehicle
                ? isSelected
                  ? "bg-blue-500/50 animate-ping"
                  : "bg-cyan-500/30 animate-pulse"
                : "bg-emerald-500/20"
            }"></div>
            <div class="size-10 rounded-2xl shadow-xl flex items-center justify-center border-2 ${markerBgClass} transition-transform duration-300 ${
              isSelected ? "scale-125 ring-4 ring-cyan-400" : ""
            }" style="transform: rotate(${isVehicle ? currentHeading : 0}deg);">
              ${iconSvg}
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 text-white font-mono text-[9px] px-2 py-0.5 shadow-md pointer-events-none font-bold border border-slate-700 flex items-center gap-1">
              ${isVehicle ? `<span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>` : ""}
              <span>${loc.id} ${isVehicle ? `(${remainingDist}km)` : ""}</span>
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const marker = L.marker([currentLat, currentLng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        const updatedLoc = {
          ...loc,
          lat: currentLat,
          lng: currentLng,
          headingDeg: currentHeading,
        };
        setSelectedLocation(updatedLoc);
        map.flyTo([currentLat, currentLng], 11, { duration: 1.0 });
      });

      markersRef.current.set(loc.id, marker);
    });

    // 4. RENDER EMERGENCY CRASH SOS & DISPATCH UNITS ON MAP IF ACTIVE
    if (activeIncident && activeIncident.status !== "RESOLVED") {
      const crashIcon = L.divIcon({
        className: "custom-emergency-crash-marker",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-4 rounded-full bg-red-600/40 animate-ping"></div>
            <div class="absolute -inset-8 rounded-full bg-red-500/20 animate-pulse"></div>
            <div class="size-11 rounded-2xl bg-red-600 text-white border-2 border-white shadow-2xl flex items-center justify-center font-black">
              <svg class="size-6 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div class="absolute -bottom-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-red-950 text-white font-mono text-[9px] px-2 py-0.5 shadow-lg border border-red-500 font-bold">
              🚨 CRASH: ${activeIncident.vehicleNumber} (${activeIncident.gForce}g)
            </div>
          </div>
        `,
        iconSize: [44, 44],
        iconAnchor: [22, 22],
      });

      const crashMarker = L.marker(
        [activeIncident.coordinates.lat, activeIncident.coordinates.lng],
        { icon: crashIcon, zIndexOffset: 1000 },
      ).addTo(map);

      markersRef.current.set("CRASH_SITE_EMERGENCY", crashMarker);
    }
  }, [
    simProgress,
    isClientReady,
    activeIncident,
    showRoadways,
    showRailways,
    showPorts,
    selectedLocation?.id,
    isCameraLocked,
  ]);

  const drawCorridors = (map: LeafletType.Map, L: typeof LeafletType) => {
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    // 1. Western Dedicated Freight Corridor (Indigo Glow Rail Spine)
    const wdfcLine = L.polyline(WDFC_ROUTE_PATH, {
      color: "#2563eb",
      weight: 4,
      dashArray: "8, 6",
      opacity: 0.95,
    }).addTo(map);
    wdfcLine.bindTooltip(
      "🚆 Western Dedicated Freight Corridor (1,504 km Electrified Double-Stack)",
      { sticky: true, className: "font-mono text-xs font-semibold" },
    );
    polylinesRef.current.push(wdfcLine);

    // 2. Eastern Dedicated Freight Corridor (Green Rail Spine)
    const edfcLine = L.polyline(EDFC_ROUTE_PATH, {
      color: "#059669",
      weight: 4,
      dashArray: "8, 6",
      opacity: 0.95,
    }).addTo(map);
    edfcLine.bindTooltip("🚆 Eastern Dedicated Freight Corridor (1,875 km Heavy-Haul Coal/Steel)", {
      sticky: true,
      className: "font-mono text-xs font-semibold",
    });
    polylinesRef.current.push(edfcLine);

    // 3. Maharashtra Freight Highway Drayage Line
    const roadMhLine = L.polyline(ROAD_EXPRESSWAY_PATH_MH, {
      color: "#d97706",
      weight: 3.5,
      dashArray: "4, 6",
      opacity: 0.85,
    }).addTo(map);
    roadMhLine.bindTooltip("🚚 Nhava Sheva Interstate Highway Drayage Corridor", { sticky: true });
    polylinesRef.current.push(roadMhLine);

    // 4. NH-44 Delhi-Ludhiana Highway Line
    const roadNh44Line = L.polyline(ROAD_NH44_PATH_NORTH, {
      color: "#f59e0b",
      weight: 3.5,
      dashArray: "4, 6",
      opacity: 0.85,
    }).addTo(map);
    roadNh44Line.bindTooltip("🚚 NH-44 North-South Heavy Highway Freight Corridor", {
      sticky: true,
    });
    polylinesRef.current.push(roadNh44Line);
  };

  // Locate browser user GPS
  const handleLocateUser = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("GPS Geolocation is not supported by your browser/device.");
      return;
    }
    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy, altitude, speed, heading } = position.coords;
        setUserGps({
          lat: latitude,
          lng: longitude,
          accuracy,
          altitude,
          speed,
          heading,
        });

        const L = leafletRef.current;
        const map = mapInstanceRef.current;
        if (L && map) {
          if (userMarkerRef.current) userMarkerRef.current.remove();
          if (userCircleRef.current) userCircleRef.current.remove();

          const userIcon = L.divIcon({
            className: "custom-user-gps-marker",
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute -inset-3 rounded-full bg-cyan-500/40 animate-ping"></div>
                <div class="size-6 rounded-full bg-cyan-600 border-2 border-white shadow-xl flex items-center justify-center text-white text-[10px] font-bold">
                  YOU
                </div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
          userCircleRef.current = L.circle([latitude, longitude], {
            radius: accuracy,
            color: "#06b6d4",
            fillColor: "#0891b2",
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(map);

          map.flyTo([latitude, longitude], 12, { duration: 1.2 });
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsError(`GPS Error (${err.code}): ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  };

  // Compute live vehicle display telemetry
  const selectedVehicleInterpolated =
    selectedLocation?.type === "active_vehicle" && selectedLocation.routePath
      ? interpolatePolyline(selectedLocation.routePath, simProgress)
      : null;

  return (
    <div
      className={`relative w-full rounded-2xl border border-border bg-card overflow-hidden shadow-xl flex flex-col ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none h-screen" : "h-[720px]"
      }`}
    >
      {/* Top Header & Map Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/80 bg-surface/90 px-4 py-3 backdrop-blur-md z-10">
        <div className="flex items-center gap-3">
          <div className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white shadow-md">
            <Radio className="size-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-foreground tracking-tight">
                Multimodal Roadways & Railways Real-Time Live Map
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NavIC + GPS L5 Live
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Swiggy & Ola style continuous telemetry tracking across Indian Freight Expressways &
              DFC Railways
            </p>
          </div>
        </div>

        {/* Action Controls & Peripheral Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* PERIPHERAL FILTER CHIPS */}
          <div className="flex items-center gap-1 bg-surface-2/80 p-1 rounded-xl border border-border">
            <button
              onClick={() => setShowRoadways(!showRoadways)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                showRoadways
                  ? "bg-amber-500 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle Roadways: Expressways, Toll Plazas, Highway Fuel Stations"
            >
              <Truck className="size-3.5" />
              <span>Roadways</span>
            </button>

            <button
              onClick={() => setShowRailways(!showRailways)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                showRailways
                  ? "bg-indigo-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle Railways: DFC Lines, Marshalling Yards, ABS Signals"
            >
              <Train className="size-3.5" />
              <span>Railways</span>
            </button>

            <button
              onClick={() => setShowPorts(!showPorts)}
              className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-bold transition ${
                showPorts
                  ? "bg-teal-600 text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Toggle Intermodal Ports & Inland Container Depots"
            >
              <Anchor className="size-3.5" />
              <span>Ports & ICDs</span>
            </button>
          </div>

          {/* SIMULATION MOVEMENT PLAY/PAUSE */}
          <button
            onClick={() => setIsSimRunning(!isSimRunning)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition ${
              isSimRunning
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-400"
                : "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
            }`}
          >
            {isSimRunning ? (
              <>
                <Pause className="size-3.5 fill-current" />
                <span>Live Moving</span>
              </>
            ) : (
              <>
                <Play className="size-3.5 fill-current" />
                <span>Paused</span>
              </>
            )}
          </button>

          {/* USER GEOLOCATION LOCATE BUTTON */}
          <button
            onClick={handleLocateUser}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs disabled:opacity-50"
            title="Locate my exact WGS-84 location"
          >
            <Crosshair className={`size-3.5 ${isLocating ? "animate-spin text-blue-600" : ""}`} />
            <span>My Location</span>
          </button>

          {/* FULLSCREEN TOGGLE */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="flex size-8 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground hover:bg-surface-2 hover:text-foreground transition"
            title="Toggle Fullscreen Mode"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* Map Main Canvas Area */}
      <div className="relative flex-1 w-full bg-slate-950 overflow-hidden">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Map Tile Layer Selector Floating Overlay */}
        <div className="absolute top-4 left-4 z-1000 flex items-center gap-1 bg-surface/90 p-1 rounded-xl border border-border shadow-lg backdrop-blur-md">
          <span className="text-[10px] font-extrabold text-muted-foreground px-2">MAP TILE:</span>
          {(["hybrid", "satellite", "streets", "dark"] as MapTileLayer[]).map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer)}
              className={`rounded-lg px-2.5 py-1 text-[10px] font-bold uppercase transition ${
                activeLayer === layer
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              }`}
            >
              {layer}
            </button>
          ))}
        </div>

        {/* SWIGGY / OLA STYLE FLOATING LIVE VEHICLE TRACKER CARD */}
        {selectedLocation && selectedLocation.type === "active_vehicle" && (
          <div className="absolute bottom-6 right-6 z-1000 w-80 sm:w-96 rounded-2xl border border-blue-500/30 bg-surface/95 p-4 shadow-2xl backdrop-blur-xl space-y-3 pointer-events-auto">
            {/* Header / Delivery App Trajectory Badge */}
            <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                  {selectedLocation.mode === "rail" ? (
                    <Train className="size-4" />
                  ) : (
                    <Truck className="size-4" />
                  )}
                </span>
                <div>
                  <div className="font-extrabold text-sm text-foreground truncate max-w-[200px]">
                    {selectedLocation.name}
                  </div>
                  <div className="text-[10px] font-mono font-semibold text-blue-600 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>{selectedLocation.status}</span>
                  </div>
                </div>
              </div>

              {/* CAMERA LOCK FOLLOW TOGGLE */}
              <button
                onClick={() => setIsCameraLocked(!isCameraLocked)}
                className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-[10px] font-extrabold border transition shadow-xs ${
                  isCameraLocked
                    ? "bg-cyan-600 text-white border-cyan-400 animate-pulse"
                    : "bg-surface border-border text-muted-foreground hover:text-foreground"
                }`}
                title="Lock camera to follow vehicle movement smoothly"
              >
                <Eye className="size-3" />
                <span>{isCameraLocked ? "CAMERA LOCKED" : "FOLLOW"}</span>
              </button>
            </div>

            {/* LIVE SPEEDOMETER & ETA TELEMETRY GRID */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="rounded-xl bg-surface-2 p-2.5 border border-border/80">
                <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Gauge className="size-3 text-blue-600" />
                  <span>Current Speed</span>
                </div>
                <div className="text-base font-black text-foreground mt-0.5 font-mono">
                  {selectedLocation.speedKmh || 80} km/h
                </div>
                <div className="w-full bg-border rounded-full h-1.5 mt-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full rounded-full"
                    style={{
                      width: `${Math.min(100, ((selectedLocation.speedKmh || 80) / 120) * 100)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="rounded-xl bg-surface-2 p-2.5 border border-border/80">
                <div className="text-[10px] font-semibold text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3 text-emerald-600" />
                  <span>Remaining Distance</span>
                </div>
                <div className="text-base font-black text-foreground mt-0.5 font-mono">
                  {selectedVehicleInterpolated?.remainingKm || 420} km
                </div>
                <div className="text-[9px] font-semibold text-emerald-600 mt-1">
                  ETA: ~{Math.ceil((selectedVehicleInterpolated?.remainingKm || 420) / 75)} hours
                </div>
              </div>
            </div>

            {/* DRIVER / LOCO PILOT TELEMETRY */}
            {selectedLocation.driverInfo && (
              <div className="rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-2.5 border border-blue-200 dark:border-blue-900 text-xs space-y-1">
                <div className="flex items-center justify-between text-[11px] font-bold text-blue-900 dark:text-blue-300">
                  <span className="flex items-center gap-1">
                    <User className="size-3 text-blue-600" />
                    {selectedLocation.driverInfo.name}
                  </span>
                  <span className="text-[10px] font-mono text-emerald-600 font-bold">
                    Vigilance: {selectedLocation.driverInfo.vigilanceScorePct}%
                  </span>
                </div>
                <div className="text-[10px] text-muted-foreground flex items-center justify-between">
                  <span>Contact: {selectedLocation.driverInfo.contact}</span>
                  <span>Shift Left: {selectedLocation.driverInfo.shiftHoursRemaining}h</span>
                </div>
              </div>
            )}

            {/* CARGO DETAILS & TEMPERATURE */}
            {selectedLocation.cargoDetails && (
              <div className="rounded-xl bg-surface-2 p-2.5 border border-border/80 text-[11px] space-y-1">
                <div className="font-bold text-foreground truncate">
                  📦 {selectedLocation.cargoDetails.containerId}
                </div>
                <div className="text-[10px] text-muted-foreground truncate">
                  {selectedLocation.cargoDetails.commodity} (
                  {selectedLocation.cargoDetails.weightTons} Tons)
                </div>
                {selectedLocation.cargoDetails.tempC !== undefined && (
                  <div className="text-[10px] font-bold text-cyan-600 flex items-center gap-1 mt-0.5">
                    <Thermometer className="size-3 text-cyan-500" />
                    <span>Cold-Chain Temp: {selectedLocation.cargoDetails.tempC}°C</span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* GPS ERROR NOTIFICATION OVERLAY */}
        {gpsError && (
          <div className="absolute top-16 left-4 z-1000 max-w-sm rounded-xl border border-red-300 bg-red-50 p-3 text-xs text-red-800 shadow-xl flex items-center gap-2">
            <AlertOctagon className="size-4 text-red-600 shrink-0" />
            <span>{gpsError}</span>
          </div>
        )}
      </div>

      {/* Emergency Call Modal integration */}
      {callModalTarget && (
        <EmergencyCallModal
          isOpen={!!callModalTarget}
          onClose={() => setCallModalTarget(null)}
          targetInfo={callModalTarget}
        />
      )}
    </div>
  );
}
