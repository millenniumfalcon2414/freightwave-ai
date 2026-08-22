cat src/routes/cargo-portal.tsx | awk '
BEGIN { in_memo = 0; }
/const shipments = useMemo<CargoShipment\[\]>\(\(\) => \{/ { in_memo = 1; print; next; }
in_memo == 1 {
    if (/^\s*\}\, \[dbShipments\]\);/) {
        in_memo = 0;
        print;
        next;
    }
    if (/return dbShipments.map/) {
        print "    return dbShipments.map((db, index) => {";
        print "      return {";
        print "        id: db.shipmentId,";
        print "        consignmentNumber: db.trackingNumber,";
        print "        title: db.cargoType,";
        print "        customerName: db.customer,";
        print "        transportMode: db.mode ? db.mode.toUpperCase() : \"ROAD\",";
        print "        currentLocationName: db.currentLocation?.address || \"Unknown Location\",";
        print "        status: db.status === \"DELIVERED\" ? \"DELIVERED\" : db.status === \"AT_DESTINATION\" ? \"ARRIVED_AT_DESTINATION\" : db.status === \"DELAYED\" ? \"DELAYED_IN_TRANSIT\" : \"IN_TRANSIT\",";
        print "        statusLabel: db.status === \"DELIVERED\" ? \"Delivered safely\" : db.status === \"AT_DESTINATION\" ? \"At Destination ICD\" : db.status === \"DELAYED\" ? \"Delayed in Transit\" : \"In Transit\",";
        print "        currentStageIndex: db.status === \"DELIVERED\" ? 6 : db.status === \"AT_DESTINATION\" ? 5 : db.status === \"DELAYED\" ? 2 : 3,";
        print "        weightTons: db.cargoWeight,";
        print "        origin: { name: db.origin, hub: db.origin, city: db.origin, state: \"\", lat: db.originCoords?.lat || 0, lng: db.originCoords?.lng || 0 },";
        print "        destination: { name: db.destination, hub: db.destination, city: db.destination, state: \"\", lat: db.destCoords?.lat || 0, lng: db.destCoords?.lng || 0 },";
        print "        currentGps: { lat: db.currentLocation?.lat || 0, lng: db.currentLocation?.lng || 0, heading: 0 },";
        print "        currentSpeedKmh: 45,";
        print "        estimatedArrival: db.predictedEta || db.currentEta || db.expectedDeliveryTime,";
        print "        lastUpdatedMinutesAgo: 0,";
        print "        condition: { temperature: 22, humidity: 45, shockEvents: 0, status: \"NOMINAL\", lastSyncTime: \"Just now\" },";
        print "        documents: [],";
        print "        stages: []";
        print "      };";
        print "    });";
        next;
    }
    next;
}
!in_memo { print; }
' > src/routes/cargo-portal2.tsx
