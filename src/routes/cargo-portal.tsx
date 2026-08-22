import { createFileRoute } from "@tanstack/react-router";
import React, { useState, useEffect } from "react";
import {
  Package,
  Search,
  CheckCircle2,
  AlertTriangle,
  FileText,
  ShieldCheck,
  Bell,
  HelpCircle,
  Train,
  Truck,
  Layers,
  MapPin,
  RefreshCw,
  Compass,
  ArrowRight,
  Sparkles,
  Zap,
} from "lucide-react";
import { CargoOwnerNav } from "@/components/cargo-portal/CargoOwnerNav";
import { CargoPortalMap } from "@/components/cargo-portal/CargoPortalMap";
import { ShipmentTrackerHeader } from "@/components/cargo-portal/ShipmentTrackerHeader";
import { EtaCard } from "@/components/cargo-portal/EtaCard";
import { ShipmentDetailsCard } from "@/components/cargo-portal/ShipmentDetailsCard";
import { JourneyTimeline } from "@/components/cargo-portal/JourneyTimeline";
import { TrainInfoCard } from "@/components/cargo-portal/TrainInfoCard";
import { CargoConditionCard } from "@/components/cargo-portal/CargoConditionCard";
import { AlertsPanel } from "@/components/cargo-portal/AlertsPanel";
import { MyShipmentsView } from "@/components/cargo-portal/MyShipmentsView";
import { DocumentsSection } from "@/components/cargo-portal/DocumentsSection";
import { DeliveryConfirmationCard } from "@/components/cargo-portal/DeliveryConfirmationCard";
import { HelpSupportModal } from "@/components/cargo-portal/HelpSupportModal";
import { UserProfileModal } from "@/components/cargo-portal/UserProfileModal";
import { MOCK_SHIPMENTS, MOCK_ALERTS, MOCK_USER_PROFILE } from "@/lib/cargo-portal/mockShipments";
import { CargoShipment, CargoAlert } from "@/types/cargo-portal";

export const Route = createFileRoute("/cargo-portal")({
  head: () => ({
    meta: [
      { title: "Cargo Owner Tracking Portal · RailFlow AI" },
      {
        name: "description",
        content:
          "Customer-facing live railway & road cargo tracking portal. Real-time GPS location, journey timeline, train speed, documents, and condition sensors.",
      },
    ],
  }),
  component: CargoPortalPage,
});

