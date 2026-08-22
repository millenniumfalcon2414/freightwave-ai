import React, { useState, useMemo } from "react";
import { useVehicles } from "@/lib/db/useDb";
import {
  Truck,
  MapPin,
  Navigation,
  Shield,
  Clock,
  Gauge,
  User,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { LiveVehicleTelemetry, MOCK_LIVE_ROAD_FLEET } from "@/types/road-tracking";

interface RoadTrackingDashboardProps {
  onSelectVehicleOnMap?: (vehicle: LiveVehicleTelemetry) => void;
  onTriggerSos?: (vehicle: LiveVehicleTelemetry) => void;
}

export function RoadTrackingDashboard({
  onSelectVehicleOnMap,
  onTriggerSos,
}: RoadTrackingDashboardProps) {
  const dbVehicles = useVehicles();
  const vehicles = useMemo<LiveVehicleTelemetry[]>(() => {
    return dbVehicles
      .filter((v) => v.mode === "road")
      .map((v, index) => {
        const mockVehicle =
          MOCK_LIVE_ROAD_FLEET.find(
            (m) => m.vehicleNumber === v.registrationNumber || m.id === v.vehicleId,
          ) || MOCK_LIVE_ROAD_FLEET[index % MOCK_LIVE_ROAD_FLEET.length];
        return {
          ...mockVehicle,
          id: v.vehicleId,
          vehicleNumber: v.registrationNumber,
          driverName: v.driverName || mockVehicle.driverName,
          currentLat: v.currentLocation?.lat || mockVehicle.currentLat,
          currentLng: v.currentLocation?.lng || mockVehicle.currentLng,
          currentLocationName: v.currentLocation?.address || mockVehicle.currentLocationName,
          speedKmh: v.speed || mockVehicle.speedKmh,
          status:
            v.status === "in_transit"
              ? "CRUISING"
              : v.status === "idle"
                ? "REST_STOP"
                : v.status === "emergency"
                  ? "DELAYED_TRAFFIC"
                  : "REST_STOP",
        };
      });
  }, [dbVehicles]);

  const [selectedVehicleId, setSelectedVehicleId] = useState<string>(vehicles[0]?.id || "");
  const selectedVehicle = vehicles.find((v) => v.id === selectedVehicleId) || vehicles[0];

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4">
      <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Truck className="w-5 h-5" /> Road Fleet Tracking
        </h2>
        {vehicles.map((v) => (
          <div
            key={v.id}
            onClick={() => setSelectedVehicleId(v.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all \${selectedVehicleId === v.id ? 'border-blue-500 bg-blue-50/10' : 'border-neutral-200 dark:border-neutral-800'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{v.vehicleNumber}</h3>
              <span
                className={`px-2 py-1 text-xs font-bold rounded-full \${v.status === 'CRUISING' ? 'bg-green-100 text-green-700' : v.status === 'DELAYED_TRAFFIC' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
              >
                {v.status}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
              <User className="w-4 h-4" /> {v.driverName}
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <MapPin className="w-4 h-4" /> {v.currentLocationName}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        {selectedVehicle ? (
          <div className="border rounded-xl p-6 bg-white dark:bg-neutral-900 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedVehicle.vehicleNumber}</h2>
                <p className="text-neutral-500 flex items-center gap-2">
                  <User className="w-4 h-4" /> {selectedVehicle.driverName}
                </p>
              </div>
              <button
                onClick={() => onTriggerSos?.(selectedVehicle)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" /> SOS EMERGENCY
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Current Speed</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-500" /> {selectedVehicle.speedKmh} km/h
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Status</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  {selectedVehicle.status === "CRUISING" ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <Clock className="w-5 h-5 text-yellow-500" />
                  )}{" "}
                  {selectedVehicle.status.replace("_", " ")}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Fuel / Battery</p>
                <p className="text-xl font-bold">{selectedVehicle.fuelLevelPct || 85}%</p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Engine Temp</p>
                <p className="text-xl font-bold">{selectedVehicle.engineTempC || 90}°C</p>
              </div>
            </div>

            <div className="flex-grow rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center relative">
              <div className="text-center p-6">
                <MapPin className="w-12 h-12 text-blue-500 mx-auto mb-2 opacity-50" />
                <h3 className="text-lg font-semibold">Live Map View</h3>
                <p className="text-neutral-500">{selectedVehicle.currentLocationName}</p>
                <button
                  onClick={() => onSelectVehicleOnMap?.(selectedVehicle)}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg flex items-center gap-2 mx-auto hover:bg-blue-700 transition"
                >
                  <Navigation className="w-4 h-4" /> Focus on Map
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow border rounded-xl flex items-center justify-center text-neutral-500">
            Select a vehicle to view details
          </div>
        )}
      </div>
    </div>
  );
}
