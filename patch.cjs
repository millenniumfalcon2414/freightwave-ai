const fs = require("fs");
let code = fs.readFileSync("src/routes/dashboard.tsx", "utf-8");

const injectStr = `
  const dbShipments = useDb((s) => s.shipments);
  const dbAlerts = useDb((s) => s.alerts);

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

code = code.replace("const alerts = useDb((s) => s.alerts);", "");
code = code.replace("const shipments = useDb((s) => s.shipments);", injectStr);

// We need to change `db.createShipment` to a server call!
if (!code.includes("createShipmentFn")) {
  code = code.replace(
    'import { db } from "@/lib/db/database";',
    'import { db } from "@/lib/db/database";\nimport { createShipmentFn } from "@/lib/api/shipment.functions";',
  );

  // Replace the exact createShipment usage
  code = code.replace(
    /const newShipment = db\.createShipment\(\{(.*?)\},\s*(user\?.+?),\s*(user\?.+?)\);/s,
    `const newShipment = await createShipmentFn({ data: {$1} });`,
  );

  // Actually, wait, let's just find `const newShipment = db.createShipment` and replace it with `createShipmentFn`
}

fs.writeFileSync("src/routes/dashboard.tsx", code);
