import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X, Copy, Check, CornerDownLeft } from "lucide-react";
import { copilotChat } from "@/lib/copilot.functions";
import { useDb } from "@/lib/db/useDb";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "⚠️ Which shipments are at highest risk?",
  "🔍 Why is shipment FW-1042 delayed?",
  "🚨 Show active critical incidents",
  "⚡ Compare DFC Rail vs NH-48 Highway",
  "📊 Summarize today's freight operations",
];

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "👋 **Welcome to FreightWave AI Command Copilot.**\n\nI have direct real-time access to the live logistics database. Ask me to diagnose delayed consignments like **FW-1042**, analyze multimodal corridor tradeoffs, evaluate incident reports, or calculate risk scores.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const dbState = useDb();
  const chat = useServerFn(copilotChat);

  const mutation = useMutation({
    mutationFn: async (next: Msg[]) =>
      chat({
        data: {
          messages: next,
          liveDatabaseSnapshot: {
            shipments: dbState.shipments,
            vehicles: dbState.vehicles,
            alerts: dbState.alerts,
            incidents: dbState.incidents,
            routes: dbState.routes,
          },
        },
      }),
    onSuccess: (res) => {
      setMessages((m) => [...m, { role: "assistant", content: res.text || "(no response)" }]);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : "Request failed";
      setMessages((m) => [...m, { role: "assistant", content: `⚠️ ${msg}` }]);
    },
  });

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, mutation.isPending]);

  const send = (text: string) => {
    const t = text.trim();
    if (!t || mutation.isPending) return;
    const next: Msg[] = [...messages, { role: "user", content: t }];
    setMessages(next);
    setInput("");
    mutation.mutate(next);
  };

  const copyToClipboard = (text: string, idx: number) => {
    navigator.clipboard?.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-primary to-accent px-4 py-3 text-xs font-bold text-primary-foreground shadow-2xl transition hover:scale-105 active:scale-95"
        aria-label="Open AI Copilot"
      >
        {open ? <X className="size-5" /> : <Sparkles className="size-5" />}
        <span className="hidden sm:inline">{open ? "Close Assistant" : "Ask AI Copilot"}</span>
      </button>

      {open ? (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 flex h-[580px] w-[min(94vw,440px)] flex-col overflow-hidden rounded-2xl border border-border/80 bg-surface-2/95 shadow-2xl backdrop-blur-2xl animate-in fade-in slide-in-from-bottom-4">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/70 px-4 py-3.5 bg-surface">
            <div className="flex items-center gap-3">
              <div className="grid size-9 place-items-center rounded-xl bg-primary/15 text-primary">
                <Bot className="size-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-foreground">FreightWave AI Copilot</span>
                  <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.2 text-[9px] font-bold text-emerald-400">
                    Live Data
                  </span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  Multimodal Freight Intelligence · Gemini 2.5
                </div>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="grid size-8 place-items-center rounded-lg hover:bg-surface-2 text-muted-foreground hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 space-y-3.5 overflow-y-auto p-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
              >
                <div
                  className={`relative group ${
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-tr-xs bg-primary px-4 py-2.5 text-xs sm:text-sm font-medium text-primary-foreground shadow-sm"
                      : "max-w-[90%] rounded-2xl rounded-tl-xs border border-border/70 bg-surface px-4 py-3 text-xs sm:text-sm leading-relaxed text-foreground shadow-sm"
                  }`}
                >
                  <Markdown text={m.content} />
                  {m.role === "assistant" && (
                    <button
                      onClick={() => copyToClipboard(m.content, i)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-foreground rounded transition"
                      title="Copy response"
                    >
                      {copiedIndex === i ? (
                        <Check className="size-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
            {mutation.isPending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-xs border border-border/70 bg-surface px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
                    <Sparkles className="size-3.5 text-primary animate-spin" />
                    <span>Analyzing multimodal corridors...</span>
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {/* Quick Prompts Chips */}
          <div className="border-t border-border/60 bg-surface/50 p-2.5">
            <div className="text-[10px] font-semibold text-muted-foreground mb-1.5 px-1">
              Suggested Questions:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="rounded-lg border border-border/80 bg-surface px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-surface-2 transition"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              send(input);
            }}
            className="flex items-center gap-2 border-t border-border/70 bg-surface p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about tariffs, DFC slots, rail vs road..."
              className="flex-1 rounded-xl border border-border bg-background px-3.5 py-2 text-xs sm:text-sm font-medium outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
            <button
              type="submit"
              disabled={mutation.isPending || !input.trim()}
              className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground disabled:opacity-40 transition hover:brightness-110"
            >
              <Send className="size-4" />
            </button>
          </form>
        </div>
      ) : null}
    </>
  );
}

/** Minimal markdown: bold, lists, paragraphs. Keeps the bundle small. */
function Markdown({ text }: { text: string }) {
  const blocks = text.split(/\n{2,}/);
  return (
    <div className="space-y-2 [&_strong]:text-foreground [&_strong]:font-semibold">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-4 text-xs sm:text-[13px]">
              {lines.map((l, j) => (
                <li
                  key={j}
                  dangerouslySetInnerHTML={{ __html: inline(l.replace(/^\s*[-*•]\s+/, "")) }}
                />
              ))}
            </ul>
          );
        }
        return (
          <p
            key={i}
            className="text-xs sm:text-[13px]"
            dangerouslySetInnerHTML={{ __html: inline(block) }}
          />
        );
      })}
    </div>
  );
}

function inline(s: string) {
  // escape, then bold
  const esc = s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c]!);
  return esc
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(
      /`([^`]+)`/g,
      "<code class='font-mono text-[11px] text-primary bg-primary/10 px-1 py-0.5 rounded'>$1</code>",
    );
}
