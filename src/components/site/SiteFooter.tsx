export function SiteFooter() {
  return (
    <footer className="border-t border-border/60 bg-background/60">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <div className="text-base font-semibold tracking-tight">
            RailFlow<span className="text-primary">.AI</span>
          </div>
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            Intelligent rail–road freight optimization platform for India's logistics backbone.
          </p>
        </div>
        {[
          { h: "Platform", l: ["Optimization", "Digital Twin", "Consolidation", "Sustainability"] },
          { h: "Operations", l: ["Dashboard", "Emergency", "Alerts", "Hardware"] },
          { h: "Company", l: ["About", "Customers", "Careers", "Contact"] },
        ].map((c) => (
          <div key={c.h}>
            <div className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              {c.h}
            </div>
            <ul className="mt-4 space-y-2 text-sm">
              {c.l.map((x) => (
                <li key={x}>
                  <a className="text-foreground/80 hover:text-foreground" href="#">
                    {x}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-border/60">
        <div className="mx-auto flex max-w-[1400px] flex-col items-center justify-between gap-2 px-6 py-5 font-mono text-[10px] uppercase tracking-widest text-muted-foreground md:flex-row">
          <span>© 2026 RailFlow Logistics Intelligence Pvt. Ltd.</span>
          <span>Mumbai · Delhi · Bengaluru · Chennai</span>
        </div>
      </div>
    </footer>
  );
}
