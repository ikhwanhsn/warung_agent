/**
 * Warung Agent API documentation (monorepo `api/` package).
 */

export interface ApiParam {
  name: string;
  type: string;
  required: string;
  description: string;
}

export interface ApiEndpoint {
  method: "GET" | "POST" | "DELETE";
  path: string;
  description: string;
  params?: ApiParam[];
  bodyExample?: string;
  requestExample: string;
  responseExample: string;
}

export interface ApiDoc {
  title: string;
  overview: string;
  baseUrl: string;
  price: string;
  authNote: string;
  endpoints: ApiEndpoint[];
  paymentFlow: { step1: string; step2: string; step3: string; response402: string };
  responseCodes: { code: string; description: string }[];
  supportLink: string;
  useCases?: string[];
  extraSections?: { title: string; content: string }[];
  hidePaymentFlow?: boolean;
}

const EXAMPLE_ORIGIN = "http://localhost:3000";

const standardJsonResponses: { code: string; description: string }[] = [
  { code: "200", description: "Success — JSON body includes success and data" },
  { code: "400", description: "Bad request — invalid body or missing required fields" },
  { code: "500", description: "Server error — route or service failed unexpectedly" },
];

function doc(partial: Partial<ApiDoc> & Pick<ApiDoc, "title" | "overview" | "endpoints">): ApiDoc {
  return {
    baseUrl: EXAMPLE_ORIGIN,
    price: "N/A (standard HTTP for these reference routes)",
    authNote:
      "Warung commerce routes use JSON bodies and return `{ success, data?, error? }`. Add API keys or auth middleware for production.",
    paymentFlow: {
      step1: "Not applicable.",
      step2: "Not applicable.",
      step3: "Not applicable.",
      response402: "{}",
    },
    responseCodes: standardJsonResponses,
    supportLink: "",
    hidePaymentFlow: true,
    ...partial,
  };
}

export const apiDocs: Record<string, ApiDoc> = {
  "warung-api-overview": doc({
    title: "Warung Agent — API package overview",
    overview:
      "The `api/` directory is a Node.js (Express) backend for Warung Agent: chat proxies, agent wallet, optional MongoDB, and any routes you enable via environment variables. Mount Warung commerce at `/warung` when you wire `createWarungCommerceRouter()` in `api/index.js`. Full setup details are in `api/README.md` at the monorepo root.",
    useCases: [
      "Bootstrap local backend development before real provider integrations.",
      "Run integration tests against stable route contracts.",
      "Add observability and validation layers while preserving API shape.",
    ],
    endpoints: [
      {
        method: "GET",
        path: "/check-status",
        description:
          "Health check route (when enabled in your deployment). Use to verify the server process responds.",
        requestExample: `curl ${EXAMPLE_ORIGIN}/check-status`,
        responseExample: `{
  "status": "ok",
  "message": "Check status server is running"
}`,
      },
    ],
    extraSections: [
      {
        title: "Mounting Warung commerce",
        content:
          "Import `createWarungCommerceRouter` from `api/routes/warungCommerce.js` and register it, for example: `app.use(\"/warung\", createWarungCommerceRouter());`. Implement `api/services/warungMockCommerce.js` with `findItems`, `createOrder`, and `executePayment` to match your product behavior.",
      },
      {
        title: "Configuration",
        content:
          "Copy `api/.env.example` patterns (if present) and set MongoDB URIs, RPC URLs, and service keys as required for the features you turn on. This documentation site only describes the Warung commerce surface and local defaults.",
      },
      {
        title: "Production migration strategy",
        content:
          "When replacing mock services with real providers (inventory/payment), preserve endpoint names and response schema first. Introduce provider-specific logic behind internal adapters.",
      },
    ],
  }),

  "warung-commerce": doc({
    title: "Warung commerce API (mock)",
    overview:
      "Mock storefront endpoints for Warung Agent: search a demo catalog, create an order, simulate payment. Responses use `{ success: boolean, data?: unknown, error?: string }`. The `ai-agent` UI can use the same shapes from `ai-agent/src/lib/warung/mockCommerce.ts` without the API, or call these routes when mounted.",
    useCases: [
      "Demo conversational checkout (Indonesian locale) in the chat UI.",
      "Prototype orders before connecting real inventory or payment providers.",
    ],
    endpoints: [
      {
        method: "POST",
        path: "/warung/find-items",
        description: "Search mock catalog by query with optional category and location filters.",
        bodyExample: `{
  "query": "kopi",
  "category": null,
  "location": null
}`,
        requestExample: `curl -s -X POST ${EXAMPLE_ORIGIN}/warung/find-items \\
  -H "Content-Type: application/json" \\
  -d '{"query":"kopi"}'`,
        responseExample: `{
  "success": true,
  "data": [
    {
      "id": "1",
      "name": "Es Kopi Kenangan",
      "price": 15000,
      "provider": "Kopi Kenangan",
      "hype": "..."
    }
  ]
}`,
      },
      {
        method: "POST",
        path: "/warung/create-order",
        description: "Create a mock order from a catalog line item.",
        bodyExample: `{
  "item_id": "1",
  "quantity": 2,
  "total_price": 30000,
  "provider": "Kopi Kenangan"
}`,
        requestExample: `curl -s -X POST ${EXAMPLE_ORIGIN}/warung/create-order \\
  -H "Content-Type: application/json" \\
  -d '{"item_id":"1","quantity":2,"total_price":30000,"provider":"Kopi Kenangan"}'`,
        responseExample: `{
  "success": true,
  "data": {
    "order_id": "ord_mock_...",
    "status": "pending_payment"
  }
}`,
      },
      {
        method: "POST",
        path: "/warung/execute-payment",
        description: "Simulate payment for a non-negative amount.",
        bodyExample: `{ "amount": 30000 }`,
        requestExample: `curl -s -X POST ${EXAMPLE_ORIGIN}/warung/execute-payment \\
  -H "Content-Type: application/json" \\
  -d '{"amount":30000}'`,
        responseExample: `{
  "success": true,
  "data": {
    "transaction_id": "txn_mock_...",
    "status": "completed"
  }
}`,
      },
    ],
    extraSections: [
      {
        title: "Validation rules",
        content:
          "`execute-payment` requires a finite non-negative number. Apply equivalent validation to all routes in production (type checks and business constraints).",
      },
      {
        title: "Error behavior",
        content:
          "Return `{ success: false, error: string }` for all failures. Avoid leaking raw stack traces to clients.",
      },
      {
        title: "Next production step",
        content:
          "Replace mock service functions with adapter-backed implementations (catalog, order, payment) while preserving API signatures.",
      },
    ],
  }),
};

export function getApiDoc(slug: string): ApiDoc | null {
  return apiDocs[slug] ?? null;
}
