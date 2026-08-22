#!/bin/bash
sed -i 's/: any/: unknown/g' src/lib/api/realtime.functions.ts
sed -i 's/: any/: unknown/g' src/lib/db/serverStorage.ts
sed -i 's/: any/: unknown/g' src/lib/realtime/serverEventBus.ts
sed -i 's/: any/: unknown/g' src/routes/dashboard.tsx
