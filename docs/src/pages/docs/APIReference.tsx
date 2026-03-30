import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { apiDocs } from "@/data/apiDocs";
import { ArrowRight } from "lucide-react";

const EXAMPLE_ORIGIN = "http://localhost:3000";

const tocItems = [
  { id: "overview", title: "Overview", level: 2 },
  { id: "api-contract", title: "Response contract", level: 2 },
  { id: "base-url", title: "Base URL", level: 2 },
  { id: "warung-endpoints", title: "Warung commerce", level: 2 },
  { id: "integration", title: "Integration checklist", level: 2 },
];

export default function APIReference() {
  const commerce = apiDocs["warung-commerce"];
  return (
    <DocsLayout toc={tocItems}>
      <div className="mb-8">
        <div className="text-sm text-primary font-medium mb-2">API</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">API overview</h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Warung Agent uses an Express API package to handle chat-connected commerce operations. This page explains the API contract first, then links to detailed endpoint examples.
        </p>
      </div>

      <section id="overview" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="text-muted-foreground mb-4">
          Start with mock endpoints and evolve into real providers. Keep request and response shapes stable so frontend logic and user flows do not break while backend services change.
        </p>
        <p className="text-muted-foreground mb-4">
          You run the API locally or on your host, set <code className="text-sm font-mono bg-muted px-1 rounded">PORT</code> and environment variables, and mount only the routers you need. Warung commerce uses JSON <code className="text-sm font-mono bg-muted px-1 rounded">POST</code> handlers under{" "}
          <code className="text-sm font-mono bg-muted px-1 rounded">/warung</code> after you register the router.
        </p>
        <ul className="list-disc pl-6 text-muted-foreground space-y-1">
          <li>
            <Link to="/docs/api/warung-api-overview" className="text-primary hover:underline">
              API package overview
            </Link>{" "}
            — layout, mounting <code className="text-sm bg-muted px-1 rounded">/warung</code>, configuration notes
          </li>
          <li>
            <Link to="/docs/api/warung-commerce" className="text-primary hover:underline">
              Warung commerce (mock)
            </Link>{" "}
            — <code className="text-sm bg-muted px-1 rounded">find-items</code>, <code className="text-sm bg-muted px-1 rounded">create-order</code>, <code className="text-sm bg-muted px-1 rounded">execute-payment</code>
          </li>
        </ul>
      </section>

      <section id="api-contract" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Response contract</h2>
        <p className="text-muted-foreground mb-4">All commerce endpoints should return one consistent shape:</p>
        <pre className="text-sm bg-muted p-4 rounded-lg overflow-x-auto text-muted-foreground mb-3">{`{ "success": true, "data": { ... } }
{ "success": false, "error": "message" }`}</pre>
        <p className="text-sm text-muted-foreground">
          This consistency makes retry handling, UI rendering, and observability easier across all conversation states.
        </p>
      </section>

      <section id="base-url" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Base URL</h2>
        <p className="text-muted-foreground mb-3">
          Default local origin (override with your <code className="text-sm bg-muted px-1 rounded">PORT</code>):
        </p>
        <code className="block text-sm font-mono bg-muted p-3 rounded-lg">{EXAMPLE_ORIGIN}</code>
      </section>

      <section id="warung-endpoints" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Warung commerce</h2>
        {commerce && (
          <ul className="space-y-2">
            {commerce.endpoints.map((e) => (
              <li key={e.path}>
                <Link to="/docs/api/warung-commerce" className="text-primary font-mono text-sm hover:underline">
                  {e.method} {e.path}
                </Link>
                <span className="text-muted-foreground text-sm"> — {e.description}</span>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-6">
          <Link
            to="/docs/api/warung-commerce"
            className="inline-flex items-center text-sm font-medium text-primary hover:underline"
          >
            Open full Warung commerce doc
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </section>

      <section id="integration" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Integration checklist</h2>
        <ul className="list-disc pl-6 text-muted-foreground space-y-2">
          <li>Mount the commerce router at <code className="text-sm bg-muted px-1 rounded">/warung</code>.</li>
          <li>Validate request body fields before running business logic.</li>
          <li>Normalize every failure into <code className="text-sm bg-muted px-1 rounded">{`{ success: false, error }`}</code>.</li>
          <li>Add route-level logs (request id, endpoint, error reason) for troubleshooting.</li>
          <li>Preserve endpoint signatures when replacing mock logic with real providers.</li>
        </ul>
      </section>
    </DocsLayout>
  );
}
