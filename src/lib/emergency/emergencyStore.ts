import { AccidentIncident, IncidentTimelineEvent, CargoProtectionSystem } from "@/types/emergency";

function nowHM() {
  const d = new Date();
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;
}

const DEFAULT_CARGO_PROTECTION: CargoProtectionSystem = {
  cargoCategory: "Lithium-Ion Batteries & Precision Electronics",
  declaredValueInr: "₹4,85,00,000 (₹4.85 Cr / $580k USD)",
  preservationStatus: "Fully Secured & Inert",
  airbagDunnage: {
    deployed: true,
    deploymentLatencyMs: 14,
    kineticShockAbsorbedPct: 86.4,
    loadDisplacementMm: 3.2,
  },
  inertGasPurge: {
    active: true,
    gasType: "Nitrogen (N2) Flood",
    chamberOxygenPct: 9.4,
    fireRiskNeutralized: true,
  },
  coldChainAux: {
    active: true,
    compressorPowerSource: "Auxiliary 240V LiFePO4 Inverter",
    temperatureC: 21.4,
    targetTemperatureC: 20.0,
    tempDeviationC: 1.4,
    coolingAutonomyHours: 48.0,
  },
  hermeticSeal: {
    sealStatus: "100% Intact & Locked",
    isolationValvesLocked: true,
    antiSpillBafflesEngaged: true,
    tamperTokenHash: "SHA256-ECALL-9981-INTACT-CARGO-SAFE",
  },
  salvageUnit: {
    id: "SALV-HZ-REW-04",
    teamName: "National Hazmat Containment & Reefer Recovery Rescue Unit #04",
    unitType: "Heavy Hazmat Containment & Reefer Recovery Unit",
    status: "Dispatched with Siren",
    etaMinutes: 6,
    distanceKm: 3.8,
    contactPhone: "+91 1274 259904",
    teamLead: "Er. Mahendra Chawla (Hazmat & Cold-Chain Engineer)",
    designatedTransferBay: "Rewari Multi-Modal Logistics Hub Bay #04",
    coordinates: { lat: 28.175, lng: 76.598 },
  },
  telemetry: {
    internalTempC: 21.4,
    targetTempC: 20.0,
    humidityPct: 44.0,
    pressureKpa: 101.8,
    shockAbsorptionPct: 86.4,
    tiltDeg: 2.1,
    oxygenLevelPct: 9.4,
    vocToxicPpm: 0.0,
    liquidSpillDetected: false,
    thermalRunawayRisk: "Suppressed",
    backupBatteryPct: 98,
    backupBatteryHours: 48,
  },
  mitigationLogs: [
    "00:00:00 - Catastrophic impact detected: IMU triggered 14ms pneumatic dunnage airbag inflation.",
    "00:00:01 - Primary chassis power loss detected: Switched to 240V LiFePO4 auxiliary inverter.",
    "00:00:01 - Nitrogen (N2) purge initiated: Cargo bay oxygen lowered to 9.4% to suppress thermal runaway.",
    "00:00:02 - Hermetic isolation valves locked: Micro-leak protection & anti-spill baffles engaged.",
    "00:00:03 - Hazmat recovery salvage crew & cross-dock reefer unit SALV-HZ-REW-04 dispatched.",
  ],
};

