const fs = require("fs");
let code = fs.readFileSync("src/components/rail/RailLogisticsSection.tsx", "utf-8");

code = code.replace(
  'import React, { useState, useEffect } from "react";',
  'import React, { useState, useEffect, useMemo } from "react";\nimport { useVehicles } from "@/lib/db/useDb";',
);

const initRegex =
  /const \[rakes, setRakes\] = useState<TrainRakeTelemetry\[\]>\(MOCK_TRAIN_RAKES\);/;
if (initRegex.test(code)) {
  const replacement = `
  const dbVehicles = useVehicles();
  const rakes = useMemo<TrainRakeTelemetry[]>(() => {
    return dbVehicles.filter(v => v.mode === "rail").map((v, index) => {
      const mockRake = MOCK_TRAIN_RAKES.find(m => m.locomotiveNumber === v.registrationNumber || m.rakeId === v.vehicleId) || MOCK_TRAIN_RAKES[index % MOCK_TRAIN_RAKES.length];
      return {
        ...mockRake,
        rakeId: v.vehicleId,
        locomotiveNumber: v.registrationNumber,
        currentLat: v.currentLocationLat || mockRake.currentLat,
        currentLng: v.currentLocationLng || mockRake.currentLng,
        currentLocationName: v.currentLocationAddress || mockRake.currentLocationName,
        speedKmh: v.speed || mockRake.speedKmh,
        status: v.status === "AVAILABLE" ? "STATION_HALT" : (v.status === "EN_ROUTE" ? "RUNNING_ON_TIME" : "DELAYED"),
      };
    });
  }, [dbVehicles]);
  `;
  code = code.replace(initRegex, replacement);
  fs.writeFileSync("src/components/rail/RailLogisticsSection.tsx", code);
  console.log("Rail section patched.");
} else {
  console.log("Regex not found!");
}
