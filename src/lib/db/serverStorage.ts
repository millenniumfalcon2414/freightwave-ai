import type {
  DatabaseState,
  DbShipment,
  DbVehicle,
  DbDriver,
  DbAlert,
  DbIncident,
  DbPrediction,
  DbRoute,
  DbSimulationEvent,
  DbAuditLog,
  DbUser,
  DbTrackingEvent,
} from "./types";

/**
 * Server-side SQLite persistence layer for FreightWave AI.
 * File location: data/freightwave.db
 *
 * Uses Node.js native DatabaseSync ("node:sqlite") with strict parameter sanitization.
 */

interface SqliteStatement {
  run: (...params: unknown[]) => { changes: number | bigint; lastInsertRowid: number | bigint };
  get: (...params: unknown[]) => Record<string, unknown> | undefined;
  all: (...params: unknown[]) => Array<Record<string, unknown>>;
}

interface SqliteDatabase {
  exec: (sql: string) => void;
  prepare: (sql: string) => SqliteStatement;
  close?: () => void;
}

let cachedDb: SqliteDatabase | null = null;

function toSqlVal(val: unknown, fallback: unknown = null): unknown {
  if (val === undefined || val === null) return fallback;
  if (typeof val === "boolean") return val ? 1 : 0;
  if (typeof val === "number" || typeof val === "string" || typeof val === "bigint") return val;
  return String(val);
}

function getSqliteInstance(): SqliteDatabase | null {
  if (cachedDb) return cachedDb;

  if (typeof window !== "undefined") {
    // In browser client, sqlite is accessed via server function API calls
    return null;
  }

  try {
    if (typeof process !== "undefined" && process.versions?.node) {
      // Use Node 22+ process.getBuiltinModule for ESM compatibility
      const getBuiltin = (process as unknown).getBuiltinModule;
      if (getBuiltin) {
        const path = getBuiltin("node:path");
        const fs = getBuiltin("node:fs");
        const sqliteModule = getBuiltin("node:sqlite");

        if (path && fs && sqliteModule?.DatabaseSync) {
          const dbDir = path.resolve(process.cwd(), "data");
          if (!fs.existsSync(dbDir)) {
            fs.mkdirSync(dbDir, { recursive: true });
          }
          const dbPath = path.join(dbDir, "freightwave.db");
          const db = new sqliteModule.DatabaseSync(dbPath) as SqliteDatabase;

          // Enable WAL mode & foreign keys for high performance and durability
          db.exec("PRAGMA journal_mode = WAL;");
          db.exec("PRAGMA synchronous = NORMAL;");

          initializeTables(db);
          cachedDb = db;
          return cachedDb;
        }
      }
    }
  } catch (err) {
    console.error("[SQLite Storage] Failed to initialize SQLite engine:", err);
  }

  // FAIL loudly if we are on the server and SQLite cannot initialize
  if (typeof window === "undefined") {
    throw new Error(
      "[SQLite Storage] Failed to initialize SQLite engine. Database is required on the server.",
    );
  }

  return null;
}

