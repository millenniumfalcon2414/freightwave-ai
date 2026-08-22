cat src/components/rail/RailLogisticsSection.tsx | awk '
BEGIN { in_memo = 0; }
/const rakes = useMemo<TrainRakeTelemetry\[\]>\(\(\) => \{/ { in_memo = 1; print; next; }
in_memo == 1 {
    if (/^\s*\}\, \[dbVehicles\]\);/) {
        in_memo = 0;
        print;
        next;
    }
    if (/return dbVehicles/) {
        print "    return dbVehicles";
        print "      .filter((v) => v.mode === \"rail\")";
        print "      .map((v, index) => {";
        print "        const mockRake =";
        print "          MOCK_TRAIN_RAKES.find(";
        print "            (m) => m.locomotiveNumber === v.registrationNumber || m.rakeId === v.vehicleId,";
        print "          ) || MOCK_TRAIN_RAKES[index % MOCK_TRAIN_RAKES.length];";
        print "        return {";
        print "          ...mockRake,";
        print "          rakeId: v.vehicleId,";
        print "          locomotiveNumber: v.registrationNumber,";
        print "          currentLat: v.currentLocation?.lat || mockRake.currentLat,";
        print "          currentLng: v.currentLocation?.lng || mockRake.currentLng,";
        print "          currentLocationName: v.currentLocation?.address || mockRake.currentLocationName,";
        print "          speedKmh: v.speed || mockRake.speedKmh,";
        print "          status: v.status === \"in_transit\" ? \"RUNNING_ON_TIME\" : v.status === \"idle\" ? \"STATION_HALT\" : v.status === \"emergency\" ? \"DELAYED\" : \"STATION_HALT\",";
        print "        };";
        print "      });";
        next;
    }
    next;
}
!in_memo { print; }
' > src/components/rail/RailLogisticsSection2.tsx
mv src/components/rail/RailLogisticsSection2.tsx src/components/rail/RailLogisticsSection.tsx
