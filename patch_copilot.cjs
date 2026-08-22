const fs = require("fs");
let code = fs.readFileSync("src/lib/copilot.functions.ts", "utf-8");

code = code.replace(
  "const currentShipments = liveSnapshot?.shipments || db.getShipments() || INITIAL_SHIPMENTS;",
  "const currentShipments = db.getShipments();",
);
code = code.replace(
  "const currentVehicles = liveSnapshot?.vehicles || db.getVehicles() || INITIAL_VEHICLES;",
  "const currentVehicles = db.getVehicles();",
);
code = code.replace(
  "const currentAlerts = liveSnapshot?.alerts || db.getAlerts() || INITIAL_ALERTS;",
  "const currentAlerts = db.getAlerts();",
);
code = code.replace(
  "const currentIncidents = liveSnapshot?.incidents || db.getIncidents() || INITIAL_INCIDENTS;",
  "const currentIncidents = db.getIncidents();",
);
code = code.replace(
  "const currentRoutes = liveSnapshot?.routes || db.getRoutes() || INITIAL_ROUTES;",
  "const currentRoutes = db.getRoutes();",
);

fs.writeFileSync("src/lib/copilot.functions.ts", code);
console.log("Copilot patched.");
