import { serverEventBus } from "./src/lib/realtime/serverEventBus";
import { updateVehicleLocationFn } from "./src/lib/api/vehicle.functions";
import { db } from "./src/lib/db/database";
import { createAlertFn } from "./src/lib/api/alert.functions";
import { updateShipmentFn } from "./src/lib/api/shipment.functions";
import { triggerSimulatedEventFn } from "./src/lib/api/realtime.functions";

async function test() {
  const events = [];
  serverEventBus.on("event", (e) => events.push(e));

  console.log("TEST 1 & 2: Update Vehicle Location (GPS event)");
  await updateVehicleLocationFn({
    data: { vehicleId: "VH-TRK-101", lat: 10, lng: 10, address: "Test", speed: 50 },
  });

  console.log("TEST 3: Create Alert");
  await createAlertFn({
    data: {
      type: "geofence_breach",
      severity: "high",
      message: "Test Alert",
      entityId: "VH-TRK-101",
    },
  });

  console.log("TEST 4: Update Shipment");
  await updateShipmentFn({ data: { shipmentId: "SHP-001", status: "DELAYED" } });

  console.log("TEST: Simulated Event");
  await triggerSimulatedEventFn({ data: { type: "SIMULATION_TICK", payload: { test: true } } });

  console.log(
    "Events received:",
    events.map((e) => e.type),
  );
  if (events.length === 4) {
    console.log("ALL TESTS PASSED.");
  } else {
    console.log("TESTS FAILED.");
  }
}
test();
