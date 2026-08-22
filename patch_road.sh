cat src/components/road/RoadTrackingDashboard.tsx | awk '
BEGIN { in_memo = 0; }
/const vehicles = useMemo<LiveVehicleTelemetry\[\]>\(\(\) => \{/ { in_memo = 1; print; next; }
in_memo == 1 {
    if (/^\s*\}\, \[dbVehicles\]\);/) {
        in_memo = 0;
        print;
        next;
    }
    if (/return dbVehicles/) {
        print "    return dbVehicles";
        print "      .map((v, index) => {";
        print "        const mockVehicle =";
        print "          MOCK_LIVE_ROAD_FLEET.find(";
        print "            (m) => m.vehicleNumber === v.registrationNumber || m.id === v.vehicleId,";
        print "          ) || MOCK_LIVE_ROAD_FLEET[index % MOCK_LIVE_ROAD_FLEET.length];";
        print "        return {";
        print "          ...mockVehicle,";
        print "          id: v.vehicleId,";
        print "          vehicleNumber: v.registrationNumber,";
        print "          driverName: v.driverName || mockVehicle.driverName,";
        print "          currentLat: v.currentLocation?.lat || mockVehicle.currentLat,";
        print "          currentLng: v.currentLocation?.lng || mockVehicle.currentLng,";
        print "          currentLocationName: v.currentLocation?.address || mockVehicle.currentLocationName,";
        print "          speedKmh: v.speed || mockVehicle.speedKmh,";
        print "          status: v.status === \"in_transit\" ? \"CRUISING\" : v.status === \"idle\" ? \"REST_STOP\" : v.status === \"emergency\" ? \"DELAYED_TRAFFIC\" : \"REST_STOP\",";
        print "        };";
        print "      });";
        next;
    }
    next;
}
!in_memo { print; }
' > src/components/road/RoadTrackingDashboard2.tsx
mv src/components/road/RoadTrackingDashboard2.tsx src/components/road/RoadTrackingDashboard.tsx