const INITIAL_INCIDENT: AccidentIncident = {
  id: "INC-2026-8809",
  title: "Heavy Double-Stack Drayage Truck Rollover & Collision",
  vehicleId: "TRK-HR26-EA-9912",
  vehicleType: "truck",
  vehicleNumber: "HR-26-EA-9912",
  driverName: "Sukhwinder Singh",
  driverPhone: "+91 98102 34112",
  driverBloodGroup: "O+",
  corridor: "NH-48 Jaipur-Delhi Freight Corridor (Near Manesar / Rewari)",
  landmark: "Km 54.2 Milestone, Near Rewari Multi-Modal Hub Overpass",
  coordinates: { lat: 28.1928, lng: 76.6189 },
  impactTime: "Just now",
  gForce: 7.6,
  speedAtImpactKmh: 68,
  rolloverAngleDeg: 78,
  severity: "CRITICAL_LEVEL_1",
  cargoDescription: "Lithium-Ion Battery Enclosures & High-Precision Electronics",
  hazmatCode: "UN 3480 (Class 9 Miscellaneous Dangerous Goods - Lithium Batteries)",
  status: "AMBULANCE_EN_ROUTE",
  driverStatus: "Conscious / Injured - Extrication in Progress",
  crewCount: 2,
  ambulance: {
    id: "AMB-108-REW-09",
    unitName: "108 Emergency Life Support Unit #09",
    type: "Advanced Life Support (ALS)",
    status: "En Route with Siren",
    etaMinutes: 3,
    distanceKm: 2.1,
    contactNumber: "108 / +91 1274 255108",
    paramedicLead: "Dr. Arvind Varma (EMT-Paramedic Lead)",
    vehicleRegistration: "HR-36-G-1108",
    currentCoordinates: { lat: 28.1812, lng: 76.608 },
    equippedWith: [
      "Multipara Patient Monitor",
      "Defibrillator & Transport Ventilator",
      "Spine Board & Extrication Collar",
      "Hazmat Chemical Burn Kit",
      "O-Negative Emergency Blood Units",
    ],
  },
  hospital: {
    id: "HOSP-AIIMS-REW",
    name: "Civil Trauma Super-Specialty Hospital & Trauma Bay 1",
    category: "Super-Specialty Hospital",
    traumaLevel: "Level 1 (Highest)",
    distanceKm: 4.8,
    travelTimeMin: 7,
    contactPhone: "+91 1274 225102",
    emergencyDepartmentHead: "Dr. Priyamvada Sen (Chief of Trauma Surgery)",
    address: "Circular Road, Model Town, Rewari, Haryana 123401",
    coordinates: { lat: 28.1995, lng: 76.626 },
    availableBeds: {
      traumaBays: 4,
      icuVentilators: 7,
      burnsUnit: 2,
      bloodO_NegUnits: 12,
    },
    preArrivalNotified: true,
    traumaBayReserved: "Trauma Resuscitation Bay #02 (Red Alert Priority)",
  },
  station: {
    id: "STN-REW-DFC",
    stationName: "Rewari Junction Railway Station & Western DFC Master Control",
    type: "Dedicated Freight Corridor Control",
    stationMasterName: "Shri Rajeshwar Nath (Chief Controller)",
    contactPhone: "139 / +91 1274 254110",
    distanceKm: 3.2,
    emergencyActionStatus: "SIGNAL_TRIP_HALTED",
    actionLog:
      "AUTOMATIC SIGNAL INTERLOCK TRIP EXECUTED: All Up & Down line freight rakes halted within 15 km radius. Overhead 25kV OHE power section neutralised.",
  },
  cargoProtection: DEFAULT_CARGO_PROTECTION,
  policeStation: {
    name: "Rewari Highway Traffic & PCR Control Room",
    contactPhone: "112 / +91 1274 222112",
    patrolUnit: "Highway Patrol Tiger-4",
    distanceKm: 1.8,
  },
  fireBrigade: {
    name: "Rewari Central Fire & Chemical Hazmat Station",
    contactPhone: "101 / +91 1274 225101",
    hazmatUnitDispatched: true,
    distanceKm: 2.9,
  },
  aiTriageSummary:
    "HIGH IMPACT G-FORCE DETECTED (7.6g). Immediate risk of battery cell thermal runaway (UN 3480). Autonomous Nitrogen purge engaged; internal temperature stabilized at 21.4°C. Pneumatic dunnage airbags deployed with 86.4% shock absorption. Paramedics instructed to avoid water-based extinguisher, use dry chemical foam. Driver cab extrication required with cervical collar.",
  timeline: [
    {
      id: "TL-01",
      timestamp: "00:00:00",
      relativeSec: 0,
      actor: "TELEMATICS_IMU",
      title: "Sudden Deceleration Impact (7.6g)",
      description:
        "Onboard IoT G-Sensor registered catastrophic deceleration and rollover angle of 78° at 68 km/h.",
      verified: true,
    },
    {
      id: "TL-02",
      timestamp: "00:00:01",
      relativeSec: 1,
      actor: "CARGO_PRESERVATION",
      title: "Cargo Dunnage Airbags & Aux Inverter Triggered",
      description:
        "Kinetic dunnage airbags deployed in 14ms (86.4% shock absorbed). Aux 240V LiFePO4 battery engaged.",
      verified: true,
    },
    {
      id: "TL-03",
      timestamp: "00:00:01",
      relativeSec: 1,
      actor: "CARGO_PRESERVATION",
      title: "Nitrogen Purge & Isolation Valves Sealed",
      description:
        "Active N2 flood reduced O2 to 9.4%, neutralizing combustion risk. Chemical isolation ports locked.",
      verified: true,
    },
    {
      id: "TL-04",
      timestamp: "00:00:02",
      relativeSec: 2,
      actor: "ECALL_AUTOMATION",
      title: "Automated eCall SOS Broadcasted",
      description:
        "Emergency packet transmitted via dual 5G/Satellite modem with exact WGS-84 coordinates and Hazmat manifest.",
      verified: true,
    },
    {
      id: "TL-05",
      timestamp: "00:00:02",
      relativeSec: 2,
      actor: "AMBULANCE_108",
      title: "108 Advanced Life Support Dispatched",
      description:
        "Ambulance Unit AMB-108-REW-09 assigned. Live GPS telemetry tracking activated with emergency sirens.",
      verified: true,
    },
    {
      id: "TL-06",
      timestamp: "00:00:03",
      relativeSec: 3,
      actor: "HAZMAT_SALVAGE",
      title: "Hazmat Salvage & Reefer Recovery Dispatched",
      description:
        "Salvage Unit SALV-HZ-REW-04 dispatched to accident coordinates for on-site cargo cross-docking.",
      verified: true,
    },
    {
      id: "TL-07",
      timestamp: "00:00:03",
      relativeSec: 3,
      actor: "HOSPITAL_TRAUMA",
      title: "Trauma Hospital Pre-Arrival Alert Sent",
      description:
        "Civil Trauma Super-Specialty Hospital notified. Trauma Bay #02 reserved with blood bank on standby.",
      verified: true,
    },
    {
      id: "TL-08",
      timestamp: "00:00:04",
      relativeSec: 4,
      actor: "STATION_MASTER",
      title: "Station Master Interlock Activated",
      description:
        "Rewari Junction & Western DFC control tripped adjacent signals to RED to avert secondary freight collisions.",
      verified: true,
    },
  ],
};

