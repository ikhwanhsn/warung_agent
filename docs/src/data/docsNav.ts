/**
 * Warung Agent documentation navigation (sidebar + search).
 */

export interface NavItem {
  title: string;
  href?: string;
  items?: NavItem[];
  badge?: string;
  defaultCollapsed?: boolean;
}

const api = (slug: string) => `/docs/api/${slug}`;

export const navigation: NavItem[] = [
  {
    title: "Start Here",
    items: [
      { title: "Documentation Home", href: "/docs" },
      { title: "Product Overview", href: "/docs/welcome" },
    ],
  },
  {
    title: "Implementation Guides",
    items: [
      { title: "AI Agent UI (ai-agent)", href: "/docs/ai-agent" },
      {
        title: "API",
        defaultCollapsed: false,
        items: [
          { title: "API package overview", href: api("warung-api-overview") },
          { title: "Warung commerce endpoints", href: api("warung-commerce") },
          { title: "API reference summary", href: "/docs/api-reference" },
        ],
      },
    ],
  },
  {
    title: "Operations",
    items: [
      { title: "Changelog", href: "/docs/changelog" },
      { title: "Community & support", href: "/docs/community" },
    ],
  },
];
