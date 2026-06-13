import { useMutation } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { Bot, Send, Sparkles, X } from "lucide-react";
import { copilotChat } from "@/lib/copilot.functions";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Optimize shipment from Bengaluru to Mumbai",
  "Show consolidation opportunities",
  "Compare rail and road costs for Delhi → Kolkata",
  "Predict next week's freight demand",
];

export function AICopilot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content:
        "**RailFlow Copilot online.** Ask me to optimize a shipment, compare modes, surface consolidation, or forecast demand.",
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const chat = useServerFn(copilotChat);

  const mutation = useMutation({
    mutationFn: async (next: Msg[]) => chat({ data: { messages: next } }),
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

  return (
    <>
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 grid size-14 place-items-center rounded-full bg-primary text-primary-foreground shadow-2xl glow-primary transition hover:scale-105"
        aria-label="Open AI Copilot"
      >
        {open ? <X className="size-6" /> : <Sparkles className="size-6" />}
      </button>

      {open ? (
        <div className="fixed bottom-24 right-6 z-50 flex h-[560px] w-[min(92vw,420px)] flex-col overflow-hidden rounded-2xl glass-strong shadow-2xl">
          <div className="flex items-center gap-3 border-b border-border/60 px-4 py-3">
            <div className="grid size-9 place-items-center rounded-md bg-primary/15 ring-1 ring-primary/40">
              <Bot className="size-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">RailFlow Copilot</div>
              <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">Gemini · Lovable AI</div>
            </div>
            <span className="font-mono text-[9px] uppercase tracking-widest text-accent">● online</span>
          </div>

          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
            {messages.map((m, i) => (
              <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
                <div
                  className={
                    m.role === "user"
                      ? "max-w-[85%] rounded-2xl rounded-tr-sm bg-primary px-3.5 py-2.5 text-sm text-primary-foreground"
                      : "max-w-[90%] rounded-2xl rounded-tl-sm border border-border bg-surface/70 px-3.5 py-2.5 text-sm leading-relaxed"
                  }
                >
                  <Markdown text={m.content} />
                </div>
              </div>
            ))}
            {mutation.isPending ? (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-tl-sm border border-border bg-surface/70 px-3.5 py-2.5">
                  <div className="flex gap-1">
                    <span className="size-1.5 animate-pulse rounded-full bg-primary" />
                    <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:120ms]" />
                    <span className="size-1.5 animate-pulse rounded-full bg-primary [animation-delay:240ms]" />
                  </div>
                </div>
              </div>
            ) : null}
          </div>

          {messages.length <= 1 ? (
            <div className="border-t border-border/60 px-3 py-2">
              <div className="grid grid-cols-1 gap-1.5">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => send(s)}
                    className="rounded-md border border-border bg-surface/40 px-3 py-1.5 text-left text-xs text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <form
            onSubmit={(e) => { e.preventDefault(); send(input); }}
            className="flex items-center gap-2 border-t border-border/60 px-3 py-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask the copilot…"
              className="flex-1 rounded-md border border-border bg-background/70 px-3 py-2 text-sm outline-none focus:border-primary/50"
            />
            <button
              type="submit"
              disabled={mutation.isPending || !input.trim()}
              className="grid size-9 place-items-center rounded-md bg-primary text-primary-foreground disabled:opacity-40"
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
    <div className="space-y-2 [&_strong]:text-foreground">
      {blocks.map((block, i) => {
        const lines = block.split("\n");
        const isList = lines.every((l) => /^\s*[-*•]\s+/.test(l));
        if (isList) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-4 text-[13px]">
              {lines.map((l, j) => (
                <li key={j} dangerouslySetInnerHTML={{ __html: inline(l.replace(/^\s*[-*•]\s+/, "")) }} />
              ))}
            </ul>
          );
        }
        return <p key={i} className="text-[13px]" dangerouslySetInnerHTML={{ __html: inline(block) }} />;
      })}
    </div>
  );
}

function inline(s: string) {
  // escape, then bold
  const esc = s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" }[c]!));
  return esc.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/`([^`]+)`/g, "<code class='font-mono text-[12px] text-primary'>$1</code>");
}
