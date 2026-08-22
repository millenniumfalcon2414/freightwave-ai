import React, { useState, useMemo } from "react";
import { useVehicles } from "@/lib/db/useDb";
import { TrainRakeTelemetry, RailWagon, MOCK_TRAIN_RAKES } from "@/types/rail-logistics";
import {
  Train,
  MapPin,
  Clock,
  Gauge,
  AlertTriangle,
  ShieldCheck,
  CheckCircle2,
  Navigation,
} from "lucide-react";

interface RailLogisticsSectionProps {
  onSelectRakeOnMap?: (rake: TrainRakeTelemetry) => void;
  onTriggerSos?: (rake: TrainRakeTelemetry) => void;
}

export function RailLogisticsSection({
  onSelectRakeOnMap,
  onTriggerSos,
}: RailLogisticsSectionProps) {
  const dbVehicles = useVehicles();
  const rakes = useMemo<TrainRakeTelemetry[]>(() => {
    return dbVehicles
      .filter((v) => v.mode === "rail")
      .map((v, index) => {
        const mockRake =
          MOCK_TRAIN_RAKES.find(
            (m) => m.locomotiveNumber === v.registrationNumber || m.rakeId === v.vehicleId,
          ) || MOCK_TRAIN_RAKES[index % MOCK_TRAIN_RAKES.length];
        return {
          ...mockRake,
          rakeId: v.vehicleId,
          locomotiveNumber: v.registrationNumber,
          currentLat: v.currentLocation?.lat || mockRake.currentLat,
          currentLng: v.currentLocation?.lng || mockRake.currentLng,
          currentLocationName: v.currentLocation?.address || mockRake.currentLocationName,
          speedKmh: v.speed || mockRake.speedKmh,
          status:
            v.status === "in_transit"
              ? "RUNNING_ON_TIME"
              : v.status === "idle"
                ? "STATION_HALT"
                : v.status === "emergency"
                  ? "DELAYED"
                  : "STATION_HALT",
        };
      });
  }, [dbVehicles]);

  const [selectedRakeId, setSelectedRakeId] = useState<string>(rakes[0]?.rakeId || "");
  const selectedRake = rakes.find((r) => r.rakeId === selectedRakeId) || rakes[0];

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4">
      <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Train className="w-5 h-5" /> Rail Fleet Tracking
        </h2>
        {rakes.map((r) => (
          <div
            key={r.rakeId}
            onClick={() => setSelectedRakeId(r.rakeId)}
            className={`p-4 rounded-xl border cursor-pointer transition-all \${selectedRakeId === r.rakeId ? 'border-blue-500 bg-blue-50/10' : 'border-neutral-200 dark:border-neutral-800'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{r.locomotiveNumber}</h3>
              <span
                className={`px-2 py-1 text-xs font-bold rounded-full \${r.status === 'RUNNING_ON_TIME' ? 'bg-green-100 text-green-700' : r.status === 'DELAYED' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}
              >
                {r.status.replace(/_/g, " ")}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500 mb-1">
              <Gauge className="w-4 h-4" /> {r.speedKmh} km/h (DFC)
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              <MapPin className="w-4 h-4" /> {r.currentLocationName}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        {selectedRake ? (
          <div className="border rounded-xl p-6 bg-white dark:bg-neutral-900 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">
                  Train Rake: {selectedRake.locomotiveNumber}
                </h2>
                <p className="text-neutral-500 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Currently at {selectedRake.currentLocationName}
                </p>
              </div>
              <button
                onClick={() => onTriggerSos?.(selectedRake)}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" /> RAISE ALARM
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Train Speed</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <Gauge className="w-5 h-5 text-blue-500" /> {selectedRake.speedKmh} km/h
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Wagons Count</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <Layers className="w-5 h-5 text-indigo-500" /> {selectedRake.wagons?.length || 45}{" "}
                  Wagons
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Power Output</p>
                <p className="text-xl font-bold">12,000 HP</p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Route Status</p>
                <p className="text-xl font-bold">{selectedRake.status.replace(/_/g, " ")}</p>
              </div>
            </div>

            <div className="flex-grow rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex items-center justify-center relative">
              <div className="text-center p-6">
                <Train className="w-12 h-12 text-indigo-500 mx-auto mb-2 opacity-50" />
                <h3 className="text-lg font-semibold">Rail Tracking View</h3>
                <p className="text-neutral-500">{selectedRake.currentLocationName}</p>
                <button
                  onClick={() => onSelectRakeOnMap?.(selectedRake)}
                  className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center gap-2 mx-auto hover:bg-indigo-700 transition"
                >
                  <Navigation className="w-4 h-4" /> Focus on Map
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow border rounded-xl flex items-center justify-center text-neutral-500">
            Select a train rake to view details
          </div>
        )}
      </div>
    </div>
  );
}

// Ensure Layers icon is available or replace it
import { Layers } from "lucide-react";
