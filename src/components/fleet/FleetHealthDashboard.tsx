import React, { useState, useMemo } from "react";
import { useVehicles } from "@/lib/db/useDb";
import { VehicleHealthProfile, MOCK_FLEET_HEALTH_PROFILES } from "@/types/fleet-health";
import {
  Activity,
  Wrench,
  ShieldAlert,
  CheckCircle,
  Battery,
  Thermometer,
  Gauge,
} from "lucide-react";

interface FleetHealthDashboardProps {
  onScheduleService?: (profile: VehicleHealthProfile) => void;
}

export function FleetHealthDashboard({ onScheduleService }: FleetHealthDashboardProps) {
  const dbVehicles = useVehicles();
  const profiles = useMemo<VehicleHealthProfile[]>(() => {
    return dbVehicles.map((v, index) => {
      const mockProfile =
        MOCK_FLEET_HEALTH_PROFILES.find(
          (m) => m.assetNumber === v.registrationNumber || m.assetId === v.vehicleId,
        ) || MOCK_FLEET_HEALTH_PROFILES[index % MOCK_FLEET_HEALTH_PROFILES.length];
      return {
        ...mockProfile,
        assetId: v.vehicleId,
        assetNumber: v.registrationNumber,
        assetType: v.mode === "rail" ? "ELECTRIC_LOCOMOTIVE" : "TRUCK_PRIME_MOVER",
        makeModel: mockProfile
          ? mockProfile.makeModel
          : v.mode === "rail"
            ? "WAG-12 Heavy Freight"
            : "Heavy Haul Truck",
        overallHealthScore: Math.round(100 - (v.riskScore || 5)),
        isGroundedForRepair: v.status === "maintenance",
      };
    });
  }, [dbVehicles]);

  const [selectedAssetId, setSelectedAssetId] = useState<string>(profiles[0]?.assetId || "");
  const selectedProfile = profiles.find((p) => p.assetId === selectedAssetId) || profiles[0];

  return (
    <div className="flex flex-col lg:flex-row h-full w-full gap-4 p-4">
      <div className="w-full lg:w-1/3 flex flex-col gap-4 overflow-y-auto">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Activity className="w-5 h-5" /> Fleet Health
        </h2>
        {profiles.map((p) => (
          <div
            key={p.assetId}
            onClick={() => setSelectedAssetId(p.assetId)}
            className={`p-4 rounded-xl border cursor-pointer transition-all \${selectedAssetId === p.assetId ? 'border-blue-500 bg-blue-50/10' : 'border-neutral-200 dark:border-neutral-800'}`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{p.assetNumber}</h3>
              <span
                className={`px-2 py-1 text-xs font-bold rounded-full \${p.overallHealthScore > 80 ? 'bg-green-100 text-green-700' : p.overallHealthScore > 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}
              >
                Score: {p.overallHealthScore}
              </span>
            </div>
            <div className="flex items-center gap-2 text-sm text-neutral-500">
              {p.assetType === "ELECTRIC_LOCOMOTIVE" ? "Locomotive" : "Road Truck"} • {p.makeModel}
            </div>
          </div>
        ))}
      </div>

      <div className="w-full lg:w-2/3 flex flex-col gap-4">
        {selectedProfile ? (
          <div className="border rounded-xl p-6 bg-white dark:bg-neutral-900 shadow-sm flex flex-col h-full">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-2xl font-bold mb-1">{selectedProfile.assetNumber}</h2>
                <p className="text-neutral-500">{selectedProfile.makeModel}</p>
              </div>
              <button
                onClick={() => onScheduleService?.(selectedProfile)}
                className="bg-neutral-800 hover:bg-neutral-900 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2"
              >
                <Wrench className="w-5 h-5" /> Schedule Maintenance
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Health Score</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <Activity className="w-5 h-5 text-blue-500" />{" "}
                  {selectedProfile.overallHealthScore}/100
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Status</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  {selectedProfile.isGroundedForRepair ? (
                    <ShieldAlert className="w-5 h-5 text-red-500" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  )}
                  {selectedProfile.isGroundedForRepair ? "Grounded" : "Active"}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Battery / Fuel</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <Battery className="w-5 h-5 text-green-500" /> 85%
                </p>
              </div>
              <div className="p-4 rounded-lg bg-neutral-100 dark:bg-neutral-800">
                <p className="text-sm text-neutral-500 mb-1">Telemetry</p>
                <p className="text-xl font-bold flex items-center gap-2">
                  <Thermometer className="w-5 h-5 text-orange-500" /> Normal
                </p>
              </div>
            </div>

            <div className="flex-grow rounded-lg overflow-hidden bg-neutral-200 dark:bg-neutral-800 flex flex-col p-6">
              <h3 className="font-semibold mb-4 text-lg">Diagnostics</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 text-green-700 rounded-lg">
                      <Gauge className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Engine & Powertrain</p>
                      <p className="text-sm text-neutral-500">
                        All metrics within operational limits
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-green-600">95%</span>
                </div>
                <div className="flex items-center justify-between p-4 bg-white dark:bg-neutral-900 rounded-lg shadow-sm border border-neutral-100 dark:border-neutral-800">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-yellow-100 text-yellow-700 rounded-lg">
                      <Wrench className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-semibold">Braking System</p>
                      <p className="text-sm text-neutral-500">
                        Pads replacement recommended in 2,000 km
                      </p>
                    </div>
                  </div>
                  <span className="font-bold text-yellow-600">62%</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-grow border rounded-xl flex items-center justify-center text-neutral-500">
            Select a vehicle to view health profile
          </div>
        )}
      </div>
    </div>
  );
}
