import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { getDatabaseSnapshotFn } from "./api/database.functions";
import type { DatabaseState } from "../db/types";

function buildContextSnapshot(db: DatabaseState): string {
  const shipments = db.shipments
    .map(
      (s) =>
        `Shipment ${s.shipmentId} (${s.status}): ETA ${s.predictedEta}, Risk ${s.riskScore}/100, Delay ${s.estimatedDelayMinutes}m. Factors: ${s.riskFactors?.join(", ") || "None"}`,
    )
    .join("\n");
  const alerts = db.alerts
    .map((a) => `Alert ${a.alertId} (${a.severity}): ${a.description}`)
    .join("\n");
  const incidents = db.incidents
    .map((i) => `Incident ${i.incidentId} (${i.severity}): ${i.cause}`)
    .join("\n");

  return `Active Shipments:
${shipments}

Active Alerts:
${alerts}

Active Incidents:
${incidents}
`;
}

export const copilotChat = createServerFn({ method: "POST" })
  .validator((d: unknown) => {
    return z
      .object({
        messages: z.array(
          z.object({
            role: z.enum(["user", "assistant", "system"]),
            content: z.string(),
          }),
        ),
      })
      .parse(d);
  })
  .handler(async ({ data }) => {
    // Get live database state
    const dbSnapshotResponse = await getDatabaseSnapshotFn();
    const liveDatabaseSnapshot = dbSnapshotResponse as DatabaseState;
    const dbContext = buildContextSnapshot(liveDatabaseSnapshot);

    const geminiKey = process.env.GEMINI_API_KEY;
    const lovableKey = process.env.LOVABLE_API_KEY;

    const SYSTEM_PROMPT = `You are FreightWave AI Copilot, the intelligent logistics command copilot for Indian multimodal freight (Dedicated Freight Corridors, National Highways, and ICD Ports).
You have real-time access to the live logistics database provided below. Answer questions accurately and factually based on this data. NEVER hallucinate fictional shipment IDs, risk scores, or vehicles. If a user asks about a shipment or incident not in the database, explicitly state it is not found.

CURRENT DATABASE STATE:
${dbContext}

CRITICAL OPERATIONAL RULES:
1. Always base your answers on the CURRENT DATABASE STATE provided above.
2. When asked why a shipment is delayed, explain the 4 pillars: WHAT happened, WHY it happened, IMPACT, and RECOMMENDED ACTION.
3. Always speak with concise, professional authority. Use tight markdown bullet points, bold key metrics, and ₹ for Indian currency.
`;

    if (geminiKey) {
      try {
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey: geminiKey });
        const contents = data.messages
          .filter((m) => m.role !== "system")
          .map((m) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
          }));

        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction: SYSTEM_PROMPT,
          },
        });

        if (response.text) {
          return { text: response.text };
        }
      } catch (err) {
        console.error("Gemini API error, falling back to data-aware engine:", err);
      }
    }

    if (lovableKey) {
      try {
        const { generateText } = await import("ai");
        const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
        const gateway = createLovableAiGatewayProvider(lovableKey);

        const result = await generateText({
          model: gateway("google/gemini-2.5-flash"),
          system: SYSTEM_PROMPT,
          messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
        });

        return { text: result.text };
      } catch (err) {
        console.error("Lovable AI Gateway error, falling back to data-aware engine:", err);
      }
    }

    // High-precision Data-Aware Rule Engine Fallback (100% factual to live database)
    const lastUserMsg =
      [...data.messages]
        .reverse()
        .find((m) => m.role === "user")
        ?.content.toLowerCase() || "";

    const criticalShipments = liveDatabaseSnapshot.shipments.filter(
      (s) => s.riskLevel === "CRITICAL" || s.riskScore >= 75,
    );
    const highestRisk = criticalShipments.sort((a, b) => b.riskScore - a.riskScore)[0];

    if (
      lastUserMsg.includes("risk") ||
      lastUserMsg.includes("highest risk") ||
      lastUserMsg.includes("danger") ||
      lastUserMsg.includes("attention")
    ) {
      if (highestRisk) {
        return {
          text: `**Highest Risk Shipment Analysis:**\n\n• **Consignment ID:** **${highestRisk.shipmentId}** (${highestRisk.customer})\n• **Risk Score:** **${highestRisk.riskScore} / 100 (${highestRisk.riskLevel})** | Delay Probability: **${highestRisk.delayProbability}%**\n• **Current Location:** ${highestRisk.currentLocation.address}\n• **Vehicle:** ${highestRisk.vehicleId}\n\n**Root Cause Breakdown:**\n${highestRisk.riskFactors?.map((f, i) => `${i + 1}. **Factor:** ${f}`).join("\\n")}\n\n**Recommended Action:**\n${highestRisk.recommendedAction || "Monitor closely."}`,
        };
      } else {
        return { text: "There are currently no high-risk shipments in the system." };
      }
    }

    if (
      lastUserMsg.includes("summarize") ||
      lastUserMsg.includes("operations") ||
      lastUserMsg.includes("overview") ||
      lastUserMsg.includes("status")
    ) {
      const activeCount = liveDatabaseSnapshot.shipments.length;
      const delayedCount = liveDatabaseSnapshot.shipments.filter(
        (s) => s.status === "DELAYED",
      ).length;
      return {
        text: `**Executive Summary of National Freight Operations:**\n\n• **Active Shipments:** ${activeCount} Consignments\n• **Delayed Shipments:** ${delayedCount} Consignments\n• **Active Alerts:** ${liveDatabaseSnapshot.alerts.length} Alerts\n• **Active Incidents:** ${liveDatabaseSnapshot.incidents.length} Incidents\n\n**Top Priority:** Operator decision required on high-risk active shipments.`,
      };
    }

    return {
      text: `**FreightWave AI Copilot Intelligence:**\n\n• **Live Network Active:** ${liveDatabaseSnapshot.shipments.length} tracked shipments.\n• **High-Risk Consignments:** ${criticalShipments.length} critical shipments.\n• **Critical Incidents:** ${liveDatabaseSnapshot.incidents.length} active emergencies.\n\n*You can ask me to analyze specific shipments, evaluate rerouting tradeoffs, investigate driver safety, or summarize corridor KPIs.*`,
    };
  });
