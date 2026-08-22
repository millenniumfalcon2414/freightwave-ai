#!/bin/bash
sed -i 's/as any/as unknown/g' src/lib/api/realtime.functions.ts
sed -i 's/as any/as unknown/g' src/lib/db/serverStorage.ts
sed -i 's/as any/as unknown/g' src/lib/realtime/serverEventBus.ts
sed -i 's/as any/as unknown/g' src/routes/dashboard.tsx
