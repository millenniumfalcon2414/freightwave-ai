const fs = require("fs");
let code = fs.readFileSync("src/routes/cargo-portal.tsx", "utf-8");

code = code.replace(
  'import React, { useState, useEffect } from "react";',
  'import React, { useState, useEffect, useMemo } from "react";\nimport { useShipments, useAlerts } from "@/lib/db/useDb";',
);

const initRegex =
  /const \[shipments, setShipments\] = useState<CargoShipment\[\]>\(MOCK_SHIPMENTS\);/;
if (initRegex.test(code)) {
  const replacement = `
  const dbShipments = useShipments();
  const shipments = useMemo<CargoShipment[]>(() => {
    return dbShipments.map((db, index) => {
      const mock = MOCK_SHIPMENTS.find(m => m.id === db.shipmentId || m.consignmentNumber === db.trackingNumber) || MOCK_SHIPMENTS[index % MOCK_SHIPMENTS.length];
      return {
        ...mock,
        id: db.shipmentId,
        consignmentNumber: db.trackingNumber,
        title: db.cargoType,
        customerName: db.customer,
        transportMode: db.mode.toUpperCase(),
        currentLocationName: db.currentLocationAddress,
        status: db.status === "DELIVERED" ? "DELIVERED" : (db.status === "AT_DESTINATION" ? "ARRIVED_AT_DESTINATION" : (db.status === "DELAYED" ? "DELAYED_IN_TRANSIT" : "IN_TRANSIT")),
        weightTons: db.cargoWeight,
        origin: { ...mock.origin, name: db.origin, city: db.origin },
        destination: { ...mock.destination, name: db.destination, city: db.destination },
      };
    });
  }, [dbShipments]);
  `;
  code = code.replace(initRegex, replacement);

  const alertsRegex = /const \[alerts, setAlerts\] = useState<CargoAlert\[\]>\(MOCK_ALERTS\);/;
  const alertsReplacement = `
  const dbAlerts = useAlerts();
  const alerts = useMemo<CargoAlert[]>(() => {
    return dbAlerts.map(a => ({
      id: a.alertId,
      shipmentId: a.shipmentId || "GENERAL",
      type: a.severity === "CRITICAL" ? "SECURITY" : "LOGISTICS",
      title: a.title,
      description: a.description,
      timestamp: new Date(a.timestamp).toLocaleString(),
      isRead: false,
      severity: a.severity.toLowerCase()
    }));
  }, [dbAlerts]);
  `;
  code = code.replace(alertsRegex, alertsReplacement);

  fs.writeFileSync("src/routes/cargo-portal.tsx", code);
  console.log("Cargo portal patched.");
} else {
  console.log("Regex not found!");
}
