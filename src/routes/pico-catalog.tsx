import { createFileRoute } from "@tanstack/react-router";
import { PICO_BITE_REGISTRY } from "@/components/pico-bites/registry";

export const Route = createFileRoute("/pico-catalog")({
  head: () => ({
    meta: [
      { title: "Pico-Bite Catalog — IDIA Pay Terminal OS" },
      {
        name: "description",
        content:
          "Every registered IDIA Pay Pico-Bite terminal control, grouped by namespace, rendered live from the registry.",
      },
      { property: "og:title", content: "Pico-Bite Catalog — IDIA Pay Terminal OS" },
      {
        property: "og:description",
        content:
          "Every registered IDIA Pay Pico-Bite terminal control, grouped by namespace, rendered live from the registry.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: PicoCatalogPage,
});

const NAMESPACE_ORDER = [
  "input",
  "output",
  "ui",
  "compliance",
  "loyalty",
  "pay",
  "ops",
  "crm",
  "sched",
  "fleet",
  "health",
  "telemetry",
  "logic",
];

function PicoCatalogPage() {
  const handleTelemetry = (tag: string, payload: unknown) => {
    console.log(`[TELEMETRY BUS] ${tag}`, payload);
  };

  const grouped = new Map<string, string[]>();
  for (const tag of Object.keys(PICO_BITE_REGISTRY)) {
    const ns = tag.split(".")[1] ?? "other";
    if (!grouped.has(ns)) grouped.set(ns, []);
    grouped.get(ns)!.push(tag);
  }
  const namespaces = [
    ...NAMESPACE_ORDER.filter((n) => grouped.has(n)),
    ...[...grouped.keys()].filter((n) => !NAMESPACE_ORDER.includes(n)),
  ];

  return (
    <div className="min-h-screen overflow-y-auto bg-black p-6 text-slate-200">
      <header className="border-b border-slate-800 pb-4 mb-8">
        <h1 className="text-2xl font-bold text-white tracking-tight">
          IDIA OS: Pico-Bite Catalog
        </h1>
        <p className="text-slate-500 mt-1 font-mono text-xs">
          {Object.keys(PICO_BITE_REGISTRY).length} tags · one independent component each ·
          zero mock data (bites render sterile without blueprint config)
        </p>
      </header>

      <div className="space-y-10 max-w-7xl mx-auto">
        {namespaces.map((ns) => (
          <section key={ns}>
            <h2 className="text-sm font-bold mb-3 uppercase tracking-widest text-slate-500 border-b border-slate-800 pb-2">
              pico.{ns}.* — {grouped.get(ns)!.length}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {grouped.get(ns)!.map((tag) => {
                const entry = PICO_BITE_REGISTRY[tag];
                const Bite = entry.component;
                return (
                  <div key={tag} className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 truncate">{tag}</span>
                      {entry.gate === "shift-lock" && (
                        <span className="text-[9px] font-bold uppercase tracking-widest text-amber-500">
                          shift-lock
                        </span>
                      )}
                    </div>
                    <div className="min-h-[8rem] flex">
                      <Bite telemetryTag={tag} onAction={handleTelemetry} />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
