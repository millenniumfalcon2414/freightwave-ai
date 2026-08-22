export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="text-base font-semibold tracking-tight">
            FreightWave<span className="text-primary">.AI</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Intelligent rail–road multimodal freight optimization platform for India's logistics
            backbone.
          </p>
        </div>
        {[
          {
            h: "Platform",
            l: [
              { name: "Route Optimizer", href: "/dashboard" },
              { name: "Cargo Distribution", href: "/dashboard" },
              { name: "Enterprise Sign Up", href: "/signup" },
              { name: "Sustainability & ESG", href: "/#features" },
            ],
          },
          {
            h: "Operations",
            l: [
              { name: "Command Hub", href: "/dashboard" },
              { name: "Cargo Tracking Portal", href: "/cargo-portal" },
              { name: "Emergency Dispatch", href: "/dashboard" },
              { name: "RDSO G-95 Audit", href: "/dashboard" },
            ],
          },
          {
            h: "Company",
            l: [
              { name: "About FreightWave", href: "/" },
              { name: "Dedicated Corridors", href: "/#network" },
              { name: "Enterprise Pricing", href: "/signup" },
              { name: "Contact & 24/7 Desk", href: "/cargo-portal" },
            ],
          },
        ].map((c) => (
          <div key={c.h}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {c.h}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {c.l.map((x) => (
                <li key={x.name}>
                  <a className="text-foreground/80 hover:text-foreground" href={x.href}>
                    {x.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:flex-row">
          <span>© 2026 FreightWave Logistics Intelligence Pvt. Ltd.</span>
          <span>Mumbai · Delhi · Bengaluru · Chennai · Kolkata</span>
        </div>
      </div>
    </footer>
  );
}
