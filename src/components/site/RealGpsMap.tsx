import React, { useEffect, useRef, useState, useMemo } from "react";
import type * as LeafletType from "leaflet";
import {
  MapPin,
  Compass,
  Radio,
  Navigation,
  Layers,
  Zap,
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
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  ExternalLink,
  AlertOctagon,
  PhoneCall,
  Package,
  ShieldCheck,
  Play,
  Pause,
  Gauge,
  User,
  Thermometer,
  X,
  ArrowRight,
  Share2,
  Bookmark,
  TrendingUp,
  Fuel,
  Info,
  Car,
  Target,
  Globe,
  SlidersHorizontal,
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
  category:
    | "Rail Freight"
    | "Highway Truck"
    | "Port / ICD"
    | "EV Hub"
    | "Toll / Weighbridge"
    | "Yard / Signal";
  address: string;
  rating: number;
  reviewsCount: number;
  lat: number;
  lng: number;
  altitudeM: number;
  speedKmh?: number;
  headingDeg?: number;
  mode?: "rail" | "road" | "sea" | "intermodal";
  status: string;
  coverImage?: string;
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
  waypoints?: { name: string; time: string; distance: string; passed: boolean }[];
}

// 1. Defined Routes for Smooth Polyline Interpolation
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
  if (!path || path.length < 2) {
    return {
      lat: 26.9,
      lng: 75.7,
      headingDeg: 0,
      remainingKm: 0,
      totalKm: 0,
      segIndex: 0,
    };
  }

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