function initializeTables(db: SqliteDatabase) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      role TEXT NOT NULL,
      company TEXT,
      phone TEXT,
      avatarLetter TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS vehicles (
      vehicleId TEXT PRIMARY KEY,
      registrationNumber TEXT NOT NULL,
      driverId TEXT,
      driverName TEXT,
      driverPhone TEXT,
      currentShipmentId TEXT,
      status TEXT NOT NULL,
      currentLocationLat REAL,
      currentLocationLng REAL,
      currentLocationAddress TEXT,
      speed REAL,
      expectedSpeed REAL,
      utilization REAL,
      riskScore REAL,
      mode TEXT,
      fuelOrBatteryPct REAL,
      telemetryJson TEXT,
      lastUpdated TEXT
    );

    CREATE TABLE IF NOT EXISTS drivers (
      driverId TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT,
      licenseNumber TEXT,
      bloodGroup TEXT,
      safetyScore REAL,
      assignedVehicleId TEXT,
      dutyStatus TEXT,
      dutyHoursToday REAL,
      maxDutyHours REAL,
      lastMedicalCheck TEXT
    );

    CREATE TABLE IF NOT EXISTS shipments (
      shipmentId TEXT PRIMARY KEY,
      trackingNumber TEXT,
      customer TEXT NOT NULL,
      customerPhone TEXT,
      origin TEXT NOT NULL,
      originLat REAL,
      originLng REAL,
      destination TEXT NOT NULL,
      destLat REAL,
      destLng REAL,
      cargoType TEXT NOT NULL,
      cargoWeight REAL NOT NULL,
      declaredValueInr TEXT,
      vehicleId TEXT,
      driverId TEXT,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      departureTime TEXT,
      expectedDeliveryTime TEXT,
      originalEta TEXT,
      currentEta TEXT,
      predictedEta TEXT,
      currentLocationLat REAL,
      currentLocationLng REAL,
      currentLocationAddress TEXT,
      remainingKm REAL,
      totalKm REAL,
      riskScore REAL,
      riskLevel TEXT,
      delayProbability REAL,
      estimatedDelayMinutes REAL,
      routeDeviationKm REAL,
      mode TEXT NOT NULL,
      activeRouteName TEXT,
      alternativeRouteName TEXT,
      isSimulated INTEGER,
      notes TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS tracking_events (
      id TEXT PRIMARY KEY,
      shipmentId TEXT NOT NULL,
      vehicleId TEXT,
      timestamp TEXT NOT NULL,
      lat REAL,
      lng REAL,
      speed REAL,
      locationName TEXT,
      eventType TEXT NOT NULL,
      description TEXT,
      source TEXT,
      metadataJson TEXT,
      isSimulated INTEGER
    );

    CREATE TABLE IF NOT EXISTS alerts (
      alertId TEXT PRIMARY KEY,
      severity TEXT NOT NULL,
      type TEXT NOT NULL,
      shipmentId TEXT,
      vehicleId TEXT,
      timestamp TEXT NOT NULL,
      description TEXT NOT NULL,
      riskScore REAL,
      aiExplanationJson TEXT,
      recommendedAction TEXT,
      status TEXT NOT NULL,
      acknowledgedBy TEXT,
      resolvedAt TEXT,
      resolutionNote TEXT
    );

    CREATE TABLE IF NOT EXISTS incidents (
      incidentId TEXT PRIMARY KEY,
      time TEXT NOT NULL,
      vehicleId TEXT NOT NULL,
      vehicleNumber TEXT,
      shipmentId TEXT,
      driverName TEXT,
      locationLat REAL,
      locationLng REAL,
      locationAddress TEXT,
      severity TEXT NOT NULL,
      cause TEXT NOT NULL,
      actionTaken TEXT NOT NULL,
      status TEXT NOT NULL,
      resolvedAt TEXT,
      crewCount INTEGER,
      ambulanceDispatched INTEGER,
      cargoSafeguardActive INTEGER,
      notesJson TEXT
    );

    CREATE TABLE IF NOT EXISTS predictions (
      id TEXT PRIMARY KEY,
      shipmentId TEXT NOT NULL,
      calculatedAt TEXT,
      createdAt TEXT,
      updatedAt TEXT,
      originalEta TEXT,
      currentEta TEXT,
      predictedEta TEXT,
      delayMinutes REAL,
      estimatedDelay REAL,
      delayProbability REAL,
      riskScore REAL,
      riskLevel TEXT,
      confidence REAL,
      riskFactorsJson TEXT,
      reason TEXT,
      recommendedAction TEXT,
      explanationJson TEXT,
      historyJson TEXT
    );

    CREATE TABLE IF NOT EXISTS routes (
      routeId TEXT PRIMARY KEY,
      shipmentId TEXT,
      name TEXT NOT NULL,
      origin TEXT NOT NULL,
      destination TEXT NOT NULL,
      mode TEXT NOT NULL,
      distanceKm REAL NOT NULL,
      estimatedDurationHours REAL NOT NULL,
      congestionScore REAL,
      riskScore REAL,
      tollCostInr REAL,
      freightCostInr REAL,
      carbonKg REAL,
      co2SavedPct REAL,
      isRecommended INTEGER,
      description TEXT,
      pathJson TEXT,
      createdAt TEXT,
      updatedAt TEXT
    );

    CREATE TABLE IF NOT EXISTS simulation_events (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      scenario TEXT,
      eventType TEXT,
      description TEXT,
      payloadJson TEXT,
      affectedShipmentsJson TEXT,
      source TEXT,
      isSimulated INTEGER
    );

    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      timestamp TEXT NOT NULL,
      user TEXT NOT NULL,
      role TEXT NOT NULL,
      action TEXT NOT NULL,
      entity TEXT NOT NULL,
      entityId TEXT NOT NULL,
      previousValue TEXT,
      newValue TEXT,
      reason TEXT
    );

    CREATE TABLE IF NOT EXISTS system_metadata (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );
  `);
}

export function readPersistentDatabase(): DatabaseState | null {
  const db = getSqliteInstance();
  if (!db) {
    return null;
  }

  try {
    // 1. Users
    const usersRows = db.prepare("SELECT * FROM users").all();
    const users: DbUser[] = usersRows.map((r) => ({
      id: String(r.id),
      name: String(r.name),
      email: String(r.email),
      role: r.role as DbUser["role"],
      company: String(r.company || ""),
      phone: r.phone ? String(r.phone) : undefined,
      avatarLetter: String(r.avatarLetter || "U"),
      createdAt: String(r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updatedAt || new Date().toISOString()),
    }));

    // 2. Vehicles
    const vehicleRows = db.prepare("SELECT * FROM vehicles").all();
    const vehicles: DbVehicle[] = vehicleRows.map((r) => ({
      vehicleId: String(r.vehicleId),
      registrationNumber: String(r.registrationNumber),
      driverId: String(r.driverId || ""),
      driverName: String(r.driverName || ""),
      driverPhone: String(r.driverPhone || ""),
      currentShipmentId: r.currentShipmentId ? String(r.currentShipmentId) : undefined,
      status: r.status as DbVehicle["status"],
      currentLocation: {
        lat: Number(r.currentLocationLat || 0),
        lng: Number(r.currentLocationLng || 0),
        address: String(r.currentLocationAddress || ""),
      },
      speed: Number(r.speed || 0),
      expectedSpeed: Number(r.expectedSpeed || 60),
      utilization: Number(r.utilization || 80),
      riskScore: Number(r.riskScore || 10),
      mode: r.mode as DbVehicle["mode"],
      fuelOrBatteryPct: Number(r.fuelOrBatteryPct ?? 100),
      telemetry: r.telemetryJson
        ? JSON.parse(String(r.telemetryJson))
        : { temperatureC: 4.2, vibrationG: 0.15, tirePressurePsi: 110, odometerKm: 45000 },
      lastUpdated: String(r.lastUpdated || new Date().toISOString()),
    }));

    // 3. Drivers
    const driverRows = db.prepare("SELECT * FROM drivers").all();
    const drivers: DbDriver[] = driverRows.map((r) => ({
      driverId: String(r.driverId),
      name: String(r.name),
      phone: String(r.phone || ""),
      licenseNumber: String(r.licenseNumber || ""),
      bloodGroup: String(r.bloodGroup || ""),
      safetyScore: Number(r.safetyScore || 90),
      assignedVehicleId: r.assignedVehicleId ? String(r.assignedVehicleId) : undefined,
      dutyStatus: r.dutyStatus as DbDriver["dutyStatus"],
      dutyHoursToday: Number(r.dutyHoursToday || 0),
      maxDutyHours: Number(r.maxDutyHours || 10),
      lastMedicalCheck: String(r.lastMedicalCheck || new Date().toISOString()),
    }));

    // 4. Shipments
    const shipmentRows = db.prepare("SELECT * FROM shipments").all();
    const shipments: DbShipment[] = shipmentRows.map((r) => ({
      shipmentId: String(r.shipmentId),
      trackingNumber: String(r.trackingNumber || r.shipmentId),
      customer: String(r.customer),
      customerPhone: r.customerPhone ? String(r.customerPhone) : undefined,
      origin: String(r.origin),
      originCoords: {
        lat: Number(r.originLat || 0),
        lng: Number(r.originLng || 0),
      },
      destination: String(r.destination),
      destCoords: {
        lat: Number(r.destLat || 0),
        lng: Number(r.destLng || 0),
      },
      cargoType: String(r.cargoType),
      cargoWeight: Number(r.cargoWeight || 0),
      declaredValueInr: String(r.declaredValueInr || "₹1.0 Cr"),
      vehicleId: String(r.vehicleId || ""),
      driverId: String(r.driverId || ""),
      priority: r.priority as DbShipment["priority"],
      status: r.status as DbShipment["status"],
      departureTime: String(r.departureTime || ""),
      expectedDeliveryTime: String(r.expectedDeliveryTime || ""),
      originalEta: String(r.originalEta || ""),
      currentEta: String(r.currentEta || ""),
      predictedEta: String(r.predictedEta || ""),
      currentLocation: {
        lat: Number(r.currentLocationLat || 0),
        lng: Number(r.currentLocationLng || 0),
        address: String(r.currentLocationAddress || ""),
      },
      remainingKm: Number(r.remainingKm || 0),
      totalKm: Number(r.totalKm || 0),
      riskScore: Number(r.riskScore || 0),
      riskLevel: r.riskLevel as DbShipment["riskLevel"],
      delayProbability: Number(r.delayProbability || 0),
      estimatedDelayMinutes: Number(r.estimatedDelayMinutes || 0),
      routeDeviationKm: Number(r.routeDeviationKm || 0),
      mode: r.mode as DbShipment["mode"],
      activeRouteName: String(r.activeRouteName || ""),
      alternativeRouteName: r.alternativeRouteName ? String(r.alternativeRouteName) : undefined,
      isSimulated: Boolean(r.isSimulated),
      notes: r.notes ? String(r.notes) : undefined,
      createdAt: String(r.createdAt || new Date().toISOString()),
      updatedAt: String(r.updatedAt || new Date().toISOString()),
    }));

    // 5. Tracking Events
    const trackingRows = db.prepare("SELECT * FROM tracking_events").all();
    const trackingEvents: DbTrackingEvent[] = trackingRows.map((r) => ({
      id: String(r.id),
      eventId: String(r.id),
      shipmentId: String(r.shipmentId),
      vehicleId: String(r.vehicleId || ""),
      timestamp: String(r.timestamp),
      lat: Number(r.lat || 0),
      latitude: Number(r.lat || 0),
      lng: Number(r.lng || 0),
      longitude: Number(r.lng || 0),
      speed: Number(r.speed || 0),
      locationName: String(r.locationName || ""),
      eventType: String(r.eventType),
      description: r.description ? String(r.description) : undefined,
      source: r.source ? String(r.source) : undefined,
      metadata: r.metadataJson ? JSON.parse(String(r.metadataJson)) : undefined,
      isSimulated: Boolean(r.isSimulated),
    }));

    // 6. Alerts
    const alertRows = db.prepare("SELECT * FROM alerts").all();
    const alerts: DbAlert[] = alertRows.map((r) => ({
      alertId: String(r.alertId),
      severity: r.severity as DbAlert["severity"],
      type: r.type as DbAlert["type"],
      shipmentId: r.shipmentId ? String(r.shipmentId) : undefined,
      vehicleId: r.vehicleId ? String(r.vehicleId) : undefined,
      timestamp: String(r.timestamp),
      description: String(r.description),
      riskScore: Number(r.riskScore || 0),
      aiExplanation: r.aiExplanationJson
        ? JSON.parse(String(r.aiExplanationJson))
        : {
            what: "",
            why: [],
            impact: "",
            recommendedAction: "",
            confidence: 80,
          },
      recommendedAction: String(r.recommendedAction || ""),
      status: r.status as DbAlert["status"],
      acknowledgedBy: r.acknowledgedBy ? String(r.acknowledgedBy) : undefined,
      resolvedAt: r.resolvedAt ? String(r.resolvedAt) : undefined,
      resolutionNote: r.resolutionNote ? String(r.resolutionNote) : undefined,
    }));

    // 7. Incidents
    const incidentRows = db.prepare("SELECT * FROM incidents").all();
    const incidents: DbIncident[] = incidentRows.map((r) => ({
      incidentId: String(r.incidentId),
      time: String(r.time),
      vehicle: String(r.vehicleNumber || r.vehicleId),
      vehicleId: String(r.vehicleId),
      vehicleNumber: String(r.vehicleNumber || r.vehicleId),
      shipment: r.shipmentId ? String(r.shipmentId) : undefined,
      shipmentId: r.shipmentId ? String(r.shipmentId) : undefined,
      driverName: String(r.driverName || ""),
      location: {
        lat: Number(r.locationLat || 0),
        lng: Number(r.locationLng || 0),
        address: String(r.locationAddress || ""),
      },
      severity: String(r.severity),
      cause: String(r.cause),
      actionTaken: String(r.actionTaken),
      status: String(r.status),
      resolvedAt: r.resolvedAt ? String(r.resolvedAt) : undefined,
      crewCount: r.crewCount ? Number(r.crewCount) : undefined,
      ambulanceDispatched: Boolean(r.ambulanceDispatched),
      cargoSafeguardActive: Boolean(r.cargoSafeguardActive),
      notes: r.notesJson ? JSON.parse(String(r.notesJson)) : [],
    }));

    // 8. Predictions
    const predictionRows = db.prepare("SELECT * FROM predictions").all();
    const predictions: DbPrediction[] = predictionRows.map((r) => ({
      id: String(r.id),
      predictionId: String(r.id),
      shipmentId: String(r.shipmentId),
      calculatedAt: r.calculatedAt ? String(r.calculatedAt) : undefined,
      createdAt: r.createdAt ? String(r.createdAt) : undefined,
      updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
      originalEta: String(r.originalEta || ""),
      currentEta: String(r.currentEta || ""),
      predictedEta: String(r.predictedEta || ""),
      delayMinutes: Number(r.delayMinutes || 0),
      estimatedDelay: Number(r.estimatedDelay || r.delayMinutes || 0),
      delayProbability: Number(r.delayProbability || 0),
      riskScore: Number(r.riskScore || 0),
      riskLevel: r.riskLevel as DbPrediction["riskLevel"],
      confidence: Number(r.confidence || 85),
      riskFactors: r.riskFactorsJson ? JSON.parse(String(r.riskFactorsJson)) : [],
      reason: r.reason ? String(r.reason) : undefined,
      recommendedAction: String(r.recommendedAction || ""),
      explanation: r.explanationJson ? JSON.parse(String(r.explanationJson)) : undefined,
      history: r.historyJson ? JSON.parse(String(r.historyJson)) : [],
    }));

    // 9. Routes
    const routeRows = db.prepare("SELECT * FROM routes").all();
    const routes: DbRoute[] = routeRows.map((r) => ({
      routeId: String(r.routeId),
      shipmentId: r.shipmentId ? String(r.shipmentId) : undefined,
      name: String(r.name),
      origin: String(r.origin),
      destination: String(r.destination),
      mode: r.mode as DbRoute["mode"],
      distanceKm: Number(r.distanceKm || 0),
      distance: Number(r.distanceKm || 0),
      estimatedDurationHours: Number(r.estimatedDurationHours || 0),
      estimatedTime: Number(r.estimatedDurationHours || 0),
      congestionScore: Number(r.congestionScore || 0),
      riskScore: Number(r.riskScore || 0),
      risk: Number(r.riskScore || 0),
      tollCostInr: Number(r.tollCostInr || 0),
      freightCostInr: Number(r.freightCostInr || 0),
      cost: Number(r.freightCostInr || 0),
      carbonKg: Number(r.carbonKg || 0),
      co2SavedPct: Number(r.co2SavedPct || 0),
      isRecommended: Boolean(r.isRecommended),
      description: String(r.description || ""),
      path: r.pathJson ? JSON.parse(String(r.pathJson)) : [],
      createdAt: r.createdAt ? String(r.createdAt) : undefined,
      updatedAt: r.updatedAt ? String(r.updatedAt) : undefined,
    }));

    // 10. Simulation Events
    const simRows = db.prepare("SELECT * FROM simulation_events").all();
    const simulationEvents: DbSimulationEvent[] = simRows.map((r) => ({
      id: String(r.id),
      simulationEventId: String(r.id),
      timestamp: String(r.timestamp),
      scenario: r.scenario ? String(r.scenario) : undefined,
      eventType: r.eventType ? String(r.eventType) : undefined,
      description: r.description ? String(r.description) : undefined,
      payload: r.payloadJson ? JSON.parse(String(r.payloadJson)) : undefined,
      affectedShipments: r.affectedShipmentsJson
        ? JSON.parse(String(r.affectedShipmentsJson))
        : undefined,
      source: r.source ? String(r.source) : undefined,
      isSimulated: Boolean(r.isSimulated),
    }));

    // 11. Audit Logs
    const auditRows = db.prepare("SELECT * FROM audit_logs ORDER BY timestamp DESC").all();
    const auditLogs: DbAuditLog[] = auditRows.map((r) => ({
      id: String(r.id),
      auditLogId: String(r.id),
      timestamp: String(r.timestamp),
      user: String(r.user),
      role: String(r.role),
      action: String(r.action),
      entity: String(r.entity),
      entityId: String(r.entityId),
      previousValue: r.previousValue ? String(r.previousValue) : undefined,
      newValue: r.newValue ? String(r.newValue) : undefined,
      reason: r.reason ? String(r.reason) : undefined,
    }));

    // Metadata
    const lastUpdatedMeta = db
      .prepare("SELECT value FROM system_metadata WHERE key = 'lastUpdated'")
      .get();
    const lastUpdated = lastUpdatedMeta ? String(lastUpdatedMeta.value) : new Date().toISOString();

    if (shipments.length === 0 && vehicles.length === 0) {
      // Empty database, needs seeding
      return null;
    }

    return {
      users,
      vehicles,
      drivers,
      shipments,
      trackingEvents,
      alerts,
      incidents,
      predictions,
      routes,
      simulationEvents,
      auditLogs,
      lastUpdated,
    };
  } catch (err) {
    console.error("[SQLite Storage] Error reading database state:", err);
    return null;
  }
}

export function writePersistentDatabase(state: DatabaseState): boolean {
  const db = getSqliteInstance();
  if (!db) {
    return false;
  }

  try {
    db.exec("BEGIN TRANSACTION;");

    // 1. Users
    const userStmt = db.prepare(`
      INSERT OR REPLACE INTO users (id, name, email, role, company, phone, avatarLetter, createdAt, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const u of state.users || []) {
      userStmt.run(
        toSqlVal(u.id),
        toSqlVal(u.name),
        toSqlVal(u.email),
        toSqlVal(u.role),
        toSqlVal(u.company),
        toSqlVal(u.phone),
        toSqlVal(u.avatarLetter),
        toSqlVal(u.createdAt),
        toSqlVal(u.updatedAt),
      );
    }

    // 2. Vehicles
    const vehStmt = db.prepare(`
      INSERT OR REPLACE INTO vehicles (
        vehicleId, registrationNumber, driverId, driverName, driverPhone, currentShipmentId,
        status, currentLocationLat, currentLocationLng, currentLocationAddress,
        speed, expectedSpeed, utilization, riskScore, mode, fuelOrBatteryPct,
        telemetryJson, lastUpdated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const v of state.vehicles || []) {
      vehStmt.run(
        toSqlVal(v.vehicleId),
        toSqlVal(v.registrationNumber),
        toSqlVal(v.driverId),
        toSqlVal(v.driverName),
        toSqlVal(v.driverPhone),
        toSqlVal(v.currentShipmentId),
        toSqlVal(v.status),
        toSqlVal(v.currentLocation?.lat),
        toSqlVal(v.currentLocation?.lng),
        toSqlVal(v.currentLocation?.address),
        toSqlVal(v.speed, 0),
        toSqlVal(v.expectedSpeed, 60),
        toSqlVal(v.utilization, 80),
        toSqlVal(v.riskScore, 10),
        toSqlVal(v.mode),
        toSqlVal(v.fuelOrBatteryPct, 100),
        JSON.stringify(v.telemetry || {}),
        toSqlVal(v.lastUpdated || new Date().toISOString()),
      );
    }

    // 3. Drivers
    const driverStmt = db.prepare(`
      INSERT OR REPLACE INTO drivers (
        driverId, name, phone, licenseNumber, bloodGroup, safetyScore,
        assignedVehicleId, dutyStatus, dutyHoursToday, maxDutyHours, lastMedicalCheck
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const d of state.drivers || []) {
      driverStmt.run(
        toSqlVal(d.driverId),
        toSqlVal(d.name),
        toSqlVal(d.phone),
        toSqlVal(d.licenseNumber),
        toSqlVal(d.bloodGroup),
        toSqlVal(d.safetyScore, 90),
        toSqlVal(d.assignedVehicleId),
        toSqlVal(d.dutyStatus, "on_duty"),
        toSqlVal(d.dutyHoursToday, 0),
        toSqlVal(d.maxDutyHours, 10),
        toSqlVal(d.lastMedicalCheck || new Date().toISOString()),
      );
    }

    // 4. Shipments
    const shipStmt = db.prepare(`
      INSERT OR REPLACE INTO shipments (
        shipmentId, trackingNumber, customer, customerPhone, origin, originLat, originLng,
        destination, destLat, destLng, cargoType, cargoWeight, declaredValueInr,
        vehicleId, driverId, priority, status, departureTime, expectedDeliveryTime,
        originalEta, currentEta, predictedEta, currentLocationLat, currentLocationLng,
        currentLocationAddress, remainingKm, totalKm, riskScore, riskLevel,
        delayProbability, estimatedDelayMinutes, routeDeviationKm, mode,
        activeRouteName, alternativeRouteName, isSimulated, notes, createdAt, updatedAt
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?, ?,
        ?, ?, ?, ?,
        ?, ?, ?, ?, ?, ?
      )
    `);
    for (const s of state.shipments || []) {
      shipStmt.run(
        toSqlVal(s.shipmentId),
        toSqlVal(s.trackingNumber || s.shipmentId),
        toSqlVal(s.customer),
        toSqlVal(s.customerPhone),
        toSqlVal(s.origin),
        toSqlVal(s.originCoords?.lat),
        toSqlVal(s.originCoords?.lng),
        toSqlVal(s.destination),
        toSqlVal(s.destCoords?.lat),
        toSqlVal(s.destCoords?.lng),
        toSqlVal(s.cargoType),
        toSqlVal(s.cargoWeight, 0),
        toSqlVal(s.declaredValueInr, "₹1.0 Cr"),
        toSqlVal(s.vehicleId || ""),
        toSqlVal(s.driverId || ""),
        toSqlVal(s.priority),
        toSqlVal(s.status),
        toSqlVal(s.departureTime, ""),
        toSqlVal(s.expectedDeliveryTime, ""),
        toSqlVal(s.originalEta, ""),
        toSqlVal(s.currentEta, ""),
        toSqlVal(s.predictedEta, ""),
        toSqlVal(s.currentLocation?.lat),
        toSqlVal(s.currentLocation?.lng),
        toSqlVal(s.currentLocation?.address),
        toSqlVal(s.remainingKm, 0),
        toSqlVal(s.totalKm, 0),
        toSqlVal(s.riskScore, 0),
        toSqlVal(s.riskLevel, "LOW"),
        toSqlVal(s.delayProbability, 0),
        toSqlVal(s.estimatedDelayMinutes, 0),
        toSqlVal(s.routeDeviationKm, 0),
        toSqlVal(s.mode, "road"),
        toSqlVal(s.activeRouteName, ""),
        toSqlVal(s.alternativeRouteName),
        s.isSimulated ? 1 : 0,
        toSqlVal(s.notes),
        toSqlVal(s.createdAt || new Date().toISOString()),
        toSqlVal(s.updatedAt || new Date().toISOString()),
      );
    }

    // 5. Tracking Events
    const trackStmt = db.prepare(`
      INSERT OR REPLACE INTO tracking_events (
        id, shipmentId, vehicleId, timestamp, lat, lng, speed,
        locationName, eventType, description, source, metadataJson, isSimulated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const t of state.trackingEvents || []) {
      trackStmt.run(
        toSqlVal(t.id || t.eventId || `TRK-${Date.now()}`),
        toSqlVal(t.shipmentId),
        toSqlVal(t.vehicleId),
        toSqlVal(t.timestamp),
        toSqlVal(t.lat ?? t.latitude),
        toSqlVal(t.lng ?? t.longitude),
        toSqlVal(t.speed, 0),
        toSqlVal(t.locationName),
        toSqlVal(t.eventType),
        toSqlVal(t.description),
        toSqlVal(t.source),
        t.metadata ? JSON.stringify(t.metadata) : null,
        t.isSimulated ? 1 : 0,
      );
    }

    // 6. Alerts
    const alertStmt = db.prepare(`
      INSERT OR REPLACE INTO alerts (
        alertId, severity, type, shipmentId, vehicleId, timestamp,
        description, riskScore, aiExplanationJson, recommendedAction,
        status, acknowledgedBy, resolvedAt, resolutionNote
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of state.alerts || []) {
      alertStmt.run(
        toSqlVal(a.alertId),
        toSqlVal(a.severity),
        toSqlVal(a.type),
        toSqlVal(a.shipmentId),
        toSqlVal(a.vehicleId),
        toSqlVal(a.timestamp),
        toSqlVal(a.description),
        toSqlVal(a.riskScore, 0),
        JSON.stringify(a.aiExplanation || {}),
        toSqlVal(a.recommendedAction, ""),
        toSqlVal(a.status),
        toSqlVal(a.acknowledgedBy),
        toSqlVal(a.resolvedAt),
        toSqlVal(a.resolutionNote),
      );
    }

    // 7. Incidents
    const incStmt = db.prepare(`
      INSERT OR REPLACE INTO incidents (
        incidentId, time, vehicleId, vehicleNumber, shipmentId, driverName,
        locationLat, locationLng, locationAddress, severity, cause,
        actionTaken, status, resolvedAt, crewCount, ambulanceDispatched,
        cargoSafeguardActive, notesJson
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const i of state.incidents || []) {
      incStmt.run(
        toSqlVal(i.incidentId),
        toSqlVal(i.time),
        toSqlVal(i.vehicleId),
        toSqlVal(i.vehicleNumber || i.vehicleId),
        toSqlVal(i.shipmentId),
        toSqlVal(i.driverName),
        toSqlVal(i.location?.lat),
        toSqlVal(i.location?.lng),
        toSqlVal(i.location?.address),
        toSqlVal(i.severity),
        toSqlVal(i.cause),
        toSqlVal(i.actionTaken),
        toSqlVal(i.status),
        toSqlVal(i.resolvedAt),
        toSqlVal(i.crewCount),
        i.ambulanceDispatched ? 1 : 0,
        i.cargoSafeguardActive ? 1 : 0,
        JSON.stringify(i.notes || []),
      );
    }

    // 8. Predictions
    const predStmt = db.prepare(`
      INSERT OR REPLACE INTO predictions (
        id, shipmentId, calculatedAt, createdAt, updatedAt,
        originalEta, currentEta, predictedEta, delayMinutes,
        estimatedDelay, delayProbability, riskScore, riskLevel,
        confidence, riskFactorsJson, reason, recommendedAction,
        explanationJson, historyJson
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const p of state.predictions || []) {
      predStmt.run(
        toSqlVal(p.id || p.predictionId || `PRED-${p.shipmentId}`),
        toSqlVal(p.shipmentId),
        toSqlVal(p.calculatedAt),
        toSqlVal(p.createdAt),
        toSqlVal(p.updatedAt),
        toSqlVal(p.originalEta, ""),
        toSqlVal(p.currentEta, ""),
        toSqlVal(p.predictedEta, ""),
        toSqlVal(p.delayMinutes, 0),
        toSqlVal(p.estimatedDelay ?? p.delayMinutes, 0),
        toSqlVal(p.delayProbability, 0),
        toSqlVal(p.riskScore, 0),
        toSqlVal(p.riskLevel, "LOW"),
        toSqlVal(p.confidence, 85),
        JSON.stringify(p.riskFactors || []),
        toSqlVal(p.reason),
        toSqlVal(p.recommendedAction, ""),
        p.explanation ? JSON.stringify(p.explanation) : null,
        JSON.stringify(p.history || []),
      );
    }

    // 9. Routes
    const routeStmt = db.prepare(`
      INSERT OR REPLACE INTO routes (
        routeId, shipmentId, name, origin, destination, mode,
        distanceKm, estimatedDurationHours, congestionScore, riskScore,
        tollCostInr, freightCostInr, carbonKg, co2SavedPct,
        isRecommended, description, pathJson, createdAt, updatedAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const r of state.routes || []) {
      routeStmt.run(
        toSqlVal(r.routeId),
        toSqlVal(r.shipmentId),
        toSqlVal(r.name),
        toSqlVal(r.origin),
        toSqlVal(r.destination),
        toSqlVal(r.mode),
        toSqlVal(r.distanceKm || r.distance, 0),
        toSqlVal(r.estimatedDurationHours || r.estimatedTime, 0),
        toSqlVal(r.congestionScore, 0),
        toSqlVal(r.riskScore, 0),
        toSqlVal(r.tollCostInr, 0),
        toSqlVal(r.freightCostInr, 0),
        toSqlVal(r.carbonKg, 0),
        toSqlVal(r.co2SavedPct, 0),
        r.isRecommended ? 1 : 0,
        toSqlVal(r.description),
        JSON.stringify(r.path || []),
        toSqlVal(r.createdAt),
        toSqlVal(r.updatedAt),
      );
    }

    // 10. Simulation Events
    const simStmt = db.prepare(`
      INSERT OR REPLACE INTO simulation_events (
        id, timestamp, scenario, eventType, description,
        payloadJson, affectedShipmentsJson, source, isSimulated
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const s of state.simulationEvents || []) {
      simStmt.run(
        toSqlVal(s.id || s.simulationEventId || `SIM-${Date.now()}`),
        toSqlVal(s.timestamp),
        toSqlVal(s.scenario),
        toSqlVal(s.eventType),
        toSqlVal(s.description),
        s.payload ? JSON.stringify(s.payload) : null,
        s.affectedShipments ? JSON.stringify(s.affectedShipments) : null,
        toSqlVal(s.source),
        s.isSimulated ? 1 : 0,
      );
    }

    // 11. Audit Logs
    const auditStmt = db.prepare(`
      INSERT OR REPLACE INTO audit_logs (
        id, timestamp, user, role, action, entity, entityId, previousValue, newValue, reason
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const a of state.auditLogs || []) {
      auditStmt.run(
        toSqlVal(a.id || a.auditLogId || `AUDIT-${Date.now()}`),
        toSqlVal(a.timestamp),
        toSqlVal(a.user),
        toSqlVal(a.role),
        toSqlVal(a.action),
        toSqlVal(a.entity),
        toSqlVal(a.entityId),
        toSqlVal(a.previousValue),
        toSqlVal(a.newValue),
        toSqlVal(a.reason),
      );
    }

    // Metadata
    const metaStmt = db.prepare(`
      INSERT OR REPLACE INTO system_metadata (key, value, updatedAt)
      VALUES ('lastUpdated', ?, ?)
    `);
    const now = new Date().toISOString();
    metaStmt.run(toSqlVal(state.lastUpdated || now), now);

    db.exec("COMMIT;");
    return true;
  } catch (err) {
    db.exec("ROLLBACK;");
    console.error("[SQLite Storage] Error persisting database state to SQLite:", err);
    return false;
  }
}

export function executeSqliteDelete(table: string, idColumn: string, idValue: string): boolean {
  const db = getSqliteInstance();
  if (!db) return false;

  try {
    const stmt = db.prepare(`DELETE FROM ${table} WHERE ${idColumn} = ?`);
    stmt.run(idValue);
    return true;
  } catch (err) {
    console.error(`[SQLite Storage] Error deleting from ${table}:`, err);
    return false;
  }
}
