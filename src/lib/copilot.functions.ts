import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const Message = z.object({
  role: z.enum(["user", "assistant", "system"]),
  content: z.string().min(1).max(4000),
});

const Input = z.object({
  messages: z.array(Message).min(1).max(40),
});

const SYSTEM_PROMPT = `You are RailFlow AI Copilot, an enterprise logistics assistant for an Indian rail-road freight optimization platform.
You speak with calm authority — concise, data-forward, structured. Format responses in tight markdown: short paragraphs, bullet lists, bold key metrics, and use ₹ for cost.
Indian context: Delhi-Mumbai DFC, Eastern DFC, JNPT, Mundra, Dadri ICD, CONCOR, Indian Railways freight corridors.
You can reason about: freight mode (rail vs road vs multimodal), cost estimation, ETA, carbon emissions (rail ~22 gCO2/ton-km vs road ~62 gCO2/ton-km), consolidation, emergency prioritization, demand forecasting.
When the user asks for an optimization, return a recommendation with: mode, confidence %, cost estimate (₹), travel time (hrs), CO₂ savings (%), and 2-3 reasoning bullets.
Never invent live network status; speak in plausible, illustrative figures and flag them as estimates. Keep replies under ~180 words unless asked for detail.`;

export const copilotChat = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => Input.parse(data))
  .handler(async ({ data }) => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) throw new Error("Missing LOVABLE_API_KEY");

    const { generateText } = await import("ai");
    const { createLovableAiGatewayProvider } = await import("./ai-gateway.server");
    const gateway = createLovableAiGatewayProvider(key);

    const result = await generateText({
      model: gateway("google/gemini-3-flash-preview"),
      system: SYSTEM_PROMPT,
      messages: data.messages.map((m) => ({ role: m.role, content: m.content })),
    });

    return { text: result.text };
  });
