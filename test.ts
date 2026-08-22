import { writePersistentDatabase, readPersistentDatabase } from "./src/lib/db/serverStorage";
import { DatabaseState } from "./src/lib/db/types";

const mockState: DatabaseState = {
  shipments: [
    {
      shipmentId: "FW-DB-TEST-001",
      customerId: "CUST-001",
      customerName: "Test Customer",
      origin: "Delhi",
      destination: "Mumbai",
      cargoType: "Electronics",
      weightTons: 10,
      status: "IN_TRANSIT",
      priority: "HIGH",
      vehicleId: "V-001",
      mode: "road",
      routeDeviationKm: 0,
      estimatedDelayMinutes: 0,
      delayProbability: 0,
      riskLevel: "LOW",
      riskScore: 0,
      isSimulated: false,
    }
  ],
  vehicles: [],
  alerts: [
    {
      alertId: "ALT-TEST-1",
      severity: "CRITICAL",
      type: "delay",
      shipmentId: "FW-DB-TEST-001",
      vehicleId: "V-001",
      timestamp: new Date().toISOString(),
      description: "Test Alert",
      riskScore: 90,
      status: "OPEN"
    }
  ],
  incidents: [
    {
      incidentId: "INC-TEST-1",
      time: new Date().toISOString(),
      vehicleId: "V-001",
      shipmentId: "FW-DB-TEST-001",
      severity: "MAJOR",
      cause: "weather",
      actionTaken: "none",
      status: "UNRESOLVED",
      crewCount: 2,
      ambulanceDispatched: false,
      cargoSafeguardActive: false,
    }
  ],
  predictions: [],
  routes: [],
  simulationEvents: [],
  auditLogs: [
    {
      id: "AUD-1",
      timestamp: new Date().toISOString(),
      user: "System",
      role: "admin",
      action: "CREATE",
      entity: "shipment",
      entityId: "FW-DB-TEST-001",
      reason: "Testing"
    }
  ],
  users: []
};

console.log("Writing mock state...");
writePersistentDatabase(mockState);
console.log("Write success!");

const readState = readPersistentDatabase();
console.log("Shipments:", readState?.shipments.length);
console.log("Shipment ID:", readState?.shipments[0]?.shipmentId);
console.log("Alerts:", readState?.alerts.length);
console.log("Incidents:", readState?.incidents.length);
console.log("Audit logs:", readState?.auditLogs.length);

// Update shipment
mockState.shipments[0].status = "DELIVERED";
writePersistentDatabase(mockState);

const updatedState = readPersistentDatabase();
console.log("Updated Shipment Status:", updatedState?.shipments[0]?.status);

