import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { CodeBlock } from "@/components/docs/CodeBlock";
import { Button } from "@/components/ui/button";
import { ArrowRight, Wallet, MessageSquare, Store } from "lucide-react";

const tocItems = [
  { id: "role", title: "Role in the monorepo", level: 2 },
  { id: "structure", title: "Important folders", level: 2 },
  { id: "stack", title: "Stack & wallet", level: 2 },
  { id: "runtime-flow", title: "Runtime flow", level: 2 },
  { id: "warung-mode", title: "Warung commerce mode", level: 2 },
  { id: "env", title: "Environment", level: 2 },
  { id: "run", title: "Run and test locally", level: 2 },
  { id: "production", title: "Production checklist", level: 2 },
];

export default function WarungAiAgent() {
  return (
    <DocsLayout toc={tocItems}>
      <div className="mb-8">
        <div className="text-sm text-primary font-medium mb-2">Guides</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">AI Agent UI (`ai-agent/`)</h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Vite + React + TypeScript chat interface for Warung Agent: Solana via Privy and optional mock warung (store) flows in Indonesian.
        </p>
      </div>

      <section id="role" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Role in the monorepo</h2>
        <p className="text-muted-foreground mb-4">
          The UI talks to the <strong className="text-foreground">`api/`</strong> package for chat, agent wallet, and routes you enable. The app is configured as{" "}
          <strong className="text-foreground">Solana only</strong> (no EVM wallet path in this fork).
        </p>
        <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
          <li>Handles user interaction, wallet connection, and chat rendering.</li>
          <li>Calls backend routes when online mode is enabled.</li>
          <li>Keeps commerce state predictable for selection, order, and payment steps.</li>
        </ul>
      </section>

      <section id="structure" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Important folders</h2>
        <div className="rounded-lg border border-border bg-card p-4 overflow-x-auto">
          <pre className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">{`src/pages/                # route-level screens
src/components/chat/      # chat shell, messages, input, sidebar
src/contexts/             # wallet/session providers
src/lib/warung/           # intent parsing + mock commerce state machine
src/lib/chatApi.ts        # backend request helpers`}</pre>
        </div>
      </section>

      <section id="stack" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Stack & wallet</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>
            <Wallet className="inline h-4 w-4 mr-1 text-primary align-text-bottom" />
            <strong className="text-foreground">Privy</strong> — email login and Solana wallets (Phantom, Solflare, detected wallets).
          </li>
          <li>
            <MessageSquare className="inline h-4 w-4 mr-1 text-primary align-text-bottom" />
            Chat API base URL from <code className="text-sm bg-muted px-1 rounded">VITE_API_URL</code> (see <code className="text-sm bg-muted px-1 rounded">ai-agent/.env.example</code>).
          </li>
        </ul>
      </section>

      <section id="runtime-flow" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Runtime flow</h2>
        <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
          <li>User connects wallet through Privy.</li>
          <li>User sends a message.</li>
          <li>Message is interpreted by chat/warung intent logic.</li>
          <li>UI either resolves mock flow or calls API route.</li>
          <li>Assistant response is rendered with next action guidance.</li>
        </ol>
      </section>

      <section id="warung-mode" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Warung commerce mode</h2>
        <p className="text-muted-foreground mb-4">
          <Store className="inline h-4 w-4 mr-1 text-primary align-text-bottom" />
          Mock catalog and conversational checkout live under <code className="text-sm bg-muted px-1 rounded">src/lib/warung/</code> (intent parsing, turn state, copy). You can mirror the same contracts with{" "}
          <Link to="/docs/api/warung-commerce" className="text-primary hover:underline">
            POST /warung/*
          </Link>{" "}
          on the API.
        </p>
      </section>

      <section id="env" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Environment</h2>
        <p className="text-muted-foreground mb-3">Typical variables (see <code className="text-sm bg-muted px-1 rounded">ai-agent/.env.example</code>):</p>
        <ul className="list-disc pl-6 text-muted-foreground text-sm space-y-1 mb-4">
          <li>
            <code className="bg-muted px-1 rounded">VITE_PRIVY_APP_ID</code> (required)
          </li>
          <li>
            <code className="bg-muted px-1 rounded">VITE_PRIVY_CLIENT_ID</code> (optional)
          </li>
          <li>
            <code className="bg-muted px-1 rounded">VITE_API_URL</code> when calling a deployed backend
          </li>
        </ul>
      </section>

      <section id="run" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Run and test locally</h2>
        <CodeBlock
          plain
          code={`cd ai-agent
npm install
npm run dev`}
          language="bash"
          showLineNumbers={false}
        />
        <p className="text-sm text-muted-foreground mt-3">
          Production: <code className="bg-muted px-1 rounded">npm run build</code> → <code className="bg-muted px-1 rounded">dist/</code>.
        </p>
        <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1 mt-3">
          <li>Verify wallet connect/disconnect.</li>
          <li>Send regular chat prompt and warung prompt.</li>
          <li>Confirm order + payment response appears correctly.</li>
        </ul>
      </section>

      <section id="production" className="mb-12 scroll-mt-24">
        <h2 className="text-2xl font-semibold mb-4">Production checklist</h2>
        <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
          <li>Configure all environment values in deployment, never hardcode secrets.</li>
          <li>Use a stable HTTPS API URL.</li>
          <li>Add telemetry for API failures and wallet flow errors.</li>
          <li>Keep response contract stable when backend evolves.</li>
        </ul>
      </section>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <Button variant="primary" asChild>
          <Link to="/docs/welcome">
            Welcome
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link to="/docs/api-reference">API overview</Link>
        </Button>
      </div>
    </DocsLayout>
  );
}
