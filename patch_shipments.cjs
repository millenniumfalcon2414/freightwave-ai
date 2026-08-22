const fs = require("fs");
let code = fs.readFileSync("src/lib/api/shipment.functions.ts", "utf-8");

if (!code.includes("import { publishServerEvent }")) {
  code = code.replace(
    'import { db } from "../db/database";',
    'import { db } from "../db/database";\nimport { publishServerEvent } from "../realtime/serverEventBus";',
  );
}

// In createShipmentFn
code = code.replace(
  "return finalShipment;",
  `publishServerEvent({ type: "NOTIFICATION_BROADCAST", payload: { message: "New shipment created: " + finalShipment.shipmentId } });
    return finalShipment;`,
);

// In updateShipmentLocationFn
code = code.replace(
  "db.updateShipmentLocation(data.shipmentId, data.lat, data.lng, data.address, data.speedKmh);",
  `db.updateShipmentLocation(data.shipmentId, data.lat, data.lng, data.address, data.speedKmh);
      publishServerEvent({ type: "VEHICLE_GPS_PING", payload: { shipmentId: data.shipmentId, lat: data.lat, lng: data.lng, address: data.address, speedKmh: data.speedKmh } });`,
);

// In createAlertFn
code = code.replace(
  "const alert = db.createAlert(data);",
  `const alert = db.createAlert(data);
      publishServerEvent({ type: "FLEET_HEALTH_ALERT", payload: alert });`,
);

fs.writeFileSync("src/lib/api/shipment.functions.ts", code);
console.log("Shipment functions patched");
