const fs = require("fs");
let code = fs.readFileSync("src/lib/api/alert.functions.ts", "utf-8");

if (!code.includes("import { publishServerEvent }")) {
  code = code.replace(
    'import { db } from "../db/database";',
    'import { db } from "../db/database";\nimport { publishServerEvent } from "../realtime/serverEventBus";',
  );
}

code = code.replace(
  "const alert = db.createAlert(data);",
  `const alert = db.createAlert(data);
      publishServerEvent({ type: "FLEET_HEALTH_ALERT", payload: alert });`,
);

fs.writeFileSync("src/lib/api/alert.functions.ts", code);
console.log("Alert patched");
