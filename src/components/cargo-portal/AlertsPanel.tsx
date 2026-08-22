import React, { useState } from "react";
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  Filter,
  Check,
  Radio,
  ExternalLink,
} from "lucide-react";
import { CargoAlert } from "@/types/cargo-portal";

interface AlertsPanelProps {
  alerts: CargoAlert[];
  onSelectShipmentId?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

export function AlertsPanel({ alerts, onSelectShipmentId, onMarkAllAsRead }: AlertsPanelProps) {
  const [filter, setFilter] = useState<"ALL" | "DELAYS" | "MOVEMENT" | "SENSOR">("ALL");

  const filteredAlerts = alerts.filter((a) => {
    if (filter === "DELAYS") return a.type === "DELAY" || a.type === "WEATHER";
    if (filter === "MOVEMENT")
      return a.type === "DEPARTURE" || a.type === "ON_SCHEDULE" || a.type === "DELIVERED";
    if (filter === "SENSOR") return a.type === "SENSOR";
    return true;
  });

  const getAlertIcon = (alert: CargoAlert) => {
    switch (alert.severity) {
      case "success":
        return <CheckCircle2 className="size-4.5 text-emerald-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="size-4.5 text-amber-500 shrink-0" />;
      case "error":
        return <AlertTriangle className="size-4.5 text-red-500 shrink-0" />;
      default:
        return <Info className="size-4.5 text-blue-500 shrink-0" />;
    }
  };

  const getAlertStyle = (alert: CargoAlert) => {
    switch (alert.severity) {
      case "success":
        return "border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20";
      case "warning":
        return "border-amber-500/30 bg-amber-50/50 dark:bg-amber-950/20";
      case "error":
        return "border-red-500/30 bg-red-50/50 dark:bg-red-950/20";
      default:
        return "border-blue-500/30 bg-blue-50/50 dark:bg-blue-950/20";
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-surface p-5 shadow-md space-y-4">
      {/* Header with Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/70 pb-3">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-blue-600/10 text-blue-600">
            <Bell className="size-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Alerts & Movement Advisories</h3>
            <p className="text-[10px] text-muted-foreground">
              Real-time FOIS & Train Control Broadcasts
            </p>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setFilter("ALL")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              filter === "ALL"
                ? "bg-blue-600 text-white"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilter("MOVEMENT")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              filter === "MOVEMENT"
                ? "bg-blue-600 text-white"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Movement
          </button>
          <button
            onClick={() => setFilter("DELAYS")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              filter === "DELAYS"
                ? "bg-blue-600 text-white"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Delays
          </button>
          <button
            onClick={() => setFilter("SENSOR")}
            className={`rounded-lg px-2.5 py-1 font-semibold transition ${
              filter === "SENSOR"
                ? "bg-blue-600 text-white"
                : "bg-surface-2 text-muted-foreground hover:text-foreground"
            }`}
          >
            Sensors
          </button>
        </div>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-2.5">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-xs text-muted-foreground">
            No alerts matching the selected category.
          </div>
        ) : (
          filteredAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`rounded-xl border p-3.5 flex items-start gap-3 transition hover:shadow-xs ${getAlertStyle(
                alert,
              )}`}
            >
              {getAlertIcon(alert)}

              <div className="flex-1 space-y-1">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <span className="font-bold text-foreground text-xs">{alert.title}</span>
                  <span className="font-mono text-[10px] text-muted-foreground flex items-center gap-1">
                    <Clock className="size-3" />
                    {alert.timestamp}
                  </span>
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">{alert.message}</p>

                <div className="flex items-center gap-2 pt-1">
                  <span className="rounded bg-surface/80 px-2 py-0.5 font-mono text-[10px] font-bold text-foreground border border-border">
                    {alert.shipmentId}
                  </span>
                  {onSelectShipmentId && (
                    <button
                      onClick={() => onSelectShipmentId(alert.shipmentId)}
                      className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <span>Track Shipment</span>
                      <ExternalLink className="size-3" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
