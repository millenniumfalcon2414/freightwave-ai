import { db } from "./src/lib/db/database";
import { calculateShipmentRisk, generatePredictionRecord } from "./src/lib/risk/riskEngine";

async function run() {
  console.log("=== 1. DATABASE PERSISTENCE ===");
  const newShipment = db.createShipment(
    {
      customer: "Test Company",
      origin: "Bengaluru",
      destination: "Hyderabad",
      cargoType: "Electronics",
      cargoWeight: 15,
      priority: "HIGH",
    },
    "Test User",
    "admin"
  );
  console.log("Created shipment:", newShipment.shipmentId);
  const fetched = db.getShipments().find(s => s.shipmentId === newShipment.shipmentId);
  console.log("Fetched shipment exists:", !!fetched);

  console.log("\n=== 2. SIMULATION & RISK ENGINE ===");
  // Trigger vehicle movement
  db.updateShipment(newShipment.shipmentId, { status: "IN_TRANSIT", routeDeviationKm: 8.5 }, "Simulation", "system", "Deviated");
  const deviatedShipment = db.getShipments().find(s => s.shipmentId === newShipment.shipmentId);
  
  const risk = calculateShipmentRisk(deviatedShipment!);
  console.log("Risk after deviation:", risk.riskScore, risk.riskLevel);
  console.log("Confidence deterministic?", calculateShipmentRisk(deviatedShipment!).confidence === risk.confidence);

  console.log("\n=== 3. PREDICTIVE DELAY ===");
  const prediction = generatePredictionRecord(deviatedShipment!);
  db.createPrediction(prediction);
  const fetchedPred = db.getPredictionsForShipment(newShipment.shipmentId);
  console.log("Prediction saved:", fetchedPred.length > 0);
  console.log("Predicted delay:", fetchedPred[0]?.delayMinutes);

  console.log("\n=== 4. ALERTS ===");
  const alert = db.createAlert({
    severity: "CRITICAL",
    type: "ROUTE_DEVIATION",
    shipmentId: newShipment.shipmentId,
    description: "Route deviated",
    riskScore: risk.riskScore,
    recommendedAction: "Reroute",
    aiExplanation: risk.explanation
  }, "System", "system");
  console.log("Alert created:", alert.alertId);
  
  db.updateAlertStatus(alert.alertId, "ACKNOWLEDGE", "Operator", "dispatcher");
  const fetchedAlert = db.getAlerts().find(a => a.alertId === alert.alertId);
  console.log("Alert status updated:", fetchedAlert?.status);

  console.log("\n=== 5. AUDIT LOGS ===");
  const logs = db.getAuditLogs().filter(l => l.entityId === newShipment.shipmentId || l.entityId === alert.alertId);
  console.log("Audit logs created:", logs.length);
}

run().catch(console.error);
