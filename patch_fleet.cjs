const fs = require("fs");
let code = fs.readFileSync("src/components/fleet/FleetHealthDashboard.tsx", "utf-8");

code = code.replace(
  'import React, { useState } from "react";',
  'import React, { useState, useMemo } from "react";\nimport { useVehicles } from "@/lib/db/useDb";',
);

// Find the initialization:
// const [profiles, setProfiles] = useState<VehicleHealthProfile[]>(MOCK_FLEET_HEALTH_PROFILES);
const initRegex =
  /const \[profiles, setProfiles\] = useState<VehicleHealthProfile\[\]>\(MOCK_FLEET_HEALTH_PROFILES\);/;
if (initRegex.test(code)) {
  const replacement = `
  const dbVehicles = useVehicles();
  const profiles = useMemo<VehicleHealthProfile[]>(() => {
    return dbVehicles.map((v, index) => {
      const mockProfile = MOCK_FLEET_HEALTH_PROFILES.find(m => m.assetNumber === v.registrationNumber || m.assetId === v.vehicleId) || MOCK_FLEET_HEALTH_PROFILES[index % MOCK_FLEET_HEALTH_PROFILES.length];
      return {
        ...mockProfile,
        assetId: v.vehicleId,
        assetNumber: v.registrationNumber,
        assetType: v.mode === "rail" ? "ELECTRIC_LOCOMOTIVE" : "TRUCK_PRIME_MOVER",
        makeModel: mockProfile ? mockProfile.makeModel : (v.mode === "rail" ? "WAG-12 Heavy Freight" : "Heavy Haul Truck"),
        overallHealthScore: Math.round(100 - (v.riskScore || 5)),
        isGroundedForRepair: v.status === "MAINTENANCE",
      };
    });
  }, [dbVehicles]);
  `;
  code = code.replace(initRegex, replacement);
  fs.writeFileSync("src/components/fleet/FleetHealthDashboard.tsx", code);
  console.log("Fleet health dashboard patched.");
} else {
  console.log("Regex not found!");
}
