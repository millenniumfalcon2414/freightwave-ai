const fs = require("fs");
let code = fs.readFileSync("src/lib/api/vehicle.functions.ts", "utf-8");

code = code.replace(
  "if (!updated) {\\n        return { success: false, error: \\`Vehicle \\${data.vehicleId} not found\\` };\\n      }\\n      return { success: true, vehicle: updated };",
  'if (!updated) {\\n        return { success: false, error: \\`Vehicle \\${data.vehicleId} not found\\` };\\n      }\\n      publishServerEvent({ type: "VEHICLE_GPS_PING", payload: { vehicleId: data.vehicleId, lat: data.lat, lng: data.lng, address: data.address, speed: data.speed } });\\n      return { success: true, vehicle: updated };',
);

fs.writeFileSync("src/lib/api/vehicle.functions.ts", code);
console.log("Vehicle patched");
