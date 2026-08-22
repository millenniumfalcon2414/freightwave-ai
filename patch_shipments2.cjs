const fs = require("fs");
let code = fs.readFileSync("src/lib/api/shipment.functions.ts", "utf-8");

// In updateShipmentFn
code = code.replace(
  "db.updateShipment(data.shipmentId, updatePayload);",
  `db.updateShipment(data.shipmentId, updatePayload);
      publishServerEvent({ type: "SHIPMENT_ETA_UPDATED", payload: { shipmentId: data.shipmentId, ...updatePayload } });`,
);

fs.writeFileSync("src/lib/api/shipment.functions.ts", code);
console.log("Shipment update event patched");
