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
} from "lucide-react";
import { useActiveIncident } from "@/lib/emergency/useEmergency";
import { emergencyStore } from "@/lib/emergency/emergencyStore";
import { EmergencyCallModal, EmergencyCallTarget } from "@/components/emergency/EmergencyCallModal";

// Real Geospatial coordinates of Major Indian Freight Hubs and DFC Terminals
export interface GpsLocation {
  id: string;
  name: string;
  type: "rail_hub" | "port" | "icd" | "active_vehicle" | "user";
  lat: number;
  lng: number;
  altitudeM: number;
  speedKmh?: number;
  headingDeg?: number;
  mode?: "rail" | "road" | "sea";
  status: string;
  satelliteFix: {
    constellation: "NavIC + GPS L5" | "GPS L1/L2" | "Multi-GNSS (RTK)";
    satellitesVisible: number;
    satellitesUsed: number;
    hdop: number; // Horizontal Dilution of Precision
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
  breadcrumbs?: [number, number][];
}

const DEFAULT_LOCATIONS: GpsLocation[] = [
  {
    id: "TR-WDFC-7702",
    name: "Western DFC Super-Rake (WDFC-7702)",
    type: "active_vehicle",
    lat: 26.9124,
    lng: 75.7873, // Near Phulera / Jaipur section of WDFC
    altitudeM: 390,
    speedKmh: 82.5,
    headingDeg: 215,
    mode: "rail",
    status: "In Transit (High Speed Corridor)",
    satelliteFix: {
      constellation: "NavIC + GPS L5",
      satellitesVisible: 16,
      satellitesUsed: 12,
      hdop: 0.74,
      vdop: 1.1,
      carrierNoiseDbHz: 46.2,
      correctionSource: "GAGAN SBAS",
    },
    cargoDetails: {
      containerId: "CONU-892301-8 (90 TEU Double-Stack)",
      origin: "Dadri ICD, Greater Noida (UP)",
      destination: "JNPT Port, Navi Mumbai (MH)",
      commodity: "Automotive Parts & High-Tech Components",
      weightTons: 3240,
      tempC: 22.4,
    },
    breadcrumbs: [
      [28.5284, 77.5682], // Dadri
      [28.1983, 76.6189], // Rewari
      [27.553, 76.6346], // Alwar
      [26.9124, 75.7873], // Current (Jaipur)
      [24.5854, 73.7125], // Udaipur (Future)
      [22.3072, 73.1812], // Vadodara
      [18.9498, 72.9515], // JNPT
    ],
  },
  {
    id: "TR-EDFC-4409",
    name: "Eastern DFC Heavy-Haul (EDFC-4409)",
    type: "active_vehicle",
    lat: 25.3176,
    lng: 82.9739, // Varanasi section of EDFC
    altitudeM: 81,
    speedKmh: 74.0,
    headingDeg: 122,
    mode: "rail",
    status: "Passing Pandit Deen Dayal Upadhyaya Junction",
    satelliteFix: {
      constellation: "Multi-GNSS (RTK)",
      satellitesVisible: 19,
      satellitesUsed: 15,
      hdop: 0.62,
      vdop: 0.9,
      carrierNoiseDbHz: 48.5,
      correctionSource: "RTK DGPS Base",
    },
    cargoDetails: {
      containerId: "RAIL-419022-1 (68 Wagons Heavy Steel)",
      origin: "Ludhiana Freight Hub (PB)",
      destination: "Dankuni Multi-Modal Terminal (WB)",
      commodity: "Finished Industrial Steel Coils & Grain",
      weightTons: 4120,
    },
    breadcrumbs: [
      [30.901, 75.8573], // Ludhiana
      [28.7041, 77.1025], // Delhi bypass
      [27.1767, 78.0081], // Agra
      [26.4499, 80.3319], // Kanpur
      [25.3176, 82.9739], // Varanasi (Current)
      [24.7914, 85.0002], // Gaya
      [22.6853, 88.2917], // Dankuni
    ],
  },
  {
    id: "TRK-EX-881",
    name: "Intermodal Drayage Fleet (MH-46-AR-2099)",
    type: "active_vehicle",
    lat: 19.076,
    lng: 73.005, // Navi Mumbai Port feeder expressway
    altitudeM: 18,
    speedKmh: 58.2,
    headingDeg: 190,
    mode: "road",
    status: "Last-Mile Delivery to Nhava Sheva CFS",
    satelliteFix: {
      constellation: "NavIC + GPS L5",
      satellitesVisible: 14,
      satellitesUsed: 10,
      hdop: 0.88,
      vdop: 1.4,
      carrierNoiseDbHz: 43.1,
      correctionSource: "IRNSS NavIC S-band",
    },
    cargoDetails: {
      containerId: "MSKU-993102-4 (40ft High Cube)",
      origin: "Bhiwandi Warehousing Hub (MH)",
      destination: "JNPT Gateway Terminals (MH)",
      commodity: "Consumer Electronics & Textiles",
      weightTons: 28.5,
      tempC: 18.2,
    },
    breadcrumbs: [
      [19.2968, 73.0631], // Bhiwandi
      [19.1983, 73.0336], // Thane
      [19.076, 73.005], // Current
      [18.9498, 72.9515], // JNPT
    ],
  },
  {
    id: "HUB-DADRI",
    name: "Dadri Inland Container Depot (ICD & DFC Junction)",
    type: "icd",
    lat: 28.5284,
    lng: 77.5682,
    altitudeM: 214,
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
    status: "Operational · Deep Water Container Terminal",
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
    status: "Operational · Rail-Linked Marine Terminal",
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
    status: "Operational · Southern Corridors Origin",
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

// Live Simulated GNSS Satellites in View (NavIC, GPS, Galileo, GLONASS)
interface SatelliteNode {
  prn: string;
  name: string;
  system: "NavIC (ISRO)" | "GPS (USA)" | "Galileo (EU)" | "GLONASS (RU)";
  elevationDeg: number;
  azimuthDeg: number;
  snrDbHz: number;
  orbitKm: number;
  pseudoRangeKm: number;
  atomicClockDriftNs: number;
  status: "LOCKED (L5/L1)" | "TRACKING" | "EPHEMERIS SYNCED";
}

const LIVE_SATELLITES: SatelliteNode[] = [
  {
    prn: "IRNSS-1I",
    name: "NavIC GEO-1I",
    system: "NavIC (ISRO)",
    elevationDeg: 78,
    azimuthDeg: 142,
    snrDbHz: 49.8,
    orbitKm: 35786,
    pseudoRangeKm: 36120.45,
    atomicClockDriftNs: +1.2,
    status: "LOCKED (L5/L1)",
  },
  {
    prn: "IRNSS-1F",
    name: "NavIC GSO-1F",
    system: "NavIC (ISRO)",
    elevationDeg: 64,
    azimuthDeg: 185,
    snrDbHz: 48.2,
    orbitKm: 35786,
    pseudoRangeKm: 36840.12,
    atomicClockDriftNs: -0.8,
    status: "LOCKED (L5/L1)",
  },
  {
    prn: "GPS-SV24",
    name: "GPS Block III",
    system: "GPS (USA)",
    elevationDeg: 52,
    azimuthDeg: 290,
    snrDbHz: 46.5,
    orbitKm: 20180,
    pseudoRangeKm: 21840.82,
    atomicClockDriftNs: +2.1,
    status: "LOCKED (L5/L1)",
  },
  {
    prn: "GPS-SV18",
    name: "GPS IIR-M",
    system: "GPS (USA)",
    elevationDeg: 41,
    azimuthDeg: 65,
    snrDbHz: 44.1,
    orbitKm: 20180,
    pseudoRangeKm: 23150.33,
    atomicClockDriftNs: +0.4,
    status: "LOCKED (L5/L1)",
  },
  {
    prn: "GAL-E08",
    name: "Galileo FOC-8",
    system: "Galileo (EU)",
    elevationDeg: 38,
    azimuthDeg: 315,
    snrDbHz: 43.8,
    orbitKm: 23222,
    pseudoRangeKm: 25420.91,
    atomicClockDriftNs: -1.1,
    status: "LOCKED (L5/L1)",
  },
  {
    prn: "GLO-R12",
    name: "GLONASS-M",
    system: "GLONASS (RU)",
    elevationDeg: 29,
    azimuthDeg: 12,
    snrDbHz: 41.2,
    orbitKm: 19130,
    pseudoRangeKm: 24890.15,
    atomicClockDriftNs: +3.2,
    status: "TRACKING",
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
  const [showHowGpsWorks, setShowHowGpsWorks] = useState(false);
  const [showSatelliteRays, setShowSatelliteRays] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [simTick, setSimTick] = useState(0);

  // Tile definitions
  const TILE_CONFIGS: Record<MapTileLayer, { url: string; attribution: string; maxZoom: number }> =
    {
      satellite: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution:
          "Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
        maxZoom: 19,
      },
      hybrid: {
        url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        attribution: "Tiles &copy; Esri &mdash; World Imagery Satellite",
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

    // Initial Tile Layer
    const tileConfig = TILE_CONFIGS[activeLayer];
    const initialTileLayer = L.tileLayer(tileConfig.url, {
      attribution: tileConfig.attribution,
      maxZoom: tileConfig.maxZoom,
    }).addTo(map);
    tileLayerRef.current = initialTileLayer;

    mapInstanceRef.current = map;

    // Draw Corridors & Breadcrumbs
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

  // Draw or update Markers
  useEffect(() => {
    const L = leafletRef.current;
    if (!mapInstanceRef.current || !L) return;
    const map = mapInstanceRef.current;

    // Remove stale markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current.clear();

    DEFAULT_LOCATIONS.forEach((loc) => {
      // Calculate slight live drift for active vehicles to show real movement
      const isVehicle = loc.type === "active_vehicle";
      const currentLat = isVehicle ? loc.lat + Math.sin(simTick * 0.1) * 0.005 : loc.lat;
      const currentLng = isVehicle ? loc.lng + Math.cos(simTick * 0.1) * 0.005 : loc.lng;

      const customIcon = L.divIcon({
        className: "custom-gps-marker",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer group">
            <div class="absolute -inset-2 rounded-full ${
              loc.type === "active_vehicle" ? "bg-blue-500/30 animate-ping" : "bg-emerald-500/20"
            }"></div>
            <div class="size-9 rounded-xl shadow-lg flex items-center justify-center border-2 ${
              loc.type === "active_vehicle"
                ? "bg-blue-600 border-white text-white"
                : loc.type === "port"
                  ? "bg-teal-600 border-white text-white"
                  : "bg-amber-600 border-white text-white"
            }">
              ${
                loc.mode === "rail" || loc.id.includes("WDFC") || loc.id.includes("EDFC")
                  ? `<svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 15V9a2 2 0 012-2h12a2 2 0 012 2v6m-16 0v2a2 2 0 002 2h1m13-4v2a2 2 0 01-2 2h-1m-10 0h8m-8-9h8m-8 4h8M7 19l-3 3m13-3l3 3"/></svg>`
                  : loc.type === "port"
                    ? `<svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v20m0 0l-4-4m4 4l4-4M5 8h14"/></svg>`
                    : `<svg class="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 16v3a2 2 0 01-2 2H7a2 2 0 01-2-2v-3m14 0V9a2 2 0 00-2-2H7a2 2 0 00-2 2v7m14 0H5"/></svg>`
              }
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900/90 text-white font-mono text-[9px] px-1.5 py-0.5 shadow-md pointer-events-none font-semibold">
              ${loc.id}
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });

      const marker = L.marker([currentLat, currentLng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setSelectedLocation({
          ...loc,
          lat: currentLat,
          lng: currentLng,
        });
        map.flyTo([currentLat, currentLng], 12, { duration: 1.2 });
      });

      markersRef.current.set(loc.id, marker);
    });

    // RENDER EMERGENCY CRASH SOS & DISPATCH UNITS ON MAP
    if (activeIncident && activeIncident.status !== "RESOLVED") {
      // 1. Crash Site Marker (Flashing Red Beacon)
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
        {
          icon: crashIcon,
          zIndexOffset: 1000,
        },
      ).addTo(map);

      crashMarker.bindPopup(`
        <div style="min-width: 240px; font-family: system-ui, sans-serif; padding: 4px;">
          <div style="font-weight: 800; color: #dc2626; font-size: 13px; margin-bottom: 2px;">
            🚨 HIGH-G ACCIDENT DETECTED (${activeIncident.gForce}g)
          </div>
          <div style="font-size: 11px; color: #334155; margin-bottom: 6px;">
            <strong>Vehicle:</strong> ${activeIncident.vehicleNumber} (${activeIncident.vehicleType})<br/>
            <strong>Corridor:</strong> ${activeIncident.corridor}<br/>
            <strong>Driver:</strong> ${activeIncident.driverName} (${activeIncident.driverBloodGroup})<br/>
            <strong>Hazmat:</strong> ${activeIncident.hazmatCode || "None"}<br/>
            <strong>Cargo:</strong> ${activeIncident.cargoDescription}
          </div>
          <div style="background: #ecfdf5; border: 1px solid #a7f3d0; padding: 6px; border-radius: 6px; font-size: 10px; color: #065f46; margin-bottom: 6px;">
            📦 <strong>CARGO SAFEGUARD:</strong> ${activeIncident.cargoProtection.preservationStatus}<br/>
            🛡️ <strong>Airbag Dunnage:</strong> ${activeIncident.cargoProtection.airbagDunnage.kineticShockAbsorbedPct}% Shock Absorbed<br/>
            🧪 <strong>Atmosphere:</strong> ${activeIncident.cargoProtection.inertGasPurge.chamberOxygenPct}% O2 (${activeIncident.cargoProtection.inertGasPurge.gasType})<br/>
            ❄️ <strong>Cold-Chain:</strong> ${activeIncident.cargoProtection.telemetry.internalTempC}°C (Target: ${activeIncident.cargoProtection.coldChainAux.targetTemperatureC}°C)
          </div>
          <div style="background: #fef2f2; border: 1px solid #fca5a5; padding: 6px; border-radius: 6px; font-size: 10px; color: #991b1b; margin-bottom: 8px;">
            🚑 108 ALS Ambulance ETA: ${Math.ceil(activeIncident.ambulance.etaMinutes)} min<br/>
            🚛 Hazmat Salvage Unit ETA: ${Math.ceil(activeIncident.cargoProtection.salvageUnit.etaMinutes)} min<br/>
            🏥 ${activeIncident.hospital.name} (Trauma Bay Reserved)
          </div>
        </div>
      `);
      markersRef.current.set("CRASH_SITE_EMERGENCY", crashMarker);

      // 2. Ambulance Marker (Moving with Siren)
      const ambLat = activeIncident.ambulance.currentCoordinates.lat;
      const ambLng = activeIncident.ambulance.currentCoordinates.lng;
      const ambIcon = L.divIcon({
        className: "custom-emergency-amb-marker",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-2 rounded-full bg-emerald-500/40 animate-ping"></div>
            <div class="size-10 rounded-2xl bg-emerald-600 text-white border-2 border-white shadow-xl flex items-center justify-center">
              <svg class="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3"/>
              </svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 shadow-md border border-emerald-500 font-bold">
              🚑 108 ALS (ETA ${Math.ceil(activeIncident.ambulance.etaMinutes)}m)
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const ambMarker = L.marker([ambLat, ambLng], {
        icon: ambIcon,
        zIndexOffset: 900,
      }).addTo(map);
      markersRef.current.set("AMBULANCE_108_DISPATCH", ambMarker);

      // 3. Emergency Siren Navigation Polyline (Ambulance -> Crash Site)
      const sirenRouteCoords: [number, number][] = [
        [ambLat, ambLng],
        [
          (ambLat + activeIncident.coordinates.lat) / 2 + 0.002,
          (ambLng + activeIncident.coordinates.lng) / 2 - 0.001,
        ],
        [activeIncident.coordinates.lat, activeIncident.coordinates.lng],
      ];
      const sirenPolyline = L.polyline(sirenRouteCoords, {
        color: "#dc2626",
        weight: 4,
        dashArray: "6, 6",
        opacity: 0.95,
      }).addTo(map);
      sirenPolyline.bindTooltip("🚑 108 Emergency Ambulance Siren Route", { sticky: true });
      polylinesRef.current.push(sirenPolyline);

      // 4. Cargo Salvage & Reefer Recovery Vehicle Marker
      const salvLat = activeIncident.cargoProtection.salvageUnit.coordinates.lat;
      const salvLng = activeIncident.cargoProtection.salvageUnit.coordinates.lng;
      const salvIcon = L.divIcon({
        className: "custom-emergency-salvage-marker",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="absolute -inset-2 rounded-full bg-cyan-500/40 animate-ping"></div>
            <div class="size-10 rounded-2xl bg-cyan-600 text-white border-2 border-white shadow-xl flex items-center justify-center">
              <svg class="size-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
              </svg>
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 shadow-md border border-cyan-500 font-bold">
              📦 Salvage Reefer (ETA ${Math.ceil(activeIncident.cargoProtection.salvageUnit.etaMinutes)}m)
            </div>
          </div>
        `,
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const salvMarker = L.marker([salvLat, salvLng], {
        icon: salvIcon,
        zIndexOffset: 850,
      }).addTo(map);
      markersRef.current.set("SALVAGE_REEFER_DISPATCH", salvMarker);

      // Salvage Polyline (Cyan dashed route)
      const salvRouteCoords: [number, number][] = [
        [salvLat, salvLng],
        [
          (salvLat + activeIncident.coordinates.lat) / 2 - 0.002,
          (salvLng + activeIncident.coordinates.lng) / 2 + 0.001,
        ],
        [activeIncident.coordinates.lat, activeIncident.coordinates.lng],
      ];
      const salvPolyline = L.polyline(salvRouteCoords, {
        color: "#0891b2",
        weight: 4,
        dashArray: "4, 6",
        opacity: 0.9,
      }).addTo(map);
      salvPolyline.bindTooltip("📦 Hazmat Cargo Salvage & Reefer Recovery Route", { sticky: true });
      polylinesRef.current.push(salvPolyline);

      // 5. Hospital Pin Marker
      const hospIcon = L.divIcon({
        className: "custom-emergency-hosp-marker",
        html: `
          <div class="relative flex items-center justify-center cursor-pointer">
            <div class="size-9 rounded-xl bg-blue-600 text-white border-2 border-white shadow-lg flex items-center justify-center font-bold">
              🏥
            </div>
            <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 text-white font-mono text-[9px] px-1.5 py-0.5 shadow-md border border-blue-500 font-bold">
              ${activeIncident.hospital.name.split(" ")[0]} Trauma
            </div>
          </div>
        `,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
      });
      const hospMarker = L.marker(
        [activeIncident.hospital.coordinates.lat, activeIncident.hospital.coordinates.lng],
        { icon: hospIcon, zIndexOffset: 800 },
      ).addTo(map);
      markersRef.current.set("HOSPITAL_TRAUMA_BAY", hospMarker);
    }
  }, [simTick, isClientReady, activeIncident]);

  // Simulation timer for live coordinate stream
  useEffect(() => {
    const timer = setInterval(() => {
      setSimTick((t) => t + 1);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const drawCorridors = (map: LeafletType.Map, L: typeof LeafletType) => {
    // Clean old
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];

    // Western DFC Route Path
    const wdfcCoords: [number, number][] = [
      [28.5284, 77.5682], // Dadri ICD
      [28.1983, 76.6189], // Rewari
      [27.553, 76.6346], // Alwar
      [26.9124, 75.7873], // Phulera / Jaipur
      [25.3407, 74.6313], // Bhilwara
      [24.5854, 73.7125], // Udaipur
      [23.0225, 72.5714], // Ahmedabad
      [22.3072, 73.1812], // Vadodara
      [21.1702, 72.8311], // Surat
      [19.076, 73.005], // Navi Mumbai
      [18.9498, 72.9515], // JNPT
    ];

    const wdfcLine = L.polyline(wdfcCoords, {
      color: "#2563eb",
      weight: 3.5,
      dashArray: "8, 6",
      opacity: 0.9,
    }).addTo(map);
    wdfcLine.bindTooltip("Western Dedicated Freight Corridor (1,504 km Double-Stack Electrified)", {
      sticky: true,
      className: "font-mono text-xs font-semibold",
    });
    polylinesRef.current.push(wdfcLine);

    // Eastern DFC Route Path
    const edfcCoords: [number, number][] = [
      [30.901, 75.8573], // Ludhiana
      [29.9695, 76.8783], // Kurukshetra
      [28.7041, 77.1025], // Khurja
      [27.1767, 78.0081], // Agra
      [26.4499, 80.3319], // Kanpur
      [25.3176, 82.9739], // Varanasi / DDU
      [24.7914, 85.0002], // Gaya / Sasaram
      [23.7957, 86.4304], // Dhanbad
      [22.6853, 88.2917], // Dankuni Kolkata
    ];

    const edfcLine = L.polyline(edfcCoords, {
      color: "#059669",
      weight: 3.5,
      dashArray: "8, 6",
      opacity: 0.9,
    }).addTo(map);
    edfcLine.bindTooltip("Eastern Dedicated Freight Corridor (1,875 km Heavy Haul Coal/Steel)", {
      sticky: true,
      className: "font-mono text-xs font-semibold",
    });
    polylinesRef.current.push(edfcLine);
  };

  // Real Browser GPS Geolocation Lookup
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
        if (mapInstanceRef.current && L) {
          const map = mapInstanceRef.current;

          // Remove previous user marker
          if (userMarkerRef.current) userMarkerRef.current.remove();
          if (userCircleRef.current) userCircleRef.current.remove();

          const userIcon = L.divIcon({
            className: "user-gps-pin",
            html: `
              <div class="relative flex items-center justify-center">
                <div class="size-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg border-2 border-white ring-4 ring-emerald-500/30 animate-pulse">
                  <div class="size-2 rounded-full bg-white"></div>
                </div>
              </div>
            `,
            iconSize: [24, 24],
            iconAnchor: [12, 12],
          });

          userMarkerRef.current = L.marker([latitude, longitude], { icon: userIcon }).addTo(map);
          userCircleRef.current = L.circle([latitude, longitude], {
            radius: accuracy || 50,
            color: "#10b981",
            fillColor: "#10b981",
            fillOpacity: 0.15,
            weight: 1.5,
          }).addTo(map);

          map.flyTo([latitude, longitude], 13, { duration: 1.5 });
        }
      },
      (err) => {
        setIsLocating(false);
        setGpsError(`Unable to retrieve GPS: ${err.message}`);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  const focusLocation = (loc: GpsLocation) => {
    setSelectedLocation(loc);
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([loc.lat, loc.lng], 13, { duration: 1.2 });
    }
  };

  return (
    <div
      className={`relative flex flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface shadow-md ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-none" : "min-h-[720px] w-full"
      }`}
    >
      {/* Top GPS Status & Controls Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/80 bg-surface px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200 shadow-xs">
            <Satellite className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">
                Real GPS Telemetry & Satellite Spatial Map
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 font-mono text-[10px] font-bold text-emerald-700">
                <span className="size-1.5 rounded-full bg-emerald-600 animate-ping"></span>
                GNSS 3D-Fix (NavIC + GPS)
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              Direct high-resolution satellite imagery, sub-meter positioning, and atomic clock
              trilateration
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Layer Selector */}
          <div className="flex items-center rounded-xl border border-border/80 bg-surface-2 p-1 text-xs">
            {(
              [
                {
                  id: "hybrid" as const,
                  label: "🛰️ Satellite",
                  title: "High-Res Aerial Satellite",
                },
                { id: "streets" as const, label: "🗺️ Streets", title: "Vector Rail & Road Map" },
                { id: "dark" as const, label: "🏙️ Tactical", title: "Clean High-Contrast" },
              ] as const
            ).map((l) => (
              <button
                key={l.id}
                onClick={() => setActiveLayer(l.id)}
                className={`rounded-lg px-2.5 py-1 font-semibold transition ${
                  activeLayer === l.id
                    ? "bg-surface text-primary shadow-xs font-bold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={l.title}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Emergency Crash Focus Button */}
          {activeIncident && activeIncident.status !== "RESOLVED" && (
            <button
              onClick={() => {
                if (mapInstanceRef.current) {
                  mapInstanceRef.current.flyTo(
                    [activeIncident.coordinates.lat, activeIncident.coordinates.lng],
                    14,
                    { duration: 1.5 },
                  );
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-red-500 bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-md hover:bg-red-700 transition animate-pulse"
              title="Focus map on crash site"
            >
              <AlertOctagon className="size-3.5" />
              <span>Center Crash Site ({activeIncident.vehicleNumber})</span>
            </button>
          )}

          {/* Emergency 108 Call Trigger Button */}
          {activeIncident && activeIncident.status !== "RESOLVED" && (
            <>
              <button
                onClick={() => setCallModalTarget("ambulance")}
                className="flex items-center gap-1.5 rounded-xl border border-red-300 bg-red-50 px-3 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 transition shadow-xs"
              >
                <Ambulance className="size-3.5" />
                <span>Call 108</span>
              </button>

              <button
                onClick={() => setCallModalTarget("cargo_salvage")}
                className="flex items-center gap-1.5 rounded-xl border border-cyan-300 bg-cyan-50 px-3 py-1.5 text-xs font-bold text-cyan-700 hover:bg-cyan-100 transition shadow-xs"
                title="Direct VoIP Bridge to Reefer Recovery & Hazmat Salvage Unit"
              >
                <Package className="size-3.5" />
                <span>Call Cargo Salvage</span>
              </button>
            </>
          )}

          {/* Locate Me (Real Geolocation) */}
          <button
            onClick={handleLocateUser}
            disabled={isLocating}
            className="flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 transition shadow-xs disabled:opacity-50"
            title="Query real device GPS coordinates"
          >
            <Crosshair className={`size-3.5 ${isLocating ? "animate-spin" : ""}`} />
            <span>{isLocating ? "Acquiring Fix..." : "Locate My Device"}</span>
          </button>

          {/* How GPS Works Modal Toggle */}
          <button
            onClick={() => setShowHowGpsWorks(!showHowGpsWorks)}
            className="flex items-center gap-1.5 rounded-xl border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs"
          >
            <Info className="size-3.5" />
            <span>How GPS Works</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="grid size-8 place-items-center rounded-xl border border-border/80 bg-surface-2 text-muted-foreground hover:text-foreground hover:bg-surface transition"
            title="Toggle fullscreen map"
          >
            {isFullscreen ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
          </button>
        </div>
      </div>

      {/* GPS Error Alert */}
      {gpsError && (
        <div className="bg-rose-50 border-b border-rose-200 px-4 py-2 text-xs font-semibold text-rose-700 flex items-center justify-between">
          <span>⚠️ {gpsError}</span>
          <button onClick={() => setGpsError(null)} className="underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Map + Side HUD Container */}
      <div className="relative flex flex-1 flex-col lg:flex-row overflow-hidden">
        {/* Leaflet Interactive Map Viewport */}
        <div className="relative h-[480px] lg:h-auto lg:flex-1 w-full bg-slate-950">
          <div ref={mapContainerRef} className="h-full w-full" />

          {!isClientReady && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-950 text-slate-300 gap-3 z-[300]">
              <Satellite className="size-8 animate-pulse text-blue-400" />
              <div className="font-mono text-xs font-semibold tracking-wider text-slate-300">
                CONNECTING TO GNSS SATELLITE CONSTELLATIONS...
              </div>
            </div>
          )}

          {/* Real-Time GNSS Triangulation Overlay Widget (Top Left Floating) */}
          <div className="absolute top-4 left-4 z-[400] max-w-xs rounded-xl border border-border/90 bg-surface/95 p-3.5 shadow-lg backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-border/60 pb-2">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-bold text-primary">
                <Radio className="size-3.5 animate-pulse text-blue-600" />
                <span>ACTIVE GNSS FIX</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                HDOP: 0.68
              </span>
            </div>

            <div className="mt-2 space-y-1.5 font-mono text-[11px]">
              <div className="flex justify-between text-muted-foreground">
                <span>Constellation:</span>
                <span className="font-bold text-foreground">NavIC + GPS Dual-Band</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Locked Satellites:</span>
                <span className="font-bold text-emerald-700">14 of 22 visible</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Differential Corr.:</span>
                <span className="font-bold text-blue-700">ISRO GAGAN SBAS</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Horizontal Accuracy:</span>
                <span className="font-bold text-foreground">± 0.42 m (Sub-meter)</span>
              </div>
            </div>

            {/* Quick Toggle to highlight satellite links */}
            <div className="mt-2.5 pt-2 border-t border-border/60 flex items-center justify-between text-[10px]">
              <span className="text-muted-foreground">Triangulation Rays:</span>
              <button
                onClick={() => setShowSatelliteRays(!showSatelliteRays)}
                className={`px-2 py-0.5 rounded font-bold transition ${
                  showSatelliteRays
                    ? "bg-blue-600 text-white"
                    : "bg-surface-2 text-muted-foreground"
                }`}
              >
                {showSatelliteRays ? "Visible" : "Hidden"}
              </button>
            </div>
          </div>

          {/* Quick Vehicle / Corridor Selector Strip (Bottom Center Floating) */}
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 z-[400] flex max-w-xl flex-wrap items-center gap-2 rounded-2xl border border-border/90 bg-surface/95 p-2 shadow-xl backdrop-blur-md">
            <span className="text-[11px] font-bold text-muted-foreground px-2">Jump to:</span>
            {DEFAULT_LOCATIONS.map((loc) => (
              <button
                key={loc.id}
                onClick={() => focusLocation(loc)}
                className={`flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold transition ${
                  selectedLocation?.id === loc.id
                    ? "bg-primary text-primary-foreground shadow-xs font-bold"
                    : "bg-surface-2 text-muted-foreground hover:text-foreground hover:bg-surface"
                }`}
              >
                {loc.mode === "rail" || loc.type === "rail_hub" ? (
                  <Train className="size-3.5" />
                ) : loc.type === "port" ? (
                  <Anchor className="size-3.5" />
                ) : (
                  <Truck className="size-3.5" />
                )}
                <span>{loc.name.split("(")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Exact Coordinates & Satellite Telemetry Inspector */}
        <div className="w-full lg:w-96 border-t lg:border-t-0 lg:border-l border-border/80 bg-surface-2/70 p-4 sm:p-5 flex flex-col space-y-4 overflow-y-auto max-h-[600px] lg:max-h-none">
          {/* Selected Location / Device Details */}
          {selectedLocation ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary font-mono">
                        {selectedLocation.type.replace("_", " ")}
                      </span>
                      <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[9px] font-bold text-blue-700 border border-blue-200">
                        {selectedLocation.id}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-foreground mt-0.5">
                      {selectedLocation.name}
                    </h3>
                  </div>
                </div>

                {/* Exact Geospatial Coordinates Panel */}
                <div className="rounded-xl bg-slate-900 p-3 text-white font-mono space-y-2 text-xs">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] border-b border-slate-800 pb-1">
                    <span>WGS-84 GEODETIC COORDINATES</span>
                    <span className="text-emerald-400 font-bold">● LIVE FIX</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-[10px] text-slate-400">LATITUDE</div>
                      <div className="text-sm font-bold text-amber-300">
                        {selectedLocation.lat.toFixed(6)}° N
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-400">LONGITUDE</div>
                      <div className="text-sm font-bold text-amber-300">
                        {selectedLocation.lng.toFixed(6)}° E
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-800 text-[11px]">
                    <div>
                      <span className="text-[9px] text-slate-400 block">ALTITUDE</span>
                      <span className="font-bold text-sky-300">
                        {selectedLocation.altitudeM} m MSL
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">SPEED</span>
                      <span className="font-bold text-emerald-400">
                        {selectedLocation.speedKmh ? `${selectedLocation.speedKmh} km/h` : "Static"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] text-slate-400 block">HEADING</span>
                      <span className="font-bold text-purple-300">
                        {selectedLocation.headingDeg ? `${selectedLocation.headingDeg}°` : "N/A"}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Satellite Quality Metrics */}
                <div className="space-y-2">
                  <div className="text-xs font-bold text-foreground flex items-center justify-between">
                    <span>🛰️ GNSS Receiver Quality</span>
                    <span className="text-[10px] font-bold text-blue-700">
                      {selectedLocation.satelliteFix.constellation}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded-lg bg-surface-2 p-2 border border-border/70">
                      <div className="text-[10px] text-muted-foreground">SVs Used / Visible</div>
                      <div className="font-mono font-bold text-foreground mt-0.5">
                        {selectedLocation.satelliteFix.satellitesUsed} /{" "}
                        {selectedLocation.satelliteFix.satellitesVisible}
                      </div>
                    </div>
                    <div className="rounded-lg bg-surface-2 p-2 border border-border/70">
                      <div className="text-[10px] text-muted-foreground">Signal Carrier/Noise</div>
                      <div className="font-mono font-bold text-emerald-700 mt-0.5">
                        {selectedLocation.satelliteFix.carrierNoiseDbHz} dB-Hz
                      </div>
                    </div>
                  </div>

                  <div className="rounded-lg bg-surface-2 p-2.5 border border-border/70 text-xs flex items-center justify-between">
                    <span className="text-muted-foreground">Correction Source:</span>
                    <span className="font-mono font-bold text-foreground">
                      {selectedLocation.satelliteFix.correctionSource}
                    </span>
                  </div>
                </div>

                {/* Cargo Consignment Manifest if Vehicle */}
                {selectedLocation.cargoDetails && (
                  <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs space-y-1.5">
                    <div className="font-bold text-blue-900 flex items-center justify-between">
                      <span>📦 Container Consignment</span>
                      <span className="font-mono text-[10px] text-blue-700">
                        {selectedLocation.cargoDetails.containerId}
                      </span>
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      From:{" "}
                      <strong className="text-foreground">
                        {selectedLocation.cargoDetails.origin}
                      </strong>
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      To:{" "}
                      <strong className="text-foreground">
                        {selectedLocation.cargoDetails.destination}
                      </strong>
                    </div>
                    <div className="text-muted-foreground text-[11px]">
                      Load:{" "}
                      <strong className="text-foreground">
                        {selectedLocation.cargoDetails.commodity} (
                        {selectedLocation.cargoDetails.weightTons} Tons)
                      </strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Real Browser GPS Coordinate Readout (If Available) */}
              {userGps && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-emerald-900">
                    <span className="flex items-center gap-1.5">
                      <Crosshair className="size-4 text-emerald-600" /> Your Device GPS (Live)
                    </span>
                    <span className="text-[10px] font-mono text-emerald-700">
                      ±{Math.round(userGps.accuracy)}m Accuracy
                    </span>
                  </div>
                  <div className="font-mono text-[11px] text-emerald-800 grid grid-cols-2 gap-1 bg-white p-2 rounded-lg border border-emerald-200">
                    <div>Lat: {userGps.lat.toFixed(5)}°</div>
                    <div>Lng: {userGps.lng.toFixed(5)}°</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="grid h-48 place-items-center text-center text-xs text-muted-foreground">
              Select any waypoint or freight vehicle on the map to inspect live satellite telemetry.
            </div>
          )}

          {/* Live Space-Segment Satellites In View Table */}
          <div className="rounded-xl border border-border/80 bg-surface p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <Satellite className="size-4 text-primary" />
                <span>Satellites Overhead (Orbit Telemetry)</span>
              </div>
              <span className="font-mono text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                6 Locked
              </span>
            </div>

            <div className="space-y-2">
              {LIVE_SATELLITES.map((sat) => (
                <div
                  key={sat.prn}
                  className="rounded-lg border border-border/70 bg-surface-2 p-2 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-foreground text-[11px]">
                      {sat.prn} ({sat.system})
                    </span>
                    <span className="text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200">
                      {sat.snrDbHz} dB-Hz
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-muted-foreground">
                    <div>Elev: {sat.elevationDeg}°</div>
                    <div>Azim: {sat.azimuthDeg}°</div>
                    <div>ToF: {(sat.pseudoRangeKm / 299.792).toFixed(1)} ms</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* "How GPS & Satellite Triangulation Works" Interactive Modal */}
      {showHowGpsWorks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="grid size-9 place-items-center rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
                  <Satellite className="size-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground">
                    How GPS & Satellite Triangulation Works
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    The physics, atomic time synchronization, and geometric trilateration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowHowGpsWorks(false)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {/* Step by Step Visual Explanations */}
            <div className="space-y-4 text-xs leading-relaxed text-foreground">
              {/* Step 1 */}
              <div className="rounded-xl border border-border/80 bg-surface-2 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <span className="grid size-6 place-items-center rounded-full bg-blue-600 text-white text-xs">
                    1
                  </span>
                  <span>Atomic Clocks & Speed-of-Light Time-of-Flight (ToF)</span>
                </div>
                <p className="text-muted-foreground">
                  Each satellite (NavIC, GPS, Galileo) carries ultra-precise onboard Rubidium /
                  Cesium atomic clocks accurate to nanoseconds. Satellites continuously broadcast
                  their exact orbital location (Ephemeris) and the precise transmission timestamp.
                </p>
                <div className="rounded-lg bg-surface p-2.5 font-mono text-[11px] text-blue-900 border border-blue-200">
                  Distance = Speed of Light (c ≈ 299,792,458 m/s) × Signal Travel Time (Δt)
                </div>
              </div>

              {/* Step 2 */}
              <div className="rounded-xl border border-border/80 bg-surface-2 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-blue-700">
                  <span className="grid size-6 place-items-center rounded-full bg-blue-600 text-white text-xs">
                    2
                  </span>
                  <span>Spherical Geometric Trilateration (Why 4 Satellites?)</span>
                </div>
                <p className="text-muted-foreground">
                  Distance measurement from one satellite places the receiver somewhere on an
                  enormous sphere around that satellite:
                </p>
                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                  <li>
                    <strong>1 Satellite</strong> gives a distance sphere.
                  </li>
                  <li>
                    <strong>2 Satellites</strong> intersect into a 2D circle of possible locations.
                  </li>
                  <li>
                    <strong>3 Satellites</strong> narrow down the intersection to exactly 2 points
                    on Earth (one of which is discarded as outside our planet).
                  </li>
                  <li>
                    <strong>4th Satellite</strong> is mandatory to solve for receiver local clock
                    drift ($\Delta t_{bias}$), providing an exact 3D Fix (Latitude, Longitude, and
                    Altitude).
                  </li>
                </ul>
              </div>

              {/* Step 3 */}
              <div className="rounded-xl border border-border/80 bg-surface-2 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-emerald-700">
                  <span className="grid size-6 place-items-center rounded-full bg-emerald-600 text-white text-xs">
                    3
                  </span>
                  <span>NavIC & GAGAN (India&apos;s Sovereign Satellite System)</span>
                </div>
                <p className="text-muted-foreground">
                  India uses <strong>NavIC (Navigation with Indian Constellation)</strong> launched
                  by ISRO. Because 4 of NavIC&apos;s satellites sit in Geostationary (GEO) orbit
                  permanently over the Indian Ocean, signals suffer zero Doppler shift over India,
                  offering <strong>sub-meter accuracy</strong> for railway freight rakes and
                  container tracking along the Dedicated Freight Corridors.
                </p>
              </div>

              {/* Step 4 */}
              <div className="rounded-xl border border-border/80 bg-surface-2 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-bold text-amber-700">
                  <span className="grid size-6 place-items-center rounded-full bg-amber-600 text-white text-xs">
                    4
                  </span>
                  <span>Atmospheric Delay & RTK Differential Correction</span>
                </div>
                <p className="text-muted-foreground">
                  Signals travel through the Ionosphere and Troposphere, slightly slowing down.
                  Ground RTK (Real-Time Kinematic) base stations placed along the DFC track
                  continuously calculate these atmospheric errors and broadcast instant
                  micro-corrections over MQTT, bringing positional accuracy down to{" "}
                  <strong>±2 centimeters</strong>.
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowHowGpsWorks(false)}
                className="rounded-xl bg-primary px-5 py-2 text-xs font-bold text-primary-foreground hover:brightness-110 transition"
              >
                Close & Return to Map
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Emergency Call Modal */}
      {callModalTarget && activeIncident && (
        <EmergencyCallModal
          target={callModalTarget}
          incident={activeIncident}
          onClose={() => setCallModalTarget(null)}
        />
      )}
    </div>
  );
}