type EmergencyListener = () => void;

class EmergencyStore {
  private activeIncident: AccidentIncident | null = INITIAL_INCIDENT;
  private incidentHistory: AccidentIncident[] = [];
  private listeners = new Set<EmergencyListener>();
  private sirenAudioActive = false;
  private audioCtx: AudioContext | null = null;
  private sirenOsc: OscillatorNode | null = null;
  private sirenGain: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    if (typeof window !== "undefined") {
      this.startSimulationTicker();
    }
  }

  getActiveIncident = () => this.activeIncident;
  getIncidentHistory = () => this.incidentHistory;
  isSirenActive = () => this.sirenAudioActive;

  subscribe = (listener: EmergencyListener) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private emit() {
    this.listeners.forEach((l) => l());
  }

  private startSimulationTicker() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => {
      if (!this.activeIncident) return;
      if (this.activeIncident.status === "RESOLVED") return;

      // 1. Gradually decrement ambulance ETA & Salvage ETA
      const currentEta = this.activeIncident.ambulance.etaMinutes;
      const currentDist = this.activeIncident.ambulance.distanceKm;
      const salvageEta = this.activeIncident.cargoProtection.salvageUnit.etaMinutes;
      const salvageDist = this.activeIncident.cargoProtection.salvageUnit.distanceKm;

      let nextAmbulance = this.activeIncident.ambulance;
      let nextSalvage = this.activeIncident.cargoProtection.salvageUnit;

      if (currentEta > 1) {
        nextAmbulance = {
          ...this.activeIncident.ambulance,
          etaMinutes: Math.max(1, currentEta - 0.2),
          distanceKm: Math.max(0.3, +(currentDist - 0.15).toFixed(1)),
        };
      }

      if (salvageEta > 1) {
        nextSalvage = {
          ...this.activeIncident.cargoProtection.salvageUnit,
          etaMinutes: Math.max(1, salvageEta - 0.25),
          distanceKm: Math.max(0.4, +(salvageDist - 0.2).toFixed(1)),
        };
      }

      // 2. Micro-jitter telemetry to simulate live IoT sensors maintaining safe cargo state
      const currentTemp = this.activeIncident.cargoProtection.telemetry.internalTempC;
      const targetTemp = this.activeIncident.cargoProtection.telemetry.targetTempC;
      // Gently drift temperature back toward target (cooling in action)
      const adjustedTemp = +(
        currentTemp +
        (targetTemp - currentTemp) * 0.05 +
        (Math.random() * 0.04 - 0.02)
      ).toFixed(1);

      this.activeIncident = {
        ...this.activeIncident,
        ambulance: nextAmbulance,
        cargoProtection: {
          ...this.activeIncident.cargoProtection,
          salvageUnit: nextSalvage,
          coldChainAux: {
            ...this.activeIncident.cargoProtection.coldChainAux,
            temperatureC: adjustedTemp,
          },
          telemetry: {
            ...this.activeIncident.cargoProtection.telemetry,
            internalTempC: adjustedTemp,
            oxygenLevelPct: Math.max(
              8.5,
              +(this.activeIncident.cargoProtection.telemetry.oxygenLevelPct - 0.02).toFixed(1),
            ),
            backupBatteryPct: Math.max(
              90,
              this.activeIncident.cargoProtection.telemetry.backupBatteryPct - 0.01,
            ),
          },
        },
      };

      if (currentEta <= 1 && this.activeIncident.status === "AMBULANCE_EN_ROUTE") {
        this.activeIncident = {
          ...this.activeIncident,
          status: "HOSPITAL_TRIAGE",
          ambulance: {
            ...this.activeIncident.ambulance,
            status: "Arrived at Scene",
            etaMinutes: 0,
            distanceKm: 0,
          },
          timeline: [
            {
              id: `TL-${Date.now()}`,
              timestamp: nowHM(),
              relativeSec: 180,
              actor: "AMBULANCE_108",
              title: "108 Paramedic Crew On-Scene",
              description:
                "Dr. Arvind Varma and EMT team arrived at crash site. Stabilizing driver vitals & securing perimeter.",
              verified: true,
            },
            ...this.activeIncident.timeline,
          ],
        };
      }

      this.emit();
    }, 4000);
  }

  triggerIncident = (custom?: Partial<AccidentIncident>) => {
    const id = `INC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const isPerishable =
      custom?.cargoDescription?.toLowerCase().includes("vaccine") ||
      custom?.cargoDescription?.toLowerCase().includes("perishable") ||
      custom?.cargoDescription?.toLowerCase().includes("pharma");

    const customCargo: CargoProtectionSystem = {
      ...DEFAULT_CARGO_PROTECTION,
      cargoCategory: isPerishable
        ? "Cold-Chain Pharmaceuticals & Vaccines"
        : custom?.hazmatCode
          ? "Hazardous Flammable Chemicals (Class 3/8)"
          : "Lithium-Ion Batteries & Precision Electronics",
      declaredValueInr: custom?.cargoProtection?.declaredValueInr || "₹3,40,00,000 (₹3.40 Cr)",
      coldChainAux: {
        ...DEFAULT_CARGO_PROTECTION.coldChainAux,
        temperatureC: isPerishable ? 3.8 : 21.0,
        targetTemperatureC: isPerishable ? 4.0 : 20.0,
      },
      telemetry: {
        ...DEFAULT_CARGO_PROTECTION.telemetry,
        internalTempC: isPerishable ? 3.8 : 21.0,
        targetTempC: isPerishable ? 4.0 : 20.0,
      },
      ...custom?.cargoProtection,
    };

    const newIncident: AccidentIncident = {
      ...INITIAL_INCIDENT,
      id,
      impactTime: "Just now (" + nowHM() + ")",
      status: "DISPATCHING",
      cargoProtection: customCargo,
      ...custom,
      timeline: [
        {
          id: `TL-NEW-1`,
          timestamp: nowHM(),
          relativeSec: 0,
          actor: "TELEMATICS_IMU",
          title: `Severe Impact (${custom?.gForce || 8.2}g Deceleration)`,
          description: `Telemetry crash sensors detected sudden catastrophic impact on ${custom?.vehicleNumber || "TRK-DL01-AB-4491"}.`,
          verified: true,
        },
        {
          id: `TL-NEW-2`,
          timestamp: nowHM(),
          relativeSec: 1,
          actor: "CARGO_PRESERVATION",
          title: "Cargo Pneumatic Airbags & Aux Cryo Inverter Activated",
          description: `Dunnage shock absorbing airbags inflated in 12ms (88% shock dissipated). Switched to isolated LiFePO4 battery.`,
          verified: true,
        },
        {
          id: `TL-NEW-3`,
          timestamp: nowHM(),
          relativeSec: 1,
          actor: "CARGO_PRESERVATION",
          title: "Nitrogen Purge & Hermetic Anti-Spill Lock Engaged",
          description: `Nitrogen purge reduced chamber oxygen to inert levels. Automatic isolation valves locked to prevent leaks.`,
          verified: true,
        },
        {
          id: `TL-NEW-4`,
          timestamp: nowHM(),
          relativeSec: 2,
          actor: "ECALL_AUTOMATION",
          title: "Automated 108 Ambulance Call & GPS Data Dispatched",
          description:
            "Central 108 Emergency Grid dialed instantly. Live coordinates and Hazmat cargo telematics transmitted.",
          verified: true,
        },
        {
          id: `TL-NEW-5`,
          timestamp: nowHM(),
          relativeSec: 2,
          actor: "HAZMAT_SALVAGE",
          title: "Dedicated Reefer & Hazmat Salvage Unit Dispatched",
          description: `Salvage unit dispatched with mobile crane and secondary refrigerated transfer vehicle.`,
          verified: true,
        },
        {
          id: `TL-NEW-6`,
          timestamp: nowHM(),
          relativeSec: 3,
          actor: "HOSPITAL_TRAUMA",
          title: "Nearby Level-1 Trauma Center Alerted",
          description: `Hospital Trauma Team notified. Emergency Resuscitation Bay prepped.`,
          verified: true,
        },
      ],
    };

    if (this.activeIncident) {
      this.incidentHistory.unshift(this.activeIncident);
    }
    this.activeIncident = newIncident;
    this.emit();

    // Trigger voice alert with cargo safety confirmation
    this.speakVoiceAlert(
      `Emergency Alert. Accident detected on ${newIncident.corridor}. 108 Ambulance and Hazmat Cargo Salvage teams dispatched. Cargo dunnage airbags and nitrogen purge successfully activated.`,
    );
  };

  // Remote Cargo Safety Actuators
  actuateCargoNitrogenPurge = () => {
    if (!this.activeIncident) return;
    this.activeIncident = {
      ...this.activeIncident,
      cargoProtection: {
        ...this.activeIncident.cargoProtection,
        inertGasPurge: {
          active: true,
          gasType: "Nitrogen (N2) Flood",
          chamberOxygenPct: 6.8,
          fireRiskNeutralized: true,
        },
        telemetry: {
          ...this.activeIncident.cargoProtection.telemetry,
          oxygenLevelPct: 6.8,
          thermalRunawayRisk: "Suppressed",
        },
        mitigationLogs: [
          `${nowHM()} - Manual Overwrite: Forced high-pressure Nitrogen (N2) purge initiated. Oxygen level reduced to 6.8%.`,
          ...this.activeIncident.cargoProtection.mitigationLogs,
        ],
      },
    };
    this.addTimelineNote(
      "Manual Nitrogen (N2) Cargo Purge Engaged",
      "Dispatcher remotely commanded high-pressure inert Nitrogen flood into cargo bay. Oxygen dropped to 6.8%. Fire risk fully neutralized.",
    );
  };

  actuateCargoAuxCryoBoost = () => {
    if (!this.activeIncident) return;
    const newTemp = +(
      this.activeIncident.cargoProtection.coldChainAux.targetTemperatureC - 1.5
    ).toFixed(1);
    this.activeIncident = {
      ...this.activeIncident,
      cargoProtection: {
        ...this.activeIncident.cargoProtection,
        coldChainAux: {
          ...this.activeIncident.cargoProtection.coldChainAux,
          active: true,
          compressorPowerSource: "Auxiliary 240V LiFePO4 Inverter",
          temperatureC: newTemp,
          coolingAutonomyHours: 60,
        },
        telemetry: {
          ...this.activeIncident.cargoProtection.telemetry,
          internalTempC: newTemp,
          backupBatteryHours: 60,
        },
        mitigationLogs: [
          `${nowHM()} - Remote Command: Aux cryo-compressor boosted to Turbo. Internal temp set to ${newTemp}°C.`,
          ...this.activeIncident.cargoProtection.mitigationLogs,
        ],
      },
    };
    this.addTimelineNote(
      "Auxiliary Cryo-Cooling Boost Engaged",
      `Dispatcher remotely engaged turbo cryogenic cooling on auxiliary battery. Container temp stabilized at ${newTemp}°C.`,
    );
  };

  actuateCargoIsolationValvesLock = () => {
    if (!this.activeIncident) return;
    this.activeIncident = {
      ...this.activeIncident,
      cargoProtection: {
        ...this.activeIncident.cargoProtection,
        hermeticSeal: {
          ...this.activeIncident.cargoProtection.hermeticSeal,
          isolationValvesLocked: true,
          antiSpillBafflesEngaged: true,
          sealStatus: "100% Intact & Locked",
        },
        telemetry: {
          ...this.activeIncident.cargoProtection.telemetry,
          vocToxicPpm: 0.0,
          liquidSpillDetected: false,
        },
        mitigationLogs: [
          `${nowHM()} - Remote Command: Hermetic isolation ports & anti-spill baffles locked shut. Zero emissions verified.`,
          ...this.activeIncident.cargoProtection.mitigationLogs,
        ],
      },
    };
    this.addTimelineNote(
      "Hermetic Isolation Valves Sealed",
      "All cargo fluid lines, venting nozzles, and exhaust ports mechanically locked to prevent hazardous leakage or vapor discharge.",
    );
  };

  actuateDispatchSalvageReefer = () => {
    if (!this.activeIncident) return;
    this.activeIncident = {
      ...this.activeIncident,
      cargoProtection: {
        ...this.activeIncident.cargoProtection,
        preservationStatus: "Cross-Dock Salvage En Route",
        salvageUnit: {
          ...this.activeIncident.cargoProtection.salvageUnit,
          status: "Dispatched with Siren",
          etaMinutes: 4,
          distanceKm: 2.2,
        },
        mitigationLogs: [
          `${nowHM()} - Priority Command: Fast-response Reefer Salvage Truck & 40T Crane dispatched with siren. ETA 4 mins.`,
          ...this.activeIncident.cargoProtection.mitigationLogs,
        ],
      },
    };
    this.addTimelineNote(
      "Priority Cross-Dock Salvage Reefer Dispatched",
      "Heavy Hazmat containment and replacement temperature-controlled transfer truck dispatched to cross-load cargo on-site.",
    );
  };

  resolveIncident = (id: string) => {
    if (this.activeIncident && this.activeIncident.id === id) {
      this.activeIncident = {
        ...this.activeIncident,
        status: "RESOLVED",
        cargoProtection: {
          ...this.activeIncident.cargoProtection,
          preservationStatus: "Fully Secured & Inert",
          salvageUnit: {
            ...this.activeIncident.cargoProtection.salvageUnit,
            status: "On-Site Conducting Cross-Dock",
            etaMinutes: 0,
            distanceKm: 0,
          },
        },
        timeline: [
          {
            id: `TL-RES-${Date.now()}`,
            timestamp: nowHM(),
            relativeSec: 300,
            actor: "CARGO_PRESERVATION",
            title: "Cargo Salvage & Cross-Dock Complete",
            description:
              "100% of cargo safely transferred to replacement reefer vehicle with zero damage or thermal breach.",
            verified: true,
          },
          {
            id: `TL-RES-HOSP-${Date.now()}`,
            timestamp: nowHM(),
            relativeSec: 300,
            actor: "HOSPITAL_TRAUMA",
            title: "Patient Admitted & Perimeter Cleared",
            description:
              "Driver safely transported to Trauma Care. Track & highway cleared for regular freight operations.",
            verified: true,
          },
          ...this.activeIncident.timeline,
        ],
      };
      this.incidentHistory.unshift(this.activeIncident);
      this.activeIncident = null;
      this.stopSirenAudio();
      this.emit();
    }
  };

  addTimelineNote = (title: string, description: string) => {
    if (!this.activeIncident) return;
    const newEvent: IncidentTimelineEvent = {
      id: `TL-${Date.now()}`,
      timestamp: nowHM(),
      relativeSec: 120,
      actor: "CARGO_PRESERVATION",
      title,
      description,
      verified: true,
    };
    this.activeIncident = {
      ...this.activeIncident,
      timeline: [newEvent, ...this.activeIncident.timeline],
    };
    this.emit();
  };

  // Web Audio Siren Generator
  toggleSirenAudio = () => {
    if (this.sirenAudioActive) {
      this.stopSirenAudio();
    } else {
      this.startSirenAudio();
    }
  };

  startSirenAudio = () => {
    if (typeof window === "undefined") return;
    try {
      if (!this.audioCtx) {
        const AudioContextClass =
          window.AudioContext ||
          (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        this.audioCtx = new AudioContextClass();
      }
      if (this.audioCtx.state === "suspended") {
        this.audioCtx.resume();
      }

      this.sirenOsc = this.audioCtx.createOscillator();
      this.sirenGain = this.audioCtx.createGain();

      this.sirenOsc.type = "sine";
      this.sirenOsc.frequency.setValueAtTime(650, this.audioCtx.currentTime);

      const now = this.audioCtx.currentTime;
      for (let i = 0; i < 20; i++) {
        this.sirenOsc.frequency.linearRampToValueAtTime(950, now + i * 1.0 + 0.5);
        this.sirenOsc.frequency.linearRampToValueAtTime(650, now + i * 1.0 + 1.0);
      }

      this.sirenGain.gain.setValueAtTime(0.08, this.audioCtx.currentTime);
      this.sirenOsc.connect(this.sirenGain);
      this.sirenGain.connect(this.audioCtx.destination);
      this.sirenOsc.start();
      this.sirenAudioActive = true;
      this.emit();
    } catch (e) {
      console.warn("Audio Context init error", e);
    }
  };

  stopSirenAudio = () => {
    try {
      if (this.sirenOsc) {
        this.sirenOsc.stop();
        this.sirenOsc.disconnect();
        this.sirenOsc = null;
      }
      this.sirenAudioActive = false;
      this.emit();
    } catch {
      this.sirenAudioActive = false;
      this.emit();
    }
  };

  speakVoiceAlert = (text: string) => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.05;
        utterance.pitch = 1.0;
        window.speechSynthesis.speak(utterance);
      } catch {
        // speech synthesis gracefully optional
      }
    }
  };
}

export const emergencyStore = new EmergencyStore();
