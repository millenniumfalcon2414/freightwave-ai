const fs = require("fs");
let code = fs.readFileSync("src/routes/cargo-portal.tsx", "utf-8");

code = code.replace("setShipments((prev) =>", "/* setShipments((prev) =>");
code = code.replace("        }),\n      );", "        }),\n      ); */");

fs.writeFileSync("src/routes/cargo-portal.tsx", code);
