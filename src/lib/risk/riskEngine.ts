import { DbShipment, DbVehicle, DbAlert, DbPrediction, DbAiExplanation } from "../db/types";

export interface RiskFactorsEvaluation {
  deviationFactor: number;
  speedFactor: number;
  timeMarginFactor: number;
  alertsFactor: number;
  externalFactor: number;
  bullets: string[];
}

export function evaluateRiskFactors(
  shipment: Partial<DbShipment>,
  vehicle?: Partial<DbVehicle>,
  activeAlerts?: DbAlert[],
): RiskFactorsEvaluation {
  const bullets: string[] = [];
  let deviationFactor = 0;
  let speedFactor = 0;
  let timeMarginFactor = 0;
  let alertsFactor = 0;
  let externalFactor = 0;

  // 1. Route Deviation Evaluation
  const deviation = shipment.routeDeviationKm ?? 0;
  if (deviation > 12) {
    deviationFactor = 35;
    bullets.push(
      `Severe route deviation of ${deviation.toFixed(1)} km detected from authorized transit corridor.`,
    );
  } else if (deviation > 5) {
    deviationFactor = 22;
    bullets.push(
      `Moderate route deviation of ${deviation.toFixed(1)} km into non-corridor arterial roadways.`,
    );
  } else if (deviation > 1.5) {
    deviationFactor = 8;
    bullets.push(`Minor local bypass deviation of ${deviation.toFixed(1)} km.`);
  }

  // 2. Speed vs Baseline Evaluation
  const currentSpeed = vehicle?.speed ?? 45;
  const expectedSpeed = vehicle?.expectedSpeed ?? 65;
  const speedRatio = expectedSpeed > 0 ? currentSpeed / expectedSpeed : 1;

  if (speedRatio < 0.35 && currentSpeed < 20) {
    speedFactor = 30;
    bullets.push(
      `Vehicle speed severely constrained at ${currentSpeed} km/h (${Math.round((1 - speedRatio) * 100)}% below normal corridor baseline of ${expectedSpeed} km/h).`,
    );
  } else if (speedRatio < 0.65) {
    speedFactor = 18;
    bullets.push(
      `Speed reduced to ${currentSpeed} km/h due to highway congestion (baseline: ${expectedSpeed} km/h).`,
    );
  } else if (currentSpeed === 0 && shipment.status === "IN_TRANSIT") {
    speedFactor = 25;
    bullets.push(
      "Vehicle stationary in active transit corridor (potential checkpoint or unscheduled breakdown).",
    );
  }

  // 3. Time & ETA Deadline Evaluation
  const remainingKm = shipment.remainingKm ?? 240;
  const nominalHoursRemaining = expectedSpeed > 0 ? remainingKm / expectedSpeed : 4;
  const actualHoursAtCurrentSpeed =
    currentSpeed > 5 ? remainingKm / currentSpeed : nominalHoursRemaining * 2.5;
  const delayHours = Math.max(0, actualHoursAtCurrentSpeed - nominalHoursRemaining);
  const estimatedDelayMinutes = Math.round(delayHours * 60);

  if (estimatedDelayMinutes > 45) {
    timeMarginFactor = 25;
    bullets.push(
      `Predicted arrival will breach delivery SLA window by ~${estimatedDelayMinutes} minutes.`,
    );
  } else if (estimatedDelayMinutes > 15) {
    timeMarginFactor = 12;
    bullets.push(
      `Transit buffer compressed with ~${estimatedDelayMinutes} minutes potential delay.`,
    );
  }

  // 4. Active Alerts & Cargo Telemetry
  const relatedAlerts = (activeAlerts || []).filter(
    (a) =>
      (a.shipmentId === shipment.shipmentId || a.vehicleId === vehicle?.vehicleId) &&
      a.status === "ACTIVE",
  );

  if (relatedAlerts.length > 0) {
    const hasCritical = relatedAlerts.some((a) => a.severity === "CRITICAL");
    const hasHigh = relatedAlerts.some((a) => a.severity === "HIGH");
    if (hasCritical) {
      alertsFactor = 20;
      bullets.push("Active CRITICAL emergency/telemetry alert unresolved on this consignment.");
    } else if (hasHigh) {
      alertsFactor = 12;
      bullets.push("High priority sensor anomaly or road alert currently active.");
    } else {
      alertsFactor = 5;
    }
  }

  // 5. Cargo Priority Multiplier
  if (shipment.priority === "CRITICAL") {
    externalFactor += 10;
    bullets.push("High-priority tier consignment with strict SLA penalization.");
  }

  return {
    deviationFactor,
    speedFactor,
    timeMarginFactor,
    alertsFactor,
    externalFactor,
    bullets,
  };
}

