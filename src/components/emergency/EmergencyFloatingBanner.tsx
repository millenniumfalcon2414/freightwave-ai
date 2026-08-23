import React, { useState } from "react";
import {
  AlertTriangle,
  Ambulance,
  Building2,
  Train,
  Volume2,
  VolumeX,
  ChevronRight,
  ShieldAlert,
  PhoneCall,
} from "lucide-react";
import { useActiveIncident, useIsSirenActive } from "@/lib/emergency/useEmergency";
import { emergencyStore } from "@/lib/emergency/emergencyStore";
import { EmergencyCallModal, EmergencyCallTarget } from "./EmergencyCallModal";

interface Props {
  onOpenConsole?: () => void;
}

export function EmergencyFloatingBanner({ onOpenConsole }: Props) {
  const activeIncident = useActiveIncident();
  const isSirenOn = useIsSirenActive();
  const [callModalTarget, setCallModalTarget] = useState<EmergencyCallTarget | null>(null);

  if (!activeIncident || activeIncident.status === "RESOLVED") {
    return null;
  }

  return (
    <>
      <div className="sticky top-0 z-[100] w-full border-b border-red-500/60 bg-gradient-to-r from-red-950/95 via-red-900/90 to-red-950/95 px-4 py-2.5 text-white shadow-xl backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          {/* Left: Incident info & pulsing beacon */}
          <div className="flex items-center gap-3">
            <span className="relative flex h-3.5 w-3.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-90"></span>
              <span className="relative inline-flex h-3.5 w-3.5 rounded-full bg-red-500 shadow-md"></span>
            </span>

            <div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-red-500 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-wider text-white">
                  🚨 LIVE CRASH SOS DETECTED
                </span>
                <span className="text-xs font-bold sm:text-sm">
                  {activeIncident.vehicleNumber} ({activeIncident.vehicleType.toUpperCase()})
                </span>
                <span className="hidden text-xs text-red-200 md:inline">
                  • {activeIncident.corridor}
                </span>
              </div>
              <p className="text-[11px] text-red-200">
                108 ALS Ambulance{" "}
                <span className="font-semibold text-white" suppressHydrationWarning>
                  ETA {Math.ceil(activeIncident.ambulance.etaMinutes)} mins
                </span>{" "}
                ({activeIncident.ambulance.distanceKm} km away) · Trauma Bay 1 Reserved at{" "}
                {activeIncident.hospital.name}
              </p>
            </div>
          </div>

          {/* Right: Quick Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Call 108 Ambulance */}
            <button
              onClick={() => setCallModalTarget("ambulance")}
              className="flex items-center gap-1.5 rounded-lg border border-red-400/50 bg-red-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-red-500 transition"
            >
              <Ambulance className="size-3.5" />
              <span>Call 108</span>
            </button>

            {/* Quick Contact Hospital */}
            <button
              onClick={() => setCallModalTarget("hospital")}
              className="hidden sm:flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-950/60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900 transition"
            >
              <Building2 className="size-3.5 text-blue-300" />
              <span>Hospital Trauma</span>
            </button>

            {/* Quick Contact Station Master */}
            <button
              onClick={() => setCallModalTarget("station_master")}
              className="hidden md:flex items-center gap-1.5 rounded-lg border border-red-400/30 bg-red-950/60 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-900 transition"
            >
              <Train className="size-3.5 text-amber-300" />
              <span>Station Master</span>
            </button>

            {/* Toggle Siren Audio */}
            <button
              onClick={() => emergencyStore.toggleSirenAudio()}
              className={`flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition ${
                isSirenOn
                  ? "border-red-400 bg-white text-red-700 font-bold"
                  : "border-red-400/40 bg-red-950/60 text-red-200 hover:bg-red-900"
              }`}
              title={isSirenOn ? "Mute Siren" : "Play Siren Sound"}
            >
              {isSirenOn ? (
                <Volume2 className="size-3.5 animate-bounce" />
              ) : (
                <VolumeX className="size-3.5" />
              )}
              <span className="hidden sm:inline">{isSirenOn ? "Siren ON" : "Siren"}</span>
            </button>

            {/* Open Incident Command Console */}
            {onOpenConsole && (
              <button
                onClick={onOpenConsole}
                className="flex items-center gap-1 rounded-lg bg-white px-3.5 py-1.5 text-xs font-bold text-red-950 shadow hover:bg-red-50 transition"
              >
                <span>Command Center</span>
                <ChevronRight className="size-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {callModalTarget && activeIncident && (
        <EmergencyCallModal
          target={callModalTarget}
          incident={activeIncident}
          onClose={() => setCallModalTarget(null)}
        />
      )}
    </>
  );
}
