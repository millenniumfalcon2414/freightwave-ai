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
} from "lucide-react";
import { CargoShipment } from "@/types/cargo-portal";

interface CargoPortalMapProps {
  shipment: CargoShipment;
  onRefreshLocation: () => void;
  isRefreshing?: boolean;
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
  const [showRoadHubs, setShowRoadHubs] = useState<boolean>(true);

  // Dynamic import of Leaflet on client-side to prevent SSR window is not defined errors
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

  // Initialize Leaflet Map once client & library are ready
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

    // Tile Layer based on selection
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
  }, [isClientReady, activeLayer, shipment.currentGps.lat, shipment.currentGps.lng]);

  // Update Route Polylines and Markers whenever shipment changes
  useEffect(() => {
    const L = leafletRef.current;
    const map = mapRef.current;
    if (!L || !map) return;

    // Clear previous polylines & markers
    polylinesRef.current.forEach((p) => p.remove());
    polylinesRef.current = [];
    stationMarkersRef.current.forEach((m) => m.remove());
    stationMarkersRef.current = [];

    // 1. Draw Railway Route (Indigo/Blue Glow Polyline)
    if (shipment.railRouteCoords && shipment.railRouteCoords.length > 1) {
      // Glow backing
      const glowLine = L.polyline(shipment.railRouteCoords, {
        color: "#3b82f6",
        weight: 8,
        opacity: 0.25,
      }).addTo(map);
      polylinesRef.current.push(glowLine);

      // Main Rail Track
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

    // 2. Draw Road Drayage Route if present (Cyan/Amber Dashed)
    if (shipment.roadDrayageCoords && shipment.roadDrayageCoords.length > 1) {
      const roadLine = L.polyline(shipment.roadDrayageCoords, {
        color: "#0891b2",
        weight: 4,
        dashArray: "4, 6",
        opacity: 0.85,
      }).addTo(map);
      roadLine.bindTooltip(`🚛 Last-Mile Road Drayage Route`, { sticky: true });
      polylinesRef.current.push(roadLine);
    }

    // 3. Origin Marker (Green Pin)
    const originIcon = L.divIcon({
      className: "custom-origin-pin",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="size-8 rounded-full bg-emerald-600 text-white border-2 border-white shadow-lg flex items-center justify-center">
            <svg class="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M5 13l4 4L19 7" />
            </svg>
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
    originMarker.bindPopup(`
      <div style="min-width: 180px; font-family: system-ui, sans-serif; padding: 2px;">
        <div style="font-weight: 800; color: #059669; font-size: 12px; margin-bottom: 2px;">🟢 ORIGIN LOADING YARD</div>
        <div style="font-size: 11px; font-weight: bold; color: #1e293b;">${shipment.origin.name}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
          Booked: ${shipment.origin.bookedDate}<br/>
          Dispatched: ${shipment.origin.dispatchedDate}
        </div>
      </div>
    `);
    stationMarkersRef.current.push(originMarker);

    // 4. Destination Marker (Red / Flag Pin)
    const destIcon = L.divIcon({
      className: "custom-dest-pin",
      html: `
        <div class="relative flex items-center justify-center">
          <div class="size-8 rounded-full bg-red-600 text-white border-2 border-white shadow-lg flex items-center justify-center">
            <svg class="size-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
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
    destMarker.bindPopup(`
      <div style="min-width: 190px; font-family: system-ui, sans-serif; padding: 2px;">
        <div style="font-weight: 800; color: #dc2626; font-size: 12px; margin-bottom: 2px;">🔴 DESTINATION TERMINAL</div>
        <div style="font-size: 11px; font-weight: bold; color: #1e293b;">${shipment.destination.name}</div>
        <div style="font-size: 10px; color: #64748b; margin-top: 2px;">
          Expected Date: <strong>${shipment.estimatedDeliveryDate}</strong><br/>
          Expected Time: <strong>${shipment.estimatedDeliveryTime}</strong>
        </div>
      </div>
    `);
    stationMarkersRef.current.push(destMarker);

    // 5. Intermediate Stations & Road Transportation Offices
    shipment.intermediateWaypoints.forEach((wp) => {
      if (wp.type === "current_gps") return; // Rendered as moving live train

      const isRoadHub = wp.type === "road_office";
      if (isRoadHub && !showRoadHubs) return;

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
      sm.bindPopup(`
        <div style="min-width: 150px; font-family: system-ui, sans-serif; font-size: 11px;">
          <div style="font-weight: bold; color: ${isRoadHub ? "#d97706" : "#2563eb"};">
            ${isRoadHub ? "🏢 Road Transport Hub" : "🚉 Railway Station"}
          </div>
          <div style="font-weight: 700; color: #0f172a; margin-top: 2px;">${wp.name} ${wp.code ? `(${wp.code})` : ""}</div>
          <div style="font-size: 10px; color: #64748b; margin-top: 1px;">${wp.description || "Active Node"}</div>
        </div>
      `);
      stationMarkersRef.current.push(sm);
    });

    // 6. Current Freight / Moving Train Marker (High Priority Animated Pulse)
    const isTruck = shipment.status === "OUT_FOR_DELIVERY";
    const movingIcon = L.divIcon({
      className: "custom-moving-train-pin",
      html: `
        <div class="relative flex items-center justify-center cursor-pointer">
          <div class="absolute -inset-2.5 rounded-full bg-blue-500/40 animate-ping"></div>
          <div class="size-11 rounded-2xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-cyan-500 text-white border-2 border-white shadow-2xl flex items-center justify-center">
            ${
              isTruck
                ? `<svg class="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h2m-6 0a1 1 0 001-1v-3"/></svg>`
                : `<svg class="size-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h8m-8 4h8m-8 4h8M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z"/></svg>`
            }
          </div>
          <div class="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-blue-900 text-white font-mono text-[9px] px-2 py-0.5 shadow-lg border border-blue-400 font-bold flex items-center gap-1">
            <span class="size-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>${shipment.currentLocationName} (${shipment.currentSpeedKmh} km/h)</span>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const liveMarker = L.marker([shipment.currentGps.lat, shipment.currentGps.lng], {
      icon: movingIcon,
      zIndexOffset: 1000,
    }).addTo(map);

    liveMarker.bindPopup(`
      <div style="min-width: 230px; font-family: system-ui, sans-serif; padding: 4px;">
        <div style="font-weight: 800; color: #2563eb; font-size: 13px; margin-bottom: 2px;">
          🚆 CURRENT FREIGHT POSITION
        </div>
        <div style="font-size: 11px; line-height: 1.5; color: #334155;">
          <strong>Location:</strong> ${shipment.currentLocationName}<br/>
          <strong>Carrier:</strong> ${shipment.train.trainName} (${shipment.train.trainNumber})<br/>
          <strong>Wagon No:</strong> ${shipment.train.wagonNumber}<br/>
          <strong>Speed:</strong> <span style="color: #059669; font-weight: bold;">${shipment.currentSpeedKmh} km/h</span><br/>
          <strong>Distance Remaining:</strong> ${shipment.remainingDistanceKm} km<br/>
          <strong>Status:</strong> ${shipment.train.trainStatus}
        </div>
        <div style="margin-top: 6px; font-size: 9px; font-family: monospace; color: #64748b; background: #f1f5f9; padding: 4px; border-radius: 4px;">
          WGS-84: ${shipment.currentGps.lat.toFixed(4)}°N, ${shipment.currentGps.lng.toFixed(4)}°E (NavIC Synced)
        </div>
      </div>
    `);

    movingMarkerRef.current = liveMarker;

    // Fit bounds smoothly to include full journey route
    if (shipment.railRouteCoords && shipment.railRouteCoords.length > 0) {
      map.fitBounds(L.polyline(shipment.railRouteCoords).getBounds(), {
        padding: [50, 50],
        maxZoom: 9,
      });
    }
  }, [isClientReady, shipment, showRoadHubs]);

  // Center on Live Current Position
  const handleViewLiveLocation = () => {
    if (!mapRef.current) return;
    mapRef.current.flyTo([shipment.currentGps.lat, shipment.currentGps.lng], 9, {
      duration: 1.2,
    });
    if (movingMarkerRef.current) {
      movingMarkerRef.current.openPopup();
    }
  };

  // Reset to full route bounds
  const handleFitRoute = () => {
    const L = leafletRef.current;
    if (!L || !mapRef.current || !shipment.railRouteCoords) return;
    mapRef.current.fitBounds(L.polyline(shipment.railRouteCoords).getBounds(), {
      padding: [50, 50],
    });
  };

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
                Interactive Multimodal Journey Map
              </h3>
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.2 font-mono text-[9px] font-bold text-emerald-600 border border-emerald-500/20">
                <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live GPS Active
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Current Location:{" "}
              <strong className="text-foreground">{shipment.currentLocationName}</strong> · Last
              Updated: {shipment.lastUpdatedMinutesAgo} min ago
            </p>
          </div>
        </div>

        {/* Map Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Toggle Road Transport Hubs */}
          <button
            onClick={() => setShowRoadHubs(!showRoadHubs)}
            className={`flex items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold transition ${
              showRoadHubs
                ? "bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-400"
                : "bg-surface border-border text-muted-foreground hover:text-foreground"
            }`}
            title="Toggle Road Transportation Offices & ICD Siding points"
          >
            <Building2 className="size-3.5" />
            <span className="text-[11px]">Road Hubs</span>
          </button>

          {/* View Live Location Button */}
          <button
            onClick={handleViewLiveLocation}
            className="flex items-center gap-1.5 rounded-xl border border-blue-300 bg-blue-50 px-3 py-1.5 text-xs font-bold text-blue-700 hover:bg-blue-100 transition shadow-xs"
            title="Focus and zoom on moving train/truck marker"
          >
            <Eye className="size-3.5 text-blue-700" />
            <span>View Live Location</span>
          </button>

          {/* Refresh Location Button */}
          <button
            onClick={onRefreshLocation}
            disabled={isRefreshing}
            className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white shadow-xs hover:bg-blue-700 transition disabled:opacity-50"
            title="Fetch latest NavIC & GPS satellite telemetry"
          >
            <RefreshCw className={`size-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            <span>Refresh Location</span>
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
      <div className="relative w-full h-[460px] sm:h-[520px] bg-slate-100 dark:bg-slate-900">
        <div ref={mapContainerRef} className="w-full h-full" />

        {!isClientReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/80 backdrop-blur-xs">
            <div className="flex items-center gap-2 text-xs font-bold text-muted-foreground">
              <RefreshCw className="size-4 animate-spin text-blue-600" />
              <span>Loading NavIC Satellite Map...</span>
            </div>
          </div>
        )}

        {/* Floating Live Telemetry Badge (Top Left Inside Map) */}
        <div className="absolute top-3 left-3 z-1000 max-w-xs rounded-xl border border-border/80 bg-surface/95 p-3 shadow-lg backdrop-blur-md text-xs space-y-1.5 pointer-events-auto">
          <div className="flex items-center justify-between gap-2 border-b border-border/60 pb-1.5">
            <span className="font-mono text-[10px] font-bold uppercase text-blue-600 flex items-center gap-1">
              <Radio className="size-3 text-blue-600 animate-pulse" />
              Moving Freight
            </span>
            <span className="rounded bg-surface-2 px-1.5 py-0.2 font-mono text-[10px] font-bold text-foreground">
              {shipment.currentSpeedKmh} km/h
            </span>
          </div>
          <div className="font-bold text-foreground truncate">{shipment.train.trainName}</div>
          <div className="text-[11px] text-muted-foreground">
            Wagon: <strong className="text-foreground">{shipment.train.wagonNumber}</strong> (
            {shipment.train.wagonType})
          </div>
          <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <span>● Status:</span>
            <span>{shipment.train.trainStatus}</span>
          </div>
        </div>

        {/* Floating Map Legend (Bottom Left Inside Map) */}
        <div className="absolute bottom-3 left-3 z-1000 hidden md:flex items-center gap-3 rounded-xl border border-border/80 bg-surface/95 px-3 py-2 shadow-md backdrop-blur-md text-[10px] font-medium text-slate-700 dark:text-slate-300 pointer-events-auto">
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-emerald-600" />
            <span>Origin</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-blue-600" />
            <span>Current Position</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2.5 rounded-full bg-red-600" />
            <span>Destination</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-4 bg-blue-600 rounded-sm" />
            <span>Rail Spine</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-1 w-4 bg-cyan-500 rounded-sm border-dashed" />
            <span>Road Drayage</span>
          </div>
        </div>
      </div>
    </div>
  );
}
