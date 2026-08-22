import React, { useState } from "react";
import {
  AlertOctagon,
  Ambulance,
  Building2,
  Train,
  ShieldAlert,
  Phone,
  PhoneCall,
  Clock,
  MapPin,
  Flame,
  Activity,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Zap,
  Navigation,
  Send,
  Download,
  Package,
  ShieldCheck,
  ThermometerSnowflake,
  Wind,
  Layers,
  Lock,
  BatteryCharging,
  Truck,
  Sparkles,
  Gauge,
} from "lucide-react";
import {
  useActiveIncident,
  useIncidentHistory,
  useIsSirenActive,
} from "@/lib/emergency/useEmergency";
import { emergencyStore } from "@/lib/emergency/emergencyStore";
import { EmergencyCallModal, EmergencyCallTarget } from "./EmergencyCallModal";
import { AccidentIncident } from "@/types/emergency";

export function EmergencyIncidentConsole() {
  const activeIncident = useActiveIncident();
  const history = useIncidentHistory();
  const isSirenOn = useIsSirenActive();

  const [callModalTarget, setCallModalTarget] = useState<EmergencyCallTarget | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<AccidentIncident | null>(activeIncident);
  const [newLogText, setNewLogText] = useState("");
  const [drillSuccessToast, setDrillSuccessToast] = useState<string | null>(null);
  const [activeCargoTab, setActiveCargoTab] = useState<"sensors" | "actuators" | "manifest">(
    "sensors",
  );

  // Sync selected incident with active incident if none selected
  const displayedIncident = selectedIncident || activeIncident || history[0];

  const showToast = (msg: string) => {
    setDrillSuccessToast(msg);
    setTimeout(() => setDrillSuccessToast(null), 4000);
  };

  // Pre-configured drill scenarios
  const triggerScenario = (
    type:
      | "lithium_battery_nh48"
      | "pharma_vaccine_coldchain"
      | "rail_derailment_wdfc"
      | "chemical_tanker_jnpt",
  ) => {
    if (type === "lithium_battery_nh48") {
      emergencyStore.triggerIncident({
        title: "EV Lithium-Ion Battery Enclosures Drayage Rollover",
        vehicleId: "TRK-HR26-EA-9912",
        vehicleType: "truck",
        vehicleNumber: "HR-26-EA-9912",
        driverName: "Sukhwinder Singh",
        driverPhone: "+91 98102 34112",
        driverBloodGroup: "O+",
        corridor: "NH-48 Jaipur-Delhi Freight Corridor (Near Manesar / Rewari)",
        landmark: "Km 54.2 Milestone, Near Rewari Multi-Modal Hub Overpass",
        coordinates: { lat: 28.1928, lng: 76.6189 },
        gForce: 8.6,
        speedAtImpactKmh: 72,
        rolloverAngleDeg: 82,
        severity: "CRITICAL_LEVEL_1",
        cargoDescription: "Lithium-Ion EV Battery Packs & Solid-State Modules",
        hazmatCode: "UN 3480 (Class 9 Lithium-Ion Batteries)",
        status: "DISPATCHING",
        driverStatus: "Conscious / Injured - Extrication in Progress",
        crewCount: 2,
        cargoProtection: {
          cargoCategory: "Lithium-Ion Batteries & Precision Electronics",
          declaredValueInr: "₹5,20,00,000 (₹5.20 Cr)",
          preservationStatus: "Fully Secured & Inert",
          airbagDunnage: {
            deployed: true,
            deploymentLatencyMs: 12,
            kineticShockAbsorbedPct: 88.2,
            loadDisplacementMm: 2.8,
          },
          inertGasPurge: {
            active: true,
            gasType: "Nitrogen (N2) Flood",
            chamberOxygenPct: 8.9,
            fireRiskNeutralized: true,
          },
          coldChainAux: {
            active: true,
            compressorPowerSource: "Auxiliary 240V LiFePO4 Inverter",
            temperatureC: 22.1,
            targetTemperatureC: 20.0,
            tempDeviationC: 2.1,
            coolingAutonomyHours: 48.0,
          },
          hermeticSeal: {
            sealStatus: "100% Intact & Locked",
            isolationValvesLocked: true,
            antiSpillBafflesEngaged: true,
            tamperTokenHash: "SHA256-N2-LITHIUM-SAFE-9912",
          },
          salvageUnit: {
            id: "SALV-HZ-REW-04",
            teamName: "National Hazmat Containment & Heavy Reefer Salvage Unit #04",
            unitType: "Heavy Hazmat Containment & Reefer Recovery Unit",
            status: "Dispatched with Siren",
            etaMinutes: 5,
            distanceKm: 3.2,
            contactPhone: "+91 1274 259904",
            teamLead: "Er. Mahendra Chawla (Hazmat Containment Engineer)",
            designatedTransferBay: "Rewari Multi-Modal Logistics Hub Bay #04",
            coordinates: { lat: 28.175, lng: 76.598 },
          },
          telemetry: {
            internalTempC: 22.1,
            targetTempC: 20.0,
            humidityPct: 42.0,
            pressureKpa: 101.9,
            shockAbsorptionPct: 88.2,
            tiltDeg: 2.8,
            oxygenLevelPct: 8.9,
            vocToxicPpm: 0.0,
            liquidSpillDetected: false,
            thermalRunawayRisk: "Suppressed",
            backupBatteryPct: 98,
            backupBatteryHours: 48,
          },
          mitigationLogs: [
            "00:00:00 - High-G IMU sensor triggered 12ms pneumatic dunnage airbag inflation.",
            "00:00:01 - Switched to Aux 240V LiFePO4 isolated battery system.",
            "00:00:01 - High-pressure Nitrogen purge dropped bay O2 to 8.9% (thermal runaway suppressed).",
            "00:00:02 - Hermetic containment valves locked shut to prevent battery vapor discharge.",
            "00:00:03 - Hazmat containment salvage crane SALV-HZ-REW-04 rolling with sirens.",
          ],
        },
      });
      showToast("🚨 Lithium Battery Crash & Automated Nitrogen Purge Containment Triggered!");
    } else if (type === "pharma_vaccine_coldchain") {
      emergencyStore.triggerIncident({
        title: "Cold-Chain Critical Vaccine & Biologics Express Drayage Rollover",
        vehicleId: "TRK-DL01-GA-7712",
        vehicleType: "truck",
        vehicleNumber: "DL-01-GA-7712",
        driverName: "Gurpreet Singh",
        driverPhone: "+91 98111 88291",
        driverBloodGroup: "B+",
        corridor: "NH-48 Manesar Industrial Corridor (Km 42)",
        landmark: "Panchgaon Flyover, Sector 8 IMT Manesar",
        coordinates: { lat: 28.3541, lng: 76.9412 },
        gForce: 7.9,
        speedAtImpactKmh: 65,
        rolloverAngleDeg: 76,
        severity: "CRITICAL_LEVEL_1",
        cargoDescription: "Sub-Zero mRNA Vaccines & Critical Cold-Chain Biologics (-20°C / +4°C)",
        hazmatCode: "UN 3373 (Biological Substance, Category B)",
        status: "DISPATCHING",
        driverStatus: "Conscious / Injured",
        crewCount: 2,
        cargoProtection: {
          cargoCategory: "Cold-Chain Pharmaceuticals & Vaccines",
          declaredValueInr: "₹8,75,00,000 (₹8.75 Cr / $1.05M USD)",
          preservationStatus: "Cryo-Backup Active",
          airbagDunnage: {
            deployed: true,
            deploymentLatencyMs: 14,
            kineticShockAbsorbedPct: 91.5,
            loadDisplacementMm: 1.4,
          },
          inertGasPurge: {
            active: true,
            gasType: "Clean Agent Aerosol",
            chamberOxygenPct: 12.5,
            fireRiskNeutralized: true,
          },
          coldChainAux: {
            active: true,
            compressorPowerSource: "Auxiliary 240V LiFePO4 Inverter",
            temperatureC: 3.6,
            targetTemperatureC: 4.0,
            tempDeviationC: -0.4,
            coolingAutonomyHours: 72.0,
          },
          hermeticSeal: {
            sealStatus: "100% Intact & Locked",
            isolationValvesLocked: true,
            antiSpillBafflesEngaged: true,
            tamperTokenHash: "SHA256-VACCINE-CRYO-INTACT-7712",
          },
          salvageUnit: {
            id: "SALV-CRYO-GUR-08",
            teamName: "Mobile Temperature-Controlled Cold-Chain Reefer Rescue Team #08",
            unitType: "Heavy Hazmat Containment & Reefer Recovery Unit",
            status: "Dispatched with Siren",
            etaMinutes: 4,
            distanceKm: 2.4,
            contactPhone: "+91 124 233 8808",
            teamLead: "Dr. K. N. Rao (Cryogenic Logistics Lead)",
            designatedTransferBay: "Gurugram ICD Reefer Transfer Dock #02",
            coordinates: { lat: 28.341, lng: 76.932 },
          },
          telemetry: {
            internalTempC: 3.6,
            targetTempC: 4.0,
            humidityPct: 48.0,
            pressureKpa: 101.5,
            shockAbsorptionPct: 91.5,
            tiltDeg: 1.8,
            oxygenLevelPct: 12.5,
            vocToxicPpm: 0.0,
            liquidSpillDetected: false,
            thermalRunawayRisk: "None",
            backupBatteryPct: 99,
            backupBatteryHours: 72,
          },
          mitigationLogs: [
            "00:00:00 - Impact detected: Pneumatic dunnage airbags deployed around vaccine pallets (91.5% shock absorbed).",
            "00:00:01 - Primary chassis power severed: Switched to 240V auxiliary cryo-inverter instantly.",
            "00:00:01 - Liquid cryo-injection pulsed: Compartment temperature maintained steady at 3.6°C (Target: 4.0°C).",
            "00:00:02 - Secondary reefer transfer van SALV-CRYO-GUR-08 dispatched with siren for on-site cross-docking.",
          ],
        },
      });
      showToast("🚨 Cold-Chain Vaccine Crash: Aux Inverter Engaged & Temp Secured at 3.6°C!");
    } else if (type === "rail_derailment_wdfc") {
      emergencyStore.triggerIncident({
        title: "Western DFC Double-Stack Freight Rake Obstruction & Derailment",
        vehicleId: "RAKE-WDFC-7702",
        vehicleType: "freight_rake",
        vehicleNumber: "WDFC-7702 (Double-Stack Rake)",
        driverName: "Loco Pilot Ram Swaroop & Co-Pilot Ankit Verma",
        driverPhone: "+91 94140 12345",
        driverBloodGroup: "A+",
        corridor: "Western Dedicated Freight Corridor (Rewari-Phulera Segment)",
        landmark: "WDFC Km 182.6, Near Ateli Khurd Yard",
        coordinates: { lat: 28.0125, lng: 76.2415 },
        gForce: 6.8,
        speedAtImpactKmh: 58,
        rolloverAngleDeg: 42,
        severity: "CRITICAL_LEVEL_1",
        cargoDescription:
          "Double-Stack EXIM Containers (Precision Automotive Castings & Sub-Assemblies)",
        status: "DISPATCHING",
        driverStatus: "Stable - Loco Cab Secure",
        crewCount: 2,
        cargoProtection: {
          cargoCategory: "High-Value Industrial Machinery",
          declaredValueInr: "₹12,40,00,000 (₹12.4 Cr)",
          preservationStatus: "Airbag Dunnage Deployed",
          airbagDunnage: {
            deployed: true,
            deploymentLatencyMs: 18,
            kineticShockAbsorbedPct: 84.0,
            loadDisplacementMm: 4.2,
          },
          inertGasPurge: {
            active: false,
            gasType: "Argon Shield",
            chamberOxygenPct: 20.2,
            fireRiskNeutralized: true,
          },
          coldChainAux: {
            active: false,
            compressorPowerSource: "Normal Grid",
            temperatureC: 24.0,
            targetTemperatureC: 25.0,
            tempDeviationC: -1.0,
            coolingAutonomyHours: 0,
          },
          hermeticSeal: {
            sealStatus: "100% Intact & Locked",
            isolationValvesLocked: true,
            antiSpillBafflesEngaged: true,
            tamperTokenHash: "SHA256-WDFC-INTERMODAL-SECURE-7702",
          },
          salvageUnit: {
            id: "SALV-RAIL-DFC-01",
            teamName: "DFC Heavy Rail Breakdown Crane & Intermodal Container Salvage Crew",
            unitType: "Mobile 40T Crane & Reefer Fleet",
            status: "Dispatched with Siren",
            etaMinutes: 6,
            distanceKm: 4.8,
            contactPhone: "+91 1282 254110",
            teamLead: "Er. Harish Chandra (DFC Mechanical Engineer)",
            designatedTransferBay: "Ateli Yard Siding #03",
            coordinates: { lat: 28.025, lng: 76.255 },
          },
          telemetry: {
            internalTempC: 24.0,
            targetTempC: 25.0,
            humidityPct: 40.0,
            pressureKpa: 101.3,
            shockAbsorptionPct: 84.0,
            tiltDeg: 3.4,
            oxygenLevelPct: 20.2,
            vocToxicPpm: 0.0,
            liquidSpillDetected: false,
            thermalRunawayRisk: "None",
            backupBatteryPct: 95,
            backupBatteryHours: 36,
          },
          mitigationLogs: [
            "00:00:00 - Intermodal twistlock shock absorber & pneumatic dunnage airbags deployed.",
            "00:00:01 - Track signal interlock tripped RED across all 15 km adjacent sections.",
            "00:00:02 - 140T Breakdown Crane unit SALV-RAIL-DFC-01 en route with track clearing wagon.",
          ],
        },
      });
      showToast("🚨 WDFC Freight Rake Derailment: Airbag Dunnage Active & Track Isolated!");
    } else {
      emergencyStore.triggerIncident({
        title: "Port Drayage Hazardous Chemical Polymer Tanker Rollover",
        vehicleId: "TRK-MH46-BB-2041",
        vehicleType: "drayage_carrier",
        vehicleNumber: "MH-46-BB-2041",
        driverName: "Manoj Jadhav",
        driverPhone: "+91 98200 44551",
        driverBloodGroup: "O-",
        corridor: "JNPT Port Terminal Access Expressway (Navi Mumbai)",
        landmark: "JNPT North Gate Container Freight Station Entry",
        coordinates: { lat: 18.9482, lng: 72.9514 },
        gForce: 8.1,
        speedAtImpactKmh: 48,
        rolloverAngleDeg: 84,
        severity: "CRITICAL_LEVEL_1",
        cargoDescription: "Chemical Polymer Intermediates & Flammable Solvents",
        hazmatCode: "UN 1993 (Flammable Liquid, N.O.S., Class 3)",
        status: "DISPATCHING",
        driverStatus: "Conscious / Injured",
        crewCount: 1,
        cargoProtection: {
          cargoCategory: "Hazardous Flammable Chemicals (Class 3/8)",
          declaredValueInr: "₹3,90,00,000 (₹3.90 Cr)",
          preservationStatus: "Fully Secured & Inert",
          airbagDunnage: {
            deployed: true,
            deploymentLatencyMs: 11,
            kineticShockAbsorbedPct: 89.0,
            loadDisplacementMm: 1.9,
          },
          inertGasPurge: {
            active: true,
            gasType: "Nitrogen (N2) Flood",
            chamberOxygenPct: 7.4,
            fireRiskNeutralized: true,
          },
          coldChainAux: {
            active: true,
            compressorPowerSource: "Auxiliary 240V LiFePO4 Inverter",
            temperatureC: 18.4,
            targetTemperatureC: 18.0,
            tempDeviationC: 0.4,
            coolingAutonomyHours: 48.0,
          },
          hermeticSeal: {
            sealStatus: "100% Intact & Locked",
            isolationValvesLocked: true,
            antiSpillBafflesEngaged: true,
            tamperTokenHash: "SHA256-HAZMAT-VALVE-SEAL-2041",
          },
          salvageUnit: {
            id: "SALV-PORT-HAZMAT-01",
            teamName: "JNPT Port Hazmat Chemical Spill & Cargo Containment Force",
            unitType: "Heavy Hazmat Containment & Reefer Recovery Unit",
            status: "Dispatched with Siren",
            etaMinutes: 3,
            distanceKm: 1.6,
            contactPhone: "+91 22 2724 9901",
            teamLead: "Capt. Arvind Patil (Port Hazmat Commander)",
            designatedTransferBay: "JNPT Hazmat Chemical Isolation Dock #01",
            coordinates: { lat: 18.941, lng: 72.945 },
          },
          telemetry: {
            internalTempC: 18.4,
            targetTempC: 18.0,
            humidityPct: 52.0,
            pressureKpa: 102.4,
            shockAbsorptionPct: 89.0,
            tiltDeg: 2.3,
            oxygenLevelPct: 7.4,
            vocToxicPpm: 0.0,
            liquidSpillDetected: false,
            thermalRunawayRisk: "Suppressed",
            backupBatteryPct: 97,
            backupBatteryHours: 48,
          },
          mitigationLogs: [
            "00:00:00 - High-G roll sensor triggered instantaneous chemical valve seal-off.",
            "00:00:01 - Nitrogen flood injected into tanker ullage space (O2 down to 7.4%).",
            "00:00:02 - Zero VOC leak detected (0.0 ppm). Anti-spill internal baffles locked.",
            "00:00:03 - Port Hazmat foam salvage tender SALV-PORT-HAZMAT-01 rolling.",
          ],
        },
      });
      showToast("🚨 Port Chemical Tanker: Hermetic Valves Locked & Nitrogen Flood Engaged!");
    }
  };

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLogText.trim()) return;
    emergencyStore.addTimelineNote("Operator Field Update", newLogText.trim());
    setNewLogText("");
  };

  const handleExportIncidentReport = () => {
    if (!displayedIncident) return;
    const cp = displayedIncident.cargoProtection;
    const report = `
================================================================================
          RAILFLOW AI — CRASH, EMERGENCY & CARGO PRESERVATION BLACKBOX REPORT
================================================================================
Incident ID:          ${displayedIncident.id}
Timestamp:            ${new Date().toISOString()} (${displayedIncident.impactTime})
Vehicle Reg / ID:     ${displayedIncident.vehicleNumber} (${displayedIncident.vehicleId})
Vehicle Type:         ${displayedIncident.vehicleType.toUpperCase()}
Location / Corridor:  ${displayedIncident.corridor}
Milestone Landmark:   ${displayedIncident.landmark}
WGS-84 Coordinates:   Latitude ${displayedIncident.coordinates.lat}, Longitude ${displayedIncident.coordinates.lng}

CRASH TELEMETRY:
- Impact G-Force:     ${displayedIncident.gForce}g (IoT IMU Accelerometer)
- Impact Velocity:    ${displayedIncident.speedAtImpactKmh} km/h
- Rollover Tilt Angle:${displayedIncident.rolloverAngleDeg}°
- Severity:           ${displayedIncident.severity}

CARGO INTEGRITY & PRESERVATION TELEMETRY:
- Cargo Description:  ${displayedIncident.cargoDescription}
- Hazardous Code:     ${displayedIncident.hazmatCode || "None (Standard Freight)"}
- Cargo Category:     ${cp.cargoCategory}
- Declared Value:     ${cp.declaredValueInr}
- Preservation Status:${cp.preservationStatus}
- Dunnage Airbags:    ${cp.airbagDunnage.deployed ? `DEPLOYED (${cp.airbagDunnage.kineticShockAbsorbedPct}% kinetic shock absorbed, latency: ${cp.airbagDunnage.deploymentLatencyMs}ms)` : "STANDBY"}
- Inert Gas Purge:    ${cp.inertGasPurge.active ? `ACTIVE (${cp.inertGasPurge.gasType} - Chamber O2: ${cp.inertGasPurge.chamberOxygenPct}%)` : "OFF"}
- Aux Cryo-Cooling:   ${cp.coldChainAux.active ? `ACTIVE (${cp.coldChainAux.compressorPowerSource} - Internal Temp: ${cp.telemetry.internalTempC}°C vs Target: ${cp.coldChainAux.targetTemperatureC}°C)` : "OFF"}
- Hermetic Seal:      ${cp.hermeticSeal.sealStatus} (Valves Locked: ${cp.hermeticSeal.isolationValvesLocked ? "YES" : "NO"})
- Toxic Gas VOC PPM:  ${cp.telemetry.vocToxicPpm} ppm (Spill Detected: ${cp.telemetry.liquidSpillDetected ? "YES" : "NO"})
- Battery Autonomy:   ${cp.telemetry.backupBatteryHours} hours remaining (${cp.telemetry.backupBatteryPct}%)
- Tamper Hash Token:  ${cp.hermeticSeal.tamperTokenHash}

CASUALTY & CREW DETAILS:
- Driver Name:        ${displayedIncident.driverName}
- Contact Phone:      ${displayedIncident.driverPhone}
- Blood Group:        ${displayedIncident.driverBloodGroup}
- Driver Condition:   ${displayedIncident.driverStatus}
- Crew Count:         ${displayedIncident.crewCount}

AUTOMATED EMERGENCY DISPATCH RECORD:
1. 108 AMBULANCE (ALS):
   - Assigned Unit:   ${displayedIncident.ambulance.unitName} (${displayedIncident.ambulance.type})
   - Paramedic Lead:  ${displayedIncident.ambulance.paramedicLead}
   - Contact Phone:   ${displayedIncident.ambulance.contactNumber}
   - Distance / ETA:  ${displayedIncident.ambulance.distanceKm} km | ETA: ${Math.ceil(displayedIncident.ambulance.etaMinutes)} minutes

2. LEVEL-1 TRAUMA HOSPITAL:
   - Facility Name:   ${displayedIncident.hospital.name} (${displayedIncident.hospital.traumaLevel})
   - Address:         ${displayedIncident.hospital.address}
   - Trauma Chief:    ${displayedIncident.hospital.emergencyDepartmentHead}
   - Hotline:         ${displayedIncident.hospital.contactPhone}
   - Reserved Bed:    ${displayedIncident.hospital.traumaBayReserved}

3. SPECIALIZED CARGO SALVAGE & REEFER RECOVERY FLEET:
   - Salvage Unit:    ${cp.salvageUnit.teamName} (${cp.salvageUnit.unitType})
   - Team Lead:       ${cp.salvageUnit.teamLead}
   - Contact Phone:   ${cp.salvageUnit.contactPhone}
   - Transfer Bay:    ${cp.salvageUnit.designatedTransferBay}
   - Distance / ETA:  ${cp.salvageUnit.distanceKm} km | ETA: ${Math.ceil(cp.salvageUnit.etaMinutes)} minutes

4. RAILWAY / DFC STATION MASTER:
   - Control Post:    ${displayedIncident.station.stationName}
   - Station Master:  ${displayedIncident.station.stationMasterName}
   - Interlock Action:${displayedIncident.station.actionLog}

5. POLICE & FIRE BRIGADE:
   - Police PCR Unit: ${displayedIncident.policeStation.name} (${displayedIncident.policeStation.contactPhone})
   - Fire / Hazmat:   ${displayedIncident.fireBrigade.name} (${displayedIncident.fireBrigade.contactPhone})

CARGO PRESERVATION AUDIT TRAIL:
${cp.mitigationLogs.map((l) => `* ${l}`).join("\n")}

CHRONOLOGICAL EVENT LOG:
${displayedIncident.timeline.map((t) => `[${t.timestamp}] [${t.actor}] ${t.title} - ${t.description}`).join("\n")}

================================================================================
Generated by RailFlow AI Autonomous Space-Ground Telemetry & Cargo Safety Core
================================================================================
    `;

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Crash_And_Cargo_Safety_Blackbox_${displayedIncident.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("📄 Crash & Cargo Safety Blackbox Manifest Downloaded Successfully!");
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {drillSuccessToast && (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-950/80 p-3.5 text-xs font-semibold text-emerald-300 shadow-lg backdrop-blur-md animate-in fade-in">
          {drillSuccessToast}
        </div>
      )}

      {/* Header & Simulator Control Bar */}
      <div className="rounded-2xl border border-red-500/40 bg-gradient-to-br from-surface via-surface to-red-950/20 p-5 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex size-7 items-center justify-center rounded-xl bg-red-500/10 text-red-500 border border-red-500/30">
                <AlertOctagon className="size-4" />
              </span>
              <h2 className="text-lg font-bold text-foreground">
                Automated Accident eCall, Casualty Dispatch & Cargo Safety Matrix
              </h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Autonomous crash telemetry, 108 ambulance dispatch, Level-1 trauma reservation, and
              instant IoT cargo preservation (Nitrogen purge, pneumatic dunnage airbags, cryogenic
              battery cooling & isolation lock).
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Siren Toggle */}
            <button
              onClick={() => emergencyStore.toggleSirenAudio()}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                isSirenOn
                  ? "bg-red-600 border-red-500 text-white shadow-md animate-pulse font-bold"
                  : "bg-surface-2 border-border text-foreground hover:bg-surface-3"
              }`}
            >
              {isSirenOn ? <Volume2 className="size-4" /> : <VolumeX className="size-4" />}
              <span>{isSirenOn ? "Siren Audio Active" : "Test Siren Audio"}</span>
            </button>

            {/* Export Report */}
            {displayedIncident && (
              <button
                onClick={handleExportIncidentReport}
                className="flex items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-xs font-semibold text-foreground hover:bg-surface-3 transition"
              >
                <Download className="size-3.5 text-primary" />
                <span>Export Safety Blackbox</span>
              </button>
            )}
          </div>
        </div>

        {/* Live Scenario Simulator Triggers */}
        <div className="rounded-xl border border-border/80 bg-surface-2/60 p-3.5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="size-3 text-amber-500" />
              Simulate Live Crash & Automated Cargo Safety Drill:
            </span>
            <span className="text-[10px] text-muted-foreground">
              Zero-Latency Autonomous Activation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            <button
              onClick={() => triggerScenario("lithium_battery_nh48")}
              className="flex items-center justify-between rounded-xl border border-red-500/40 bg-red-500/10 p-2.5 text-left text-xs font-semibold text-red-400 hover:bg-red-500/20 transition group"
            >
              <div className="flex items-center gap-2 truncate">
                <Flame className="size-4 text-red-500 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-foreground group-hover:text-red-400 truncate">
                    EV Battery Crash (NH-48)
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    8.6g Impact · Nitrogen Purge
                  </div>
                </div>
              </div>
              <Play className="size-3 text-red-400 shrink-0 ml-1" />
            </button>

            <button
              onClick={() => triggerScenario("pharma_vaccine_coldchain")}
              className="flex items-center justify-between rounded-xl border border-cyan-500/40 bg-cyan-500/10 p-2.5 text-left text-xs font-semibold text-cyan-400 hover:bg-cyan-500/20 transition group"
            >
              <div className="flex items-center gap-2 truncate">
                <ThermometerSnowflake className="size-4 text-cyan-500 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-foreground group-hover:text-cyan-400 truncate">
                    Pharma Vaccine Rollover
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Aux Cryo 3.6°C · Airbags
                  </div>
                </div>
              </div>
              <Play className="size-3 text-cyan-400 shrink-0 ml-1" />
            </button>

            <button
              onClick={() => triggerScenario("rail_derailment_wdfc")}
              className="flex items-center justify-between rounded-xl border border-amber-500/40 bg-amber-500/10 p-2.5 text-left text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition group"
            >
              <div className="flex items-center gap-2 truncate">
                <Train className="size-4 text-amber-500 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-foreground group-hover:text-amber-400 truncate">
                    WDFC Freight Rake Derailment
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    25kV Cut · Intermodal Lock
                  </div>
                </div>
              </div>
              <Play className="size-3 text-amber-400 shrink-0 ml-1" />
            </button>

            <button
              onClick={() => triggerScenario("chemical_tanker_jnpt")}
              className="flex items-center justify-between rounded-xl border border-purple-500/40 bg-purple-500/10 p-2.5 text-left text-xs font-semibold text-purple-400 hover:bg-purple-500/20 transition group"
            >
              <div className="flex items-center gap-2 truncate">
                <ShieldAlert className="size-4 text-purple-500 shrink-0" />
                <div className="truncate">
                  <div className="font-bold text-foreground group-hover:text-purple-400 truncate">
                    Port Hazmat Chemical Tanker
                  </div>
                  <div className="text-[10px] text-muted-foreground truncate">
                    Hermetic Lock · 0.0 ppm
                  </div>
                </div>
              </div>
              <Play className="size-3 text-purple-400 shrink-0 ml-1" />
            </button>
          </div>
        </div>
      </div>

      {displayedIncident ? (
        <div className="space-y-6">
          {/* Main Active Incident Overview Banner */}
          <div className="rounded-2xl border-2 border-red-500 bg-red-950/20 p-5 shadow-lg space-y-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-full bg-red-600 px-3 py-1 font-mono text-xs font-black uppercase text-white shadow animate-pulse">
                    🚨 {displayedIncident.severity.replace(/_/g, " ")}
                  </span>
                  <span className="rounded-full border border-border bg-surface px-2.5 py-0.5 font-mono text-xs font-bold text-foreground">
                    ID: {displayedIncident.id}
                  </span>
                  <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-500 flex items-center gap-1">
                    <ShieldCheck className="size-3.5 text-emerald-500" />
                    <span>
                      Cargo Protection Active:{" "}
                      {displayedIncident.cargoProtection.preservationStatus}
                    </span>
                  </span>
                </div>
                <h3 className="text-xl font-bold text-foreground">{displayedIncident.title}</h3>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1 font-medium text-foreground">
                    <MapPin className="size-3.5 text-red-500" />
                    {displayedIncident.landmark} ({displayedIncident.corridor})
                  </span>
                  <span>
                    WGS-84 GPS:{" "}
                    <code className="font-mono text-primary">
                      {displayedIncident.coordinates.lat.toFixed(4)}° N,{" "}
                      {displayedIncident.coordinates.lng.toFixed(4)}° E
                    </code>
                  </span>
                  <span>Impact: {displayedIncident.impactTime}</span>
                </div>
              </div>

              {/* Status & Resolve Action */}
              <div className="flex items-center gap-2">
                {displayedIncident.status !== "RESOLVED" ? (
                  <button
                    onClick={() => emergencyStore.resolveIncident(displayedIncident.id)}
                    className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                  >
                    <CheckCircle2 className="size-4" />
                    <span>Mark Incident & Cargo Secured</span>
                  </button>
                ) : (
                  <span className="rounded-xl bg-emerald-500/10 border border-emerald-500/30 px-3.5 py-2 text-xs font-bold text-emerald-500">
                    ✓ Casualties Admitted · 100% Cargo Salvaged
                  </span>
                )}
              </div>
            </div>

            {/* Impact & Cargo Telemetry Gauge Strip */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              <div className="rounded-xl border border-red-500/30 bg-surface/90 p-3">
                <div className="text-[10px] font-mono uppercase text-muted-foreground">
                  Impact G-Force
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-red-500">
                  {displayedIncident.gForce}g
                </div>
                <div className="text-[10px] text-red-400">Severe Structural Shock</div>
              </div>

              <div className="rounded-xl border border-cyan-500/30 bg-surface/90 p-3">
                <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                  <span>Cargo Shock Absorbed</span>
                  <Layers className="size-3 text-cyan-500" />
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-cyan-400">
                  {displayedIncident.cargoProtection.airbagDunnage.kineticShockAbsorbedPct}%
                </div>
                <div className="text-[10px] text-cyan-500">Pneumatic Airbag Deployed</div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-surface/90 p-3">
                <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                  <span>Internal Cargo Temp</span>
                  <ThermometerSnowflake className="size-3 text-emerald-500" />
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-emerald-400">
                  {displayedIncident.cargoProtection.telemetry.internalTempC}°C
                </div>
                <div className="text-[10px] text-emerald-500">
                  Target: {displayedIncident.cargoProtection.coldChainAux.targetTemperatureC}°C (Aux
                  LiFePO4)
                </div>
              </div>

              <div className="rounded-xl border border-amber-500/30 bg-surface/90 p-3">
                <div className="text-[10px] font-mono uppercase text-muted-foreground flex items-center justify-between">
                  <span>Chamber Atmosphere</span>
                  <Wind className="size-3 text-amber-500" />
                </div>
                <div className="mt-1 font-mono text-2xl font-bold text-amber-400">
                  {displayedIncident.cargoProtection.inertGasPurge.chamberOxygenPct}% O2
                </div>
                <div className="text-[10px] text-amber-500">
                  {displayedIncident.cargoProtection.inertGasPurge.gasType} Purge
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* SPECIALIZED CARGO INTEGRITY & PRESERVATION COMMAND MATRIX */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border-2 border-cyan-500/50 bg-gradient-to-br from-surface via-surface to-cyan-950/20 p-5 shadow-lg space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex size-11 items-center justify-center rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner">
                  <Package className="size-6 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-cyan-500/10 px-2.5 py-0.5 font-mono text-[9px] font-bold uppercase text-cyan-400 border border-cyan-500/30">
                      IoT Cargo Containment Active
                    </span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      Value:{" "}
                      <strong className="text-foreground">
                        {displayedIncident.cargoProtection.declaredValueInr}
                      </strong>
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    Cargo Protection, Preservation & Autonomous Salvage Center
                  </h3>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex items-center rounded-xl bg-surface-2 p-1 border border-border text-xs font-semibold">
                <button
                  onClick={() => setActiveCargoTab("sensors")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    activeCargoTab === "sensors"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Live IoT Telemetry
                </button>
                <button
                  onClick={() => setActiveCargoTab("actuators")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    activeCargoTab === "actuators"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Remote Actuators
                </button>
                <button
                  onClick={() => setActiveCargoTab("manifest")}
                  className={`rounded-lg px-3 py-1.5 transition ${
                    activeCargoTab === "manifest"
                      ? "bg-cyan-600 text-white shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  Salvage & Insurance
                </button>
              </div>
            </div>

            {/* TAB 1: SENSORS & STATUS MATRIX */}
            {activeCargoTab === "sensors" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Gauge 1: Dunnage Airbags */}
                  <div className="rounded-xl border border-cyan-500/30 bg-surface p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-cyan-400">
                      <span className="flex items-center gap-1.5">
                        <Layers className="size-4" />
                        Pneumatic Dunnage
                      </span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                        {displayedIncident.cargoProtection.airbagDunnage.deployed
                          ? "INFLATED"
                          : "STANDBY"}
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-foreground">
                      {displayedIncident.cargoProtection.airbagDunnage.kineticShockAbsorbedPct}%
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Inflated in{" "}
                      {displayedIncident.cargoProtection.airbagDunnage.deploymentLatencyMs}ms.
                      Lateral shifting prevented (
                      {displayedIncident.cargoProtection.airbagDunnage.loadDisplacementMm}mm shift).
                    </p>
                  </div>

                  {/* Gauge 2: Nitrogen & Atmospheric Ingress */}
                  <div className="rounded-xl border border-amber-500/30 bg-surface p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-amber-400">
                      <span className="flex items-center gap-1.5">
                        <Wind className="size-4" />
                        Inert Gas Purge
                      </span>
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[9px] font-bold text-amber-400 border border-amber-500/30">
                        {displayedIncident.cargoProtection.inertGasPurge.active ? "FLOODED" : "OFF"}
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-foreground">
                      {displayedIncident.cargoProtection.inertGasPurge.chamberOxygenPct}%{" "}
                      <span className="text-xs font-normal text-muted-foreground">O2</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {displayedIncident.cargoProtection.inertGasPurge.gasType}. Fire and thermal
                      runaway risk fully suppressed.
                    </p>
                  </div>

                  {/* Gauge 3: Cold-Chain Cryo Compressor */}
                  <div className="rounded-xl border border-blue-500/30 bg-surface p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-blue-400">
                      <span className="flex items-center gap-1.5">
                        <ThermometerSnowflake className="size-4" />
                        Cold-Chain Aux
                      </span>
                      <span className="rounded-full bg-blue-500/10 px-2 py-0.5 text-[9px] font-bold text-blue-400 border border-blue-500/30">
                        {displayedIncident.cargoProtection.coldChainAux.active
                          ? "240V AUX"
                          : "GRID"}
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-foreground">
                      {displayedIncident.cargoProtection.telemetry.internalTempC}°C
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {displayedIncident.cargoProtection.coldChainAux.coolingAutonomyHours}h battery
                      runtime. Deviation:{" "}
                      {displayedIncident.cargoProtection.coldChainAux.tempDeviationC > 0
                        ? `+${displayedIncident.cargoProtection.coldChainAux.tempDeviationC}`
                        : displayedIncident.cargoProtection.coldChainAux.tempDeviationC}
                      °C.
                    </p>
                  </div>

                  {/* Gauge 4: Hermetic Seal & Toxic Emissions */}
                  <div className="rounded-xl border border-emerald-500/30 bg-surface p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-emerald-400">
                      <span className="flex items-center gap-1.5">
                        <Lock className="size-4" />
                        Hermetic Seal
                      </span>
                      <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-500/30">
                        {displayedIncident.cargoProtection.hermeticSeal.sealStatus}
                      </span>
                    </div>
                    <div className="text-2xl font-mono font-bold text-foreground">
                      {displayedIncident.cargoProtection.telemetry.vocToxicPpm}{" "}
                      <span className="text-xs font-normal text-muted-foreground">ppm VOC</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Mechanical drain valves & ventilation ports locked shut. Anti-spill baffles
                      engaged.
                    </p>
                  </div>
                </div>

                {/* Cargo Safety Audit Timeline Stream */}
                <div className="rounded-xl border border-border/80 bg-surface-2 p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-foreground">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="size-4 text-cyan-400" />
                      Autonomous Cargo Safeguard Mitigation Actions:
                    </span>
                    <span className="text-[10px] font-mono text-muted-foreground">
                      Tamper Token: {displayedIncident.cargoProtection.hermeticSeal.tamperTokenHash}
                    </span>
                  </div>
                  <div className="space-y-1.5 pt-1">
                    {displayedIncident.cargoProtection.mitigationLogs.map((log, idx) => (
                      <div
                        key={idx}
                        className="text-xs text-muted-foreground flex items-start gap-2"
                      >
                        <span className="size-1.5 rounded-full bg-cyan-400 mt-1.5 shrink-0" />
                        <span className="font-mono text-foreground">{log}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: REMOTE ACTUATION SWITCHBOARD */}
            {activeCargoTab === "actuators" && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {/* Actuator 1: Nitrogen Flood */}
                  <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-amber-400">
                        <Wind className="size-4" />
                        Forced Nitrogen (N2) Flood
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Remotely command high-pressure inert Nitrogen burst into cargo headspace to
                        suppress thermal runaway.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        emergencyStore.actuateCargoNitrogenPurge();
                        showToast("🧪 High-Pressure Nitrogen Purge Actuated Remotely!");
                      }}
                      className="w-full rounded-xl bg-amber-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-amber-700 transition"
                    >
                      Trigger Forced N2 Purge
                    </button>
                  </div>

                  {/* Actuator 2: Aux Cryo Turbo Boost */}
                  <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-cyan-400">
                        <ThermometerSnowflake className="size-4" />
                        Boost Cryo-Chiller Inverter
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Engage turbo cryogenic cooling mode on isolated LiFePO4 battery to safeguard
                        biologics/vaccines.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        emergencyStore.actuateCargoAuxCryoBoost();
                        showToast("❄️ Auxiliary Cryo-Chiller Turbo Boost Engaged!");
                      }}
                      className="w-full rounded-xl bg-cyan-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-cyan-700 transition"
                    >
                      Engage Cryo Turbo Boost
                    </button>
                  </div>

                  {/* Actuator 3: Lock Hermetic Valves */}
                  <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                        <Lock className="size-4" />
                        Lock All Isolation Valves
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Remote hydraulic lock on all chemical manifold exhaust and drain vents to
                        guarantee zero emissions.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        emergencyStore.actuateCargoIsolationValvesLock();
                        showToast("🔒 All Container Isolation Valves & Baffles Locked!");
                      }}
                      className="w-full rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-emerald-700 transition"
                    >
                      Enforce Hermetic Lock
                    </button>
                  </div>

                  {/* Actuator 4: Dispatch Reefer Salvage */}
                  <div className="rounded-xl border border-border bg-surface p-3.5 space-y-2.5 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs font-bold text-purple-400">
                        <Truck className="size-4" />
                        Priority Reefer Cross-Dock
                      </div>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        Fast-track mobile 40T hydraulic crane and secondary refrigerated transfer
                        vehicle with emergency siren.
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        emergencyStore.actuateDispatchSalvageReefer();
                        showToast("🚛 Priority Reefer Salvage & Crane Unit Dispatched!");
                      }}
                      className="w-full rounded-xl bg-purple-600 px-3 py-2 text-xs font-bold text-white shadow hover:bg-purple-700 transition"
                    >
                      Fast-Track Reefer Salvage
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SALVAGE UNIT & INSURANCE MANIFEST */}
            {activeCargoTab === "manifest" && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Salvage Unit Card */}
                  <div className="rounded-xl border border-cyan-500/40 bg-surface p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="flex size-9 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                          <Truck className="size-5" />
                        </div>
                        <div>
                          <span className="font-mono text-[9px] font-bold text-cyan-400 uppercase">
                            Designated Salvage Recovery Crew
                          </span>
                          <h4 className="text-sm font-bold text-foreground">
                            {displayedIncident.cargoProtection.salvageUnit.teamName}
                          </h4>
                          <p className="text-[11px] text-muted-foreground">
                            Lead: {displayedIncident.cargoProtection.salvageUnit.teamLead}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="font-mono text-xl font-bold text-cyan-400">
                          {Math.ceil(displayedIncident.cargoProtection.salvageUnit.etaMinutes)} min
                        </div>
                        <div className="text-[10px] text-muted-foreground">
                          {displayedIncident.cargoProtection.salvageUnit.distanceKm} km away
                        </div>
                      </div>
                    </div>

                    <div className="rounded-lg bg-surface-2 p-2.5 text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Unit Type:</span>
                        <span className="font-semibold">
                          {displayedIncident.cargoProtection.salvageUnit.unitType}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Offload Transfer Bay:</span>
                        <span className="font-bold text-cyan-400">
                          {displayedIncident.cargoProtection.salvageUnit.designatedTransferBay}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => setCallModalTarget("cargo_salvage")}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-3.5 py-2 text-xs font-bold text-white shadow hover:bg-cyan-700 transition"
                      >
                        <PhoneCall className="size-3.5" />
                        <span>Call Cargo Salvage Team Lead</span>
                      </button>
                      <a
                        href={`tel:${displayedIncident.cargoProtection.salvageUnit.contactPhone.replace(/[^0-9+]/g, "")}`}
                        className="flex size-9 items-center justify-center rounded-xl border border-border bg-surface-2 text-foreground hover:bg-surface-3"
                        title="Direct Call"
                      >
                        <Phone className="size-3.5 text-emerald-500" />
                      </a>
                    </div>
                  </div>

                  {/* Insurance & Compliance Card */}
                  <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="size-5 text-emerald-500" />
                      <div>
                        <h4 className="text-sm font-bold text-foreground">
                          Cargo Insurance & Telematics Blackbox Guarantee
                        </h4>
                        <p className="text-[11px] text-muted-foreground">
                          Instantaneous zero-friction insurance claim certification with immutable
                          IoT audit hash.
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg bg-surface-2 p-2.5 text-xs space-y-1.5">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Declared Cargo Value:</span>
                        <span className="font-bold text-foreground">
                          {displayedIncident.cargoProtection.declaredValueInr}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Preservation Classification:</span>
                        <span className="font-semibold text-emerald-400">
                          {displayedIncident.cargoProtection.cargoCategory}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Damage Mitigation Protocol:</span>
                        <span className="font-semibold text-cyan-400">
                          100% Autonomous Airbag + Cryo Trigger
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleExportIncidentReport}
                      className="w-full flex items-center justify-center gap-2 rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs font-bold text-foreground hover:bg-surface-3 transition"
                    >
                      <Download className="size-3.5 text-primary" />
                      <span>Download Cryptographic Cargo Insurance Certificate</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* THE 4-PILLAR EMERGENCY DISPATCH QUADRANT */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* PILLAR 1: 108 Emergency Ambulance (ALS) */}
            <div className="rounded-2xl border border-red-500/50 bg-surface p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1.5 w-full bg-red-500" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-red-500/10 text-red-500 border border-red-500/30">
                    <Ambulance className="size-6 animate-pulse" />
                  </div>
                  <div>
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-red-500 border border-red-500/20">
                      Ambulance Dispatched (108)
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      {displayedIncident.ambulance.unitName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      {displayedIncident.ambulance.type} · Reg:{" "}
                      {displayedIncident.ambulance.vehicleRegistration}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-2xl font-extrabold text-red-500">
                    {Math.ceil(displayedIncident.ambulance.etaMinutes)} min
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    {displayedIncident.ambulance.distanceKm} km to scene
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface-2 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Paramedic Lead:</span>
                  <span className="font-semibold">{displayedIncident.ambulance.paramedicLead}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status:</span>
                  <span className="font-bold text-red-500 flex items-center gap-1">
                    <span className="size-1.5 rounded-full bg-red-500 animate-ping" />
                    {displayedIncident.ambulance.status}
                  </span>
                </div>
                <div className="pt-1">
                  <span className="text-[10px] text-muted-foreground block mb-1">
                    Onboard Equipment:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {displayedIncident.ambulance.equippedWith.map((eq, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-surface border border-border px-1.5 py-0.5 text-[9px] font-medium text-muted-foreground"
                      >
                        {eq}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Call Ambulance Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setCallModalTarget("ambulance")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 transition"
                >
                  <PhoneCall className="size-4 animate-bounce" />
                  <span>Call 108 Dispatcher & Paramedic Lead</span>
                </button>
                <a
                  href={`tel:${displayedIncident.ambulance.contactNumber.replace(/[^0-9+]/g, "")}`}
                  className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-2 text-foreground hover:bg-surface-3"
                  title="Direct Phone Call"
                >
                  <Phone className="size-4 text-emerald-500" />
                </a>
              </div>
            </div>

            {/* PILLAR 2: Nearby Level-1 Trauma Hospital */}
            <div className="rounded-2xl border border-blue-500/50 bg-surface p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1.5 w-full bg-blue-500" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/30">
                    <Building2 className="size-6" />
                  </div>
                  <div>
                    <span className="rounded-full bg-blue-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-blue-500 border border-blue-500/20">
                      Trauma Bay Reserved ({displayedIncident.hospital.traumaLevel})
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      {displayedIncident.hospital.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Head: {displayedIncident.hospital.emergencyDepartmentHead}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-mono text-xl font-bold text-blue-500">
                    {displayedIncident.hospital.distanceKm} km
                  </div>
                  <div className="text-[10px] text-muted-foreground font-semibold">
                    ~{displayedIncident.hospital.travelTimeMin} min transit
                  </div>
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface-2 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Reserved Bay:</span>
                  <span className="font-bold text-blue-500">
                    {displayedIncident.hospital.traumaBayReserved}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pre-Arrival Notification:</span>
                  <span className="font-semibold text-emerald-500 flex items-center gap-1">
                    <CheckCircle2 className="size-3.5" />
                    Confirmed Ready
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1.5 pt-1 text-[10px] text-center">
                  <div className="rounded-lg bg-surface border border-border p-1.5">
                    <div className="font-bold text-foreground">
                      {displayedIncident.hospital.availableBeds.traumaBays}
                    </div>
                    <div className="text-muted-foreground text-[9px]">Trauma Bays</div>
                  </div>
                  <div className="rounded-lg bg-surface border border-border p-1.5">
                    <div className="font-bold text-foreground">
                      {displayedIncident.hospital.availableBeds.icuVentilators}
                    </div>
                    <div className="text-muted-foreground text-[9px]">ICU Vents</div>
                  </div>
                  <div className="rounded-lg bg-surface border border-border p-1.5">
                    <div className="font-bold text-foreground">
                      {displayedIncident.hospital.availableBeds.bloodO_NegUnits} Units
                    </div>
                    <div className="text-muted-foreground text-[9px]">O-Neg Blood</div>
                  </div>
                </div>
              </div>

              {/* Call Hospital Button */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setCallModalTarget("hospital")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-blue-700 transition"
                >
                  <PhoneCall className="size-4" />
                  <span>Contact Hospital Trauma Surgery Ward</span>
                </button>
                <a
                  href={`tel:${displayedIncident.hospital.contactPhone.replace(/[^0-9+]/g, "")}`}
                  className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-2 text-foreground hover:bg-surface-3"
                  title="Direct Phone Call"
                >
                  <Phone className="size-4 text-emerald-500" />
                </a>
              </div>
            </div>

            {/* PILLAR 3: Railway Station Master & Track Interlocking */}
            <div className="rounded-2xl border border-amber-500/50 bg-surface p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1.5 w-full bg-amber-500" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/30">
                    <Train className="size-6" />
                  </div>
                  <div>
                    <span className="rounded-full bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-amber-500 border border-amber-500/20">
                      Station Interlock Tripped
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      {displayedIncident.station.stationName}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Station Master: {displayedIncident.station.stationMasterName}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-full bg-red-500 px-2.5 py-1 text-[10px] font-black uppercase text-white shadow">
                    TRACK HALTED
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface-2 p-3 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Signal & Power Interlock:</span>
                  <span className="font-bold text-red-500">
                    {displayedIncident.station.emergencyActionStatus}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {displayedIncident.station.actionLog}
                </p>
              </div>

              {/* Call Station Master */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setCallModalTarget("station_master")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-amber-700 transition"
                >
                  <PhoneCall className="size-4" />
                  <span>Call Station Master & DFC Controller</span>
                </button>
                <a
                  href={`tel:${displayedIncident.station.contactPhone.replace(/[^0-9+]/g, "")}`}
                  className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-2 text-foreground hover:bg-surface-3"
                  title="Direct Phone Call"
                >
                  <Phone className="size-4 text-emerald-500" />
                </a>
              </div>
            </div>

            {/* PILLAR 4: Police Highway Patrol & Fire Hazmat Team */}
            <div className="rounded-2xl border border-purple-500/50 bg-surface p-5 shadow-sm space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 h-1.5 w-full bg-purple-500" />
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/30">
                    <ShieldAlert className="size-6" />
                  </div>
                  <div>
                    <span className="rounded-full bg-purple-500/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase text-purple-500 border border-purple-500/20">
                      Police 112 & Fire 101 Dispatched
                    </span>
                    <h4 className="text-base font-bold text-foreground">
                      {displayedIncident.policeStation.name}
                    </h4>
                    <p className="text-xs text-muted-foreground">
                      Unit: {displayedIncident.policeStation.patrolUnit} · Fire Unit:{" "}
                      {displayedIncident.fireBrigade.name}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="rounded-full bg-purple-500/10 border border-purple-500/30 px-2.5 py-1 text-[10px] font-bold text-purple-400">
                    CORDON ACTIVE
                  </span>
                </div>
              </div>

              <div className="rounded-xl border border-border/80 bg-surface-2 p-3 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Highway Police Hotline:</span>
                  <span className="font-semibold">
                    {displayedIncident.policeStation.contactPhone}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Hazmat Foam Unit:</span>
                  <span className="font-bold text-emerald-500">
                    {displayedIncident.fireBrigade.hazmatUnitDispatched
                      ? "Dispatched & Rolling"
                      : "Standby"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Driver Handsfree Link:</span>
                  <button
                    onClick={() => setCallModalTarget("driver_cab")}
                    className="text-primary font-bold hover:underline"
                  >
                    Connect In-Cab Audio
                  </button>
                </div>
              </div>

              {/* Call Police / Fire */}
              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => setCallModalTarget("police_fire")}
                  className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-purple-600 px-4 py-2.5 text-xs font-bold text-white shadow hover:bg-purple-700 transition"
                >
                  <PhoneCall className="size-4" />
                  <span>Call Police PCR & Hazmat Commander</span>
                </button>
                <a
                  href={`tel:${displayedIncident.policeStation.contactPhone.replace(/[^0-9+]/g, "")}`}
                  className="flex size-10 items-center justify-center rounded-xl border border-border bg-surface-2 text-foreground hover:bg-surface-3"
                  title="Direct Phone Call"
                >
                  <Phone className="size-4 text-emerald-500" />
                </a>
              </div>
            </div>
          </div>

          {/* AI Emergency Incident Assistant & First Responder Protocol */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-sm space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Activity className="size-4" />
              </div>
              <h4 className="text-base font-bold text-foreground">
                AI Crash Triage, First-Responder Guidance & Cargo Safety Directives
              </h4>
            </div>
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 text-xs text-foreground leading-relaxed space-y-2">
              <p className="font-semibold text-primary">
                ⚡ Automated Triage Directive (National Disaster Management & Hazmat Protocol):
              </p>
              <p>{displayedIncident.aiTriageSummary}</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2 text-[11px]">
                <div className="rounded-lg bg-surface p-2.5 border border-border">
                  <div className="font-bold text-red-500">1. Golden Hour Target</div>
                  <div className="text-muted-foreground">
                    Casualty hospital admission target &lt; 18 min (Current ETA:{" "}
                    {Math.ceil(displayedIncident.ambulance.etaMinutes)} mins).
                  </div>
                </div>
                <div className="rounded-lg bg-surface p-2.5 border border-border">
                  <div className="font-bold text-cyan-500">2. Cargo Containment</div>
                  <div className="text-muted-foreground">
                    Nitrogen purge active, dunnage airbags deployed, zero hazardous emissions
                    verified.
                  </div>
                </div>
                <div className="rounded-lg bg-surface p-2.5 border border-border">
                  <div className="font-bold text-amber-500">3. Track & Corridor Interlock</div>
                  <div className="text-muted-foreground">
                    Automatic signal trip halted secondary rail/highway traffic.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Chronological Automated Emergency Action Timeline */}
          <div className="rounded-2xl border border-border/80 bg-surface p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-primary" />
                <h4 className="text-base font-bold">Automated Incident Action Audit Trail</h4>
              </div>
              <span className="font-mono text-xs text-muted-foreground">
                {displayedIncident.timeline.length} verified events logged
              </span>
            </div>

            <div className="relative border-l-2 border-border/80 ml-3 space-y-4 pl-5">
              {displayedIncident.timeline.map((event) => (
                <div key={event.id} className="relative group">
                  <span className="absolute -left-[27px] top-1 flex size-3.5 items-center justify-center rounded-full bg-red-500 ring-4 ring-surface" />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-bold text-red-400">
                      {event.timestamp}
                    </span>
                    <span className="rounded-md bg-surface-2 border border-border px-1.5 py-0.5 font-mono text-[9px] font-bold text-muted-foreground uppercase">
                      {event.actor}
                    </span>
                    <h5 className="text-xs font-bold text-foreground">{event.title}</h5>
                  </div>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Add manual operator note */}
            <form onSubmit={handleAddLog} className="flex gap-2 pt-2">
              <input
                type="text"
                value={newLogText}
                onChange={(e) => setNewLogText(e.target.value)}
                placeholder="Add operator notes, cargo inspection or on-site dispatch status..."
                className="flex-1 rounded-xl border border-border bg-surface-2 px-3.5 py-2 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <button
                type="submit"
                disabled={!newLogText.trim()}
                className="flex items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground disabled:opacity-50"
              >
                <Send className="size-3.5" />
                <span>Log Event</span>
              </button>
            </form>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border border-border/80 bg-surface p-12 text-center space-y-4">
          <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/30">
            <CheckCircle2 className="size-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-foreground">Zero Active Crash Emergencies</h3>
            <p className="mt-1 text-xs text-muted-foreground max-w-md mx-auto">
              All 1,248 freight rakes and drayage trucks are operating normally across national
              corridors with 100% cargo integrity verified.
            </p>
          </div>
          <button
            onClick={() => triggerScenario("lithium_battery_nh48")}
            className="rounded-xl bg-red-600 px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-red-700 transition"
          >
            🚨 Launch Live Emergency Crash & Cargo Safety Drill
          </button>
        </div>
      )}

      {/* Interactive Emergency Call Modal */}
      {callModalTarget && displayedIncident && (
        <EmergencyCallModal
          target={callModalTarget}
          incident={displayedIncident}
          onClose={() => setCallModalTarget(null)}
        />
      )}
    </div>
  );
}
