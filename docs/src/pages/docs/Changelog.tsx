import { DocsLayout } from "@/components/docs/DocsLayout";
import { CheckCircle2 } from "lucide-react";

const changelogEntries: { period: string; items: string[] }[] = [
  {
    period: "March 2026",
    items: [
      "Documentation expanded with product-first onboarding and architecture flow",
      "Detailed Warung commerce API docs (contracts, validation, integration checklist)",
      "AI UI guide expanded with runtime flow, folder map, and production checklist",
    ],
  },
];

const completed = [
  "Monorepo layout: `ai-agent/`, `api/`, `docs/`, optional `landing/`",
  "Warung conversational commerce under `ai-agent/src/lib/warung/`",
  "Express commerce router scaffold in `api/routes/warungCommerce.js`",
  "Unified navigation for onboarding -> implementation -> operations",
];

export default function Changelog() {
  return (
    <DocsLayout>
      <div className="mb-8">
        <div className="text-sm text-primary font-medium mb-2">Resources</div>
        <h1 className="text-4xl font-bold tracking-tight mb-4">Changelog</h1>
        <p className="text-xl text-muted-foreground leading-relaxed">
          Notable changes in the Warung Agent monorepo.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-2">Recent updates</h2>
        <p className="text-muted-foreground mb-4">Newest periods first.</p>
        <div className="space-y-8">
          {changelogEntries.map((block) => (
            <div key={block.period} className="rounded-lg border border-border bg-card/50 p-4">
              <h3 className="text-sm font-semibold text-foreground mb-3">{block.period}</h3>
              <ul className="space-y-2">
                {block.items.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="text-primary mt-1.5 h-1 w-1 shrink-0 rounded-full bg-primary" aria-hidden />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-2">Baseline</h2>
        <p className="text-muted-foreground mb-4">Foundations in this repository.</p>
        <div className="rounded-lg border border-border bg-card/50 p-4">
          <ul className="space-y-2">
            {completed.map((item, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>
    </DocsLayout>
  );
}
