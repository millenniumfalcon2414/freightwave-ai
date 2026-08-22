const fs = require("fs");
let code = fs.readFileSync("src/lib/api/vehicle.functions.ts", "utf-8");

if (!code.includes("import { publishServerEvent }")) {
  code = code.replace(
    'import { db } from "../db/database";',
    'import { db } from "../db/database";\nimport { publishServerEvent } from "../realtime/serverEventBus";',
  );
}

code = code.replace(
  "db.updateVehicleLocation(data.vehicleId, data.lat, data.lng, data.address, data.speedKmh);",
  `db.updateVehicleLocation(data.vehicleId, data.lat, data.lng, data.address, data.speedKmh);
      publishServerEvent({ type: "VEHICLE_GPS_PING", payload: { vehicleId: data.vehicleId, lat: data.lat, lng: data.lng, address: data.address, speedKmh: data.speedKmh } });`,
);

fs.writeFileSync("src/lib/api/vehicle.functions.ts", code);
console.log("Vehicle patched");
