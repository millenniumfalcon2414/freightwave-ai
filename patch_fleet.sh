cat src/components/fleet/FleetHealthDashboard.tsx | awk '
BEGIN { in_memo = 0; }
/const profiles = useMemo<VehicleHealthProfile\[\]>\(\(\) => \{/ { in_memo = 1; print; next; }
in_memo == 1 {
    if (/^\s*\}\, \[dbVehicles\]\);/) {
        in_memo = 0;
        print;
        next;
    }
    if (/return dbVehicles.map/) {
        print "    return dbVehicles.map((v, index) => {";
        print "      const mockProfile =";
        print "        MOCK_FLEET_HEALTH_PROFILES.find(";
        print "          (m) => m.assetNumber === v.registrationNumber || m.assetId === v.vehicleId,";
        print "        ) || MOCK_FLEET_HEALTH_PROFILES[index % MOCK_FLEET_HEALTH_PROFILES.length];";
        print "      return {";
        print "        ...mockProfile,";
        print "        assetId: v.vehicleId,";
        print "        assetNumber: v.registrationNumber,";
        print "        assetType: v.mode === \"rail\" ? \"ELECTRIC_LOCOMOTIVE\" : \"TRUCK_PRIME_MOVER\",";
        print "        makeModel: mockProfile ? mockProfile.makeModel : (v.mode === \"rail\" ? \"WAG-12 Heavy Freight\" : \"Heavy Haul Truck\"),";
        print "        overallHealthScore: Math.round(100 - (v.riskScore || 5)),";
        print "        isGroundedForRepair: v.status === \"maintenance\",";
        print "      };";
        print "    });";
        next;
    }
    next;
}
!in_memo { print; }
' > src/components/fleet/FleetHealthDashboard2.tsx
mv src/components/fleet/FleetHealthDashboard2.tsx src/components/fleet/FleetHealthDashboard.tsx
