const fs = require("fs");
let code = fs.readFileSync("src/routes/dashboard.tsx", "utf-8");

// The line is: notes: `Booked by ${user?.name || "Operations Manager"}. Direct electric rake allocation.`,
// And then: });
// Let's replace the whole string up to });

code = code.replace(
  /notes: `Booked by \$\{user\?.name \|\| "Operations Manager"\}\. Direct electric rake allocation\.`,\n\s*\}\);/g,
  'notes: `Booked by ${user?.name || "Operations Manager"}. Direct electric rake allocation.`\n                } });',
);

fs.writeFileSync("src/routes/dashboard.tsx", code);
