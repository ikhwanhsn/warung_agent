import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { Button } from "@/components/ui/button";
import { ArrowRight, BookOpen, Bot, Layers, Store, Zap } from "lucide-react";

const features = [
  {
    icon: Layers,
    title: "Modular monorepo",
    description: "Separate UI, API, docs, and landing so teams can work independently.",
    href: "/docs/welcome",
  },
  {
    icon: Bot,
    title: "AI commerce chat",
    description: "Conversational shopping flow with deterministic state transitions.",
    href: "/docs/ai-agent",
  },
  {
    icon: Store,
    title: "Warung mode",
    description: "Mock catalog, order creation, and payment simulation for quick demos.",
    href: "/docs/api/warung-commerce",
  },
  {
    icon: Zap,
    title: "Extensible API",
    description: "Express backend that can grow into production integrations.",
    href: "/docs/api-reference",
  },
];

const onboarding = [
  { title: "Understand architecture", href: "/docs/welcome", description: "Roles, flow, and boundaries" },
  { title: "Run AI UI", href: "/docs/ai-agent", description: "Wallet + chat setup" },
  { title: "Run API", href: "/docs/api/warung-api-overview", description: "Routes + mounting" },
  { title: "Test commerce endpoints", href: "/docs/api/warung-commerce", description: "Request/response examples" },
];

export default function DocsHome() {
  return (
    <DocsLayout>
      <div className="relative pb-12 mb-12 border-b border-border">
        <div className="absolute inset-0 -z-10 bg-hero-gradient" />

        <div className="max-w-3xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
              Warung Agent • Product Docs
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4 animate-fade-in">
            Build and operate <span className="gradient-text-primary">Warung Agent</span>
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 leading-relaxed animate-fade-in animation-delay-100">
            This documentation is implementation-focused. It explains product architecture, local setup, route contracts, and extension patterns so your team can move from prototype to production with confidence.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3 animate-fade-in animation-delay-200">
            <Button variant="primary" size="lg" className="w-full sm:min-w-[12rem] sm:w-auto justify-center" asChild>
              <Link to="/docs/welcome">
                Start onboarding
                <ArrowRight className="ml-2 h-4 w-4 shrink-0" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" className="w-full sm:min-w-[12rem] sm:w-auto justify-center" asChild>
              <Link to="/docs/api-reference">Open API docs</Link>
            </Button>
          </div>
        </div>
      </div>

      <section className="mb-16">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="h-5 w-5 text-primary" />
          <h2 className="text-2xl font-semibold">Core product capabilities</h2>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-4">
          {features.map((feature) => (
            <Link
              key={feature.title}
              to={feature.href}
              className="group p-5 rounded-xl border border-border bg-card hover:border-primary/50 hover:bg-muted/30 transition-all duration-300 hover-lift"
            >
              <feature.icon className="h-8 w-8 text-primary mb-3 transition-transform group-hover:scale-110" />
              <h3 className="font-semibold mb-1.5 group-hover:text-primary transition-colors">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="mb-16">
        <h2 className="text-2xl font-semibold mb-6">Recommended onboarding path</h2>
        <div className="space-y-3">
          {onboarding.map((step, index) => (
            <Link
              key={step.title}
              to={step.href}
              className="flex items-center gap-4 p-4 rounded-lg border border-border hover:border-primary/50 transition-colors group"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-semibold">
                {index + 1}
              </div>
              <div>
                <div className="font-medium group-hover:text-primary transition-colors">{step.title}</div>
                <div className="text-sm text-muted-foreground">{step.description}</div>
              </div>
              <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>
    </DocsLayout>
  );
}