// 2. Comprehensive Google Maps POI & Vehicle Database
const DEFAULT_LOCATIONS: GpsLocation[] = [
  {
    id: "TR-WDFC-7702",
    name: "Western DFC Super-Rake (WDFC-7702)",
    category: "Rail Freight",
    address: "Dedicated Freight Corridor Track 1, Rajasthan Sector",
    rating: 4.9,
    reviewsCount: 328,
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
    waypoints: [
      { name: "Dadri ICD Terminal", time: "06:00 AM", distance: "0 km", passed: true },
      { name: "Rewari Junction Siding", time: "08:15 AM", distance: "140 km", passed: true },
      { name: "Phulera Junction", time: "11:45 AM", distance: "390 km", passed: true },
      { name: "Ahmedabad Freight Yard", time: "04:30 PM", distance: "880 km", passed: false },
      { name: "Surat GIDC Terminal", time: "08:15 PM", distance: "1,140 km", passed: false },
      {
        name: "JNPT Nhava Sheva Gate",
        time: "02:30 AM (Next Day)",
        distance: "1,504 km",
        passed: false,
      },
    ],
  },
  {
    id: "TR-EDFC-4409",
    name: "Eastern DFC Heavy-Haul Steel Rake (EDFC-4409)",
    category: "Rail Freight",
    address: "Eastern Dedicated Freight Corridor, Uttar Pradesh Sector",
    rating: 4.8,
    reviewsCount: 194,
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
    waypoints: [
      { name: "Ludhiana ICD Hub", time: "04:00 AM", distance: "0 km", passed: true },
      { name: "Khurja Interchange", time: "09:30 AM", distance: "380 km", passed: true },
      { name: "Kanpur Central Yard", time: "02:15 PM", distance: "780 km", passed: true },
      { name: "Pt. Deen Dayal Upadhyaya", time: "06:45 PM", distance: "1,090 km", passed: true },
      { name: "Dhanbad Coal Siding", time: "11:30 PM", distance: "1,450 km", passed: false },
      { name: "Dankuni Port Terminal", time: "05:00 AM", distance: "1,875 km", passed: false },
    ],
  },
  {
    id: "TRK-EX-881",
    name: "Intermodal Cold-Chain Reefer (MH-46-AR-2099)",
    category: "Highway Truck",
    address: "National Expressway 1, Thane-Mumbai Corridor",
    rating: 4.7,
    reviewsCount: 142,
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
    waypoints: [
      { name: "Bhiwandi Logistics Park", time: "01:00 PM", distance: "0 km", passed: true },
      { name: "Thane Express Checkpoint", time: "01:45 PM", distance: "18 km", passed: true },
      { name: "Navi Mumbai Expressway", time: "02:30 PM", distance: "42 km", passed: true },
      { name: "Panvel Toll Gate", time: "03:15 PM", distance: "60 km", passed: false },
      { name: "Nhava Sheva Gate 4", time: "04:00 PM", distance: "78 km", passed: false },
    ],
  },
  {
    id: "TRK-NH44-102",
    name: "NH44 Interstate Freight Multi-Axle (DL-01-AX-9911)",
    category: "Highway Truck",
    address: "National Highway 44, Haryana Corridor",
    rating: 4.6,
    reviewsCount: 89,
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
    waypoints: [
      { name: "Sanjay Gandhi Transport Nagar", time: "07:00 AM", distance: "0 km", passed: true },
      { name: "Panipat Toll Plaza", time: "09:15 AM", distance: "85 km", passed: true },
      { name: "Karnal Express Siding", time: "10:45 AM", distance: "135 km", passed: false },
      { name: "Ambala Highway Junction", time: "01:00 PM", distance: "210 km", passed: false },
      { name: "Ludhiana Freight ICD", time: "03:30 PM", distance: "310 km", passed: false },
    ],
  },
  {
    id: "HUB-DADRI",
    name: "Dadri Inland Container Depot (ICD & DFC Junction)",
    category: "Port / ICD",
    address: "Dadri Freight Logistics Park, Greater Noida, UP 203207",
    rating: 4.9,
    reviewsCount: 1540,
    type: "icd",
    lat: 28.5284,
    lng: 77.5682,
    altitudeM: 214,
    mode: "intermodal",
    status: "Open 24/7 · 18 Track Automatic Siding & Customs Gate",
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
    category: "Port / ICD",
    address: "Admin Building, Nhava Sheva, Navi Mumbai, MH 400707",
    rating: 4.8,
    reviewsCount: 4210,
    type: "port",
    lat: 18.9498,
    lng: 72.9515,
    altitudeM: 6,
    mode: "port",
    status: "Open 24/7 · Deep Water RMG Container Terminal",
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
    category: "Port / ICD",
    address: "Port & SEZ, Mundra, Kutch, Gujarat 370421",
    rating: 4.9,
    reviewsCount: 2890,
    type: "port",
    lat: 22.7533,
    lng: 69.7042,
    altitudeM: 12,
    mode: "port",
    status: "Open 24/7 · Rail-Linked Marine Gateway",
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
    category: "Port / ICD",
    address: "Rajaji Salai, Chennai Port Trust, Chennai, TN 600001",
    rating: 4.7,
    reviewsCount: 1980,
    type: "port",
    lat: 13.0827,
    lng: 80.2907,
    altitudeM: 8,
    mode: "port",
    status: "Open 24/7 · Southern Freight Corridor Gateway",
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
  {
    id: "PERIPHERAL-EV-JAIPUR",
    name: "Highway Heavy EV 350kW Fast-Charger & Fleet Pitstop",
    category: "EV Hub",
    address: "NH-48 Expressway KM 248, Jaipur Bypass, RJ",
    rating: 4.8,
    reviewsCount: 312,
    type: "road_ev",
    lat: 26.9124,
    lng: 75.7873,
    altitudeM: 395,
    mode: "road",
    status: "Open 24/7 · 8 High-Power Commercial Charger Bays (CCS2/MCS)",
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
  {
    id: "PERIPHERAL-TOLL-KHERKI",
    name: "Kherki Daula Toll Plaza & Automated WIM Scale",
    category: "Toll / Weighbridge",
    address: "Delhi-Gurugram Expressway, Sector 34, Gurugram, HR",
    rating: 4.3,
    reviewsCount: 890,
    type: "road_toll",
    lat: 28.3842,
    lng: 76.9741,
    altitudeM: 218,
    mode: "road",
    status: "Open 24/7 · 12 Lane FASTag & Automated Weight-In-Motion Scale",
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
    id: "PERIPHERAL-RAIL-DDU",
    name: "Pt. Deen Dayal Upadhyaya Marshalling Yard & Hump",
    category: "Yard / Signal",
    address: "Mughalsarai East Yard, Chandauli, UP 232101",
    rating: 4.9,
    reviewsCount: 1120,
    type: "rail_yard",
    lat: 25.281,
    lng: 83.1189,
    altitudeM: 78,
    mode: "rail",
    status: "Active · Asia's Largest Freight Classification Yard",
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
];

type GoogleMapType = "default" | "satellite" | "terrain" | "dark";

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
  const [mapType, setMapType] = useState<GoogleMapType>("default");
  const [selectedLocation, setSelectedLocation] = useState<GpsLocation | null>(
    DEFAULT_LOCATIONS[0],
  );
  // Display Scope: default to "single" to focus on a single location instead of cluttering with multiples
  const [displayScope, setDisplayScope] = useState<"single" | "all">("single");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Search & Navigation States
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [directionsMode, setDirectionsMode] = useState(false);
  const [routeOrigin, setRouteOrigin] = useState("Dadri ICD (Greater Noida)");
  const [routeDestination, setRouteDestination] = useState("JNPT Nhava Sheva (Mumbai)");
  const [selectedTransitMode, setSelectedTransitMode] = useState<"rail" | "road" | "hybrid">(
    "rail",
  );

  // Google Maps Overlays
  const [showTraffic, setShowTraffic] = useState(true);
  const [showTransit, setShowTransit] = useState(true);
  const [showPorts, setShowPorts] = useState(true);
  const [showEV, setShowEV] = useState(true);
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  // Live Vehicle Tracking Simulation
  const [isCameraLocked, setIsCameraLocked] = useState(false);
  const [simProgress, setSimProgress] = useState(0.42);
  const [isSimRunning, setIsSimRunning] = useState(true);

  // Geolocation & Controls
  const [userGps, setUserGps] = useState<{ lat: number; lng: number; accuracy: number } | null>(
    null,
  );
  const [isLocating, setIsLocating] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [savedPins, setSavedPins] = useState<string[]>(["TR-WDFC-7702"]);

  // Google Maps Tile configurations
  const TILE_CONFIGS: Record<GoogleMapType, { url: string; attribution: string; maxZoom: number }> =
    {
      default: {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
        maxZoom: 19,
      },
      satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri World Imagery",
        maxZoom: 19,
      },
      terrain: {
        url: "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        maxZoom: 17,
      },
      dark: {
        url: "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        attribution: '&copy; <a href="https://carto.com/">CARTO Dark</a>',
        maxZoom: 19,
      },
    };

  // Filtered search suggestions
  const searchSuggestions = useMemo(() => {
    if (!searchQuery.trim()) return DEFAULT_LOCATIONS.slice(0, 6);
    const q = searchQuery.toLowerCase();
    return DEFAULT_LOCATIONS.filter(
      (loc) =>
        loc.name.toLowerCase().includes(q) ||
        loc.id.toLowerCase().includes(q) ||
        loc.category.toLowerCase().includes(q) ||
        loc.address.toLowerCase().includes(q) ||
        loc.status.toLowerCase().includes(q) ||
        loc.cargoDetails?.commodity.toLowerCase().includes(q),
    );
  }, [searchQuery]);

  // Load Leaflet dynamically
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

  // Initialize Map
  useEffect(() => {
    if (!isClientReady || !mapContainerRef.current) return;
    const L = leafletRef.current;
    if (!L || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [23.5, 78.5],
      zoom: 5,
      zoomControl: false,
      attributionControl: false,
    });

    const tileConfig = TILE_CONFIGS[mapType];
    const initialTile = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);
    tileLayerRef.current = initialTile;

    mapInstanceRef.current = map;
    drawCorridors(map, L);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [isClientReady]);

  // Tile layer switch
  useEffect(() => {
    const L = leafletRef.current;
    if (!mapInstanceRef.current || !L) return;
    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }
    const tileConfig = TILE_CONFIGS[mapType];
    const newTile = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(mapInstanceRef.current);
    tileLayerRef.current = newTile;
  }, [mapType, isClientReady]);

  // High Frequency Smooth Simulation
  useEffect(() => {
    if (!isSimRunning) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => (prev + 0.0008) % 1);
    }, 120);
    return () => clearInterval(interval);
  }, [isSimRunning]);

  // Render Markers (supports Single Location Focus vs Full Network)
  useEffect(() => {
    const L = leafletRef.current;
    if (!mapInstanceRef.current || !L) return;
    const map = mapInstanceRef.current;

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    const activeTarget = selectedLocation || DEFAULT_LOCATIONS[0];
    const locationsToRender = displayScope === "single" ? [activeTarget] : DEFAULT_LOCATIONS;

    locationsToRender.forEach((loc) => {
      const isVehicle = loc.type === "active_vehicle";
      const isSelected = selectedLocation?.id === loc.id;

      if (displayScope === "all") {
        if (loc.mode === "rail" && !showTransit && !isVehicle) return;
        if (loc.mode === "road" && !showTraffic && !isVehicle) return;
        if ((loc.type === "port" || loc.type === "icd") && !showPorts) return;
        if (loc.type === "road_ev" && !showEV) return;
      }

      let currentLat = loc.lat;
      let currentLng = loc.lng;
      let currentHeading = loc.headingDeg || 0;
      let remainingKm = 0;

      if (isVehicle && loc.routePath) {
        const interp = interpolatePolyline(loc.routePath, simProgress);
        currentLat = interp.lat;
        currentLng = interp.lng;
        currentHeading = interp.headingDeg;
        remainingKm = Math.round(interp.remainingKm);

        if (isSelected && isCameraLocked) {
          map.panTo([currentLat, currentLng], { animate: true, duration: 0.2 });
        }
      }

      // Google Maps style SVG Marker Icons
      let markerHtml = "";
      const isRail = loc.mode === "rail";
      const isRoad = loc.mode === "road";
      const isPort = loc.type === "port" || loc.type === "icd";
      const isEv = loc.type === "road_ev";

      if (isVehicle) {
        // Moving Vehicle puck with heading navigation arrow
        const colorBg = isRail ? "bg-blue-600 ring-blue-400" : "bg-emerald-600 ring-emerald-400";
        markerHtml = `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute -inset-3 rounded-full ${isRail ? "bg-blue-500/30" : "bg-emerald-500/30"} animate-ping"></div>
            <div class="size-10 rounded-full ${colorBg} text-white shadow-[0_4px_14px_rgba(0,0,0,0.4)] flex items-center justify-center border-2 border-white transition-transform duration-200 group-hover:scale-110 ${
              isSelected ? "scale-125 ring-4 shadow-2xl" : ""
            }">
              <div style="transform: rotate(${currentHeading}deg);" class="transition-transform duration-200 flex items-center justify-center">
                <svg class="size-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z"/>
                </svg>
              </div>
            </div>
            <!-- Google Maps style clean label -->
            <div class="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 text-white font-sans text-[11px] px-2 py-0.5 rounded-md shadow-md border border-slate-700 font-semibold z-50 flex items-center gap-1.5">
              <span>${loc.name.split("(")[0]}</span>
              <span class="${isRail ? "text-cyan-300" : "text-emerald-300"} font-mono">(${remainingKm} km to ETA)</span>
            </div>
          </div>
        `;
      } else {
        // Google Maps Classic Teardrop Pin
        let pinColor = "#2563eb"; // Blue
        let iconSvg = `<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2v20m0 0l-4-4m4 4l4-4M5 8h14"/></svg>`;

        if (isPort) {
          pinColor = "#0d9488"; // Teal
          iconSvg = `<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="5" r="3"/><line x1="12" y1="22" x2="12" y2="8"/><path d="M5 12H2a10 10 0 0 0 20 0h-3"/></svg>`;
        } else if (isEv) {
          pinColor = "#16a34a"; // Green
          iconSvg = `<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;
        } else if (loc.type === "road_toll") {
          pinColor = "#d97706"; // Amber
          iconSvg = `<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`;
        } else if (loc.type === "rail_yard") {
          pinColor = "#4f46e5"; // Indigo
          iconSvg = `<svg class="size-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="16" rx="2"/><path d="M4 11h16"/><path d="M12 3v8"/><path d="m8 19-2 3"/><path d="m18 22-2-3"/></svg>`;
        }

        markerHtml = `
          <div class="relative flex flex-col items-center justify-center cursor-pointer group">
            <div class="flex items-center justify-center size-9 rounded-full shadow-[0_3px_10px_rgba(0,0,0,0.35)] border-2 border-white text-white transition-transform duration-200 group-hover:scale-125 ${
              isSelected ? "scale-125 ring-4 ring-blue-400 shadow-xl" : ""
            }" style="background-color: ${pinColor};">
              ${iconSvg}
            </div>
            <div class="w-1.5 h-1.5 -mt-0.5 rounded-full" style="background-color: ${pinColor};"></div>
            <!-- Google Maps style clean name label -->
            <div class="mt-1 bg-white text-slate-900 font-sans text-[11px] px-2 py-0.5 rounded shadow-sm border border-slate-300 font-bold whitespace-nowrap">
              ${loc.name.split("(")[0]}
            </div>
          </div>
        `;
      }

      const customIcon = L.divIcon({
        className: "google-maps-pin",
        html: markerHtml,
        iconSize: [44, 52],
        iconAnchor: [22, 26],
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
        setIsSidebarOpen(true);
        map.flyTo([currentLat, currentLng], 12, { duration: 0.8 });
      });

      markersRef.current.set(loc.id, marker);

      // In single location mode, if vehicle has route, add origin & destination terminal pins
      if (displayScope === "single" && isVehicle && loc.routePath && loc.routePath.length > 1) {
        const startPoint = loc.routePath[0];
        const endPoint = loc.routePath[loc.routePath.length - 1];

        // Origin Pin
        const originHtml = `
          <div class="flex items-center gap-1 bg-emerald-700 text-white font-sans text-[10px] px-2 py-0.5 rounded shadow-lg border border-emerald-500 font-bold">
            <span>🟢 Origin: ${loc.cargoDetails?.origin || "Dispatch Yard"}</span>
          </div>
        `;
        const originIcon = L.divIcon({
          className: "route-origin-pin",
          html: originHtml,
          iconSize: [160, 24],
          iconAnchor: [80, 12],
        });
        const originMarker = L.marker([startPoint[0], startPoint[1]], {
          icon: originIcon,
        }).addTo(map);
        markersRef.current.set(`${loc.id}-origin`, originMarker);

        // Destination Pin
        const destHtml = `
          <div class="flex items-center gap-1 bg-blue-700 text-white font-sans text-[10px] px-2 py-0.5 rounded shadow-lg border border-blue-500 font-bold">
            <span>🏁 Dest: ${loc.cargoDetails?.destination || "Destination Port"}</span>
          </div>
        `;
        const destIcon = L.divIcon({
          className: "route-dest-pin",
          html: destHtml,
          iconSize: [160, 24],
          iconAnchor: [80, 12],
        });
        const destMarker = L.marker([endPoint[0], endPoint[1]], {
          icon: destIcon,
        }).addTo(map);
        markersRef.current.set(`${loc.id}-dest`, destMarker);
      }
    });

    // Render Crash Emergency SOS if active
    if (activeIncident && activeIncident.status !== "RESOLVED") {
      const crashIcon = L.divIcon({
        className: "custom-emergency-crash-marker",
        html: `
          <div class="relative flex flex-col items-center justify-center cursor-pointer">
            <div class="absolute -inset-4 rounded-full bg-red-600/40 animate-ping"></div>
            <div class="size-10 rounded-full bg-red-600 text-white border-2 border-white shadow-2xl flex items-center justify-center font-bold">
              <svg class="size-5 text-white animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div class="mt-1 bg-red-600 text-white font-sans text-[10px] px-2 py-0.5 rounded shadow-lg font-bold border border-red-700">
              🚨 Incident: ${activeIncident.vehicleNumber}
            </div>
          </div>
        `,
        iconSize: [44, 48],
        iconAnchor: [22, 24],
      });

      const crashMarker = L.marker(
        [activeIncident.coordinates.lat, activeIncident.coordinates.lng],
        { icon: crashIcon, zIndexOffset: 1000 },
      ).addTo(map);

      crashMarker.on("click", () => {
        map.flyTo([activeIncident.coordinates.lat, activeIncident.coordinates.lng], 14, {
          duration: 0.8,
        });
      });

      markersRef.current.set("CRASH_SITE_EMERGENCY", crashMarker);
    }
  }, [
    simProgress,
    isClientReady,
    activeIncident,
    showTraffic,
    showTransit,
    showPorts,
    showEV,
    selectedLocation,
    displayScope,
    isCameraLocked,
  ]);

  const drawCorridors = (map: LeafletType.Map, L: typeof LeafletType) => {
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    // In Single Location Mode: Draw only the route corridor for the selected vehicle
    if (displayScope === "single") {
      const active = selectedLocation || DEFAULT_LOCATIONS[0];
      if (active.routePath && active.routePath.length > 1) {
        const isRail = active.mode === "rail";
        const color = isRail ? "#2563eb" : "#059669";
        const singleLine = L.polyline(active.routePath, {
          color,
          weight: 6,
          opacity: 0.95,
          dashArray: showTraffic ? "12, 6" : undefined,
        }).addTo(map);
        singleLine.bindTooltip(`${isRail ? "🚆" : "🚚"} ${active.name} Active Transit Track`, {
          sticky: true,
          className: "google-maps-tooltip",
        });
        polylinesRef.current.push(singleLine);
      }
      return;
    }

    // Full Network Mode: Render all national corridors
    // Western DFC
    const wdfcLine = L.polyline(WDFC_ROUTE_PATH, {
      color: "#2563eb",
      weight: 5,
      opacity: 0.9,
      dashArray: showTraffic ? "10, 6" : undefined,
    }).addTo(map);
    wdfcLine.bindTooltip(
      "🚆 Western Dedicated Freight Corridor (1,504 km Electrified Double-Stack)",
      {
        sticky: true,
        className: "google-maps-tooltip",
      },
    );
    polylinesRef.current.push(wdfcLine);

    // Eastern DFC
    const edfcLine = L.polyline(EDFC_ROUTE_PATH, {
      color: "#059669",
      weight: 5,
      opacity: 0.9,
      dashArray: showTraffic ? "10, 6" : undefined,
    }).addTo(map);
    edfcLine.bindTooltip("🚆 Eastern Dedicated Freight Corridor (1,875 km Heavy-Haul)", {
      sticky: true,
      className: "google-maps-tooltip",
    });
    polylinesRef.current.push(edfcLine);

    // Highway Expressways
    const roadMhLine = L.polyline(ROAD_EXPRESSWAY_PATH_MH, {
      color: "#f59e0b",
      weight: 4,
      opacity: 0.85,
    }).addTo(map);
    roadMhLine.bindTooltip("🚚 Nhava Sheva Expressway Corridor", { sticky: true });
    polylinesRef.current.push(roadMhLine);

    const roadNh44Line = L.polyline(ROAD_NH44_PATH_NORTH, {
      color: "#ea580c",
      weight: 4,
      opacity: 0.85,
    }).addTo(map);
    roadNh44Line.bindTooltip("🚚 NH-44 North-South Heavy Freight Corridor", { sticky: true });
    polylinesRef.current.push(roadNh44Line);
  };

  // Re-draw corridors whenever displayScope or selected location changes
  useEffect(() => {
    if (!mapInstanceRef.current || !leafletRef.current) return;
    drawCorridors(mapInstanceRef.current, leafletRef.current);
  }, [displayScope, selectedLocation?.id, showTraffic, showTransit, isClientReady]);

  // Google Maps Zoom In / Out
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetNorth = () => {
    mapInstanceRef.current?.setView([23.5, 78.5], 5, { animate: true });
  };

  // Geolocation
  const handleLocateUser = () => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGpsError("GPS Geolocation is not supported by your browser.");
      return;
    }
    setIsLocating(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocating(false);
        const { latitude, longitude, accuracy } = position.coords;
        setUserGps({ lat: latitude, lng: longitude, accuracy });

        const L = leafletRef.current;
        const map = mapInstanceRef.current;
        if (L && map) {
          if (userMarkerRef.current) userMarkerRef.current.remove();
          if (userCircleRef.current) userCircleRef.current.remove();

          const userIcon = L.divIcon({
            className: "google-user-location-marker",
            html: `
              <div class="relative flex items-center justify-center">
                <div class="absolute -inset-3 rounded-full bg-blue-500/40 animate-ping"></div>
                <div class="size-5 rounded-full bg-blue-600 border-2 border-white shadow-xl"></div>
              </div>
            `,
            iconSize: [20, 20],
            iconAnchor: [10, 10],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
          userCircleRef.current = L.circle([latitude, longitude], {
            radius: accuracy,
            color: "#3b82f6",
            fillColor: "#60a5fa",
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(map);

          map.flyTo([latitude, longitude], 13, { duration: 1.2 });
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsError(`GPS Error: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  // Select location helper
  const handleSelectLocation = (loc: GpsLocation) => {
    setSelectedLocation(loc);
    setIsSidebarOpen(true);
    setIsSearchFocused(false);
    setSearchQuery(loc.name);
    if (loc.type === "active_vehicle" && loc.routePath) {
      const interp = interpolatePolyline(loc.routePath, simProgress);
      mapInstanceRef.current?.flyTo([interp.lat, interp.lng], 11, { duration: 1.0 });
    } else {
      mapInstanceRef.current?.flyTo([loc.lat, loc.lng], 13, { duration: 1.0 });
    }
  };

  const handleNextLocation = () => {
    const currentIndex = DEFAULT_LOCATIONS.findIndex(
      (l) => l.id === (selectedLocation?.id || DEFAULT_LOCATIONS[0].id),
    );
    const nextIndex = (currentIndex + 1) % DEFAULT_LOCATIONS.length;
    handleSelectLocation(DEFAULT_LOCATIONS[nextIndex]);
  };

  const handlePrevLocation = () => {
    const currentIndex = DEFAULT_LOCATIONS.findIndex(
      (l) => l.id === (selectedLocation?.id || DEFAULT_LOCATIONS[0].id),
    );
    const prevIndex = (currentIndex - 1 + DEFAULT_LOCATIONS.length) % DEFAULT_LOCATIONS.length;
    handleSelectLocation(DEFAULT_LOCATIONS[prevIndex]);
  };

  const handleRecenter = () => {
    if (!selectedLocation) return;
    if (selectedLocation.type === "active_vehicle" && selectedLocation.routePath) {
      const interp = interpolatePolyline(selectedLocation.routePath, simProgress);
      mapInstanceRef.current?.flyTo([interp.lat, interp.lng], 11, { duration: 0.8 });
    } else {
      mapInstanceRef.current?.flyTo([selectedLocation.lat, selectedLocation.lng], 13, {
        duration: 0.8,
      });
    }
  };

  const handleTogglePin = (id: string) => {
    setSavedPins((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  // Calculated live telemetry
  const selectedVehicleInterp =
    selectedLocation?.type === "active_vehicle" && selectedLocation.routePath
      ? interpolatePolyline(selectedLocation.routePath, simProgress)
      : null;

  const activeLoc = selectedLocation || DEFAULT_LOCATIONS[0];

  return (
    <div
      id="google-maps-container"
      className={`relative w-full overflow-hidden bg-slate-100 font-sans border border-slate-300/80 shadow-2xl ${
        isFullscreen
          ? "fixed inset-0 z-50 h-screen rounded-none border-none"
          : "h-[740px] rounded-2xl"
      }`}
    >
      {/* 1. MAP CANVAS */}
      <div ref={mapContainerRef} className="absolute inset-0 w-full h-full z-0 bg-slate-200" />

      {/* TOP COMMAND BAR: SINGLE LOCATION FOCUS & NETWORK TOGGLE */}
      <div className="absolute top-3 left-3 right-3 sm:left-4 sm:right-4 z-20 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        {/* Left: Search Box Card */}
        <div className="max-w-[360px] w-full sm:w-[360px] pointer-events-auto">
          <div className="relative rounded-xl bg-white shadow-[0_2px_8px_rgba(0,0,0,0.25)] border border-slate-200/90 transition-all">
            <div className="flex items-center px-3 py-2">
              <div className="flex items-center justify-center size-7 text-slate-500 hover:text-slate-700 mr-2">
                <Search className="size-4 text-slate-400" />
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder="Search single rake, port, truck..."
                className="flex-1 bg-transparent text-xs text-slate-800 placeholder:text-slate-400 focus:outline-hidden font-normal"
              />

              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
                >
                  <X className="size-3.5" />
                </button>
              )}

              <div className="h-4 w-px bg-slate-200 mx-1.5" />

              {/* Directions Action Icon */}
              <button
                onClick={() => setDirectionsMode(!directionsMode)}
                className={`flex items-center justify-center size-7 rounded-lg transition ${
                  directionsMode
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-blue-600 hover:bg-blue-50"
                }`}
                title="Get Freight Directions"
              >
                <Navigation className="size-3.5" />
              </button>
            </div>

            {/* Autocomplete Search Dropdown */}
            {isSearchFocused && (
              <div className="border-t border-slate-100 max-h-80 overflow-y-auto bg-white rounded-b-xl divide-y divide-slate-100 shadow-xl">
                <div className="p-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                  {searchQuery ? "Search Results" : "Select Single Location / Rake / Hub"}
                </div>
                {searchSuggestions.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectLocation(item)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-blue-50/60 text-left transition"
                  >
                    <div className="flex size-6 items-center justify-center rounded-full bg-slate-100 text-slate-600 shrink-0">
                      {item.mode === "rail" ? (
                        <Train className="size-3.5 text-blue-600" />
                      ) : item.mode === "road" ? (
                        <Truck className="size-3.5 text-amber-600" />
                      ) : item.type === "port" ? (
                        <Anchor className="size-3.5 text-teal-600" />
                      ) : (
                        <MapPin className="size-3.5 text-slate-500" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-800 truncate">
                        {item.name}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{item.address}</div>
                    </div>
                    <ChevronRight className="size-3.5 text-slate-300" />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right: Single Location Focus Switcher & Quick Navigation */}
        <div className="flex items-center gap-1.5 pointer-events-auto bg-white/95 backdrop-blur-md px-2.5 py-1.5 rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.25)] border border-slate-200/90 text-xs">
          {/* Scope Toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200/80">
            <button
              onClick={() => {
                setDisplayScope("single");
                handleRecenter();
              }}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                displayScope === "single"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Focus map exclusively on a single location"
            >
              <Target className="size-3.5" />
              <span>Single Location</span>
            </button>
            <button
              onClick={() => setDisplayScope("all")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition ${
                displayScope === "all"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
              title="Show all national freight network nodes"
            >
              <Globe className="size-3.5" />
              <span>All Nodes</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 mx-0.5" />

          {/* Quick Cycle: Prev Button */}
          <button
            onClick={handlePrevLocation}
            className="flex items-center justify-center size-7 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition"
            title="Previous Location"
          >
            <ChevronLeft className="size-4" />
          </button>

          {/* Single Location Direct Select Dropdown */}
          <div className="relative">
            <select
              value={activeLoc.id}
              onChange={(e) => {
                const found = DEFAULT_LOCATIONS.find((l) => l.id === e.target.value);
                if (found) handleSelectLocation(found);
              }}
              className="appearance-none bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] font-bold py-1.5 pl-2.5 pr-6 rounded-lg border border-slate-200 focus:outline-hidden cursor-pointer max-w-[190px] sm:max-w-[230px] truncate"
            >
              <optgroup label="🚆 Dedicated Rail Freight (DFC)">
                {DEFAULT_LOCATIONS.filter((l) => l.mode === "rail").map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="🚛 Highway Freight Fleet">
                {DEFAULT_LOCATIONS.filter((l) => l.mode === "road").map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚓ Inland Ports & Terminals">
                {DEFAULT_LOCATIONS.filter((l) => l.type === "port" || l.type === "icd").map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </optgroup>
              <optgroup label="⚡ EV Hubs & Infrastructure">
                {DEFAULT_LOCATIONS.filter(
                  (l) => l.type !== "port" && l.type !== "icd" && l.type !== "active_vehicle",
                ).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </optgroup>
            </select>
            <ChevronDown className="pointer-events-none absolute right-1.5 top-1/2 -translate-y-1/2 size-3 text-slate-400" />
          </div>

          {/* Quick Cycle: Next Button */}
          <button
            onClick={handleNextLocation}
            className="flex items-center justify-center size-7 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200 transition"
            title="Next Location"
          >
            <ChevronRight className="size-4" />
          </button>

          {/* Recenter Button */}
          <button
            onClick={handleRecenter}
            className="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-lg border border-blue-200 transition"
            title="Center map on target location"
          >
            <Crosshair className="size-3.5" />
            <span className="hidden sm:inline text-[11px]">Center</span>
          </button>
        </div>
      </div>

      {/* 2. GOOGLE MAPS FLOATING TOP-LEFT SEARCH & CONTROLS (CATEGORY CHIPS & DIRECTIONS) */}
      <div className="absolute top-16 left-3 sm:left-4 z-20 flex flex-col gap-2 max-w-[360px] w-[calc(100%-1.5rem)] sm:w-[360px] pointer-events-auto">
        {/* Google Maps Quick Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => {
              const rake = DEFAULT_LOCATIONS.find((l) => l.mode === "rail");
              if (rake) handleSelectLocation(rake);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.15)] text-[11px] font-medium border shrink-0 transition ${
              activeLoc.mode === "rail"
                ? "bg-blue-600 text-white border-blue-700"
                : "bg-white/95 text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <Train className="size-3" />
            <span>Rail DFC</span>
          </button>

          <button
            onClick={() => {
              const truck = DEFAULT_LOCATIONS.find((l) => l.mode === "road");
              if (truck) handleSelectLocation(truck);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.15)] text-[11px] font-medium border shrink-0 transition ${
              activeLoc.mode === "road"
                ? "bg-emerald-600 text-white border-emerald-700"
                : "bg-white/95 text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <Truck className="size-3" />
            <span>Expressways</span>
          </button>

          <button
            onClick={() => {
              const port = DEFAULT_LOCATIONS.find((l) => l.type === "port" || l.type === "icd");
              if (port) handleSelectLocation(port);
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.15)] text-[11px] font-medium border shrink-0 transition ${
              activeLoc.type === "port" || activeLoc.type === "icd"
                ? "bg-teal-600 text-white border-teal-700"
                : "bg-white/95 text-slate-700 hover:bg-slate-50 border-slate-200"
            }`}
          >
            <Anchor className="size-3" />
            <span>Ports & ICDs</span>
          </button>

          <button
            onClick={() => setShowTraffic(!showTraffic)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full shadow-[0_2px_4px_rgba(0,0,0,0.15)] text-[11px] font-medium border shrink-0 transition ${
              showTraffic
                ? "bg-amber-50 border-amber-300 text-amber-800 font-semibold"
                : "bg-white/95 border-slate-200 text-slate-700"
            }`}
          >
            <Activity className="size-3 text-amber-600" />
            <span>Live Speed</span>
          </button>
        </div>

        {/* 3. GOOGLE MAPS DIRECTIONS ROUTING PANEL */}
        {directionsMode && (
          <div className="rounded-lg bg-white p-3.5 shadow-[0_4px_12px_rgba(0,0,0,0.2)] border border-slate-200 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                <Navigation className="size-4 text-blue-600" />
                <span>Multimodal Route Planner</span>
              </div>
              <button
                onClick={() => setDirectionsMode(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="size-4" />
              </button>
            </div>

            {/* Origin & Destination Inputs */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 rounded-md bg-slate-50 p-2 border border-slate-200">
                <div className="size-2.5 rounded-full bg-blue-600" />
                <input
                  type="text"
                  value={routeOrigin}
                  onChange={(e) => setRouteOrigin(e.target.value)}
                  className="flex-1 bg-transparent font-medium text-slate-800 focus:outline-hidden"
                />
              </div>
              <div className="flex items-center gap-2 rounded-md bg-slate-50 p-2 border border-slate-200">
                <div className="size-2.5 rounded-full bg-red-600" />
                <input
                  type="text"
                  value={routeDestination}
                  onChange={(e) => setRouteDestination(e.target.value)}
                  className="flex-1 bg-transparent font-medium text-slate-800 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Mode Selector */}
            <div className="grid grid-cols-3 gap-1.5 text-center text-xs">
              <button
                onClick={() => setSelectedTransitMode("rail")}
                className={`flex flex-col items-center py-2 px-1 rounded-lg border transition ${
                  selectedTransitMode === "rail"
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Train className="size-4 mb-0.5" />
                <span>Rail DFC</span>
                <span className="text-[10px] text-emerald-600 font-bold">18h 30m</span>
              </button>

              <button
                onClick={() => setSelectedTransitMode("road")}
                className={`flex flex-col items-center py-2 px-1 rounded-lg border transition ${
                  selectedTransitMode === "road"
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Truck className="size-4 mb-0.5" />
                <span>Highway</span>
                <span className="text-[10px] text-slate-500 font-bold">28h 15m</span>
              </button>

              <button
                onClick={() => setSelectedTransitMode("hybrid")}
                className={`flex flex-col items-center py-2 px-1 rounded-lg border transition ${
                  selectedTransitMode === "hybrid"
                    ? "bg-blue-50 border-blue-500 text-blue-700 font-bold"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                <Zap className="size-4 mb-0.5" />
                <span>Intermodal</span>
                <span className="text-[10px] text-blue-600 font-bold">21h 00m</span>
              </button>
            </div>

            {/* Best Route Summary */}
            <div className="rounded-lg bg-blue-50/60 p-2.5 border border-blue-200/80 text-xs">
              <div className="flex items-center justify-between font-bold text-slate-800">
                <span>Via Western DFC (1,504 km)</span>
                <span className="text-emerald-700 font-mono">₹14,200/TEU</span>
              </div>
              <div className="text-[11px] text-slate-600 mt-1">
                Fastest route · 58% lower CO₂ emissions than road transport
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 4. GOOGLE MAPS PLACE / VEHICLE DETAILS DRAWER (Left Side) */}
      {selectedLocation && isSidebarOpen && (
        <div className="absolute top-20 left-4 bottom-6 z-10 w-[380px] max-w-[calc(100%-2rem)] rounded-xl bg-white shadow-[0_4px_20px_rgba(0,0,0,0.25)] border border-slate-200/80 overflow-y-auto flex flex-col pointer-events-auto">
          {/* Header Banner with Category Gradient */}
          <div className="relative bg-gradient-to-r from-blue-700 to-indigo-900 text-white p-4">
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="absolute top-3 right-3 p-1 text-white/80 hover:text-white rounded-full bg-black/20 hover:bg-black/40 transition"
            >
              <X className="size-4" />
            </button>

            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-lg bg-white/20 backdrop-blur-md text-white">
                {selectedLocation.mode === "rail" ? (
                  <Train className="size-4" />
                ) : selectedLocation.mode === "road" ? (
                  <Truck className="size-4" />
                ) : (
                  <Anchor className="size-4" />
                )}
              </span>
              <span className="text-xs font-mono font-bold tracking-wide uppercase text-blue-200">
                {selectedLocation.category}
              </span>
            </div>

            <h3 className="mt-2 text-base font-bold text-white leading-tight">
              {selectedLocation.name}
            </h3>

            <div className="mt-1 flex items-center gap-2 text-xs text-white/90">
              <span className="font-bold flex items-center gap-1 text-amber-300">
                ★ {selectedLocation.rating}
              </span>
              <span>({selectedLocation.reviewsCount} logs)</span>
              <span>·</span>
              <span className="text-emerald-300 font-semibold">{selectedLocation.status}</span>
            </div>
          </div>

          {/* Google Maps Quick Actions */}
          <div className="flex items-center justify-around border-b border-slate-100 py-3 bg-slate-50/50">
            <button
              onClick={() => setDirectionsMode(true)}
              className="flex flex-col items-center gap-1 text-blue-600 hover:text-blue-800 transition"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-blue-600 text-white shadow-md">
                <Navigation className="size-4" />
              </div>
              <span className="text-[11px] font-bold">Directions</span>
            </button>

            <button
              onClick={() => handleTogglePin(selectedLocation.id)}
              className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-800 transition"
            >
              <div
                className={`flex size-9 items-center justify-center rounded-full border shadow-xs transition ${
                  savedPins.includes(selectedLocation.id)
                    ? "bg-amber-500 text-white border-amber-600"
                    : "bg-white text-slate-600 border-slate-200"
                }`}
              >
                <Bookmark className="size-4" />
              </div>
              <span className="text-[11px] font-medium">Save</span>
            </button>

            {selectedLocation.driverInfo && (
              <button
                onClick={() =>
                  setCallModalTarget({
                    name: selectedLocation.driverInfo!.name,
                    role: selectedLocation.mode === "rail" ? "Loco Pilot" : "Heavy Freight Driver",
                    vehicleId: selectedLocation.id,
                    phone: selectedLocation.driverInfo!.contact,
                    location: `${selectedLocation.lat.toFixed(4)}°N, ${selectedLocation.lng.toFixed(4)}°E`,
                  })
                }
                className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-800 transition"
              >
                <div className="flex size-9 items-center justify-center rounded-full bg-white text-emerald-600 border border-slate-200 shadow-xs hover:bg-emerald-50">
                  <PhoneCall className="size-4" />
                </div>
                <span className="text-[11px] font-medium">Call Pilot</span>
              </button>
            )}

            <button
              onClick={() => {
                if (navigator.clipboard) {
                  navigator.clipboard.writeText(
                    `https://railflow.ai/cargo-portal?q=${selectedLocation.id}`,
                  );
                }
              }}
              className="flex flex-col items-center gap-1 text-slate-600 hover:text-slate-800 transition"
            >
              <div className="flex size-9 items-center justify-center rounded-full bg-white text-slate-600 border border-slate-200 shadow-xs hover:bg-slate-100">
                <Share2 className="size-4" />
              </div>
              <span className="text-[11px] font-medium">Share</span>
            </button>
          </div>

          {/* Details Body */}
          <div className="p-4 space-y-4 text-xs">
            {/* Live Speed & Distance telemetry if active vehicle */}
            {selectedLocation.type === "active_vehicle" && (
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Gauge className="size-3.5 text-blue-600" />
                    <span>Live Speed</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1 font-mono">
                    {selectedLocation.speedKmh || 80} km/h
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-blue-600 h-full rounded-full"
                      style={{
                        width: `${Math.min(100, ((selectedLocation.speedKmh || 80) / 120) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <div className="text-[11px] text-slate-500 font-medium flex items-center gap-1">
                    <Clock className="size-3.5 text-emerald-600" />
                    <span>Remaining</span>
                  </div>
                  <div className="text-lg font-black text-slate-900 mt-1 font-mono">
                    {selectedVehicleInterp
                      ? `${Math.round(selectedVehicleInterp.remainingKm)} km`
                      : "550 km"}
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600 mt-1">
                    ETA: ~{Math.ceil((selectedVehicleInterp?.remainingKm || 550) / 75)} hours
                  </div>
                </div>
              </div>
            )}

            {/* Camera lock toggle button */}
            {selectedLocation.type === "active_vehicle" && (
              <button
                onClick={() => setIsCameraLocked(!isCameraLocked)}
                className={`w-full flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-bold transition shadow-xs ${
                  isCameraLocked
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                }`}
              >
                <Eye className="size-4" />
                <span>{isCameraLocked ? "Camera Following Vehicle" : "Follow Vehicle Live"}</span>
              </button>
            )}

            {/* Waypoints Timeline */}
            {selectedLocation.waypoints && (
              <div className="space-y-2">
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Journey Waypoint Schedule
                </div>
                <div className="relative pl-6 space-y-3 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                  {selectedLocation.waypoints.map((wp, idx) => (
                    <div key={idx} className="relative">
                      <div
                        className={`absolute -left-6 top-0.5 size-2.5 rounded-full ring-4 ring-white ${
                          wp.passed ? "bg-emerald-500" : "bg-slate-300"
                        }`}
                      />
                      <div className="flex items-center justify-between text-xs">
                        <span
                          className={`font-semibold ${
                            wp.passed ? "text-slate-800" : "text-slate-400"
                          }`}
                        >
                          {wp.name}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">{wp.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Cargo Manifest */}
            {selectedLocation.cargoDetails && (
              <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                  <Package className="size-3.5" />
                  <span>Cargo Manifest</span>
                </div>
                <div className="font-bold text-slate-800 text-xs">
                  {selectedLocation.cargoDetails.containerId}
                </div>
                <div className="text-slate-600 text-[11px]">
                  {selectedLocation.cargoDetails.commodity} (
                  {selectedLocation.cargoDetails.weightTons} Tons)
                </div>
                {selectedLocation.cargoDetails.tempC !== undefined && (
                  <div className="flex items-center gap-1 text-teal-700 font-bold text-[11px]">
                    <Thermometer className="size-3.5 text-teal-600" />
                    <span>Cold-Chain Telemetry: {selectedLocation.cargoDetails.tempC}°C</span>
                  </div>
                )}
              </div>
            )}

            {/* GNSS Satellite Telemetry */}
            <div className="rounded-xl bg-slate-50 p-3 border border-slate-200 space-y-1.5">
              <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
                <Radio className="size-3.5 text-blue-600" />
                <span>Space-Ground GNSS Telemetry</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Constellation:</span>
                <span className="font-bold text-slate-800">
                  {selectedLocation.satelliteFix.constellation}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">Sats Visible / Used:</span>
                <span className="font-mono text-slate-800">
                  {selectedLocation.satelliteFix.satellitesVisible} /{" "}
                  {selectedLocation.satelliteFix.satellitesUsed}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-600">HDOP Accuracy:</span>
                <span className="font-mono text-emerald-600 font-bold">
                  {selectedLocation.satelliteFix.hdop} (RTK Fix)
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 5. GOOGLE MAPS LAYER SWITCHER THUMBNAIL (Bottom-Left) */}
      <div className="absolute bottom-6 left-4 z-20 pointer-events-auto">
        <div className="relative">
          {/* Main Layer Thumbnail Button */}
          <button
            onClick={() => setShowLayerMenu(!showLayerMenu)}
            className="flex items-center gap-2 rounded-xl bg-white p-1.5 shadow-[0_2px_8px_rgba(0,0,0,0.25)] border border-slate-200 hover:bg-slate-50 transition"
            title="Choose Map Type & Layers"
          >
            <div className="size-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-800 flex items-center justify-center text-white text-[10px] font-bold">
              {mapType === "satellite" ? "🛰️ Sat" : mapType === "dark" ? "🌙 Dark" : "🗺️ Map"}
            </div>
            <span className="pr-2 text-xs font-bold text-slate-700">Layers</span>
          </button>

          {/* Layer Options Popup Menu */}
          {showLayerMenu && (
            <div className="absolute bottom-14 left-0 w-64 rounded-xl bg-white p-3 shadow-2xl border border-slate-200 space-y-3 animate-in fade-in zoom-in-95">
              <div className="text-xs font-bold text-slate-800">Map Types</div>
              <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-bold">
                {(["default", "satellite", "terrain", "dark"] as GoogleMapType[]).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setMapType(t);
                      setShowLayerMenu(false);
                    }}
                    className={`flex flex-col items-center gap-1 p-1 rounded-lg border transition ${
                      mapType === t
                        ? "border-blue-600 bg-blue-50 text-blue-700"
                        : "border-slate-200 text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <div className="size-8 rounded-md bg-slate-200 flex items-center justify-center uppercase text-[8px]">
                      {t === "satellite"
                        ? "🛰️"
                        : t === "dark"
                          ? "🌙"
                          : t === "terrain"
                            ? "⛰️"
                            : "🗺️"}
                    </div>
                    <span className="capitalize">{t}</span>
                  </button>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-2 space-y-2">
                <div className="text-xs font-bold text-slate-800">Map Overlays</div>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Transit & Rail Corridors</span>
                  <input
                    type="checkbox"
                    checked={showTransit}
                    onChange={(e) => setShowTransit(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Live Highway Traffic</span>
                  <input
                    type="checkbox"
                    checked={showTraffic}
                    onChange={(e) => setShowTraffic(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
                <label className="flex items-center justify-between text-xs text-slate-700 cursor-pointer">
                  <span>Ports & ICDs</span>
                  <input
                    type="checkbox"
                    checked={showPorts}
                    onChange={(e) => setShowPorts(e.target.checked)}
                    className="rounded text-blue-600"
                  />
                </label>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 6. GOOGLE MAPS STANDARD FLOATING NAVIGATION CONTROLS (Bottom-Right) */}
      <div className="absolute bottom-6 right-4 z-20 flex flex-col items-center gap-2 pointer-events-auto">
        {/* Play/Pause Live Movement */}
        <button
          onClick={() => setIsSimRunning(!isSimRunning)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-full shadow-[0_2px_6px_rgba(0,0,0,0.25)] border text-xs font-bold transition ${
            isSimRunning
              ? "bg-white text-emerald-600 border-slate-200 hover:bg-slate-50"
              : "bg-amber-500 text-white border-amber-600"
          }`}
          title="Play/Pause Freight Simulation"
        >
          {isSimRunning ? <Pause className="size-3.5" /> : <Play className="size-3.5" />}
          <span>{isSimRunning ? "Live" : "Paused"}</span>
        </button>

        {/* Compass Button */}
        <button
          onClick={handleResetNorth}
          className="flex size-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-slate-200 hover:bg-slate-50 transition"
          title="Reset to North"
        >
          <Compass className="size-5 text-red-500" />
        </button>

        {/* My Location Button */}
        <button
          onClick={handleLocateUser}
          disabled={isLocating}
          className="flex size-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-slate-200 hover:bg-blue-50 transition disabled:opacity-50"
          title="Show My Location"
        >
          <Crosshair className={`size-5 ${isLocating ? "animate-spin text-blue-600" : ""}`} />
        </button>

        {/* Zoom In & Zoom Out Pill Stack */}
        <div className="flex flex-col rounded-lg bg-white shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-slate-200 overflow-hidden divide-y divide-slate-200">
          <button
            onClick={handleZoomIn}
            className="flex size-10 items-center justify-center text-slate-700 hover:bg-slate-50 font-black text-lg transition"
            title="Zoom In"
          >
            +
          </button>
          <button
            onClick={handleZoomOut}
            className="flex size-10 items-center justify-center text-slate-700 hover:bg-slate-50 font-black text-lg transition"
            title="Zoom Out"
          >
            −
          </button>
        </div>

        {/* Fullscreen Expand Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          className="flex size-10 items-center justify-center rounded-full bg-white text-slate-700 shadow-[0_2px_6px_rgba(0,0,0,0.25)] border border-slate-200 hover:bg-slate-50 transition"
          title="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
      </div>

      {/* Emergency Incident Call Modal */}
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
