const fs = require("fs");
let code = fs.readFileSync("src/lib/simulation/engine.ts", "utf-8");

if (!code.includes("import { triggerSimulatedEventFn }")) {
  code = code.replace(
    'import { liveEventBus } from "../realtime/liveEventBus";',
    'import { triggerSimulatedEventFn } from "../api/realtime.functions";',
  );
  code = code.replace("liveEventBus.publish({", "triggerSimulatedEventFn({ data: {");
  code = code.replace("        },\n      });", "        },\n      }});");
  fs.writeFileSync("src/lib/simulation/engine.ts", code);
  console.log("Engine patched");
}
