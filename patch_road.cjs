const fs = require("fs");
let code = fs.readFileSync("src/components/road/RoadTrackingDashboard.tsx", "utf-8");

code = code.replace(
  'import React, { useState, useEffect } from "react";',
  'import React, { useState, useEffect, useMemo } from "react";\nimport { useVehicles } from "@/lib/db/useDb";',
);

const initRegex =
  /const \[vehicles, setVehicles\] = useState<LiveVehicleTelemetry\[\]>\(MOCK_LIVE_ROAD_FLEET\);/;
if (initRegex.test(code)) {
  const replacement = `
  const dbVehicles = useVehicles();
  const vehicles = useMemo<LiveVehicleTelemetry[]>(() => {
    return dbVehicles.filter(v => v.mode === "road").map((v, index) => {
      const mockVehicle = MOCK_LIVE_ROAD_FLEET.find(m => m.vehicleNumber === v.registrationNumber || m.id === v.vehicleId) || MOCK_LIVE_ROAD_FLEET[index % MOCK_LIVE_ROAD_FLEET.length];
      return {
        ...mockVehicle,
        id: v.vehicleId,
        vehicleNumber: v.registrationNumber,
        driverName: v.driverName || mockVehicle.driverName,
        currentLat: v.currentLocationLat || mockVehicle.currentLat,
        currentLng: v.currentLocationLng || mockVehicle.currentLng,
        currentLocationName: v.currentLocationAddress || mockVehicle.currentLocationName,
        speedKmh: v.speed || mockVehicle.speedKmh,
        status: v.status === "AVAILABLE" ? "REST_STOP" : (v.status === "EN_ROUTE" ? "CRUISING" : "DELAYED_TRAFFIC"),
      };
    });
  }, [dbVehicles]);
  `;
  code = code.replace(initRegex, replacement);
  fs.writeFileSync("src/components/road/RoadTrackingDashboard.tsx", code);
  console.log("Road tracking patched.");
} else {
  console.log("Regex not found!");
}