export function calculateShipmentRisk(
  shipment: DbShipment,
  vehicle?: DbVehicle,
  activeAlerts: DbAlert[] = [],
): {
  riskScore: number;
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  delayProbability: number;
  estimatedDelayMinutes: number;
  riskFactors: string[];
  recommendedAction: string;
  confidence: number;
  explanation: DbAiExplanation;
} {
  const evalResult = evaluateRiskFactors(shipment, vehicle, activeAlerts);

  const rawScore =
    evalResult.deviationFactor +
    evalResult.speedFactor +
    evalResult.timeMarginFactor +
    evalResult.alertsFactor +
    evalResult.externalFactor;

  // Bound score between 5 and 98
  const riskScore = Math.min(98, Math.max(8, Math.round(rawScore)));

  let riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL" = "LOW";
  if (riskScore >= 75) riskLevel = "CRITICAL";
  else if (riskScore >= 50) riskLevel = "HIGH";
  else if (riskScore >= 25) riskLevel = "MEDIUM";
  else riskLevel = "LOW";

  // Delay probability is correlated with risk score and deviation
  const delayProbability = Math.min(
    95,
    Math.max(5, Math.round(riskScore * 0.95 + (shipment.routeDeviationKm > 5 ? 10 : 0))),
  );

  const currentSpeed = vehicle?.speed ?? 40;
  const expectedSpeed = vehicle?.expectedSpeed ?? 65;
  const remainingKm = shipment.remainingKm ?? 200;
  const delayMinutes = Math.max(
    0,
    Math.round((remainingKm / Math.max(currentSpeed, 10) - remainingKm / expectedSpeed) * 60),
  );

  let recommendedAction = "Maintain current multimodal corridor tracking.";
  if (riskLevel === "CRITICAL") {
    if (shipment.mode === "road" || shipment.activeRouteName.includes("NH")) {
      recommendedAction = `Reroute to Dedicated Freight Corridor (DFC Rail Rake slot) at nearest ICD hub to bypass highway gridlock and eliminate ${delayMinutes}m delay.`;
    } else {
      recommendedAction =
        "Request priority express clearance signal from Indian Railways Central DFC Traffic Controller.";
    }
  } else if (riskLevel === "HIGH") {
    recommendedAction =
      "Dispatch automated advisory to driver; reroute via green expressway alternate corridor.";
  } else if (riskLevel === "MEDIUM") {
    recommendedAction =
      "Increase GPS ping frequency to 15s; monitor upcoming toll plaza dwell times.";
  }

  const confidence = Math.min(96, Math.max(82, 85 + Math.round(shipment.remainingKm % 10)));

  const explanation: DbAiExplanation = {
    what:
      riskLevel === "CRITICAL"
        ? `CRITICAL DELAY & DEVIATION RISK DETECTED (${riskScore}/100)`
        : riskLevel === "HIGH"
          ? `Elevated Transit Delay Risk (${riskScore}/100)`
          : riskLevel === "MEDIUM"
            ? `Moderate Transit Fluctuations (${riskScore}/100)`
            : `Normal Optimized Corridor Operations (${riskScore}/100)`,
    why:
      evalResult.bullets.length > 0
        ? evalResult.bullets
        : ["Corridor speed, route geometry, and vehicle telemetry match expected schedules."],
    impact: `Estimated arrival impact: +${delayMinutes} minutes (${delayProbability}% probability of deadline breach).`,
    recommendedAction,
    confidence,
  };

  return {
    riskScore,
    riskLevel,
    delayProbability,
    estimatedDelayMinutes: delayMinutes,
    riskFactors: evalResult.bullets,
    recommendedAction,
    confidence,
    explanation,
  };
}

export function generatePredictionRecord(
  shipment: DbShipment,
  vehicle?: DbVehicle,
  activeAlerts: DbAlert[] = [],
): DbPrediction {
  const result = calculateShipmentRisk(shipment, vehicle, activeAlerts);

  // Compute predicted ETA by adding delay minutes to current ETA
  const now = new Date();
  const predictedEtaDate = new Date(
    now.getTime() + (shipment.remainingKm / 55) * 3600000 + result.estimatedDelayMinutes * 60000,
  );
  const predictedEtaStr = `${String(predictedEtaDate.getHours()).padStart(2, "0")}:${String(
    predictedEtaDate.getMinutes(),
  ).padStart(2, "0")}`;

  return {
    id: `PRED-${shipment.shipmentId}-${Date.now().toString(36)}`,
    shipmentId: shipment.shipmentId,
    calculatedAt: new Date().toISOString(),
    originalEta: shipment.originalEta || shipment.expectedDeliveryTime,
    currentEta: shipment.currentEta || shipment.eta,
    predictedEta: predictedEtaStr,
    delayMinutes: result.estimatedDelayMinutes,
    delayProbability: result.delayProbability,
    riskScore: result.riskScore,
    riskLevel: result.riskLevel,
    confidence: result.confidence,
    riskFactors: result.riskFactors,
    recommendedAction: result.recommendedAction,
    explanation: result.explanation,
    history: [
      {
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        predictedEta: shipment.originalEta || "18:30",
        riskScore: Math.max(10, result.riskScore - 25),
        delayMinutes: Math.max(0, result.estimatedDelayMinutes - 20),
      },
      {
        timestamp: new Date().toISOString(),
        predictedEta: predictedEtaStr,
        riskScore: result.riskScore,
        delayMinutes: result.estimatedDelayMinutes,
      },
    ],
  };
}
