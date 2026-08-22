import React, { useEffect, useRef, useState } from "react";
import type * as LeafletType from "leaflet";
import {
  Maximize2,
  RefreshCw,
  Navigation,
  Train,
  Truck,
  MapPin,
  Building2,
  Layers,
  Sparkles,
  Compass,
  Radio,
  Eye,
  Gauge,
  Clock,
  User,
  PhoneCall,
  ShieldCheck,
  Pause,
  Play,
  Anchor,
} from "lucide-react";
import { CargoShipment } from "@/types/cargo-portal";

interface CargoPortalMapProps {
  shipment: CargoShipment;
  onRefreshLocation: () => void;
  isRefreshing?: boolean;
}

// Helper to calculate polyline interpolation & bearing heading angle
function interpolatePolyline(path: [number, number][], progress: number) {
  if (!path || path.length < 2)
    return {
      lat: 26.9,
      lng: 75.7,
      headingDeg: 0,
      remainingKm: 0,
      totalKm: 0,
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

  return { lat, lng, headingDeg, remainingKm, totalKm };
}

export function CargoPortalMap({
  shipment,
  onRefreshLocation,
  isRefreshing = false,
}: CargoPortalMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const leafletRef = useRef<typeof LeafletType | null>(null);
  const mapRef = useRef<LeafletType.Map | null>(null);
  const movingMarkerRef = useRef<LeafletType.Marker | null>(null);
  const polylinesRef = useRef<LeafletType.Polyline[]>([]);
  const stationMarkersRef = useRef<LeafletType.Marker[]>([]);

  const [isClientReady, setIsClientReady] = useState<boolean>(false);
  const [activeLayer, setActiveLayer] = useState<"standard" | "satellite" | "railway">("standard");

  // Peripheral Filter Toggles
  const [showRoadHubs, setShowRoadHubs] = useState<boolean>(true);
  const [showRailSiding, setShowRailSiding] = useState<boolean>(true);

  // Swiggy/Ola Style Live Trajectory Camera Lock & Movement Ticker
  const [isCameraLocked, setIsCameraLocked] = useState<boolean>(false);
  const [simProgress, setSimProgress] = useState<number>(0.55); // 55% initial progress along route
  const [isLiveMoving, setIsLiveMoving] = useState<boolean>(true);

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

  // Initialize Leaflet Map
  useEffect(() => {
    if (!isClientReady || !mapContainerRef.current) return;
    const L = leafletRef.current;
    if (!L) return;

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const map = L.map(mapContainerRef.current, {
      center: [shipment.currentGps.lat, shipment.currentGps.lng],
      zoom: 6,
      zoomControl: false,
      attributionControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);
    mapRef.current = map;

    let tileUrl = "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    if (activeLayer === "satellite") {
      tileUrl =
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}";
    } else if (activeLayer === "railway") {
      tileUrl = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
    }

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      subdomains: "abcd",
    }).addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [isClientReady, activeLayer]);

  // High Frequency Smooth Ticker for Freight Movement
  useEffect(() => {
    if (!isLiveMoving) return;
    const interval = setInterval(() => {
      setSimProgress((prev) => (prev + 0.0008) % 1);
    }, 120);
    return () => clearInterval(interval);
  }, [isLiveMoving]);

  // Draw Route Polylines and Dynamic Moving Marker
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    // Clear previous elements
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];

    // 1. Draw Railway Primary Route (Blue Glow Track)
    if (shipment.railRouteCoords && shipment.railRouteCoords.length > 1) {
      const glowLine = L.polyline(shipment.railRouteCoords, {
        color: "#3b82f6",
        weight: 8,
        opacity: 0.25,
      }).addTo(map);
      polylinesRef.current.push(glowLine);

      const railLine = L.polyline(shipment.railRouteCoords, {
        color: "#1d4ed8",
        weight: 4,
        opacity: 0.9,
        dashArray: "8, 4",
      }).addTo(map);
      railLine.bindTooltip(`🚆 ${shipment.train.trainName} (${shipment.train.trainNumber})`, {
        sticky: true,
      });
      polylinesRef.current.push(railLine);
    }

    // 2. Draw Road Drayage Last-Mile Route (Cyan/Amber Dashed)
    if (shipment.roadDrayageCoords && shipment.roadDrayageCoords.length > 1) {
      const roadLine = L.polyline(shipment.roadDrayageCoords, {
        color: "#0891b2",
        weight: 4,
        dashArray: "4, 6",
        opacity: 0.85,
      }).addTo(map);
      roadLine.bindTooltip(`drayage 🚛 Last-Mile Road Expressway Drayage Route`, { sticky: true });
      polylinesRef.current.push(roadLine);
    }

    // 3. Origin Marker
    const originIcon = L.divIcon({
      className: "custom-origin-pin",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="size-8 rounded-full bg-emerald-600 text-white border-2 border-white shadow-lg flex items-center justify-center">
            <svg class="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7"/></svg>
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 text-emerald-300 font-mono text-[9px] px-1.5 py-0.5 shadow border border-emerald-500 font-bold">
            ORIGIN: ${shipment.origin.city}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const originMarker = L.marker([shipment.origin.lat, shipment.origin.lng], {
      icon: originIcon,
    }).addTo(map);
    stationMarkersRef.current.push(originMarker);

    // 4. Destination Marker
    const destIcon = L.divIcon({
      className: "custom-dest-pin",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="size-8 rounded-full bg-red-600 text-white border-2 border-white shadow-lg flex items-center justify-center">
            <svg class="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/></svg>
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 text-red-300 font-mono text-[9px] px-1.5 py-0.5 shadow border border-red-500 font-bold">
            DESTINATION: ${shipment.destination.city}
          </div>
        </div>
      `,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const destMarker = L.marker([shipment.destination.lat, shipment.destination.lng], {
      icon: destIcon,
    }).addTo(map);
    stationMarkersRef.current.push(destMarker);

    // 5. Intermediate Peripherals & Stations
    shipment.intermediateWaypoints.forEach((wp) => {
      if (wp.type === "current_gps") return;

      const isRoadHub = wp.type === "road_office";
      if (isRoadHub && !showRoadHubs) return;
      if (!isRoadHub && !showRailSiding) return;

      const stationIcon = L.divIcon({
        className: "custom-station-pin",
        html: `
          <div class="group relative flex items-center justify-center cursor-pointer">
            <div class="size-3.5 rounded-full ${
              isRoadHub ? "bg-amber-500 border-white" : "bg-blue-600 border-white"
            } border-2 shadow-md"></div>
            <div class="hidden group-hover:block absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 text-white font-mono text-[8px] px-1 py-0.5 z-30">
              ${wp.name}
            </div>
          </div>
        `,
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const sm = L.marker([wp.lat, wp.lng], { icon: stationIcon }).addTo(map);
      stationMarkersRef.current.push(sm);
    });

    // 6. CONTINUOUS SMOOTH MOVING FREIGHT MARKER (Ola / Swiggy Style)
    const routeCoords = shipment.railRouteCoords || [];
    const currentLocInterpolated = interpolatePolyline(routeCoords, simProgress);

    const currentLat = currentLocInterpolated.lat;
    const currentLng = currentLocInterpolated.lng;
    const currentHeading = currentLocInterpolated.headingDeg;
    const remainingKm = Math.round(currentLocInterpolated.remainingKm);

    if (isCameraLocked) {
      map.panTo([currentLat, currentLng], { animate: true, duration: 0.2 });
    }

    const isTruck = shipment.status === "OUT_FOR_DELIVERY";
    const movingIcon = L.divIcon({
      className: "custom-moving-train-pin",
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="absolute -inset-3 rounded-full bg-blue-500/40 animate-ping"></div>
          <div class="size-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white border-2 border-white shadow-2xl flex items-center justify-center ring-4 ring-cyan-400/50" style="transform: rotate(${currentHeading}deg);">
            ${
              isTruck
                ? `<svg class="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2m-6 0a1 1 0 001-1v-3"/></svg>`
                : `<svg class="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 15V9a2 2 0 012-2h12a2 2 0 012 2v6m-16 0v2a2 2 0 002 2h1m13-4v2a2 2 0 01-2 2h-1m-10 0h8m-8-9h8m-8 4h8M7 19l-3 3m13-3l3 3"/></svg>`
            }
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-blue-900 text-white font-mono text-[9px] px-2 py-0.5 shadow-lg border border-blue-400 font-bold flex items-center gap-1">
            <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>LIVE: ${remainingKm} km to Destination (${shipment.currentSpeedKmh} km/h)</span>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const liveMarker = L.marker([currentLat, currentLng], {
      icon: movingIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    movingMarkerRef.current = liveMarker;
  }, [isClientReady, shipment, showRoadHubs, showRailSiding, simProgress, isCameraLocked]);

  // Center on Live Current Position
  const handleViewLiveLocation = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([shipment.currentGps.lat, shipment.currentGps.lng], 9, {
      duration: 1.2,
    });
  };

  // Reset to full route bounds
  const handleFitRoute = () => {
    const L = leafletRef.current;
    if (!L || !mapRef.current || !shipment.railRouteCoords) return;
    mapRef.current.fitBounds(L.polyline(shipment.railRouteCoords).getBounds(), {
      padding: [50, 50],
    });
  };

  const routeCoords = shipment.railRouteCoords || [];
  const currentLocInterpolated = interpolatePolyline(routeCoords, simProgress);

  return (
    <div className="relative rounded-2xl border border-border bg-surface overflow-hidden shadow-md flex flex-col">
      {/* Map Control Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 bg-surface-2/80 px-4 py-3 backdrop-blur-md z-10">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600 border border-blue-500/20">
            <Compass className="size-4.5 text-blue-600" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-foreground">
                Swiggy / Ola Style Multimodal Live Delivery Tracking
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.2 font-mono text-[9px] font-bold text-emerald-600 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                NavIC RTK Live
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Consignment: <strong className="text-foreground">{shipment.trackingNumber}</strong> ·
              Current Node: {shipment.currentLocationName}
            </p>
          </div>
        </div>

        {/* Map Quick Action Buttons & Peripheral Toggles */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Road Peripherals */}
          <button
            onClick={() => setShowRoadHubs(!showRoadHubs)}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
              showRoadHubs
                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle Road Transport Hubs & Toll Checkposts"
          >
            <Truck className="size-3.5" />
            <span className="text-[11px]">Road Peripherals</span>
          </button>

          {/* Toggle Rail Peripherals */}
          <button
            onClick={() => setShowRailSiding(!showRailSiding)}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
              showRailSiding
                ? "bg-indigo-500/10 border-indigo-500/30 text-indigo-700 dark:text-indigo-400"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle Railway Marshalling Sidings & ABS Signals"
          >
            <Train className="size-3.5" />
            <span className="text-[11px]">Rail Peripherals</span>
          </button>

          {/* Live Camera Follow Lock */}
          <button
            onClick={() => setIsCameraLocked(!isCameraLocked)}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-bold transition ${
              isCameraLocked
                ? "bg-cyan-600 text-white border-cyan-400 shadow-xs animate-pulse"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Eye className="size-3.5" />
            <span>{isCameraLocked ? "Camera Locked" : "Follow Vehicle"}</span>
          </button>

          {/* Refresh Location Button */}
          <button
            onClick={onRefreshLocation}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          {/* Fit Full Route Button */}
          <button
            onClick={handleFitRoute}
            className="flex size-8 items-center justify-center rounded-xl border border-border bg-surface text-muted-foreground hover:bg-surface-2 hover:text-foreground transition"
            title="Fit Full Route Extents"
          >
            <Maximize2 className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Map Canvas Container */}
      <div className="relative w-full h-[480px] sm:h-[540px] bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* SWIGGY/OLA STYLE LIVE DELIVERY TRAJECTORY FLOATING HUD */}
        <div className="absolute top-4 right-4 z-1000 w-72 sm:w-80 rounded-2xl border border-blue-500/30 bg-surface/95 p-3.5 shadow-2xl backdrop-blur-xl space-y-2.5 pointer-events-auto">
          <div className="flex items-center justify-between border-b border-border/60 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-lg bg-blue-600 text-white font-bold text-xs">
                LIVE
              </span>
              <span className="font-extrabold text-xs text-foreground">Delivery Trajectory</span>
            </div>
            <span className="text-[10px] font-mono font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
              On Schedule
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-xl bg-surface-2 p-2 border border-border">
              <div className="text-[9px] font-semibold text-muted-foreground flex items-center gap-1">
                <Gauge className="size-3 text-blue-600" />
                <span>Speed</span>
              </div>
              <div className="text-sm font-black text-foreground font-mono mt-0.5">
                {shipment.currentSpeedKmh} km/h
              </div>
            </div>

            <div className="rounded-xl bg-surface-2 p-2 border border-border">
              <div className="text-[9px] font-semibold text-muted-foreground flex items-center gap-1">
                <Clock className="size-3 text-emerald-600" />
                <span>Dist. Remaining</span>
              </div>
              <div className="text-sm font-black text-foreground font-mono mt-0.5">
                {Math.round(currentLocInterpolated.remainingKm)} km
              </div>
            </div>
          </div>

          {/* Journey Progress Bar */}
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-semibold text-muted-foreground">
              <span>{shipment.origin.city}</span>
              <span className="text-blue-600 font-bold">
                {Math.round((1 - currentLocInterpolated.remainingKm / 1200) * 100)}% Completed
              </span>
              <span>{shipment.destination.city}</span>
            </div>
            <div className="w-full bg-border rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 via-blue-600 to-cyan-400 h-full rounded-full transition-all duration-300"
                style={{
                  width: `${Math.min(100, Math.max(10, Math.round((1 - currentLocInterpolated.remainingKm / 1200) * 100)))}%`,
                }}
              />
            </div>
          </div>

          {/* Driver Contact */}
          <div className="flex items-center justify-between rounded-xl bg-blue-50/80 dark:bg-blue-950/40 p-2 border border-blue-200 dark:border-blue-900 text-xs">
            <div className="text-[10px] font-bold text-foreground truncate">
              Pilot: {shipment.train.trainName}
            </div>
            <button
              onClick={() =>
                alert(
                  `Contacting Crew Control for ${shipment.train.trainName} (${shipment.train.trainNumber})`,
                )
              }
              className="flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-blue-700 transition"
            >
              <PhoneCall className="size-2.5" />
              <span>Call Crew</span>
            </button>
          </div>
        </div>

        {/* Floating Map Legend */}
        <div className="absolute bottom-3 left-3 z-1000 hidden md:flex items-center gap-3 rounded-xl border border-border/80 bg-surface/95 px-3 py-2 shadow-md backdrop-blur-md text-[10px] font-medium text-slate-700 dark:text-slate-300 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-600" />
            <span>Origin Yard</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-600 animate-pulse" />
            <span>Live Freight Unit</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-600" />
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-4 bg-blue-600 rounded-sm" />
            <span>DFC Rail Track</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-4 bg-amber-500 rounded-sm border-dashed" />
            <span>Highway Drayage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