function CargoPortalPage() {
  const [shipments, setShipments] = useState<CargoShipment[]>(MOCK_SHIPMENTS);
  const [activeShipmentId, setActiveShipmentId] = useState<string>("RAIL-IND-28491");
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "shipments" | "documents" | "condition" | "alerts"
  >("dashboard");

  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchFeedback, setSearchFeedback] = useState<{
    status: "found" | "not_found" | null;
    message: string;
  }>({ status: null, message: "" });

  const [copiedId, setCopiedId] = useState(false);
  const [isRefreshingGps, setIsRefreshingGps] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [alerts, setAlerts] = useState<CargoAlert[]>(MOCK_ALERTS);

  // Active shipment object
  const activeShipment = shipments.find((s) => s.id === activeShipmentId) || shipments[0];

  // Copy Cargo ID handler
  const handleCopyCargoId = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(activeShipment.id);
    }
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  // Search Consignment / Cargo ID
  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim().toUpperCase();
    if (!query) return;

    const match = shipments.find(
      (s) =>
        s.id.toUpperCase() === query ||
        s.id.toUpperCase().includes(query) ||
        s.consignmentNumber.toUpperCase().includes(query) ||
        s.train.wagonNumber.toUpperCase().includes(query),
    );

    if (match) {
      setActiveShipmentId(match.id);
      setActiveTab("dashboard");
      setSearchFeedback({
        status: "found",
        message: `Cargo Found ✓ — Displaying live journey for ${match.id} (${match.origin.city} → ${match.destination.city})`,
      });
      setTimeout(() => setSearchFeedback({ status: null, message: "" }), 5000);
    } else {
      setSearchFeedback({
        status: "not_found",
        message: `No active cargo found for "${query}". Try sample ID: RAIL-IND-28491, RAIL-IND-55912, or RAIL-IND-88231.`,
      });
      setTimeout(() => setSearchFeedback({ status: null, message: "" }), 6000);
    }
  };

  // Simulate Live GPS Telemetry Refresh
  const handleRefreshLocation = () => {
    setIsRefreshingGps(true);
    setTimeout(() => {
      setShipments((prev) =>
        prev.map((s) => {
          if (s.id === activeShipmentId) {
            // Slight jitter in speed & random minutes update
            const deltaSpeed = Math.floor(Math.random() * 5) - 2;
            const newSpeed = Math.max(35, Math.min(85, s.currentSpeedKmh + deltaSpeed));
            return {
              ...s,
              lastUpdatedMinutesAgo: 0,
              currentSpeedKmh: newSpeed,
              condition: {
                ...s.condition,
                lastSyncTime: "Just now (NavIC verified)",
              },
            };
          }
          return s;
        }),
      );
      setIsRefreshingGps(false);
      setSearchFeedback({
        status: "found",
        message: `✓ Live GPS coordinates updated from Indian Railways FOIS satellite feed.`,
      });
      setTimeout(() => setSearchFeedback({ status: null, message: "" }), 3500);
    }, 800);
  };

  const unreadAlertsCount = alerts.filter((a) => !a.read).length;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Customer Navigation Bar */}
      <CargoOwnerNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        unreadAlertsCount={unreadAlertsCount}
        userProfile={MOCK_USER_PROFILE}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
      />

      {/* Main Container */}
      <main className="flex-1 mx-auto w-full max-w-[1440px] px-4 sm:px-6 py-6 space-y-6">
        {/* Quick Search Chips & Found Status Feedback */}
        <div className="space-y-2">
          {/* Quick Preset Chips for Easy Evaluation */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs bg-surface-2/60 border border-border/80 rounded-xl px-4 py-2">
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="font-semibold text-foreground">Quick Track Consignments:</span>
              <span className="hidden sm:inline text-[11px]">
                (Click any sample consignment below)
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 font-mono text-[11px]">
              {shipments.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveShipmentId(s.id);
                    setActiveTab("dashboard");
                  }}
                  className={`rounded-lg px-2.5 py-1 font-bold transition flex items-center gap-1.5 ${
                    activeShipmentId === s.id
                      ? "bg-blue-600 text-white shadow-xs"
                      : "bg-surface border border-border text-foreground hover:bg-surface-2"
                  }`}
                >
                  <span>{s.id}</span>
                  <span className="text-[9px] opacity-80">({s.origin.city})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Search Result Feedback Banner */}
          {searchFeedback.status && (
            <div
              className={`rounded-xl border p-3 text-xs font-bold flex items-center justify-between animate-in fade-in ${
                searchFeedback.status === "found"
                  ? "border-emerald-500/40 bg-emerald-50/70 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300"
                  : "border-amber-500/40 bg-amber-50/70 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300"
              }`}
            >
              <div className="flex items-center gap-2">
                {searchFeedback.status === "found" ? (
                  <CheckCircle2 className="size-4 text-emerald-600" />
                ) : (
                  <AlertTriangle className="size-4 text-amber-600" />
                )}
                <span>{searchFeedback.message}</span>
              </div>
              <button
                onClick={() => setSearchFeedback({ status: null, message: "" })}
                className="text-[11px] underline font-medium"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        {/* Tab 1: Dashboard Main View */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            {/* Top Active Shipment Tracker Header & Progress Bar */}
            <ShipmentTrackerHeader
              shipment={activeShipment}
              onCopyCargoId={handleCopyCargoId}
              copied={copiedId}
              onViewDocuments={() => setActiveTab("documents")}
            />

            {/* If Delivered, Display Prominent Proof of Delivery Card */}
            {activeShipment.status === "DELIVERED" && (
              <DeliveryConfirmationCard
                shipment={activeShipment}
                onViewDocuments={() => setActiveTab("documents")}
              />
            )}

            {/* Main Interactive Map & ETA Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
              {/* Left 2 Columns: Large Interactive Map */}
              <div className="lg:col-span-2 space-y-6">
                <CargoPortalMap
                  shipment={activeShipment}
                  onRefreshLocation={handleRefreshLocation}
                  isRefreshing={isRefreshingGps}
                />

                {/* Train Information & Locomotive Telemetry */}
                <TrainInfoCard
                  train={activeShipment.train}
                  expectedDeliveryTime={activeShipment.estimatedDeliveryTime}
                  expectedDeliveryDate={activeShipment.estimatedDeliveryDate}
                />

                {/* IoT Sensor Health & Telemetry */}
                <CargoConditionCard condition={activeShipment.condition} />
              </div>

              {/* Right 1 Column: Estimated Delivery ETA + Journey Timeline */}
              <div className="space-y-6">
                {/* 1. Golden ETA Priority Card */}
                <EtaCard shipment={activeShipment} />

                {/* 2. Detailed Shipment Information Card */}
                <ShipmentDetailsCard shipment={activeShipment} />

                {/* 3. Vertical Journey Milestone Timeline */}
                <JourneyTimeline
                  timeline={activeShipment.timeline}
                  currentSpeedKmh={activeShipment.currentSpeedKmh}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: My Shipments View */}
        {activeTab === "shipments" && (
          <MyShipmentsView
            shipments={shipments}
            activeShipmentId={activeShipmentId}
            onSelectShipment={(s) => setActiveShipmentId(s.id)}
            onTrackShipment={(s) => {
              setActiveShipmentId(s.id);
              setActiveTab("dashboard");
            }}
          />
        )}

        {/* Tab 3: Official Documents */}
        {activeTab === "documents" && <DocumentsSection shipment={activeShipment} />}

        {/* Tab 4: Cargo Condition & Sensors */}
        {activeTab === "condition" && (
          <div className="space-y-6">
            <CargoConditionCard condition={activeShipment.condition} />
            <ShipmentDetailsCard shipment={activeShipment} />
          </div>
        )}

        {/* Tab 5: Alerts & Notifications */}
        {activeTab === "alerts" && (
          <div className="space-y-6">
            <AlertsPanel
              alerts={alerts}
              onSelectShipmentId={(id) => {
                const match = shipments.find((s) => s.id === id);
                if (match) {
                  setActiveShipmentId(match.id);
                  setActiveTab("dashboard");
                }
              }}
              onMarkAllAsRead={() => {
                setAlerts((prev) => prev.map((a) => ({ ...a, read: true })));
              }}
            />
          </div>
        )}
      </main>

      {/* Modals */}
      <HelpSupportModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
        cargoId={activeShipment.id}
      />

      <UserProfileModal
        isOpen={profileModalOpen}
        onClose={() => setProfileModalOpen(false)}
        userProfile={MOCK_USER_PROFILE}
      />

      {/* Footer */}
      <footer className="border-t border-border/70 bg-surface-2/40 py-6 mt-12 text-xs text-muted-foreground">
        <div className="mx-auto max-w-[1440px] px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Train className="size-4 text-blue-600" />
            <span className="font-bold text-foreground">RailFlow.Track</span>
            <span>— Dedicated Cargo Owner & Customer Multimodal Freight Tracking Platform</span>
          </div>

          <div className="flex items-center gap-4">
            <span>Powered by Indian Railways FOIS & ISRO NavIC</span>
            <span>·</span>
            <button
              onClick={() => setHelpModalOpen(true)}
              className="text-blue-600 hover:underline font-semibold"
            >
              24/7 Helpline
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
