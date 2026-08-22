const fs = require("fs");
let code = fs.readFileSync("src/routes/dashboard.tsx", "utf-8");

code = code.replace("onSubmit={(e) => {", "onSubmit={async (e) => {");

code = code.replace(
  "createShipmentFn({ data: {",
  "const newShipment = await createShipmentFn({ data: {",
);

// We also need to get shipments and alerts from the DB, not the sim.
// Earlier we tried replacing:
// const shipments = useSim((s) => s.shipments);
// const alerts = useSim((s) => s.alerts);
// But the patch failed. Let's do it cleanly!

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

code = code.replace(
  "  const alerts = useSim((s) => s.alerts);\n  const shipments = useSim((s) => s.shipments);",
  injectStr,
);

fs.writeFileSync("src/routes/dashboard.tsx", code);
