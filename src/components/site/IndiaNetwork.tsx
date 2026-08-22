/**
 * Stylized India logistics network. SVG, animated freight flow.
 */
export function IndiaNetwork() {
  const nodes = [
    { id: "DEL", name: "Delhi/Dadri", x: 320, y: 165, kind: "hub" },
    { id: "MUM", name: "Mumbai/JNPT", x: 215, y: 360, kind: "port" },
    { id: "AHM", name: "Ahmedabad", x: 225, y: 270, kind: "hub" },
    { id: "NAG", name: "Nagpur", x: 360, y: 360, kind: "hub" },
    { id: "KOL", name: "Kolkata", x: 540, y: 295, kind: "port" },
    { id: "HYD", name: "Hyderabad", x: 360, y: 440, kind: "hub" },
    { id: "BLR", name: "Bengaluru", x: 330, y: 520, kind: "hub" },
    { id: "CHE", name: "Chennai", x: 395, y: 530, kind: "port" },
    { id: "MND", name: "Mundra", x: 150, y: 270, kind: "port" },
    { id: "LDH", name: "Ludhiana", x: 285, y: 110, kind: "hub" },
    { id: "VSK", name: "Visakhapatnam", x: 460, y: 440, kind: "port" },
  ];
  const n = Object.fromEntries(nodes.map((x) => [x.id, x]));
  const routes: Array<[string, string, "rail" | "road"]> = [
    ["DEL", "MUM", "rail"],
    ["DEL", "KOL", "rail"],
    ["LDH", "DEL", "rail"],
    ["MUM", "BLR", "rail"],
    ["AHM", "DEL", "rail"],
    ["AHM", "MND", "rail"],
    ["NAG", "DEL", "rail"],
    ["NAG", "HYD", "road"],
    ["HYD", "BLR", "road"],
    ["BLR", "CHE", "rail"],
    ["KOL", "VSK", "rail"],
    ["VSK", "CHE", "road"],
    ["MUM", "AHM", "road"],
  ];

  return (
    <div className="relative h-full w-full overflow-hidden rounded-xl border border-border bg-surface-2/60">
      <div className="absolute inset-0 grid-bg opacity-40" />

      <svg viewBox="0 0 640 620" className="absolute inset-0 h-full w-full">
        <defs>
          <linearGradient id="rail" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.52 0.2 255)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="oklch(0.52 0.2 255)" stopOpacity="0.95" />
            <stop offset="100%" stopColor="oklch(0.52 0.2 255)" stopOpacity="0.3" />
          </linearGradient>
          <linearGradient id="road" x1="0" x2="1">
            <stop offset="0%" stopColor="oklch(0.55 0.15 190)" stopOpacity="0.25" />
            <stop offset="50%" stopColor="oklch(0.55 0.15 190)" stopOpacity="0.9" />
            <stop offset="100%" stopColor="oklch(0.55 0.15 190)" stopOpacity="0.25" />
          </linearGradient>
          <radialGradient id="nodeGlow">
            <stop offset="0%" stopColor="oklch(0.52 0.2 255)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="oklch(0.52 0.2 255)" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Stylised India silhouette */}
        <path
          d="M170 110 Q260 60 360 95 Q470 120 520 170 Q580 220 560 290 Q545 360 510 410 Q470 480 420 530 Q380 580 330 580 Q280 575 240 530 Q190 470 165 400 Q140 320 145 240 Q150 170 170 110 Z"
          fill="oklch(0.93 0.01 240 / 0.7)"
          stroke="oklch(0.82 0.02 240)"
          strokeWidth="1.5"
        />

        {/* Routes */}
        {routes.map(([a, b, kind], i) => {
          const A = n[a];
          const B = n[b];
          const mx = (A.x + B.x) / 2 + (kind === "road" ? -20 : 20);
          const my = (A.y + B.y) / 2 - 25;
          const d = `M${A.x},${A.y} Q${mx},${my} ${B.x},${B.y}`;
          return (
            <g key={i}>
              <path d={d} fill="none" stroke={`url(#${kind})`} strokeWidth="2.5" />
              <path
                d={d}
                fill="none"
                stroke={kind === "rail" ? "oklch(0.52 0.2 255)" : "oklch(0.55 0.15 190)"}
                strokeWidth="1.5"
                opacity="0.9"
                className="animate-dash"
              />
            </g>
          );
        })}

        {/* Nodes */}
        {nodes.map((node) => (
          <g key={node.id}>
            <circle cx={node.x} cy={node.y} r="18" fill="url(#nodeGlow)" />
            <circle
              cx={node.x}
              cy={node.y}
              r="4.5"
              fill={node.kind === "port" ? "oklch(0.55 0.15 190)" : "oklch(0.52 0.2 255)"}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="7"
              fill="none"
              stroke={node.kind === "port" ? "oklch(0.55 0.15 190)" : "oklch(0.52 0.2 255)"}
              strokeOpacity="0.4"
              className="animate-pulse-soft"
            />
            <text
              x={node.x + 10}
              y={node.y - 8}
              fill="oklch(0.2 0.025 250)"
              fontSize="10"
              fontWeight="600"
              fontFamily="JetBrains Mono"
              className="uppercase tracking-wider"
            >
              {node.name}
            </text>
          </g>
        ))}
      </svg>

      {/* Floating telemetry chip */}
      <div className="absolute right-4 top-4 rounded-xl border border-border/80 bg-surface/95 p-3.5 shadow-sm font-mono text-[10px] uppercase tracking-widest backdrop-blur-xs">
        <div className="mb-2 flex items-center gap-2 text-primary font-bold">
          <span className="size-2 rounded-full bg-primary animate-pulse-soft" />
          Live DFC Network
        </div>
        <div className="space-y-1.5 text-muted-foreground font-medium">
          <div className="flex justify-between gap-6">
            <span>Active Rakes</span>
            <span className="text-foreground font-bold">1,248</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Drayage Trucks</span>
            <span className="text-foreground font-bold">19,540</span>
          </div>
          <div className="flex justify-between gap-6">
            <span>Freight Corridors</span>
            <span className="text-foreground font-bold">12</span>
          </div>
        </div>
      </div>

      {/* AI recommendation chip */}
      <div className="absolute bottom-4 left-4 max-w-[280px] rounded-xl border border-border/80 bg-surface/95 p-3.5 shadow-sm backdrop-blur-xs">
        <div className="mb-1 font-mono text-[9px] uppercase tracking-widest text-accent font-bold">
          AI Smart Route
        </div>
        <div className="text-xs sm:text-sm font-bold text-foreground">
          Rail + Drayage · Delhi ➔ JNPT
        </div>
        <div className="font-mono text-[10px] text-muted-foreground mt-0.5 font-medium">
          Confidence 94% · ₹2.8L saved · −38% CO₂
        </div>
      </div>
    </div>
  );
}
