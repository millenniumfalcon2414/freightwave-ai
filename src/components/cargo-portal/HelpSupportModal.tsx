import React, { useState } from "react";
import {
  HelpCircle,
  Phone,
  Mail,
  MessageSquare,
  FileQuestion,
  X,
  ExternalLink,
  CheckCircle2,
  Send,
  Building2,
  AlertCircle,
} from "lucide-react";

interface HelpSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  cargoId?: string;
}

export function HelpSupportModal({ isOpen, onClose, cargoId }: HelpSupportModalProps) {
  const [ticketSubject, setTicketSubject] = useState(
    cargoId ? `Inquiry regarding Consignment ${cargoId}` : "",
  );
  const [ticketMessage, setTicketMessage] = useState("");
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketMessage.trim()) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketMessage("");
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <div className="relative w-full max-w-xl rounded-2xl border border-border bg-surface p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 items-center justify-center rounded-xl bg-blue-600/10 text-blue-600">
              <HelpCircle className="size-4.5" />
            </div>
            <div>
              <h3 className="font-bold text-foreground text-base">
                Cargo Owner Help & Freight Desk
              </h3>
              <p className="text-xs text-muted-foreground">
                24/7 Dedicated Indian Railways & Multimodal Freight Support
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface-2 hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* 24/7 Helplines Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="rounded-xl border border-border bg-surface-2/40 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <Phone className="size-3.5 text-emerald-600" />
              <span>FOIS Freight Helpline</span>
            </div>
            <div className="font-mono text-sm font-bold text-blue-600">
              139 (Ext 6) / 1800-111-321
            </div>
            <div className="text-[10px] text-muted-foreground">
              Toll-free 24/7 live rake position helpline
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface-2/40 p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <MessageSquare className="size-3.5 text-blue-600" />
              <span>WhatsApp Instant Rake Bot</span>
            </div>
            <div className="font-mono text-sm font-bold text-emerald-600">+91 98200 45678</div>
            <div className="text-[10px] text-muted-foreground">
              Send "STATUS {cargoId || "RAIL-IND-28491"}" for live updates
            </div>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-muted-foreground">
            Frequently Asked Questions
          </h4>

          <div className="space-y-1.5 text-xs">
            <details className="rounded-lg border border-border/80 bg-surface-2/30 p-2.5 group">
              <summary className="font-bold text-foreground cursor-pointer flex justify-between items-center">
                <span>How frequently is the GPS / NavIC location updated?</span>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Telemetry pings every 2 to 5 minutes via ISRO NavIC satellite transponders fitted to
                locomotives and smart wagon electronic seals.
              </p>
            </details>

            <details className="rounded-lg border border-border/80 bg-surface-2/30 p-2.5 group">
              <summary className="font-bold text-foreground cursor-pointer flex justify-between items-center">
                <span>Where can I download my official Electronic Railway Receipt (e-RR)?</span>
                <span className="text-muted-foreground group-open:rotate-180 transition-transform">
                  ▼
                </span>
              </summary>
              <p className="mt-2 text-muted-foreground leading-relaxed">
                Click on the <strong>Documents</strong> tab in the top navigation bar to view and
                download digitally certified e-RRs, GST Invoices, and Gate Passes.
              </p>
            </details>
          </div>
        </div>

        {/* Instant Support Ticket Form */}
        <form onSubmit={handleSubmitTicket} className="space-y-3 pt-2 border-t border-border">
          <h4 className="text-xs font-bold uppercase text-muted-foreground">
            Raise Priority Support Ticket
          </h4>

          {ticketSubmitted ? (
            <div className="rounded-xl border border-emerald-500/40 bg-emerald-50/50 dark:bg-emerald-950/30 p-3 text-xs font-bold text-emerald-600 flex items-center gap-2">
              <CheckCircle2 className="size-4" />
              <span>Ticket #TK-9924 registered. Station Freight Officer assigned.</span>
            </div>
          ) : (
            <>
              <div>
                <input
                  type="text"
                  value={ticketSubject}
                  onChange={(e) => setTicketSubject(e.target.value)}
                  placeholder="Subject: e.g. Wagon temperature check or delay query"
                  className="w-full rounded-xl border border-border bg-surface-2/50 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              <div>
                <textarea
                  rows={3}
                  value={ticketMessage}
                  onChange={(e) => setTicketMessage(e.target.value)}
                  placeholder="Describe your issue or request..."
                  className="w-full rounded-xl border border-border bg-surface-2/50 p-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-xl border border-border px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-surface-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-blue-700 shadow-xs"
                >
                  <Send className="size-3.5" />
                  <span>Submit Ticket</span>
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
