import React, { useState, useEffect } from "react";
import {
  Phone,
  PhoneCall,
  PhoneOff,
  Ambulance,
  Building2,
  Train,
  ShieldAlert,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  CheckCircle2,
  Radio,
  FileSpreadsheet,
  Package,
} from "lucide-react";
import { AccidentIncident } from "@/types/emergency";
import { emergencyStore } from "@/lib/emergency/emergencyStore";

export type EmergencyCallTarget =
  "ambulance" | "hospital" | "station_master" | "police_fire" | "driver_cab" | "cargo_salvage";

interface Props {
  target: EmergencyCallTarget;
  incident: AccidentIncident;
  onClose: () => void;
}

export function EmergencyCallModal({ target, incident, onClose }: Props) {
  const [callState, setCallState] = useState<"ringing" | "connected" | "ended">("ringing");
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
  const [dataPushed, setDataPushed] = useState(false);
  const [chatMessages, setChatMessages] = useState<
    { sender: "dispatcher" | "operator"; text: string; time: string }[]
  >([]);

  // Configure target metadata
  const targetInfo = {
    ambulance: {
      name: "108 Emergency Ambulance Central Dispatch",
      number: incident.ambulance.contactNumber,
      sublabel: `${incident.ambulance.unitName} (ALS Team Lead: ${incident.ambulance.paramedicLead})`,
      icon: Ambulance,
      badgeColor: "bg-red-500/10 text-red-500 border-red-500/30",
      initialVoiceMessage: `108 Dispatch Control. We have received your automated eCall packet for vehicle ${incident.vehicleNumber}. Unit ${incident.ambulance.unitName} is rolling with sirens on. ETA is ${Math.ceil(incident.ambulance.etaMinutes)} minutes. Please confirm if driver is conscious.`,
    },
    hospital: {
      name: incident.hospital.name,
      number: incident.hospital.contactPhone,
      sublabel: `Emergency Trauma Ward (${incident.hospital.emergencyDepartmentHead})`,
      icon: Building2,
      badgeColor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
      initialVoiceMessage: `This is Trauma Bay 1 at ${incident.hospital.name}. Pre-arrival notification confirmed. We have reserved ${incident.hospital.traumaBayReserved}. CT Trauma scanner and ${incident.driverBloodGroup} blood units ready on standby.`,
    },
    station_master: {
      name: incident.station.stationName,
      number: incident.station.contactPhone,
      sublabel: `Station Superintendent (${incident.station.stationMasterName})`,
      icon: Train,
      badgeColor: "bg-amber-500/10 text-amber-500 border-amber-500/30",
      initialVoiceMessage: `Station Master Office copy. Emergency signal interlock executed. All Up & Down line freight rakes halted at distant signals. Track section isolated. Over.`,
    },
    police_fire: {
      name: `${incident.policeStation.name} & Fire HAZMAT`,
      number: `${incident.policeStation.contactPhone} / ${incident.fireBrigade.contactPhone}`,
      sublabel: `Highway Patrol & Chemical Response Unit`,
      icon: ShieldAlert,
      badgeColor: "bg-purple-500/10 text-purple-500 border-purple-500/30",
      initialVoiceMessage: `PCR 112 Control. Highway patrol unit ${incident.policeStation.patrolUnit} has been routed to cordon off milestone ${incident.landmark}. Hazmat foam unit dispatched.`,
    },
    driver_cab: {
      name: `In-Cab Handsfree Audio: ${incident.driverName}`,
      number: incident.driverPhone,
      sublabel: `Vehicle: ${incident.vehicleNumber} (Crew count: ${incident.crewCount})`,
      icon: PhoneCall,
      badgeColor: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
      initialVoiceMessage: `(Audio Bridge Connected to Driver Cab Telematics) "Hello? RailFlow Control? I'm trapped in the driver cabin... cargo battery packs intact but cabin warped. Need ambulance quickly."`,
    },
    cargo_salvage: {
      name: incident.cargoProtection.salvageUnit.teamName,
      number: incident.cargoProtection.salvageUnit.contactPhone,
      sublabel: `Lead: ${incident.cargoProtection.salvageUnit.teamLead} | ${incident.cargoProtection.salvageUnit.unitType}`,
      icon: Package,
      badgeColor: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
      initialVoiceMessage: `Hazmat Salvage & Cold-Chain Recovery Command. Live cargo telematics received. Internal temperature stable at ${incident.cargoProtection.telemetry.internalTempC}°C, Nitrogen purge active, dunnage airbags deployed. Reefer recovery van rolling with sirens. ETA is ${Math.ceil(incident.cargoProtection.salvageUnit.etaMinutes)} minutes.`,
    },
  }[target];

  // Auto connect after 2 seconds
  useEffect(() => {
    const ringTimer = setTimeout(() => {
      setCallState("connected");
      emergencyStore.speakVoiceAlert(targetInfo.initialVoiceMessage);
      setChatMessages([
        {
          sender: "dispatcher",
          text: targetInfo.initialVoiceMessage,
          time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        },
      ]);
    }, 2200);

    return () => clearTimeout(ringTimer);
  }, [target]);

  // Duration ticker
  useEffect(() => {
    if (callState !== "connected") return;
    const interval = setInterval(() => {
      setCallDuration((d) => d + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [callState]);

  const handlePushTelemetry = () => {
    setDataPushed(true);
    const msg = `⚡ Live Cargo & Crash Telemetry Pushed: GPS (${incident.coordinates.lat}, ${incident.coordinates.lng}) | Cargo: ${incident.cargoDescription} | Temp: ${incident.cargoProtection.telemetry.internalTempC}°C | Airbag Shock Absorbed: ${incident.cargoProtection.airbagDunnage.kineticShockAbsorbedPct}% | O2: ${incident.cargoProtection.inertGasPurge.chamberOxygenPct}% | Hazmat: ${incident.hazmatCode || "Standard"}`;
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "operator",
        text: msg,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
    emergencyStore.addTimelineNote(
      "Telemetry & Cargo Status Transmitted",
      `Direct VoIP operator forwarded live GPS coordinates, Cargo Protection telemetry (Temp: ${incident.cargoProtection.telemetry.internalTempC}°C, N2 Purge Active), and Hazmat card.`,
    );
  };

  const handleSendQuickAck = (text: string) => {
    setChatMessages((prev) => [
      ...prev,
      {
        sender: "operator",
        text,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  };

  const TargetIcon = targetInfo.icon;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-red-500/40 bg-surface shadow-2xl">
        {/* Header Ribbon */}
        <div className="flex items-center justify-between border-b border-border/80 bg-red-950/40 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
            </span>
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-red-400">
              Live Emergency VoIP Satellite Bridge
            </span>
          </div>
          <span className="font-mono text-xs font-medium text-muted-foreground">
            Incident: {incident.id}
          </span>
        </div>

        {/* Call Visualizer Body */}
        <div className="p-6 space-y-6">
          {/* Target Entity Card */}
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="relative">
              <div className="flex size-20 items-center justify-center rounded-2xl border-2 border-red-500/30 bg-surface-2 shadow-inner">
                <TargetIcon className="size-10 text-red-500 animate-pulse" />
              </div>
              {callState === "connected" && (
                <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-emerald-500 text-white shadow">
                  <Radio className="size-3.5 animate-spin" />
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-bold">{targetInfo.name}</h3>
              <p className="text-xs text-muted-foreground">{targetInfo.sublabel}</p>
              <div className="mt-1 font-mono text-sm font-semibold text-primary">
                {targetInfo.number}
              </div>
            </div>

            {/* Status / Ringing Indicator */}
            <div className="flex items-center gap-2">
              {callState === "ringing" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-semibold text-amber-500 border border-amber-500/30 animate-pulse">
                  <PhoneCall className="size-3.5" />
                  Connecting Satellite Link...
                </span>
              ) : callState === "connected" ? (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-500 border border-emerald-500/30">
                  <span className="size-2 rounded-full bg-emerald-500 animate-ping" />
                  Connected ({formatSeconds(callDuration)})
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                  Call Terminated
                </span>
              )}
            </div>
          </div>

          {/* Animated Audio Waveform (When Connected) */}
          {callState === "connected" && (
            <div className="flex items-center justify-center gap-1 h-8 px-4 rounded-xl bg-surface-2/60 border border-border/60">
              {[40, 75, 100, 60, 90, 45, 80, 100, 70, 50, 85, 40].map((h, i) => (
                <div
                  key={i}
                  className="w-1 rounded-full bg-red-500 transition-all duration-150 animate-pulse"
                  style={{
                    height: `${Math.max(20, (h * Math.random()).toFixed(0))}%`,
                    animationDelay: `${i * 100}ms`,
                  }}
                />
              ))}
            </div>
          )}

          {/* Dispatcher Live Transcript Stream */}
          <div className="space-y-2 rounded-xl border border-border/70 bg-surface-2 p-3.5 max-h-48 overflow-y-auto text-xs">
            <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              Encrypted Real-Time Transcript
            </div>
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={`p-2.5 rounded-lg ${
                  msg.sender === "dispatcher"
                    ? "bg-red-500/10 border border-red-500/20 text-foreground"
                    : "bg-primary/10 border border-primary/20 text-foreground"
                }`}
              >
                <div className="flex items-center justify-between font-mono text-[9px] text-muted-foreground mb-1">
                  <span>{msg.sender === "dispatcher" ? "DISPATCHER" : "RAILFLOW OPERATOR"}</span>
                  <span>{msg.time}</span>
                </div>
                <p className="leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Quick Push Telemetry & Emergency Actions */}
          <div className="flex flex-wrap gap-2 pt-1">
            <button
              onClick={handlePushTelemetry}
              disabled={dataPushed}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                dataPushed
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/30"
                  : "bg-surface-2 hover:bg-surface-3 border border-border text-foreground"
              }`}
            >
              {dataPushed ? (
                <CheckCircle2 className="size-3.5 text-emerald-500" />
              ) : (
                <FileSpreadsheet className="size-3.5 text-primary" />
              )}
              {dataPushed ? "Telemetry Sent to Responder" : "Push Live Cargo & GPS Manifest"}
            </button>

            <button
              onClick={() =>
                handleSendQuickAck("Cargo Nitrogen purge active. Auxiliary cryo-battery locked.")
              }
              className="rounded-lg bg-surface-2 hover:bg-surface-3 border border-border px-2.5 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition"
            >
              "Confirm Cargo Inert Purge Active"
            </button>
          </div>

          {/* Call Controls Toolbar */}
          <div className="flex items-center justify-between border-t border-border/80 pt-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className={`flex size-10 items-center justify-center rounded-xl border transition ${
                  isMuted
                    ? "bg-red-500/20 border-red-500/40 text-red-400"
                    : "bg-surface-2 border-border text-foreground hover:bg-surface-3"
                }`}
                title={isMuted ? "Unmute Mic" : "Mute Mic"}
              >
                {isMuted ? <MicOff className="size-4" /> : <Mic className="size-4" />}
              </button>

              <button
                onClick={() => setIsSpeaker(!isSpeaker)}
                className={`flex size-10 items-center justify-center rounded-xl border transition ${
                  isSpeaker
                    ? "bg-primary/20 border-primary/40 text-primary"
                    : "bg-surface-2 border-border text-muted-foreground"
                }`}
                title="Speaker Mode"
              >
                {isSpeaker ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              </button>

              <a
                href={`tel:${targetInfo.number.replace(/[^0-9+]/g, "")}`}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-3 transition"
              >
                <Phone className="size-3.5 text-emerald-500" />
                <span>Open Phone App</span>
              </a>
            </div>

            {/* Red End Call Button */}
            <button
              onClick={() => {
                setCallState("ended");
                setTimeout(onClose, 400);
              }}
              className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg hover:bg-red-700 transition"
            >
              <PhoneOff className="size-4" />
              <span>End Call</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
