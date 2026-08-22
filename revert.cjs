const fs = require("fs");
let code = fs.readFileSync("src/routes/dashboard.tsx", "utf-8");

// Undo the patch.js inject
const injectStr = `
  const shipments = useMemo(() => dbShipments.map(s => ({
    id: s.shipmentId,
    corridor: \`\${s.origin} -> \${s.destination}\`,
    cargo: s.cargoType,
    etaMin: s.remainingKm ? Math.round((s.remainingKm / 60) * 60) : 0, 
    status: (s.status === "ON_SCHEDULE" || s.status === "IN_TRANSIT" || s.status === "BOOKED" || s.status === "LOADED") ? "on_schedule" : (s.status === "REROUTED" ? "rerouted" : "delay_20m"),
    confidence: s.predictedEta ? 92 : 85,
    weightTons: s.cargoWeight,
  }) as any), [dbShipments]);

  const alerts = useMemo(() => dbAlerts.map(a => ({
    id: a.alertId,
    t: new Date(a.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    sev: a.severity.toLowerCase(),
    msg: a.description,
    node: a.shipmentId || 'System',
  }) as any), [dbAlerts]);
`;

code = code.replace(
  injectStr + "\n  const hardware = useSim((s) => s.hardware);",
  "const hardware = useSim((s) => s.hardware);",
);

// undo the createShipment patch
code = code.replace(
  `
    import { createShipmentFn } from "@/lib/api/shipment.functions";
    //... wait we can't import inside the function
  `,
  "const newShipment = db.createShipment({",
);

// undo the sed replacements
code = code.replace(
  "const dbAlerts = useDb((s) => s.alerts);",
  "const alerts = useSim((s) => s.alerts);",
);
code = code.replace(
  "const dbShipments = useDb((s) => s.shipments);",
  "const shipments = useSim((s) => s.shipments);",
);

fs.writeFileSync("src/routes/dashboard.tsx", code);
