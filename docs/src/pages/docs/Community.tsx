import { Link } from "react-router-dom";
import { DocsLayout } from "@/components/docs/DocsLayout";
import { Button } from "@/components/ui/button";
import { BookOpen, Mail } from "lucide-react";

const links = [
  {
    icon: BookOpen,
    title: "Documentation home",
    description: "Overview of the Warung Agent monorepo.",
    href: "/docs",
    cta: "Open",
  },
  {
    icon: BookOpen,
    title: "Welcome",
    description: "Layout, quick start, and backend notes.",
    href: "/docs/welcome",
    cta: "Open",
  },
  {
    icon: BookOpen,
    title: "AI Agent UI",
    description: "Run the Vite app, Privy, and Warung mode.",
    href: "/docs/ai-agent",
    cta: "Open",
  },
  {
    icon: BookOpen,
    title: "API reference",
    description: "Warung commerce endpoints and API overview.",
    href: "/docs/api-reference",
    cta: "Open",
  },
];

export default function Community() {
  return (
    <DocsLayout>
      <div className="mb-8">
        <div className="text-sm text-primary font-medium mb-2">Resources</div>
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">Community</h1>
        <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
          Everything in this documentation site describes the <strong className="text-foreground">Warung Agent</strong> monorepo. Use the links below to move between sections and find implementation help faster.
        </p>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-6">Sections</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {links.map((item) => (
            <Link
              key={item.title}
              to={item.href}
              className="group p-5 rounded-xl border border-border bg-card hover:border-primary/50 transition-all duration-300 hover-lift"
            >
              <item.icon className="h-8 w-8 text-primary mb-3" />
              <h3 className="font-semibold mb-1.5 group-hover:text-primary transition-colors">{item.title}</h3>
              <p className="text-sm text-muted-foreground mb-4">{item.description}</p>
              <Button variant="outline" size="sm" className="w-full">
                {item.cta}
              </Button>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Support scope</h2>
        <div className="rounded-xl border border-border bg-card p-4 sm:p-6 mb-8">
          <ul className="list-disc pl-6 text-sm text-muted-foreground space-y-1">
            <li>Local setup and environment configuration</li>
            <li>UI/API contract alignment for commerce flow</li>
            <li>Endpoint behavior and payload troubleshooting</li>
            <li>Production hardening checklist review</li>
          </ul>
        </div>

        <h2 className="text-2xl font-semibold mb-4">Contact</h2>
        <div className="p-4 sm:p-6 rounded-xl border border-border bg-card flex items-start gap-3">
          <Mail className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div>
            <p className="text-muted-foreground text-sm mb-2">For development or partnership inquiries:</p>
            <a
              href="mailto:ikhwanulhusna111@gmail.com"
              className="text-primary font-medium hover:underline break-all"
            >
              ikhwanulhusna111@gmail.com
            </a>
          </div>
        </div>
      </section>
    </DocsLayout>
  );
}
