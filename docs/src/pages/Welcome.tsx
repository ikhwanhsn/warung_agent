import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, Bot, CheckCircle2, Store, Workflow } from "lucide-react";

const tocItems = [
  { id: "what-is-warung", title: "What is Warung Agent?", level: 2 },
  { id: "who-is-this-for", title: "Who this product is for", level: 2 },
  { id: "how-it-works", title: "How the product works", level: 2 },
  { id: "layout", title: "Repository layout", level: 2 },
  { id: "quick-start", title: "Quick start (full flow)", level: 2 },
  { id: "extend", title: "How to extend safely", level: 2 },
];

export default function Welcome() {
  return (
    <DocsLayout toc={tocItems}>
      <div className="mb-8">
        <div className="text-sm text-primary font-medium mb-2">Welcome</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Product overview</h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          <strong className="text-foreground">Warung Agent</strong> is a monorepo for a conversational commerce experience. It combines a Solana-first chat UI in <code className="text-sm bg-muted px-1 rounded">ai-agent/</code>, an Express API in <code className="text-sm bg-muted px-1 rounded">api/</code>, and this docs site in <code className="text-sm bg-muted px-1 rounded">docs/</code>.
        </p>
      </div>

      <section id="what-is-warung" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">What is Warung Agent?</h2>
        <p className="text-muted-foreground mb-4">
          Warung Agent focuses on <strong className="text-foreground">fast product iteration</strong>: conversational UX first, real integrations later. Today it includes a mock warung catalog and checkout simulation so your team can validate user journeys before connecting production inventory or payment providers.
        </p>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Natural-language chat flow for shopping intent (for example: "beli kopi 2")</li>
          <li>Deterministic commerce state transitions (search to select to order to payment)</li>
          <li>Optional HTTP endpoints for the same flow: <code className="text-sm bg-muted px-1 rounded">POST /warung/find-items</code>, <code className="text-sm bg-muted px-1 rounded">/create-order</code>, <code className="text-sm bg-muted px-1 rounded">/execute-payment</code></li>
        </ul>
      </section>

      <section id="who-is-this-for" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Who this product is for</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="font-medium mb-1">Startup founders / PMs</div>
            <p className="text-sm text-muted-foreground">Validate conversational commerce quickly with a realistic UI + API structure.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="font-medium mb-1">Frontend engineers</div>
            <p className="text-sm text-muted-foreground">Build and test chat, wallet UX, and interaction states independently from backend complexity.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="font-medium mb-1">Backend engineers</div>
            <p className="text-sm text-muted-foreground">Add real catalog, order, payment, and persistence behind stable route contracts.</p>
          </div>
          <div className="p-4 rounded-lg border border-border bg-card">
            <div className="font-medium mb-1">AI / agent teams</div>
            <p className="text-sm text-muted-foreground">Tune intent parsing and deterministic response flow without breaking checkout behavior.</p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">How the product works</h2>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground mb-4">
          <li><strong className="text-foreground">User message</strong>: customer asks for an item in chat.</li>
          <li><strong className="text-foreground">Intent parser</strong>: message is classified (search, select, confirm, cancel).</li>
          <li><strong className="text-foreground">Commerce layer</strong>: catalog search and order payload are generated.</li>
          <li><strong className="text-foreground">Payment simulation</strong>: payment result is returned with consistent response shape.</li>
          <li><strong className="text-foreground">Chat response</strong>: user receives clear next action and state-aware feedback.</li>
        </ol>
        <div className="p-4 rounded-lg border border-border bg-card text-sm text-muted-foreground">
          <Workflow className="inline h-4 w-4 mr-1 text-primary align-text-bottom" />
          The same flow can run fully in-browser (mock) or through API routes, so you can switch environments without changing user-facing UX.
        </div>
      </section>

      <section id="layout" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Repository layout</h2>
        <div className="rounded-lg border border-border overflow-hidden overflow-x-auto">
          <table className="w-full text-sm min-w-[320px]">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left p-2 sm:p-3 font-medium">Folder</th>
                <th className="text-left p-2 sm:p-3 font-medium">Role</th>
                <th className="text-left p-2 sm:p-3 font-medium">When to edit</th>
              </tr>
            </thead>
            <tbody className="text-muted-foreground">
              <tr className="border-b border-border/50">
                <td className="p-2 sm:p-3 font-mono text-primary whitespace-nowrap">ai-agent/</td>
                <td className="p-2 sm:p-3">Vite + React UI (Solana / Privy)</td>
                <td className="p-2 sm:p-3">New chat UX, wallet UX, message rendering, intent prompts</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-2 sm:p-3 font-mono text-primary whitespace-nowrap">api/</td>
                <td className="p-2 sm:p-3">Express API routes and integrations</td>
                <td className="p-2 sm:p-3">Real catalog/payment integration, auth, observability, storage</td>
              </tr>
              <tr className="border-b border-border/50">
                <td className="p-2 sm:p-3 font-mono text-primary whitespace-nowrap">docs/</td>
                <td className="p-2 sm:p-3">Product and technical documentation</td>
                <td className="p-2 sm:p-3">Onboarding quality, API docs, operational playbooks</td>
              </tr>
              <tr>
                <td className="p-2 sm:p-3 font-mono text-primary whitespace-nowrap">landing/</td>
                <td className="p-2 sm:p-3">Optional marketing site</td>
                <td className="p-2 sm:p-3">Public marketing content only</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="quick-start" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Quick start (full flow)</h2>
        <div className="space-y-6">
          <div className="p-5 rounded-xl border border-border bg-card">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Bot className="h-5 w-5 text-primary" />
              1) Run AI Agent UI
            </h3>
            <pre className="text-xs sm:text-sm bg-muted/50 p-3 rounded-md overflow-x-auto text-muted-foreground mb-4">{`cd ai-agent
cp .env.example .env
# set VITE_PRIVY_APP_ID and VITE_API_URL
npm install
npm run dev`}</pre>
            <p className="text-sm text-muted-foreground">Open the local URL and verify chat UI renders, wallet modal opens, and basic input works.</p>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <Store className="h-5 w-5 text-primary" />
              2) Run API and commerce routes
            </h3>
            <pre className="text-xs sm:text-sm bg-muted/50 p-3 rounded-md overflow-x-auto text-muted-foreground mb-4">{`cd api
npm install
# configure .env
npm run dev`}</pre>
            <p className="text-sm text-muted-foreground mb-2">Then mount commerce in your API bootstrap:</p>
            <pre className="text-xs sm:text-sm bg-muted/50 p-3 rounded-md overflow-x-auto text-muted-foreground">{`import { createWarungCommerceRouter } from "./routes/warungCommerce.js";

app.use("/warung", createWarungCommerceRouter());`}</pre>
          </div>

          <div className="p-5 rounded-xl border border-border bg-card">
            <h3 className="font-semibold flex items-center gap-2 mb-2">
              <CheckCircle2 className="h-5 w-5 text-primary" />
              3) Validate the user journey
            </h3>
            <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
              <li>Search flow: user asks for product (e.g. "beli kopi")</li>
              <li>Selection flow: user chooses item and quantity</li>
              <li>Order creation: API returns order payload</li>
              <li>Payment simulation: API returns transaction payload</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="extend" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">How to extend safely</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Keep response contract stable: <code className="text-sm bg-muted px-1 rounded">{`{ success, data?, error? }`}</code></li>
          <li>Add new route modules instead of large handlers in one file</li>
          <li>Validate all request bodies before processing (type + business rules)</li>
          <li>Log route-level failures with enough context for debugging</li>
          <li>For real payments, separate analysis/recommendation from execution paths</li>
        </ul>
      </section>

      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 pt-4">
        <Button variant="primary" size="lg" className="w-full sm:min-w-[12rem] sm:w-auto justify-center" asChild>
          <Link to="/docs/ai-agent">
            AI Agent UI
            <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" className="w-full sm:min-w-[12rem] sm:w-auto justify-center" asChild>
          <Link to="/docs/api-reference">API overview</Link>
        </Button>
      </div>
    </DocsLayout>
  );
}
