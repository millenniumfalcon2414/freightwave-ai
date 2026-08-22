const fs = require("fs");
let code = fs.readFileSync("src/routes/dashboard.tsx", "utf-8");
code = code.replace(
  "const newShipment = db.createShipment({",
  `
    const { useServerFn } = await import('@tanstack/react-start');
    // We cannot use hooks in an event handler, so we should move useServerFn to the component body.
  `,
);
fs.writeFileSync("src/routes/dashboard.tsx", code);
